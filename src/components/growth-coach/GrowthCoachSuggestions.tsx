"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { SuggestedPrompt } from "@/types";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

function PromptCard({ prompt, onSelect }: { prompt: SuggestedPrompt; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(prompt.id)}
      className="flex items-center gap-2.5 rounded-xl border border-ink-100 bg-white px-3.5 py-3 text-left text-sm font-medium text-ink-800 shadow-soft transition-all duration-200 ease-confident hover:-translate-y-0.5 hover:border-grove-200 hover:shadow-lifted"
    >
      <Icon name={prompt.icon} className="h-4 w-4 shrink-0 text-grove-700" aria-hidden="true" />
      <span>{prompt.label}</span>
    </button>
  );
}

export function GrowthCoachSuggestions({
  prompts,
  onSelect,
}: {
  prompts: SuggestedPrompt[];
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const primary = prompts.filter((prompt) => prompt.tier === "primary");
  const more = prompts.filter((prompt) => prompt.tier === "more");

  return (
    <div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {primary.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} onSelect={onSelect} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="mt-3 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-500 hover:text-ink-800"
      >
        More ways I can help
        <ChevronDown
          aria-hidden="true"
          className={cn("h-3.5 w-3.5 transition-transform duration-300 motion-reduce:transition-none", expanded && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "grid overflow-hidden transition-all duration-300 ease-confident motion-reduce:transition-none",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {more.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} onSelect={onSelect} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
