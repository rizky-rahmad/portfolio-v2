// app/api/chat/route.ts
export const runtime = "edge";

import { NextResponse } from "next/server";

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

import resume from "@/content/resume.json";

/**
 * The resume ships with the bundle, transcribed from the Google Doc by
 * scripts/sync-resume.mjs (hourly, in CI). Sending the PDF itself on every
 * message cost ~38s per reply while producing the same reading every time.
 * Nothing here touches Google Docs, and Redis is only the rate limiter.
 */
/**
 * Free-tier quota is counted per project PER MODEL — gemini-2.5-flash allows
 * only 20 requests a day, and once it is spent the chatbot is dead until
 * midnight. Listing a second model gives it a second bucket. They are in speed
 * order; both answered certificate-detail questions correctly when measured.
 */
const MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];

const endpointFor = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(15, "1 m"),
  analytics: true,
});

/**
 * ponytail: the rate limiter fails OPEN. Redis is a guard rail, not the feature
 * — an Upstash outage used to throw here and take the whole chatbot down with a
 * 500. Traffic on a personal portfolio is low and Gemini enforces its own quota,
 * so serving unthrottled beats serving nothing. If abuse ever shows up, swap
 * this for an in-memory fallback counter.
 */
async function isWithinRateLimit(ip: string) {
  try {
    const { success } = await ratelimit.limit(ip);
    return success;
  } catch (error) {
    console.error("Rate limiter unavailable, allowing request:", error);
    return true;
  }
}

const safetySettings = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
];

/**
 * Calls Gemini over REST rather than through @google/generative-ai: that SDK is
 * end-of-life and has no thinkingConfig, and disabling thinking is what takes a
 * reply from ~5.8s to ~2.7s here.
 */
async function askGemini(prompt: string) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    safetySettings,
    generationConfig: {
      // Looking a fact up in a resume is retrieval, not reasoning. Measured no
      // loss of accuracy on certificate dates and exam scores with this off.
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  // 429 is a spent daily quota and 503 is "high demand" — during testing Gemini
  // returned both. Neither is a bug the visitor should read as "technical
  // problems", and both are answered by trying the next model instead.
  for (const model of MODELS) {
    const response = await fetch(`${endpointFor(model)}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.status === 429 || response.status === 503) {
      console.warn(`${model} unavailable (${response.status}), falling back to the next model`);
      continue;
    }

    if (!response.ok) {
      throw new Error(`${model} returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((p: { text?: string }) => p.text ?? "").join("").trim();
    if (text) return text;

    console.warn(`${model} returned an empty answer, falling back to the next model`);
  }

  return null;
}

function buildPrompt(message: string) {
  return `
You are a highly polite, professional, and helpful personal AI assistant for Rahmad Rizki.
Your task is to answer questions from visitors to Rahmad Rizki's portfolio website regarding his background, skills, experience, and the certificates he has achieved.

Use the reference below as your ONLY source. It is a transcription of Rizki's resume, including the full contents of his certificates.

STRICT RULES FOR ANSWERING:
1. ONLY answer based on the information in the reference.
2. If the information is NOT there, reply politely: "I'm sorry, I don't have that specific detail in my records about Rizki. You can contact him directly via email or WhatsApp." (Translate this to Indonesian if the user asks in Indonesian).
3. NO HALLUCINATIONS. Never make up information.
4. Never mention "Google Drive", "Document", "PDF", "transcription", or source file names. Just refer to it as "Rizki's data".
5. LANGUAGE: Your default language is ENGLISH. However, if the visitor's question is in INDONESIAN, you MUST reply entirely in INDONESIAN. Match the user's language.
6. FORMATTING & READABILITY:
   - ALWAYS use clear paragraphs with line breaks (empty lines) between them.
   - Use bullet points (-) or numbered lists for multiple items (like skills or experiences) with proper indentation.
   - Do not output giant walls of text. Keep it easily scannable for a small chat interface.
7. You are Rizki's assistant, refer to him as "Rizki", "he", or "him".

--- REFERENCE: RIZKI'S DATA ---
${resume.markdown}
--- END OF REFERENCE ---

Visitor's Question: ${message}
`;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("cf-connecting-ip") || "anonymous";

    if (!(await isWithinRateLimit(ip))) {
      return NextResponse.json(
        {
          response:
            "You already ask 15 questions in a minute, please wait 60 seconds!",
        },
        { status: 429, statusText: "Too Many Requests" }
      );
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const text = await askGemini(buildPrompt(message));

    if (!text) {
      return NextResponse.json({
        response:
          "Maaf, layanan AI sedang sibuk. Silakan coba lagi sebentar lagi.",
      });
    }

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
