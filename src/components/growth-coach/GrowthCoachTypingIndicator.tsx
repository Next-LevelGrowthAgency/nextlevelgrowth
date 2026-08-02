export function GrowthCoachTypingIndicator() {
  return (
    <div className="flex max-w-[85%] items-center gap-1.5 rounded-2xl bg-paper-200 px-4 py-3">
      <span className="sr-only">Coach is typing</span>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          aria-hidden="true"
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 motion-reduce:animate-none"
          style={{ animationDelay: `${dot * 0.15}s` }}
        />
      ))}
    </div>
  );
}
