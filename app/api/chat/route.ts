// app/api/chat/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";
import "dotenv/config"

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

// Fungsi untuk mengambil teks dari Google Docs
async function getResumeContext() {
  const docId = process.env.GOOGLE_DOC_ID;
  if (!docId) throw new Error("GOOGLE_DOC_ID is not defined");

  // URL ini akan secara otomatis mengunduh/mengekstrak dokumen dalam format Plain Text (.txt)
  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
  
  try {
    // Next.js akan men-cache hasil fetch ini secara otomatis (bisa diatur revalidate-nya jika perlu)
    const response = await fetch(exportUrl, { next: { revalidate: 3600 } }); // Cache selama 1 jam
    if (!response.ok) throw new Error("Gagal mengambil dokumen dari Google Drive");
    
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("Error fetching doc:", error);
    return ""; // Kembalikan string kosong jika gagal, atau handle error sesuai kebutuhan
  }
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Ambil dokumen dari Google Drive terlebih dahulu
    const resumeContext = await getResumeContext();

    if (!resumeContext) {
        return NextResponse.json({ response: "Maaf, saat ini saya tidak dapat mengakses data dokumen." });
    }

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        safetySettings
    });

    // 2. Masukkan dokumen yang di-fetch ke dalam System Prompt
    const systemPrompt = `
You are a highly polite, professional, and helpful personal AI assistant for Rahmad Rizki. 
Your task is to answer questions from visitors to Rahmad Rizki's portfolio website regarding his background, skills, and experience.

Use the following knowledge data as your ONLY reference:
----------------------------------------------------------------------------------
${resumeContext}
----------------------------------------------------------------------------------

STRICT RULES FOR ANSWERING:
1. ONLY answer based on the information provided in the knowledge data above.
2. If the information is NOT in the data, reply politely: "I'm sorry, I don't have that specific detail in my records about Rizki. You can contact him directly via email or WhatsApp." (Translate this to Indonesian if the user asks in Indonesian).
3. NO HALLUCINATIONS. Never make up information.
4. Never mention "Google Drive", "Document", or source file names. Just refer to it as "Rizki's data".
5. LANGUAGE: Your default language is ENGLISH. However, if the visitor's question is in INDONESIAN, you MUST reply entirely in INDONESIAN. Match the user's language.
6. FORMATTING & READABILITY: 
   - ALWAYS use clear paragraphs with line breaks (empty lines) between them.
   - Use bullet points (-) or numbered lists for multiple items (like skills or experiences) with proper indentation.
   - Do not output giant walls of text. Keep it easily scannable for a small chat interface.
7. You are Rizki's assistant, refer to him as "Rizki", "he", or "him".

Visitor's Question: ${message}
`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ response: text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}