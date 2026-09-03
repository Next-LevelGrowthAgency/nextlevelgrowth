import { businessPathPrompts, responseDepthPromptHeading, responseDepthPrompts, welcomeMessage } from "@/lib/growth-coach/config";
import { Icon } from "@/components/ui/Icon";
import type { SuggestedPrompt } from "@/types";
import { GrowthCoachSuggestions } from "./GrowthCoachSuggestions";

export function GrowthCoachWelcome({
  prompts,
  onSelectPrompt,
}: {
  prompts: SuggestedPrompt[];
  onSelectPrompt: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="max-w-[92%] rounded-2xl bg-paper-200 px-4 py-3 text-sm leading-relaxed text-ink-800 sm:max-w-[480px]">
        {welcomeMessage.split("\n\n").map((paragraph, index) => (
          <p key={index} className={index > 0 ? "mt-2.5" : undefined}>
            {paragraph}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {businessPathPrompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            onClick={() => onSelectPrompt(prompt.id)}
            className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3 text-left text-sm font-semibold text-blue-900 shadow-soft transition-all duration-200 ease-confident hover:-translate-y-0.5 hover:shadow-lifted"
          >
            <Icon name={prompt.icon} className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            <span>{prompt.label}</span>
          </button>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{responseDepthPromptHeading}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {responseDepthPrompts.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              onClick={() => onSelectPrompt(prompt.id)}
              title={prompt.description}
              className="rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-medium text-ink-700 shadow-soft transition-colors hover:border-blue-400 hover:text-blue-700"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>

      <GrowthCoachSuggestions prompts={prompts} onSelect={onSelectPrompt} />
    </div>
  );
}
