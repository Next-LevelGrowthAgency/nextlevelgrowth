"use client";

import { suggestedPrompts } from "@/lib/growth-coach/config";
import { cn } from "@/lib/utils";
import type { CoachMessage, QuickReplyAction } from "@/types";
import { useEffect, useId, useRef } from "react";
import { GrowthCoachDisclaimer } from "./GrowthCoachDisclaimer";
import { GrowthCoachHeader } from "./GrowthCoachHeader";
import { GrowthCoachInput } from "./GrowthCoachInput";
import { GrowthCoachMessage } from "./GrowthCoachMessage";
import { GrowthCoachTypingIndicator } from "./GrowthCoachTypingIndicator";
import { GrowthCoachWelcome } from "./GrowthCoachWelcome";

export function GrowthCoachPanel({
  messages,
  sending,
  minimized,
  inputValue,
  onInputChange,
  onSend,
  onReset,
  onClose,
  onToggleMinimize,
  onSelectPrompt,
  onQuickReply,
  onScoreAnswer,
  activeScoreQuestionId,
}: {
  messages: CoachMessage[];
  sending: boolean;
  minimized: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onReset: () => void;
  onClose: () => void;
  onToggleMinimize: () => void;
  onSelectPrompt: (id: string) => void;
  onQuickReply: (action: QuickReplyAction, label: string) => void;
  onScoreAnswer: (promptId: string, label: string) => void;
  activeScoreQuestionId: string | null;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (minimized) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, minimized]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={cn(
        "flex flex-col overflow-hidden rounded-none border-0 bg-white shadow-lifted outline-none sm:rounded-2xl sm:border sm:border-ink-100",
        // Preferred desktop maximum ~600x800, fluidly clamped so the panel
        // never exceeds the visible viewport on smaller desktop/tablet
        // windows. Mobile stays full-screen, unchanged.
        "fixed inset-0 sm:static sm:w-[min(600px,calc(100vw-3rem))] sm:h-[min(800px,calc(100dvh-7rem))]",
        minimized && "sm:h-auto"
      )}
    >
      <GrowthCoachHeader minimized={minimized} onToggleMinimize={onToggleMinimize} onClose={onClose} titleId={titleId} />

      {!minimized ? (
        <>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6" role="log" aria-live="polite">
            {messages.length === 0 ? <GrowthCoachWelcome prompts={suggestedPrompts} onSelectPrompt={onSelectPrompt} /> : null}
            {messages.map((message) => (
              <GrowthCoachMessage
                key={message.id}
                message={message}
                onQuickReply={onQuickReply}
                onScoreAnswer={onScoreAnswer}
                activeScoreQuestionId={activeScoreQuestionId}
              />
            ))}
            {sending ? <GrowthCoachTypingIndicator /> : null}
          </div>

          <GrowthCoachInput
            value={inputValue}
            onChange={onInputChange}
            onSend={onSend}
            onReset={onReset}
            disabled={sending}
            hasMessages={messages.length > 0}
          />
          <GrowthCoachDisclaimer />
        </>
      ) : null}
    </div>
  );
}
