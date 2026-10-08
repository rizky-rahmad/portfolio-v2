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

const INSTRUCTIONS: Record<Lang, string> = {
  en: "You are a friendly voice assistant on Rahmad Rizki's portfolio demo. Speak English. Keep replies short and conversational — one or two sentences, spoken style, no lists, no URLs, no markdown. You are a preview of the Channelflow voice agent and can chat about anything. Never claim to complete real bookings or take real actions; this demo has no backend.",
  id: "You are a friendly voice assistant on Rahmad Rizki's portfolio demo. Reply entirely in Indonesian. Keep replies short and conversational — one or two sentences, spoken style, no lists, no URLs, no markdown. You are a preview of the Channelflow voice agent and can chat about anything. Never claim to complete real bookings or take real actions; this demo has no backend.",
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
    this.port.onmessage = ({ data }) => {
      if (data === 'clear') { this.queue = []; this.offset = 0; this.a = 0; this.b = 0; }
      else this.queue.push(new Int16Array(data));
    };
  }
  take() {
    while (this.queue.length) {
      const head = this.queue[0];
      if (this.offset < head.length) return head[this.offset++];
      this.queue.shift(); this.offset = 0;
    }
    return 0;
  }
  process(_, outputs) {
    const out = outputs[0][0];
    for (let i = 0; i < out.length; i++) {
      this.pos += this.step;
      while (this.pos >= 1) { this.pos -= 1; this.a = this.b; this.b = this.take(); }
      out[i] = this.a + (this.b - this.a) * this.pos;
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
  private ready = false;
  private queue: string[] = [];
  private userBuf = "";
  private agentBuf = "";
  private turns = 0;
  private startedAt = 0;
  private muted = false;
  private finished = false;
  private raf = 0;
  private freq: Uint8Array | null = null;

  constructor(private events: VoiceEngineEvents) {}

  async start(lang: Lang) {
    this.turns = 0;
    this.startedAt = Date.now();
    try {
      const token = await this.mintToken(lang);
      await this.openSocket(token, lang);
    } catch (error) {
      this.events.onError(error instanceof Error ? error.message : "Could not start a live session.");
      this.cleanup();
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
    const res = await fetch("/api/voice/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang }),
    });
    if (res.status === 429) {
      throw new Error("Demo limit reached — 5 calls per hour. Please try again later.");
    }
    if (!res.ok) throw new Error("Could not start a live session right now.");
    const data = (await res.json()) as { token?: string; error?: string };
    if (!data?.token) throw new Error(data?.error ?? "Could not start a live session right now.");
    return data.token;
  }

  private async openSocket(token: string, lang: Lang) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      throw new Error("Microphone blocked — allow mic access and try again.");
    }

    this.ctx = new AudioContext();
    await this.ctx.audioWorklet.addModule(
      URL.createObjectURL(new Blob([WORKLETS], { type: "application/javascript" }))
    );

    // Mic -> 16 kHz capture -> socket
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.capture = new AudioWorkletNode(this.ctx, "pcv-capture");
    this.capture.port.onmessage = ({ data }: { data: ArrayBuffer }) => {
      if (!this.ready || this.muted || this.finished) return;
      this.send({
        realtimeInput: { audio: { mimeType: `audio/pcm;rate=${INPUT_RATE}`, data: chunkToBase64(data) } },
      });
    };
    src.connect(this.capture);

    // Socket audio 24 kHz -> playback -> analyser (orb) -> speakers
    this.playback = new AudioWorkletNode(this.ctx, "pcv-playback");
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.freq = new Uint8Array(this.analyser.frequencyBinCount);
    this.playback.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    this.meter();

    const ws = new WebSocket(WS_URL + encodeURIComponent(token));
    this.ws = ws;
    ws.onopen = () => {
      // Mirrors the locked setup minted server-side (the token's config wins;
      // this copy keeps the handshake valid if the API ever merges instead).
      this.send({
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
      });
    };
    ws.onmessage = (ev) => {
      try {
        this.onMessage(JSON.parse(ev.data as string) as ServerMessage);
      } catch {
        /* ignore malformed frames */
      }
    };
    ws.onerror = () => {
      if (!this.finished) {
        this.events.onError("Lost the live connection. Check your network and try again.");
        this.finish();
      }
    };
    ws.onclose = () => {
      if (!this.finished && this.startedAt > 0 && this.ready) this.finish();
      else if (!this.finished && !this.ready) {
        this.events.onError("The live session closed before it started. Please try again.");
        this.cleanup();
      }
    };
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
    for (const part of content.modelTurn?.parts ?? []) {
      if (!part.inlineData?.data) continue;
      const samples = base64ToInt16(part.inlineData.data);
      this.playback?.port.postMessage(samples.buffer, [samples.buffer]);
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
      this.analyser.getByteFrequencyData(this.freq);
      let sum = 0;
      for (let i = 0; i < this.freq.length; i++) sum += this.freq[i];
      this.events.onLevel(Math.min(1, sum / this.freq.length / 90));
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
    this.capture = null;
    this.playback = null;
    this.analyser = null;
    void this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.ready = false;
    this.queue = [];
  }
}
