export interface KnowledgeChunk { id: string; title: string; text: string }
export interface KnowledgeIndex { model: string; dimensions: number; hash: string; vectors: number[][] }

export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || !a.length) return 0
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2 }
  return na && nb ? dot / Math.sqrt(na * nb) : 0
}

async function digest(chunks: KnowledgeChunk[]): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(chunks))
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('')
}

export async function selectKnowledge(message: string, chunks: KnowledgeChunk[], index: KnowledgeIndex, apiKey: string | undefined, fetcher: typeof fetch = fetch): Promise<KnowledgeChunk[]> {
  // Any stale or unavailable index falls back to all approved facts.
  try {
    if (!apiKey || index.model !== 'models/gemini-embedding-001' || index.vectors.length !== chunks.length || index.hash !== await digest(chunks)) return chunks
    const response = await fetcher(`https://generativelanguage.googleapis.com/v1beta/${index.model}:embedContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ content: { parts: [{ text: message }] }, taskType: 'RETRIEVAL_QUERY', outputDimensionality: index.dimensions }),
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) return chunks
    const query: unknown = (await response.json())?.embedding?.values
    if (!Array.isArray(query) || query.length !== index.dimensions || !query.every(v => typeof v === 'number' && Number.isFinite(v))) return chunks
    if (index.vectors.some(v => v.length !== index.dimensions || v.some(n => !Number.isFinite(n)))) return chunks
    const ranked = chunks.map((chunk, i) => ({ chunk, score: cosine(query, index.vectors[i]) }))
      .sort((a, b) => b.score - a.score).slice(0, Math.min(6, chunks.length)).map(x => x.chunk)
    const essentials = chunks.filter(chunk => chunk.id === 'profile' || chunk.id === 'pt-unicorn-overview')
    return [...essentials, ...ranked.filter(chunk => !essentials.includes(chunk))]
  } catch { return chunks }
}
