import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { cosine, selectKnowledge, type KnowledgeChunk, type KnowledgeIndex } from './knowledge-retrieval.ts'

const chunks: KnowledgeChunk[] = [{ id: 'a', title: 'A', text: 'AI' }, { id: 'b', title: 'B', text: 'Education' }]
const index: KnowledgeIndex = { model: 'models/gemini-embedding-001', dimensions: 2, hash: createHash('sha256').update(JSON.stringify(chunks)).digest('hex'), vectors: [[1, 0], [0, 1]] }

test('cosine ranks matching vectors and handles zero vectors', () => {
  assert.equal(cosine([1, 0], [1, 0]), 1)
  assert.equal(cosine([0, 0], [1, 0]), 0)
})
test('semantic search orders knowledge by query embedding', async () => {
  const fake: typeof fetch = async () => Response.json({ embedding: { values: [0, 1] } })
  assert.deepEqual((await selectKnowledge('Where did he study?', chunks, index, 'key', fake)).map(x => x.id), ['b', 'a'])
})
test('falls back to all approved facts when the index is stale or embedding fails', async () => {
  const fail: typeof fetch = async () => { throw new Error('offline') }
  assert.deepEqual(await selectKnowledge('test', chunks, index, 'key', fail), chunks)
  assert.deepEqual(await selectKnowledge('test', chunks, { ...index, hash: 'stale' }, 'key', fail), chunks)
  assert.deepEqual(await selectKnowledge('test', chunks, index, undefined, fail), chunks)
})
