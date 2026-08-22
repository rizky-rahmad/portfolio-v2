/**
 * The chatbot conversation is kept in localStorage so a returning visitor still
 * sees what they asked before. It never leaves their device, and it does not
 * follow them between their phone and their laptop.
 */
export interface Message {
  role: "user" | "ai";
  content: string;
}

const STORAGE_KEY = "rizky-chat-history";

// ponytail: a plain message cap instead of byte accounting. localStorage dies at
// around 5MB and this keeps even a long chat far below it; count bytes only if
// messages ever start carrying something heavier than text.
const MAX_STORED_MESSAGES = 60;

export const GREETING: Message = {
  role: "ai",
  content:
    "Hi! I'm AI assistant Rahmad Rizki. Can I help you with anything regarding Rahmad's experience or qualifications?",
};

/**
 * Anything could be sitting under our key — another script, a half-written
 * value, or a shape from an older version of this widget. Keep only entries
 * that still look like messages, and treat "nothing usable" as no history.
 *
 * Pure on purpose: the storage access lives in loadHistory, so this stays
 * testable without a browser.
 */
export function parseHistory(raw: string | null): Message[] | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed)) return null;

  const messages = parsed.filter(
    (m): m is Message =>
      !!m &&
      typeof m === "object" &&
      ((m as Message).role === "user" || (m as Message).role === "ai") &&
      typeof (m as Message).content === "string"
  );

  return messages.length ? messages : null;
}

export function loadHistory(): Message[] | null {
  try {
    return parseHistory(localStorage.getItem(STORAGE_KEY));
  } catch {
    // Private mode or storage disabled entirely.
    return null;
  }
}

export function saveHistory(messages: Message[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.slice(-MAX_STORED_MESSAGES))
    );
  } catch {
    // Quota exceeded or storage blocked — the chat still works in memory.
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do; the caller resets its own state regardless.
  }
}
