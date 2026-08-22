// app/api/chat/route.ts
export const runtime = "edge";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextResponse } from "next/server";

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

function asPdfPart(base64Data: string) {
  return {
    inlineData: {
      data: base64Data,
      mimeType: "application/pdf",
    },
  };
}

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Fetches the resume as a PDF (not text) so Gemini can read the certificate
 * images too. Redis only caches it — every cache call is best-effort, so a
 * Redis failure costs a re-download, never the answer.
 */
async function getResumeContextPdf() {
  const docId = process.env.GOOGLE_DOC_ID;
  if (!docId) throw new Error("GOOGLE_DOC_ID is not defined");

  const cacheKey = `resume_pdf_cache_${docId}`;

  const cached = await redis.get<string>(cacheKey).catch((error) => {
    console.error("Resume cache read failed, re-downloading:", error);
    return null;
  });

  if (cached) {
    console.log("Resume PDF served from Upstash cache");
    return asPdfPart(cached);
  }

  try {
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=pdf`;
    const response = await fetch(exportUrl, { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`Google Docs export returned ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    console.log("Resume PDF downloaded from Google Docs");

    // Best-effort: a failed cache write only costs the next request a download.
    await redis
      .set(cacheKey, base64Data, { ex: 3600 })
      .catch((error) => console.error("Resume cache write failed:", error));

    return asPdfPart(base64Data);
  } catch (error) {
    console.error("Resume PDF download failed:", error);
    return null;
  }
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

    // 1. Fetch the resume PDF
    const pdfPart = await getResumeContextPdf();

    if (!pdfPart) {
      return NextResponse.json({
        response: "Maaf, saat ini saya tidak dapat mengakses data dokumen.",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      safetySettings,
    });

    // 2. The system prompt points Gemini at the attached file as its only source
    const systemPrompt = `
You are a highly polite, professional, and helpful personal AI assistant for Rahmad Rizki. 
Your task is to answer questions from visitors to Rahmad Rizki's portfolio website regarding his background, skills, experience, and the certificates he has achieved.

Use the attached PDF document as your ONLY reference. This document contains Rizki's text data as well as images of his certificates. You must analyze BOTH the text and the visual contents (images/certificates) to answer the visitor's question.

STRICT RULES FOR ANSWERING:
1. ONLY answer based on the information provided in the attached PDF document. If it's in an image/certificate, you can read and use that information.
2. If the information is NOT in the document, reply politely: "I'm sorry, I don't have that specific detail in my records about Rizki. You can contact him directly via email or WhatsApp." (Translate this to Indonesian if the user asks in Indonesian).
3. NO HALLUCINATIONS. Never make up information.
4. Never mention "Google Drive", "Document", "PDF", or source file names. Just refer to it as "Rizki's data".
5. LANGUAGE: Your default language is ENGLISH. However, if the visitor's question is in INDONESIAN, you MUST reply entirely in INDONESIAN. Match the user's language.
6. FORMATTING & READABILITY: 
   - ALWAYS use clear paragraphs with line breaks (empty lines) between them.
   - Use bullet points (-) or numbered lists for multiple items (like skills or experiences) with proper indentation.
   - Do not output giant walls of text. Keep it easily scannable for a small chat interface.
7. You are Rizki's assistant, refer to him as "Rizki", "he", or "him".

Visitor's Question: ${message}
`;

    // 3. Send the prompt and the PDF together
    const result = await model.generateContent([systemPrompt, pdfPart]);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
