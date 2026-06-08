// components/chatbot/ChatbotWidget.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  BotMessageSquare,
  X,
  SendHorizontal,
  Loader2,
  MessageCircleQuestion,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "ai";
  content: string;
}

export function ChatbotWidget() {
  // 1. Tambahkan state isMounted untuk mencegah Hydration Error
  const [isMounted, setIsMounted] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hi! I'm AI assistant Rahmad Rizki. Can I help you with anything regarding Rahmad's experience or qualifications?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. Ubah state isMounted menjadi true hanya ketika di sisi Client (Browser)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 3. Auto-scroll ke pesan terbaru atau saat jendela chat baru dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput(""); // Clear input
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (data.response) {
        setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "Sorry, technical problems." },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, Gemini server is Error." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Jika belum mount di client, jangan render apa-apa (mencegah error server vs client)
  if (!isMounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-secondary border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20">
                  <BotMessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Ask Rizky AI</h3>
                  <p className="text-xs text-primary-foreground/80">
                    Answers only based on Rahmad's experience and qualifications.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-background">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none whitespace-pre-wrap"
                        : "bg-secondary text-foreground rounded-bl-none border border-border"
                    }`}
                  >
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      // 5. Bungkus dengan div, letakkan className di sini
                      <div className="space-y-3">
                        <ReactMarkdown
                          components={{
                            ul: ({ node: _node, ...props }: any) => (
                              <ul className="list-disc pl-4 space-y-1" {...props} />
                            ),
                            ol: ({ node: _node, ...props }: any) => (
                              <ol className="list-decimal pl-4 space-y-1" {...props} />
                            ),
                            li: ({ node: _node, ...props }: any) => (
                              <li className="leading-relaxed" {...props} />
                            ),
                            p: ({ node: _node, ...props }: any) => (
                              <p className="leading-relaxed" {...props} />
                            ),
                            strong: ({ node: _node, ...props }: any) => (
                              <strong className="font-semibold" {...props} />
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] px-4 py-3 rounded-xl bg-secondary text-foreground rounded-bl-none border border-border flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-secondary border-t border-border flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask something..."
                className="flex-1 p-2.5 text-sm bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition"
              >
                <SendHorizontal className="w-5 h-5" />
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Floating Button (Sticky) */}
      <m.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-4 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center gap-2"
        aria-label="Open chat"
      >
        <MessageCircleQuestion className="w-6 h-6" />
        <span className="font-semibold text-sm">Ask Me</span>
      </m.button>
    </div>
  );
}