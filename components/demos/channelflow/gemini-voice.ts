"use client";

import type { Lang, VoiceEngine, VoiceEngineEvents } from "./voice-demo";

/* ------------------------------------------------------------------ */
/* Live Qwen… no — Gemini Live voice engine. Implements the VoiceEngine */
/* interface from voice-demo.tsx, so the UI needs zero changes:        */
/*                                                                     */
/*   token (edge route) -> WS straight to Google -> setup -> mic 16 kHz */
/*   PCM up, 24 kHz voice down, transcripts into VoiceLines.           */
/*                                                                     */
/* Message shapes follow ai.google.dev/api/live (BidiGenerateContent   */
/* server messages) as proven in channelflow-wa-live-agents'           */
/* gemini-live.ts; worklets follow its sts-call.ts (16 k in / 24 k out)*/
/* ------------------------------------------------------------------ */

const WS_URL =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=";
const MODEL = "models/gemini-3.8-live";
const VOICE = "Puck";
const INPUT_RATE = 16000;
const OUTPUT_RATE = 24000;
const MINT_TIMEOUT_MS = 15_000;
const WS_OPEN_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 2; // initial try + one retry on silent WS stall

/* Persona: deliberately general. This tab demos that a live voice agent
   works (mic -> Gemini Live -> speaker + transcript), not what it knows.
   Knowledge (resume.json) will be wired into systemInstruction later; until
   then the agent must not invent personal facts — see NO_FACTS below. */
const NO_FACTS =
  "This is only a demo that a live voice agent works, so you have no information about any real person, company, or project. If asked for facts about Rizky, his work, or anything you were not told here, say honestly that this demo has no knowledge connected yet instead of guessing. If you mention the portfolio owner, call him Rizki — never use his full name.";
const INSTRUCTIONS: Record<Lang, string> = {
  en: "You are a friendly voice assistant on Rahmad Rizki's portfolio demo. Speak English. Keep replies short and conversational — one or two sentences, spoken style, no lists, no URLs, no markdown. You are a preview of the Channelflow voice agent and can chat about anything. Never claim to complete real bookings or take real actions; this demo has no backend. " + NO_FACTS,
  id: "You are a friendly voice assistant on Rahmad Rizki's portfolio demo. Reply entirely in Indonesian. Keep replies short and conversational — one or two sentences, spoken style, no lists, no URLs, no markdown. You are a preview of the Channelflow voice agent and can chat about anything. Never claim to complete real bookings or take real actions; this demo has no backend. " + NO_FACTS,
};

const WORKLETS = `
class Capture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.step = sampleRate / ${INPUT_RATE};
    this.pos = 0; this.sum = 0; this.count = 0;
    this.size = ${INPUT_RATE / 50}; // 20 ms
    this.out = new Int16Array(this.size); this.n = 0;
  }
  process(inputs) {
    const input = inputs[0] && inputs[0][0];
    if (!input) return true;
    for (let i = 0; i < input.length; i++) {
      this.sum += input[i]; this.count++; this.pos++;
      if (this.pos < this.step) continue;
      this.pos -= this.step;
      const v = Math.max(-1, Math.min(1, this.sum / this.count));
      this.sum = 0; this.count = 0;
      this.out[this.n++] = v * 0x7fff;
      if (this.n === this.out.length) {
        this.port.postMessage(this.out.buffer, [this.out.buffer]);
        this.out = new Int16Array(this.size); this.n = 0;
      }
    }
    return true;
  }
}
registerProcessor('pcv-capture', Capture);

class Playback extends AudioWorkletProcessor {
  constructor() {
    super();
    this.queue = []; this.offset = 0;
    this.step = ${OUTPUT_RATE} / sampleRate; this.pos = 0; this.a = 0; this.b = 0;
    this.preRoll = ${OUTPUT_RATE / 10}; // 100 ms of 24 kHz sound before the first sample out
    this.buffered = 0; this.started = false;
    this.starved = false; this.last = 0;
    this.port.onmessage = ({ data }) => {
      if (data === 'clear') {
        // New turn replaces the old: drop queued sound, but keep the started
        // latch — re-priming 100 ms on every barge-in would lag each reply.
        this.queue = []; this.offset = 0; this.a = 0; this.b = 0;
        this.buffered = 0; this.starved = false; this.last = 0;
      } else {
        const view = new Int16Array(data);
        this.buffered += view.length;
        this.queue.push(view);
      }
    };
  }
  take() {
    while (this.queue.length) {
      const head = this.queue[0];
      if (this.offset < head.length) {
        this.buffered--;
        return head[this.offset++] / 0x8000; // int16 -> float: skipping this clips everything
      }
      this.queue.shift(); this.offset = 0;
    }
    return null; // nothing queued: the caller fades instead of chopping to zero
  }
  process(_, outputs) {
    const out = outputs[0][0];
    for (let i = 0; i < out.length; i++) {
      if (!this.started) {
        // Hold silence until a jitter cushion lands: WS text frames arrive
        // bursty, and starting on the first frame starves mid-word (clicks).
        if (this.buffered < this.preRoll) { out[i] = 0; continue; }
        this.started = true;
      }
      this.pos += this.step;
      while (this.pos >= 1) {
        this.pos -= 1;
        const s = this.take();
        if (s === null) {
          this.a = 0; this.b = 0; this.pos = 0; // resync: resume must not leap from stale levels
          this.starved = true;
          break;
        }
        if (this.starved) { this.a = s; this.b = s; this.starved = false; }
        else { this.a = this.b; this.b = s; }
      }
      let v = this.a + (this.b - this.a) * this.pos;
      if (this.starved) {
        // Fade the last level out instead of dropping to zero mid-waveform.
        this.last *= 0.985;
        if (this.last < 0.0002 && this.last > -0.0002) this.last = 0;
        v = this.last;
      } else this.last = v;
      out[i] = v;
    }
    return true;
  }
}
registerProcessor('pcv-playback', Playback);
`;

type ServerMessage = {
  setupComplete?: object;
  serverContent?: {
    modelTurn?: { parts?: { inlineData?: { data?: string } }[] };
    turnComplete?: boolean;
    interrupted?: boolean;
    inputTranscription?: { text?: string };
    outputTranscription?: { text?: string };
  };
  goAway?: { timeLeft?: string };
};

/** A silent stall (no open, no error, no close) — the only failure worth retrying. */
class StallError extends Error {}

/* Reports a terminal failure exactly once, then cleans up. Sockets that
   close afterwards stay silent via the failed flag. */
function chunkToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

function base64ToInt16(b64: string): Int16Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const even = bytes.length & ~1;
  return new Int16Array(bytes.buffer.slice(0, even));
}

export class GeminiVoiceEngine implements VoiceEngine {
  private ws: WebSocket | null = null;
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private capture: AudioWorkletNode | null = null;
  private playback: AudioWorkletNode | null = null;
  private analyser: AnalyserNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private ready = false;
  private queue: string[] = [];
  private userBuf = "";
  private agentBuf = "";
  private turns = 0;
  private startedAt = 0;
  private muted = false;
  private finished = false;
  private failed = false; // terminal failure already reported; sockets closing after this stay silent
  private openTimer = 0;
  private epoch = 0; // bumped per attempt; stale sockets from a previous attempt stay silent
  private raf = 0;
  private freq: Uint8Array | null = null;
  private micFreq: Uint8Array | null = null;
  private meterTick = 0;

  constructor(private events: VoiceEngineEvents) {}

  private stage(stage: "token" | "mic" | "session") {
    this.events.onStage?.(stage);
  }

  async start(lang: Lang) {
    this.turns = 0;
    this.startedAt = Date.now();
    try {
      // A fresh single-use token per attempt (a stalled attempt may have
      // consumed the previous one).
      let lastError: unknown = null;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        if (this.finished) return;
        try {
          this.stage("token");
          const token = await this.mintToken(lang);
          this.stage("mic");
          await this.openSocket(token, lang);
          return; // openSocket resolves once the socket is open; setupComplete arrives via onmessage
        } catch (error) {
          lastError = error;
          this.teardownSocket();
          // Only silent stalls are retried; explicit refusals (mic blocked,
          // rate limit) fail immediately.
          if (!(error instanceof StallError) || attempt === MAX_ATTEMPTS) throw error;
        }
      }
      throw lastError;
    } catch (error) {
      this.fail(error instanceof Error ? error.message : "Could not start a live session.");
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.stream?.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
  }

  end() {
    this.finish();
  }

  dispose() {
    this.finished = true;
    this.cleanup();
  }

  private async mintToken(lang: Lang): Promise<string> {
    let res: Response;
    try {
      res = await fetch("/api/voice/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang }),
        signal: AbortSignal.timeout(MINT_TIMEOUT_MS),
      });
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error("Session request timed out. Please try again.");
      }
      throw new Error("Could not reach the session server. Check your connection and try again.");
    }
    if (res.status === 429) {
      throw new Error("Demo limit reached — 5 calls per hour. Please try again later.");
    }
    if (!res.ok) throw new Error("Could not start a live session right now.");
    const data = (await res.json()) as { token?: string; error?: string };
    if (!data?.token) throw new Error(data?.error ?? "Could not start a live session right now.");
    return data.token;
  }

  private async openSocket(token: string, lang: Lang): Promise<void> {
    const myEpoch = ++this.epoch;
    const stale = () => myEpoch !== this.epoch;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      throw new Error("Microphone blocked — allow mic access and try again.");
    }
    if (stale() || this.finished) throw new Error("Call cancelled.");

    this.ctx = new AudioContext();
    await this.ctx.audioWorklet.addModule(
      URL.createObjectURL(new Blob([WORKLETS], { type: "application/javascript" }))
    );
    if (stale() || this.finished) throw new Error("Call cancelled.");

    // Mic -> 16 kHz capture -> socket, with a pass-through tap so the UI
    // can meter the caller's voice. AnalyserNode forwards audio untouched,
    // so what reaches the socket is bit-identical.
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.micAnalyser = this.ctx.createAnalyser();
    this.micAnalyser.fftSize = 256;
    this.micFreq = new Uint8Array(this.micAnalyser.frequencyBinCount);
    this.capture = new AudioWorkletNode(this.ctx, "pcv-capture");
    this.capture.port.onmessage = ({ data }: { data: ArrayBuffer }) => {
      if (!this.ready || this.muted || this.finished) return;
      this.send({
        realtimeInput: { audio: { mimeType: `audio/pcm;rate=${INPUT_RATE}`, data: chunkToBase64(data) } },
      });
    };
    src.connect(this.micAnalyser);
    this.micAnalyser.connect(this.capture);

    // Socket audio 24 kHz -> playback -> analyser (waveform) -> speakers
    this.playback = new AudioWorkletNode(this.ctx, "pcv-playback");
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.freq = new Uint8Array(this.analyser.frequencyBinCount);
    this.playback.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    this.meter();

    this.stage("session");
    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(WS_URL + encodeURIComponent(token));
      this.ws = ws;
      // Google frames server messages as binary: without this they arrive
      // as Blobs, JSON.parse silently fails, and setupComplete is missed.
      ws.binaryType = "arraybuffer";
      const clear = () => window.clearTimeout(this.openTimer);
      // A network blackhole (dropped packets, no refusal) fires neither
      // onopen nor onerror — without this the UI waits forever.
      this.openTimer = window.setTimeout(() => {
        if (stale()) return;
        try {
          ws.close();
        } catch {
          /* already gone */
        }
        reject(
          new StallError(
            "Voice server unreachable — your network may be blocking it. Try another connection."
          )
        );
      }, WS_OPEN_TIMEOUT_MS);
      ws.onopen = () => {
        if (stale()) return;
        clear();
        // Sent DIRECTLY, never via send(): send() queues everything until
        // setupComplete arrives, and setupComplete only arrives after the
        // setup is sent — queueing it deadlocks the session forever.
        ws.send(
          JSON.stringify({
            setup: {
              model: MODEL,
              generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
              },
              systemInstruction: { parts: [{ text: INSTRUCTIONS[lang] }] },
              inputAudioTranscription: {},
              outputAudioTranscription: {},
              sessionResumption: {},
            },
          })
        );
        resolve();
      };
      ws.onmessage = (ev) => {
        if (stale()) return;
        try {
          const text =
            typeof ev.data === "string" ? ev.data : new TextDecoder().decode(ev.data as ArrayBuffer);
          this.onMessage(JSON.parse(text) as ServerMessage);
        } catch {
          /* ignore malformed frames */
        }
      };
      ws.onerror = () => {
        if (stale() || this.finished || this.failed) return;
        clear();
        this.fail("Lost the live connection. Check your network and try again.");
      };
      ws.onclose = () => {
        if (stale() || this.finished || this.failed) return;
        clear();
        if (this.ready && this.startedAt > 0) this.finish();
        else this.fail("The live session closed before it started. Please try again.");
      };
    });
  }

  private fail(message: string) {
    if (this.failed || this.finished) return;
    this.failed = true;
    this.events.onError(message);
    this.cleanup();
  }

  /** Between retry attempts: drop the dead attempt's resources and silence it. */
  private teardownSocket() {
    this.epoch += 1;
    this.cleanup();
  }

  private send(message: Record<string, unknown>) {
    const data = JSON.stringify(message);
    if (this.ready && this.ws?.readyState === WebSocket.OPEN) this.ws.send(data);
    else this.queue.push(data);
  }

  private onMessage(message: ServerMessage) {
    if (message.setupComplete) {
      this.ready = true;
      for (const data of this.queue.splice(0)) this.ws?.send(data);
      this.events.onReady();
      return;
    }
    const content = message.serverContent;
    if (!content) {
      if (message.goAway) this.finish();
      return;
    }
    if (content.interrupted) {
      // Barge-in: stop what is playing, the new turn replaces it.
      this.playback?.port.postMessage("clear");
      this.flushTurn();
    }
    if (content.inputTranscription?.text) this.userBuf += content.inputTranscription.text;
    if (content.outputTranscription?.text) this.agentBuf += content.outputTranscription.text;
    // One postMessage per server message, not per part: a reply streams
    // dozens of small parts and each hop costs GC churn on the audio thread.
    const chunks: Int16Array[] = [];
    let total = 0;
    for (const part of content.modelTurn?.parts ?? []) {
      if (!part.inlineData?.data) continue;
      const samples = base64ToInt16(part.inlineData.data);
      chunks.push(samples);
      total += samples.length;
    }
    if (chunks.length === 1) {
      const only = chunks[0];
      this.playback?.port.postMessage(only.buffer, [only.buffer]);
    } else if (chunks.length > 1) {
      const merged = new Int16Array(total);
      let at = 0;
      for (const c of chunks) {
        merged.set(c, at);
        at += c.length;
      }
      this.playback?.port.postMessage(merged.buffer, [merged.buffer]);
    }
    if (content.turnComplete) this.flushTurn();
  }

  private flushTurn() {
    const user = this.userBuf.trim();
    const agent = this.agentBuf.trim();
    this.userBuf = "";
    this.agentBuf = "";
    if (user) {
      this.turns += 1;
      this.events.onLine({ who: "you", text: user });
    }
    if (agent) this.events.onLine({ who: "agent", text: agent });
  }

  private meter() {
    const loop = () => {
      if (this.finished || !this.analyser || !this.freq) return;
      // ~15 Hz is plenty for a level meter; emitting every animation frame
      // re-renders React 60x/sec (x2 analysers = 120 state updates/sec).
      this.meterTick += 1;
      if (this.meterTick % 4 === 0) {
        this.analyser.getByteFrequencyData(this.freq);
        let sum = 0;
        for (let i = 0; i < this.freq.length; i++) sum += this.freq[i];
        this.events.onLevel(Math.min(1, sum / this.freq.length / 90));
        if (this.micAnalyser && this.micFreq) {
          this.micAnalyser.getByteFrequencyData(this.micFreq);
          let msum = 0;
          for (let i = 0; i < this.micFreq.length; i++) msum += this.micFreq[i];
          this.events.onMicLevel(Math.min(1, msum / this.micFreq.length / 90));
        }
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private finish() {
    if (this.finished) return;
    const seconds = Math.max(1, Math.round((Date.now() - this.startedAt) / 1000));
    const turns = this.turns;
    this.flushTurn();
    this.finished = true;
    this.cleanup();
    this.events.onEnded({ seconds, turns: this.turns || turns });
  }

  private cleanup() {
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.openTimer);
    try {
      this.ws?.close();
    } catch {
      /* already closed */
    }
    this.ws = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.capture?.disconnect();
    this.playback?.disconnect();
    this.micAnalyser?.disconnect();
    this.capture = null;
    this.playback = null;
    this.analyser = null;
    this.micAnalyser = null;
    this.micFreq = null;
    void this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.ready = false;
    this.queue = [];
  }
}
