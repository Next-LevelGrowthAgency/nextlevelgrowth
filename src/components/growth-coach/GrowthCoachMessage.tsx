"use client";

import { Badge } from "@/components/ui/Badge";
import { coachingModes } from "@/lib/growth-coach/config";
import { cn } from "@/lib/utils";
import type { CoachMessage, QuickReplyAction } from "@/types";
import { Check, Copy } from "lucide-react";
import { Fragment, useState } from "react";
import { GrowthCoachReport } from "./GrowthCoachReport";

function renderBoldSegments(line: string) {
  return line.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  );
}

function renderContent(content: string) {
  return content.split(/\n\n+/).map((paragraph, index) => (
    <p key={index} className={index > 0 ? "mt-2" : undefined}>
      {paragraph.split("\n").map((line, lineIndex, lines) => (
        <Fragment key={lineIndex}>
          {renderBoldSegments(line)}
          {lineIndex < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </p>
  ));
}

export function GrowthCoachMessage({
  message,
  onQuickReply,
  onScoreAnswer,
  activeScoreQuestionId,
}: {
  message: CoachMessage;
  onQuickReply: (action: QuickReplyAction, label: string) => void;
  onScoreAnswer: (promptId: string, label: string) => void;
  activeScoreQuestionId: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === "assistant";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied by the browser — fail silently, the
      // button simply won't show the "copied" confirmation.
    }
  }

  return (
    <div className={cn("flex flex-col", !isAssistant && "items-end")}>
      {isAssistant && message.report ? (
        <div className="mb-1">
          <Badge tone={coachingModes[message.mode ?? "clarity"].badgeTone}>{coachingModes[message.mode ?? "clarity"].label}</Badge>
        </div>
      ) : null}

      <div
        className={cn(
          // Capped independently of the panel's own width so lines stay a
          // comfortable reading length even at the ~600px desktop size.
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[440px]",
          isAssistant ? "bg-paper-200 text-ink-800" : "bg-grove-600 text-white"
        )}
      >
        {renderContent(message.content)}
      </div>

      {isAssistant && message.report ? <GrowthCoachReport report={message.report} /> : null}

      {isAssistant && message.cta ? (
        <a
          href={message.cta.href}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-grove-600 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-all duration-200 ease-confident hover:bg-grove-700 hover:shadow-lifted"
        >
          {message.cta.label}
        </a>
      ) : null}

      {isAssistant && message.scoreQuestion && message.scoreQuestion.questionId === activeScoreQuestionId ? (
        <div className="mt-2 w-full max-w-[92%]">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-ink-500">
            <span>
              Question {message.scoreQuestion.progress.answered + 1} of {message.scoreQuestion.progress.total}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-paper-200" role="img" aria-label={`Progress: ${message.scoreQuestion.progress.answered} of ${message.scoreQuestion.progress.total} answered`}>
            <div
              className="h-1 rounded-full bg-grove-600 transition-all duration-300 motion-reduce:transition-none"
              style={{ width: `${(message.scoreQuestion.progress.answered / message.scoreQuestion.progress.total) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {message.scoreQuestion.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onScoreAnswer(`score:${message.scoreQuestion!.questionId}:${option.value}`, option.label)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-medium transition-colors hover:border-ink-900 hover:bg-ink-50",
                  option.value === "unknown" || option.value === "not-applicable" ? "border-dashed border-ink-200 text-ink-500" : "border-ink-300 text-ink-800"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {isAssistant && message.quickReplies ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {message.quickReplies.map((reply) => (
            <button
              key={reply.action}
              type="button"
              onClick={() => onQuickReply(reply.action, reply.label)}
              className="rounded-full border border-ink-300 px-4 py-2 text-xs font-medium text-ink-800 transition-colors hover:border-ink-900 hover:bg-ink-50"
            >
              {reply.label}
            </button>
          ))}
        </div>
      ) : null}

      {isAssistant ? (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Response copied" : "Copy response"}
          className="mt-1 inline-flex items-center gap-1 self-start rounded-full px-1.5 py-1 text-[11px] text-ink-500 transition-colors hover:text-ink-700"
        >
          {copied ? <Check className="h-3 w-3" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      ) : null}
    </div>
  );
}
