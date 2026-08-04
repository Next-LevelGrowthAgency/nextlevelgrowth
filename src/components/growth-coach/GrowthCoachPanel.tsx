"use client";

import { suggestedPrompts } from "@/lib/growth-coach/config";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
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
  expanded,
  inputValue,
  onInputChange,
  onSend,
  onReset,
  onClose,
  onToggleMinimize,
  onExpand,
  onRestore,
  onSelectPrompt,
  onQuickReply,
  onScoreAnswer,
  activeScoreQuestionId,
}: {
  messages: CoachMessage[];
  sending: boolean;
  minimized: boolean;
  expanded: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onReset: () => void;
  onClose: () => void;
  onToggleMinimize: () => void;
  onExpand: () => void;
  onRestore: () => void;
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

  // Active for the panel's entire mounted lifetime (open, whatever its
  // minimized/expanded state) — a dialog that's on screen at all must
  // keep Tab from leaking focus out to the page behind it.
  useFocusTrap(panelRef, true);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // Escape restores from fullscreen first — a second Escape (now that
      // expanded is false) closes the whole panel. Matches the platform
      // convention of "undo the most recent view change before exiting."
      if (expanded) {
        onRestore();
      } else {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [expanded, onClose, onRestore]);

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
        "flex flex-col overflow-hidden bg-white shadow-lifted outline-none",
        expanded
          ? // Near-fullscreen contained layout at every breakpoint — fills
            // the inset-0 wrapper GrowthCoach.tsx switches to when
            // expanded. 100dvh (not 100vh) so mobile browser chrome and
            // the on-screen keyboard don't clip the input.
            "h-[100dvh] w-full rounded-none border-0 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
          : cn(
              "rounded-none border-0 sm:rounded-2xl sm:border sm:border-ink-100",
              // Preferred desktop maximum ~600x800, fluidly clamped so the
              // panel never exceeds the visible viewport on smaller
              // desktop/tablet windows. Mobile stays full-screen, unchanged.
              //
              // Width subtracts 6rem (100vw-6rem), not the original 3rem:
              // the panel now sits `1.5rem + var(--growth-coach-desktop-
              // right-offset)` from the right edge (default 72px total)
              // instead of a plain 1.5rem, so the width budget has to
              // reserve that full offset PLUS a matching ~1.5rem left
              // margin, or the panel overflows off the left edge on
              // narrow desktop widths near the sm breakpoint (verified:
              // at exactly 640px wide, the old 3rem formula put the left
              // edge 24px off-screen once the offset grew past 24px).
              "fixed inset-0 sm:static sm:w-[min(600px,calc(100vw-6rem))] sm:h-[min(800px,calc(100dvh-7rem))]",
              minimized && "sm:h-auto"
            )
      )}
    >
      <GrowthCoachHeader
        minimized={minimized}
        expanded={expanded}
        onToggleMinimize={onToggleMinimize}
        onExpand={onExpand}
        onRestore={onRestore}
        onClose={onClose}
        titleId={titleId}
      />

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
