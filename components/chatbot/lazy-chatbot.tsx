"use client"

import dynamic from "next/dynamic"

/**
 * The chatbot (and its heavy deps: react-markdown + framer-motion) is not needed
 * for first paint, so it is loaded as a separate client-only chunk after hydration.
 */
const ChatbotWidget = dynamic(
  () => import("./ChatBotWidget").then((m) => m.ChatbotWidget),
  { ssr: false }
)

export function LazyChatbot() {
  return <ChatbotWidget />
}
