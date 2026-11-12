import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const path = new URL('../content/knowledge.json', import.meta.url)
const indexPath = new URL('../content/knowledge-index.json', import.meta.url)
const model = 'models/gemini-embedding-001'
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) throw new Error('GEMINI_API_KEY is required to build the semantic index')
const chunks = JSON.parse(await readFile(path, 'utf8'))
const requests = chunks.map(({ title, text }) => ({ model, content: { parts: [{ text }] }, taskType: 'RETRIEVAL_DOCUMENT', title, outputDimensionality: 768 }))
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:batchEmbedContents`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
  body: JSON.stringify({ requests }), signal: AbortSignal.timeout(60000),
})
if (!response.ok) throw new Error(`Embedding request failed: ${response.status}`)
const { embeddings } = await response.json()
if (!Array.isArray(embeddings) || embeddings.length !== chunks.length || embeddings.some(e => !Array.isArray(e.values) || e.values.length !== 768 || e.values.some(v => !Number.isFinite(v)))) throw new Error('Invalid embedding response')
const hash = createHash('sha256').update(JSON.stringify(chunks)).digest('hex')
await writeFile(indexPath, JSON.stringify({ model, dimensions: 768, hash, vectors: embeddings.map(e => e.values) }) + '\n')
console.log(`Indexed ${chunks.length} approved knowledge sections`)
