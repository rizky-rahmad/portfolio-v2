"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff, Languages } from "lucide-react";
import { GeminiVoiceEngine } from "./gemini-voice";
import "./voice.css";

/* ------------------------------------------------------------------ */
/* Voice tab UI. Everything call-related goes through the VoiceEngine  */
/* interface below: GeminiVoiceEngine (live, via gemini-voice.ts) or   */
/* SimulatedVoiceEngine (scripted preview, clearly labelled PREVIEW),  */
/* so the layout, states, waveform, transcript and controls can be     */
/* reviewed without touching call logic.                               */
/* ------------------------------------------------------------------ */

type CallState = "idle" | "connecting" | "live" | "ended" | "error";
export type Lang = "en" | "id";

export type VoiceLine = {
  id: number;
  who: "you" | "agent";
  text: string;
  at: string;
};

export type VoiceStage = "token" | "mic" | "session";

export type VoiceEngineEvents = {
  onLine: (line: Omit<VoiceLine, "id" | "at">) => void;
  onLevel: (level: number) => void; // 0..1 agent audio level for the waveform
  onMicLevel: (level: number) => void; // 0..1 caller mic level for the waveform
  /** The session is ready: mic streaming (live) or script running (preview). */
  onReady: () => void;
  /** Live engine only: which connecting stage was reached (for staged hints). */
  onStage?: (stage: VoiceStage) => void;
  onEnded: (summary: { seconds: number; turns: number }) => void;
  onError: (message: string) => void;
};

export interface VoiceEngine {
  start: (lang: Lang) => void;
  setMuted: (muted: boolean) => void;
  end: () => void;
  dispose: () => void;
}

/* Scripted preview so the UI can be reviewed without a live model.
   Fictional data, same as the other demo tabs. */
const PREVIEW_SCRIPT: { who: "you" | "agent"; text: string; afterMs: number }[] = [
  { who: "agent", text: "Hi, thanks for calling! How can I help you today?", afterMs: 1200 },
  { who: "you", text: "Hi! Are you open this Friday evening?", afterMs: 3800 },
  { who: "agent", text: "Yes, we're open Friday from 5pm to 11pm. Would you like a table?", afterMs: 4200 },
  { who: "you", text: "A table for two, around 7pm please.", afterMs: 4200 },
  { who: "agent", text: "Done — table for two, Friday at 7pm. Anything else I can help with?", afterMs: 4200 },
];

class SimulatedVoiceEngine implements VoiceEngine {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private turns = 0;
  private startedAt = 0;
  private disposed = false;
  private micHotUntil = 0;
  constructor(private events: VoiceEngineEvents) {}

  start() {
    this.turns = 0;
    this.startedAt = Date.now();
    // Gentle fake level movement for the waveform.
    const tick = () => {
      if (this.disposed) return;
      this.events.onLevel(0.25 + Math.random() * 0.6);
      this.timers.push(setTimeout(tick, 220));
    };
    tick();
    // The "caller's" mic runs quiet except around their own lines.
    const micTick = () => {
      if (this.disposed) return;
      const hot = Date.now() < this.micHotUntil;
      this.events.onMicLevel(hot ? 0.45 + Math.random() * 0.4 : 0.06 + Math.random() * 0.16);
      this.timers.push(setTimeout(micTick, 220));
    };
    micTick();
    let delay = 0;
    for (const step of PREVIEW_SCRIPT) {
      delay += step.afterMs;
      if (step.who === "you") {
        // Heat the mic shortly before the caller "speaks".
        const at = delay;
        this.timers.push(
          setTimeout(() => {
            if (!this.disposed) this.micHotUntil = Date.now() + 2600;
          }, Math.max(0, at - 1400))
        );
      }
      this.timers.push(
        setTimeout(() => {
          if (this.disposed) return;
          if (step.who === "you") {
            this.turns += 1;
            this.micHotUntil = Date.now() + 1800;
          }
          this.events.onLine({ who: step.who, text: step.text });
        }, delay)
      );
    }
    this.timers.push(setTimeout(() => !this.disposed && this.events.onReady(), 600));
  }

  setMuted() {
    /* preview: no real mic yet */
  }

  end() {
    const seconds = Math.max(1, Math.round((Date.now() - this.startedAt) / 1000));
    this.events.onEnded({ seconds, turns: this.turns });
    this.clear();
  }

  dispose() {
    this.disposed = true;
    this.clear();
  }

  private clear() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}

function fmtClock(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* Call-relative timestamp (m:ss since onReady) — distinct from wall-clock. */
function fmtRel(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/* Dual waveform driven by agent + mic levels (0..1). Canvas, rAF, cleanup.
   Top row = agent voice, bottom row = caller mic. Levels arrive via refs so
   the 15 Hz meter never re-renders React; only live/muted re-subscribe. */
function Waveform({
  agent,
  mic,
  live,
  muted,
}: {
  agent: number;
  mic: number;
  live: boolean;
  muted: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const agentRef = useRef(0);
  const micRef = useRef(0);
  agentRef.current = live ? agent : 0;
  micRef.current = live && !muted ? mic : 0;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const agentColor = live ? "#34d399" : "#8b5cf6";
    const micColor = muted ? "#475569" : "#a78bfa";
    let raf = 0;
    const t0 = performance.now();
    const W = canvas.width;
    const H = canvas.height;
    const N = 56;
    const gap = W / N;
    const bw = Math.max(2, gap * 0.55);
    const rows = [
      { y: H * 0.28, max: H * 0.22 },
      { y: H * 0.76, max: H * 0.22 },
    ];
    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const levels = [agentRef.current, micRef.current];
      ctx.clearRect(0, 0, W, H);
      rows.forEach((row, r) => {
        const lvl = Math.max(0, Math.min(1, levels[r] ?? 0));
        ctx.fillStyle = r === 0 ? agentColor : micColor;
        for (let i = 0; i < N; i++) {
          const wobble = reduced ? 0.7 : 0.35 + 0.65 * Math.abs(Math.sin(t * 3.2 + i * 0.5 + r * 2.1));
          const h = Math.max(2, lvl * row.max * wobble + 1.5);
          const x = i * gap + (gap - bw) / 2;
          ctx.globalAlpha = 0.35 + 0.65 * (h / (row.max + 1.5));
          ctx.fillRect(x, row.y - h / 2, bw, h);
        }
        ctx.globalAlpha = 1;
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [live, muted]);

  return (
    <canvas
      ref={ref}
      width={320}
      height={148}
      className="bk-voice-wave"
      role="img"
      aria-label="Live audio levels, agent on top and your microphone below"
    />
  );
}

export function VoiceDemo() {
  const [state, setState] = useState<CallState>("idle");
  const [lang, setLang] = useState<Lang>("en");
  const [muted, setMuted] = useState(false);
  const [lines, setLines] = useState<VoiceLine[]>([]);
  const [level, setLevel] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [summary, setSummary] = useState<{ seconds: number; turns: number } | null>(null);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [stage, setStage] = useState<VoiceStage | null>(null);
  const engineRef = useRef<VoiceEngine | null>(null);
  const watchdogRef = useRef(0);
  const idRef = useRef(0);
  const startedAtRef = useRef(0); // set on onReady; line timestamps are relative to it
  const transcriptRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // mm:ss while live
  useEffect(() => {
    if (state !== "live") return;
    const iv = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [state]);

  // auto-scroll transcript
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, state]);

  // dispose engine on unmount
  useEffect(
    () => () => {
      engineRef.current?.dispose();
      window.clearTimeout(watchdogRef.current);
    },
    []
  );

  // Audit/CI hook: ?voice=preview forces the scripted engine (no mic, no quota).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("voice") === "preview") {
      setPreviewMode(true);
    }
  }, []);

  const pushLine = useCallback((line: Omit<VoiceLine, "id" | "at">) => {
    idRef.current += 1;
    setLines((prev) => [
      ...prev,
      { ...line, id: idRef.current, at: fmtRel(Date.now() - startedAtRef.current) },
    ]);
  }, []);

  const clearWatchdog = useCallback(() => {
    window.clearTimeout(watchdogRef.current);
    watchdogRef.current = 0;
  }, []);

  const start = useCallback(
    (preview: boolean) => {
      setError("");
      setLines([]);
      setSeconds(0);
      setLevel(0);
      setMicLevel(0);
      setSummary(null);
      setMuted(false);
      setPreviewMode(preview);
      setStage(null);
      setState("connecting");
      const events: VoiceEngineEvents = {
        onLine: pushLine,
        onLevel: setLevel,
        onMicLevel: setMicLevel,
        onStage: setStage,
        onReady: () => {
          clearWatchdog();
          startedAtRef.current = Date.now();
          if (stateRef.current === "connecting") setState("live");
        },
        onEnded: (s) => {
          clearWatchdog();
          setSummary(s);
          setState("ended");
        },
        onError: (message) => {
          clearWatchdog();
          setError(message);
          setState("error");
        },
      };
      const engine: VoiceEngine = preview
        ? new SimulatedVoiceEngine(events)
        : new GeminiVoiceEngine(events);
      engineRef.current?.dispose();
      engineRef.current = engine;
      void engine.start(lang);
      if (!preview) {
        // Last-resort net: no silent infinite waits. The engine reports its
        // own timeouts first; this fires only if nothing settles at all.
        window.clearTimeout(watchdogRef.current);
        watchdogRef.current = window.setTimeout(() => {
          if (stateRef.current !== "connecting") return;
          engineRef.current?.dispose();
          engineRef.current = null;
          setError("Taking too long — the voice server may be blocked on your network. Try another connection.");
          setState("error");
        }, 20_000);
      }
    },
    [lang, pushLine, clearWatchdog]
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      engineRef.current?.setMuted(!m);
      return !m;
    });
  }, []);

  const end = useCallback(() => {
    engineRef.current?.end();
  }, []);

  const reset = useCallback(() => {
    clearWatchdog();
    engineRef.current?.dispose();
    engineRef.current = null;
    setState("idle");
    setLines([]);
    setSeconds(0);
    setLevel(0);
    setMicLevel(0);
    setSummary(null);
    setError("");
    setStage(null);
  }, [clearWatchdog]);

  return (
    <div className="demo-voice" data-call-state={state}>
      <div className="bk-voice-grid">
        {/* Call panel */}
        <section className="bk-voice-call" aria-label="Voice call">
          <div className="bk-voice-top">
            <span
              className={`bk-voice-status bk-voice-status--${state}`}
              role="status"
              aria-live="polite"
            >
              <span className="bk-voice-dot" />
              {state === "idle" && "Ready"}
              {state === "connecting" && "Connecting…"}
              {state === "live" && `Live · ${fmtClock(seconds)}`}
              {state === "ended" && "Call ended"}
              {state === "error" && "Connection failed"}
            </span>
            <span
              className={previewMode ? "bk-voice-preview" : "bk-voice-live"}
              title={
                previewMode
                  ? "Simulated audio and script — no model connected."
                  : "Live session with Gemini. Billed to the demo."
              }
            >
              {previewMode ? "Preview" : "Live"}
            </span>
          </div>

          <Waveform agent={level} mic={micLevel} live={state === "live"} muted={muted} />
          <div className="bk-voice-legend" aria-hidden="true">
            <span className="bk-voice-legend-item bk-voice-legend-item--agent">Agent</span>
            <span className="bk-voice-legend-item bk-voice-legend-item--you">You</span>
          </div>

          <p className="bk-voice-model">Puck</p>
          <p className="bk-voice-sub">
            {previewMode ? "Scripted preview" : "Gemini Live"} ·{" "}
            {lang === "en" ? "English" : "Indonesia"}
          </p>
          {state === "ended" && summary ? (
            <div className="bk-voice-recap">
              <div className="bk-voice-recap-stats">
                <span className="bk-voice-recap-stat">
                  <strong>{fmtClock(summary.seconds)}</strong>Duration
                </span>
                <span className="bk-voice-recap-stat">
                  <strong>{summary.turns}</strong>Turns
                </span>
              </div>
              <p className="bk-voice-hint">
                Call lasted {fmtClock(summary.seconds)} · {summary.turns}{" "}
                {summary.turns === 1 ? "turn" : "turns"}.
              </p>
            </div>
          ) : (
            <p className="bk-voice-hint">
              {state === "idle" &&
                (previewMode
                  ? "Preview mode: a scripted exchange, no model connected."
                  : "Press Start to talk to the agent live. Your mic stays in your browser except for the call audio.")}
              {state === "connecting" &&
                (previewMode
                  ? "Preparing the scripted preview…"
                  : stage === "mic"
                    ? "Mic ready · opening a live session…"
                    : stage === "session"
                      ? "Session opening · waiting for the voice server…"
                      : "Getting a session token…")}
              {state === "live" &&
                (muted ? "You're muted — the agent can't hear you." : "Speak naturally. The agent replies in real time.")}
              {state === "error" && error}
            </p>
          )}

          <div className="bk-voice-lang" role="group" aria-label="Agent language">
            <Languages className="bk-voice-lang-icon" />
            {(["en", "id"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                disabled={state === "live" || state === "connecting"}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={lang === l ? "bk-voice-lang-active" : ""}
              >
                {l === "en" ? "English" : "Indonesia"}
              </button>
            ))}
          </div>

          <div className="bk-voice-controls">
            {state === "idle" && (
              <button type="button" className="bk-voice-start" onClick={() => start(previewMode)}>
                <Phone className="bk-voice-btn-icon" />
                Start call
              </button>
            )}
            {state === "ended" && (
              <button type="button" className="bk-voice-start" onClick={() => reset()}>
                <Phone className="bk-voice-btn-icon" />
                Start new call
              </button>
            )}
            {state === "error" && (
              <>
                <button type="button" className="bk-voice-start" onClick={() => start(false)}>
                  <Phone className="bk-voice-btn-icon" />
                  Try again
                </button>
                <button
                  type="button"
                  className="bk-voice-start bk-voice-start--ghost"
                  onClick={() => start(true)}
                >
                  Use scripted preview
                </button>
              </>
            )}
            {(state === "live" || state === "connecting") && (
              <>
                <button
                  type="button"
                  className={`bk-voice-round ${muted ? "bk-voice-round--off" : ""}`}
                  onClick={toggleMute}
                  disabled={state !== "live"}
                  aria-pressed={muted}
                  aria-label={muted ? "Unmute microphone" : "Mute microphone"}
                >
                  {muted ? <MicOff className="bk-voice-btn-icon" /> : <Mic className="bk-voice-btn-icon" />}
                </button>
                {state === "live" ? (
                  <button
                    type="button"
                    className="bk-voice-round bk-voice-round--end"
                    onClick={end}
                    aria-label="End call"
                  >
                    <PhoneOff className="bk-voice-btn-icon" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="bk-voice-round bk-voice-round--end"
                    onClick={reset}
                    aria-label="Cancel call"
                    title="Cancel"
                  >
                    <PhoneOff className="bk-voice-btn-icon" />
                  </button>
                )}
              </>
            )}
          </div>
          <p className="bk-voice-max">Max 5:00 per call · 5 calls per hour</p>
        </section>

        {/* Transcript panel */}
        <section className="bk-voice-script" aria-label="Live transcript">
          <div className="bk-voice-script-head">
            <h3 className="bk-voice-script-title">Live transcript</h3>
            {state === "live" && (level > 0.3 || micLevel > 0.35) && (
              <span className="bk-voice-speaking" aria-hidden="true">
                <span className="bk-voice-speaking-dot" />
                {micLevel > 0.35 ? "You're speaking" : "Agent speaking"}
              </span>
            )}
          </div>
          <div className="bk-voice-lines" ref={transcriptRef} aria-live="polite">
            {lines.length === 0 && (
              <div className="bk-voice-empty">
                <Mic className="bk-voice-empty-icon" aria-hidden="true" />
                <p>
                  {state === "live" || state === "connecting"
                    ? "Listening…"
                    : "Your conversation will appear here once the call starts."}
                </p>
                {state !== "live" && state !== "connecting" && (
                  <p className="bk-voice-empty-tip">Try asking about Rizky&apos;s experience.</p>
                )}
              </div>
            )}
            {lines.map((line) => (
              <div key={line.id} className={`bk-voice-line bk-voice-line--${line.who}`}>
                <span className="bk-voice-who">{line.who === "agent" ? "Agent" : "You"}</span>
                <p className="bk-voice-text">{line.text}</p>
                <span className="bk-voice-at">{line.at}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
