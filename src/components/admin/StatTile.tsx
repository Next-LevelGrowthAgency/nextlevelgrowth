export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-ink-900">{value}</p>
    </div>
  );
}

export function AdminNotConfigured({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-300 bg-paper-100 p-4 text-sm text-ink-500">
      {children}
    </div>
  );
}
