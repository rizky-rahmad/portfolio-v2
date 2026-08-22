"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

/**
 * The chatbot (and its heavy deps: react-markdown + framer-motion) is not needed
 * for first paint, so it is loaded as a separate client-only chunk.
 *
 * Mounting it straight away still hurt: the chunk went on the wire while the
 * browser was painting the hero, and blocking it in a throttled mobile profile
 * moved FCP 2336ms -> 1600ms and LCP 2728ms -> 2012ms. So wait for the browser
 * to finish the important work first, then load it.
 */
const ChatbotWidget = dynamic(
  () => import("./ChatBotWidget").then((m) => m.ChatbotWidget),
  { ssr: false }
)

export function LazyChatbot() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // ponytail: requestIdleCallback where it exists, a timer where it doesn't
    // (Safari only shipped it recently). The timeout caps the wait so the button
    // still appears on a page that never goes idle.
    if (typeof window.requestIdleCallback !== "function") {
      const timer = window.setTimeout(() => setShouldLoad(true), 2500)
      return () => window.clearTimeout(timer)
    }

    const handle = window.requestIdleCallback(() => setShouldLoad(true), {
      timeout: 4000,
    })
    return () => window.cancelIdleCallback(handle)
  }, [])

  return shouldLoad ? <ChatbotWidget /> : null
}
