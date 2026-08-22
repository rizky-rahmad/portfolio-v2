import { test } from "node:test";
import assert from "node:assert/strict";

import { parseHistory, type Message } from "./chat-history.ts";

const conversation: Message[] = [
  { role: "ai", content: "Hi!" },
  { role: "user", content: "Where did Rizki study?" },
];

test("restores a stored conversation", () => {
  assert.deepEqual(parseHistory(JSON.stringify(conversation)), conversation);
});

test("treats an absent or empty value as no history", () => {
  assert.equal(parseHistory(null), null);
  assert.equal(parseHistory(""), null);
  assert.equal(parseHistory("[]"), null);
});

test("survives anything else living under the key", () => {
  assert.equal(parseHistory("not json at all"), null);
  assert.equal(parseHistory('{"role":"ai"}'), null); // an object, not an array
  assert.equal(parseHistory("null"), null);
});

test("drops entries that are not messages, keeps the ones that are", () => {
  const raw = JSON.stringify([
    { role: "user", content: "kept" },
    { role: "system", content: "unknown role" },
    { role: "ai", content: 42 },
    null,
    "a bare string",
    { role: "ai", content: "also kept" },
  ]);

  assert.deepEqual(parseHistory(raw), [
    { role: "user", content: "kept" },
    { role: "ai", content: "also kept" },
  ]);
});

test("returns null when nothing in the array survives", () => {
  assert.equal(parseHistory(JSON.stringify([null, { role: "system" }])), null);
});
