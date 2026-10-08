// app/api/voice/token/route.ts
export const runtime = "edge";

import { NextResponse } from "next/server";

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Mints a single-use Gemini Live ephemeral token for one visitor call.
 * The browser opens its WebSocket straight to Google with that token, so
 * GEMINI_API_KEY never leaves the server. The persona, voice and model are
 * locked inside the token itself (bidiGenerateContentSetup with no
 * fieldMask, so the connection's own setup is ignored) — even a stolen
 * token can only open the demo's own audio session, in the chosen language.
 *
 * Guard rails: 5 sessions per IP per hour (voice is billed per turn over
 * an accumulating context, unlike the chat route), and the token dies
 * 30 minutes after minting whether used or not.
 */
const MODEL = "models/gemini-3.8-live";
const VOICE = "Puck";
const TOKEN_URL = "https://generativelanguage.googleapis.com/v1beta/auth_tokens";
const FETCH_TIMEOUT_MS = 10_000;

const INSTRUCTIONS = {
  en: "You are a friendly voice assistant on Rahmad Rizki's portfolio demo. Speak English. Keep replies short and conversational — one or two sentences, spoken style, no lists, no URLs, no markdown. You are a preview of the Channelflow voice agent and can chat about anything. Never claim to complete real bookings or take real actions; this demo has no backend.",
  id: "You are a friendly voice assistant on Rahmad Rizki's portfolio demo. Reply entirely in Indonesian. Keep replies short and conversational — one or two sentences, spoken style, no lists, no URLs, no markdown. You are a preview of the Channelflow voice agent and can chat about anything. Never claim to complete real bookings or take real actions; this demo has no backend.",
} as const;

type Lang = keyof typeof INSTRUCTIONS;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
});

// Same fail-open deal as the chat route: Redis is a guard rail, not the
// feature. A lost limiter must not take the demo down with it.
async function isWithinRateLimit(ip: string) {
  try {
    const { success } = await ratelimit.limit(ip);
    return success;
  } catch (error) {
    console.error("Voice rate limiter unavailable, allowing request:", error);
    return true;
  }
}

export async function POST(request: Request) {
  try {
    // Validate BEFORE touching quota or Google: malformed bodies must not
    // burn the visitor's hourly budget or a network call.
    let lang: Lang;
    try {
      const body = (await request.json()) as { lang?: unknown };
      if (body?.lang !== "en" && body?.lang !== "id") {
        return NextResponse.json({ error: 'Expected JSON body like {"lang":"en"}' }, { status: 400 });
      }
      lang = body.lang;
    } catch {
      return NextResponse.json({ error: "Expected a JSON body" }, { status: 400 });
    }

    const ip = request.headers.get("cf-connecting-ip") || "anonymous";

    if (!(await isWithinRateLimit(ip))) {
      return NextResponse.json(
        { error: "Voice demo limit reached — 5 calls per hour. Please try again later." },
        { status: 429 }
      );
    }

    const now = Date.now();
    const body = {
      uses: 1,
      expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
      newSessionExpireTime: new Date(now + 5 * 60 * 1000).toISOString(),
      // Locked persona: with setup present and no fieldMask, the Live API
      // takes the session config from here and ignores the browser's own
      // setup message. Language is chosen per call via {lang}.
      bidiGenerateContentSetup: {
        model: MODEL,
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
        },
        systemInstruction: { parts: [{ text: INSTRUCTIONS[lang] }] },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    };
    let response: Response;
    try {
      response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (error) {
      if ((error as Error).name === "TimeoutError") {
        console.warn("Voice token mint timed out, visitor should retry");
        return NextResponse.json({ error: "Voice service is slow, please try again." }, { status: 502 });
      }
      throw error;
    }

    if (!response.ok) {
      console.warn(`Voice token mint failed (${response.status}), not retrying the visitor's budget`);
      return NextResponse.json({ error: "Voice service unavailable, please try again." }, { status: 502 });
    }

    const data = (await response.json()) as { name?: string };
    if (!data?.name) {
      console.warn("Voice token mint returned no token name");
      return NextResponse.json({ error: "Voice service unavailable, please try again." }, { status: 502 });
    }

    return NextResponse.json({ token: data.name });
  } catch (error) {
    console.error("Voice token route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
