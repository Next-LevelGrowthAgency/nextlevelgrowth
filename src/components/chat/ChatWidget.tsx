"use client";

import { primaryCta } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I'm the Next Level Growth virtual assistant. I can help point you toward the right service or get you started on a Free Growth Audit — what can I help with?",
};

/**
 * Optional AI chat widget. Renders nothing when NEXT_PUBLIC_CHAT_ENABLED
 * is not "true" in the environment — this is the "easy to disable" switch
 * called for in the master spec, so the site can ship with the
 * architecture in place but the UI hidden until it's ready to go live.
 */
export function ChatWidget() {
  const enabled = process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  if (!enabled) return null;

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: nextMessages.slice(-10) }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "Sorry, something went wrong. Please try again." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. You can reach our team directly from the Contact page.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="flex h-[480px] w-[340px] flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lifted">
          <div className="flex items-center justify-between bg-ink-900 px-4 py-3 text-paper-100">
            <div>
              <p className="text-sm font-semibold">Next Level Growth</p>
              <p className="text-xs text-paper-400">Virtual assistant · not a live person</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1 hover:bg-white/10"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4" role="log" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  message.role === "assistant"
                    ? "bg-paper-200 text-ink-800"
                    : "ml-auto bg-grove-600 text-white"
                )}
              >
                {message.content}
              </div>
            ))}
            {sending ? <p className="text-xs text-ink-400">Typing…</p> : null}
          </div>

          <div className="border-t border-ink-100 p-3">
            <a href={primaryCta.href} className="mb-2 block text-center text-xs font-medium text-grove-700 underline">
              Prefer to just request a Growth Audit?
            </a>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor="chat-input" className="sr-only">
                Type your message
              </label>
              <input
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 rounded-full border border-ink-200 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={sending}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-grove-600 text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-grove-600 text-white shadow-lifted hover:bg-grove-700"
          aria-label="Open chat with our virtual assistant"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
