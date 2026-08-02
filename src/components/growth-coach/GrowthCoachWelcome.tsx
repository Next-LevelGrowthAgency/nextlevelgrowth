import { welcomeMessage } from "@/lib/growth-coach/config";
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
      <GrowthCoachSuggestions prompts={prompts} onSelect={onSelectPrompt} />
    </div>
  );
}
