// app/api/chat/route.ts
export const runtime = "edge";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

// Fungsi untuk mengambil dokumen dari Google Docs sebagai PDF
async function getResumeContextPdf() {
  const docId = process.env.GOOGLE_DOC_ID;
  if (!docId) throw new Error("GOOGLE_DOC_ID is not defined");

  // Ubah format menjadi 'pdf' agar gambar sertifikat tetap dipertahankan
  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=pdf`;

  try {
    const response = await fetch(exportUrl, { next: { revalidate: 3600 } });
    if (!response.ok)
      throw new Error("Gagal mengambil dokumen dari Google Drive");

    // Ambil data dalam bentuk buffer
    const arrayBuffer = await response.arrayBuffer();

    // Konversi ke format Base64 yang dibutuhkan oleh Gemini
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    // Kembalikan objek inlineData untuk API Gemini
    return {
      inlineData: {
        data: base64Data,
        mimeType: "application/pdf",
      },
    };
  } catch (error) {
    console.error("Error fetching doc:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // 1. Ambil PDF dari Google Drive
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

    // 2. Sesuaikan System Prompt untuk memberitahu bahwa referensinya adalah file terlampir
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

    // 3. Kirimkan teks prompt dan file PDF secara bersamaan ke Gemini
    const result = await model.generateContent([systemPrompt, pdfPart]);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
