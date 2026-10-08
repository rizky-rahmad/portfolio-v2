"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff, Languages } from "lucide-react";
import { GeminiVoiceEngine } from "./gemini-voice";
import "./voice.css";

/* ------------------------------------------------------------------ */
/* Voice tab UI. The live Qwen WebRTC wiring plugs in later: everything */
/* call-related goes through the VoiceEngine interface below. Right    */
/* now only SimulatedVoiceEngine exists, clearly labelled PREVIEW, so  */
/* the layout, states, orb, transcript and controls can be reviewed.   */
/* ------------------------------------------------------------------ */

type CallState = "idle" | "connecting" | "live" | "ended" | "error";
export type Lang = "en" | "id";

export type VoiceLine = {
  id: number;
  who: "you" | "agent";
  text: string;
  at: string;
};

export type VoiceEngineEvents = {
  onLine: (line: Omit<VoiceLine, "id" | "at">) => void;
  onLevel: (level: number) => void; // 0..1 remote audio level for the orb
  /** The session is ready: mic streaming (live) or script running (preview). */
  onReady: () => void;
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
  constructor(private events: VoiceEngineEvents) {}

  start() {
    this.turns = 0;
    this.startedAt = Date.now();
    // Gentle fake level movement for the orb.
    const tick = () => {
      if (this.disposed) return;
      this.events.onLevel(0.25 + Math.random() * 0.6);
      this.timers.push(setTimeout(tick, 220));
    };
    tick();
    let delay = 0;
    for (const step of PREVIEW_SCRIPT) {
      delay += step.afterMs;
      this.timers.push(
        setTimeout(() => {
          if (this.disposed) return;
          if (step.who === "you") this.turns += 1;
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

function stamp() {
  const d = new Date();
  return `${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

/* Animated orb driven by remote audio level (0..1). Canvas, rAF, cleanup. */
function Orb({ level, live }: { level: number; live: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef(0);
  levelRef.current = live ? level : 0;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const t0 = performance.now();
    const draw = (now: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const t = (now - t0) / 1000;
      const amp = levelRef.current;
      ctx.clearRect(0, 0, w, h);
      for (let i = 4; i >= 1; i--) {
        const pulse = reduced ? 0 : Math.sin(t * 2.2 - i * 0.7) * 4 * (0.3 + amp);
        const r = 26 + i * 17 + amp * 26 + pulse;
        const alpha = 0.1 + (5 - i) * 0.09 + amp * 0.12;
        const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
        grad.addColorStop(0, `rgba(139, 92, 246, ${alpha + 0.25})`);
        grad.addColorStop(1, "rgba(139, 92, 246, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Core
      const core = ctx.createRadialGradient(cx - 8, cy - 10, 4, cx, cy, 30);
      core.addColorStop(0, "#c4b5fd");
      core.addColorStop(0.55, "#8b5cf6");
      core.addColorStop(1, "#5b21b6");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, 26 + amp * 8, 0, Math.PI * 2);
      ctx.fill();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} width={240} height={240} className="bk-voice-orb" aria-hidden="true" />;
}

export function VoiceDemo() {
  const [state, setState] = useState<CallState>("idle");
  const [lang, setLang] = useState<Lang>("en");
  const [muted, setMuted] = useState(false);
  const [lines, setLines] = useState<VoiceLine[]>([]);
  const [level, setLevel] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [summary, setSummary] = useState<{ seconds: number; turns: number } | null>(null);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const engineRef = useRef<VoiceEngine | null>(null);
  const idRef = useRef(0);
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
  useEffect(() => () => engineRef.current?.dispose(), []);

  // Audit/CI hook: ?voice=preview forces the scripted engine (no mic, no quota).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("voice") === "preview") {
      setPreviewMode(true);
    }
  }, []);

  const pushLine = useCallback((line: Omit<VoiceLine, "id" | "at">) => {
    idRef.current += 1;
    setLines((prev) => [...prev, { ...line, id: idRef.current, at: stamp() }]);
  }, []);

  const start = useCallback(
    (preview: boolean) => {
      setError("");
      setLines([]);
      setSeconds(0);
      setSummary(null);
      setMuted(false);
      setPreviewMode(preview);
      setState("connecting");
      const events: VoiceEngineEvents = {
        onLine: pushLine,
        onLevel: setLevel,
        onReady: () => {
          if (stateRef.current === "connecting") setState("live");
        },
        onEnded: (s) => {
          setSummary(s);
          setState("ended");
        },
        onError: (message) => {
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
    },
    [lang, pushLine]
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
    engineRef.current?.dispose();
    engineRef.current = null;
    setState("idle");
    setLines([]);
    setSeconds(0);
    setSummary(null);
    setError("");
  }, []);

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

          <Orb level={level} live={state === "live"} />

          <p className="bk-voice-model">Gemini Live · Puck</p>
          <p className="bk-voice-hint">
            {state === "idle" &&
              (previewMode
                ? "Preview mode: a scripted exchange, no model connected."
                : "Press Start to talk to the agent live. Your mic stays in your browser except for the call audio.")}
            {state === "connecting" && "Opening a live session…"}
            {state === "live" && (muted ? "You're muted — the agent can't hear you." : "Speak naturally. The agent replies in real time.")}
            {state === "ended" && summary && `Call lasted ${fmtClock(summary.seconds)} · ${summary.turns} turns.`}
            {state === "error" && error}
          </p>

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
                <button
                  type="button"
                  className="bk-voice-round bk-voice-round--end"
                  onClick={end}
                  disabled={state !== "live"}
                  aria-label="End call"
                >
                  <PhoneOff className="bk-voice-btn-icon" />
                </button>
              </>
            )}
          </div>
          <p className="bk-voice-max">Max 5:00 per call · 5 calls per hour</p>
        </section>

        {/* Transcript panel */}
        <section className="bk-voice-script" aria-label="Live transcript">
          <h3 className="bk-voice-script-title">Live transcript</h3>
          <div className="bk-voice-lines" ref={transcriptRef} aria-live="polite">
            {lines.length === 0 && (
              <p className="bk-voice-empty">
                {state === "live" || state === "connecting"
                  ? "Listening…"
                  : "Transcript will appear here once the call starts."}
              </p>
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
