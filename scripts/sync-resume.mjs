#!/usr/bin/env node
/**
 * Transcribes the Google Doc résumé into content/resume.json.
 *
 * The chatbot used to send the whole résumé PDF to Gemini on every visitor
 * message, which cost ~38s per reply for a document that never changes between
 * messages. This script does that reading once, when the document actually
 * changes, so the request path only ever handles ~8KB of text.
 *
 * Run it with `npm run resume:sync`. CI runs the same command hourly.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../content/resume.json");
// gemini-2.5-flash allows only 20 free-tier requests a day and is the slowest
// of the current flash models; this one read the certificate images just as
// accurately when measured.
const MODEL = "gemini-3.5-flash";

const EXTRACTION_PROMPT = `Transcribe this resume document into complete, well-structured Markdown.

Include EVERYTHING: contact details, summary, skills, work experience, education,
hackathons, projects. For every certificate image, transcribe its full contents —
title, issuing organisation, date, credential id, and any hours or scores shown.

This transcription will be the ONLY reference used to answer questions later, so
losing a detail means losing it permanently. Output the Markdown only.`;

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Locally it comes from .env.local; in CI from repository secrets.`);
    process.exit(1);
  }
  return value;
}

async function downloadResumePdf(docId) {
  const url = `https://docs.google.com/document/d/${docId}/export?format=pdf`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Docs export returned ${response.status}. Is the document publicly readable?`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  // A Google Docs PDF export of an HTML error page would still be a 200, so
  // check we actually got a PDF before spending a Gemini call on it.
  if (!bytes.subarray(0, 5).toString("latin1").startsWith("%PDF-")) {
    throw new Error("Google Docs did not return a PDF — check the document ID and its sharing settings.");
  }
  return bytes;
}

async function transcribe(pdf, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const body = {
    contents: [
      {
        parts: [
          { text: EXTRACTION_PROMPT },
          { inlineData: { data: pdf.toString("base64"), mimeType: "application/pdf" } },
        ],
      },
    ],
  };

  // Gemini returns transient 503s under load often enough to fail a nightly
  // job on its own; a few spaced retries make the schedule reliable.
  for (let attempt = 1; attempt <= 4; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.status === 503 && attempt < 4) {
      console.warn(`Gemini is busy (503), retrying in ${attempt * 5}s...`);
      await new Promise((r) => setTimeout(r, attempt * 5000));
      continue;
    }
    if (!response.ok) {
      throw new Error(`Gemini returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }

    const text = (await response.json()).candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text?.trim()) throw new Error("Gemini returned an empty transcription.");
    return text.trim();
  }
  throw new Error("Gemini stayed unavailable across every retry.");
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    return null; // first run, or the file was deleted on purpose
  }
}

const apiKey = required("GEMINI_API_KEY");
const docId = required("GOOGLE_DOC_ID");

const pdf = await downloadResumePdf(docId);
const hash = createHash("sha256").update(pdf).digest("hex");
const existing = await readExisting();

if (existing?.sourceHash === hash) {
  console.log("Résumé unchanged — skipping transcription, no Gemini call spent.");
  process.exit(0);
}

console.log(
  existing
    ? "Résumé changed, re-transcribing..."
    : "No transcription yet, running the first one..."
);

const markdown = await transcribe(pdf, apiKey);

await mkdir(dirname(OUT), { recursive: true });
await writeFile(
  OUT,
  JSON.stringify(
    { sourceHash: hash, syncedAt: new Date().toISOString(), markdown },
    null,
    2
  ) + "\n"
);

console.log(`Wrote ${OUT} — ${markdown.length.toLocaleString()} characters from a ${(pdf.length / 1024 / 1024).toFixed(2)} MB PDF.`);
