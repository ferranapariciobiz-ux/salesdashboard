export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-neutral-700 bg-neutral-800 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-50">{value}</p>
    </div>
  );
}

export function MiniStat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-md border border-neutral-200 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-neutral-900">
        {value}
        {sub && <span className="ml-1 text-xs font-normal text-neutral-400">{sub}</span>}
      </p>
    </div>
  );
}
