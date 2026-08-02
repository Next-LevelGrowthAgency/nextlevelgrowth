"use client";

import { RotateCcw, Send } from "lucide-react";
import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";

const MAX_TEXTAREA_HEIGHT_PX = 120;

export function GrowthCoachInput({
  value,
  onChange,
  onSend,
  onReset,
  disabled,
  hasMessages,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onReset: () => void;
  disabled: boolean;
  hasMessages: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  }, [value]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSend();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  }

  return (
    <div className="border-t border-ink-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
      {hasMessages ? (
        <button
          type="button"
          onClick={onReset}
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-800"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Reset conversation
        </button>
      ) : null}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <label htmlFor="growth-coach-input" className="sr-only">
          Type your message to the Growth Coach
        </label>
        <textarea
          ref={textareaRef}
          id="growth-coach-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell me what's on your mind…"
          rows={1}
          autoComplete="off"
          className="max-h-[120px] min-h-[42px] flex-1 resize-none rounded-2xl border border-ink-200 px-4 py-2.5 text-sm leading-relaxed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={disabled || !value.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-grove-600 text-white transition-colors hover:bg-grove-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
