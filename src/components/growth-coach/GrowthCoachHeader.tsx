"use client";

import { coachIdentity } from "@/lib/growth-coach/config";
import { Expand, Maximize2, Minus, Shrink, TrendingUp, X } from "lucide-react";

export function GrowthCoachHeader({
  minimized,
  expanded,
  onToggleMinimize,
  onExpand,
  onRestore,
  onClose,
  titleId,
}: {
  minimized: boolean;
  expanded: boolean;
  onToggleMinimize: () => void;
  onExpand: () => void;
  onRestore: () => void;
  onClose: () => void;
  titleId: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 bg-ink-900 px-5 py-4 text-paper-100"
      onClick={minimized ? onToggleMinimize : undefined}
      role={minimized ? "button" : undefined}
      tabIndex={minimized ? 0 : undefined}
      onKeyDown={
        minimized
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") onToggleMinimize();
            }
          : undefined
      }
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-grove-600/20 text-grove-300">
          <TrendingUp className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <div>
          <p id={titleId} className="text-sm font-semibold leading-tight">
            {coachIdentity.name}
          </p>
          {!minimized ? <p className="mt-0.5 text-xs leading-tight text-paper-400">{coachIdentity.status}</p> : null}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {minimized ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleMinimize();
            }}
            aria-label="Expand Growth Coach"
            className="rounded-full p-1.5 hover:bg-white/10"
          >
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : expanded ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRestore();
            }}
            aria-label="Exit fullscreen"
            title="Exit fullscreen"
            className="rounded-full p-1.5 hover:bg-white/10"
          >
            <Shrink className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onExpand();
              }}
              aria-label="Open fullscreen"
              title="Open fullscreen"
              className="rounded-full p-1.5 hover:bg-white/10"
            >
              <Expand className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleMinimize();
              }}
              aria-label="Minimize Growth Coach"
              className="rounded-full p-1.5 hover:bg-white/10"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          aria-label="Close Growth Coach"
          className="rounded-full p-1.5 hover:bg-white/10"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
