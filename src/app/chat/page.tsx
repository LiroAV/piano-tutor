"use client";

import { useEffect, useRef, useState } from "react";
import { useProfile } from "@/lib/user/profile";

type Message = { role: "user" | "assistant"; content: string };

const WELCOME: Message = {
  role: "assistant",
  content:
    "Hi! I'm your piano tutor. Ask me anything — theory, technique, what to practice, or how to play a specific piece.",
};

export default function ChatPage() {
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMessage: Message = { role: "user", content: text };
    const history = [...messages, userMessage];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          profile: profile ?? undefined,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Bad response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: reply },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "Sorry, I couldn't respond right now. Try again.",
        },
      ]);
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-zinc-800">
        <h1 className="text-sm font-semibold text-zinc-200">Tutor Chat</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Ask about theory, technique, or what to practice next
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={[
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start",
            ].join(" ")}
          >
            <div
              className={[
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-zinc-800 text-zinc-200 rounded-bl-sm",
              ].join(" ")}
            >
              {msg.content ? (
                msg.content
              ) : (
                <span className="flex gap-1 items-center py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Suggestion chips — only shown when just the welcome message */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              "Give me a 20-minute practice plan",
              "What is a major scale?",
              "How do I improve my left hand?",
              "Explain quarter notes and half notes",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInput(suggestion);
                  inputRef.current?.focus();
                }}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-zinc-800 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your tutor anything…"
            disabled={streaming}
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 disabled:opacity-60 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {streaming ? "…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
