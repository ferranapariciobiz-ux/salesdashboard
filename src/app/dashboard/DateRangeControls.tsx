"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function startOfMonthIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function startOfLastMonthIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().slice(0, 10);
}

function endOfLastMonthIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 0).toISOString().slice(0, 10);
}

function startOfYearIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), 0, 1).toISOString().slice(0, 10);
}

export default function DateRangeControls({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pickerOpen, setPickerOpen] = useState(false);

  const presets = useMemo(
    () => [
      { label: "Today", from: isoToday(), to: isoToday() },
      { label: "Last 7 days", from: isoDaysAgo(6), to: isoToday() },
      { label: "Last 30 days", from: isoDaysAgo(29), to: isoToday() },
      { label: "This month", from: startOfMonthIso(), to: isoToday() },
      { label: "Last month", from: startOfLastMonthIso(), to: endOfLastMonthIso() },
      { label: "This year", from: startOfYearIso(), to: isoToday() },
    ],
    []
  );

  const activePreset = presets.find((p) => p.from === from && p.to === to)?.label;
  const isCustom = !activePreset;

  function apply(newFrom: string, newTo: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", newFrom);
    params.set("to", newTo);
    router.push(`${pathname}?${params.toString()}`);
  }

  function formatDisplay(iso: string) {
    const d = new Date(`${iso}T00:00:00.000Z`);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-neutral-700 bg-neutral-800/60 p-1">
        {presets.map((p) => {
          const active = activePreset === p.label;
          return (
            <button
              key={p.label}
              onClick={() => apply(p.from, p.to)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                active
                  ? "bg-amber-500 text-neutral-900 shadow-sm"
                  : "text-neutral-400 hover:bg-neutral-700/80 hover:text-neutral-100"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all duration-150 ${
            isCustom
              ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
              : "border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-700/80 hover:text-neutral-100"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span>
            {formatDisplay(from)} – {formatDisplay(to)}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-150 ${pickerOpen ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {pickerOpen && (
          <div className="absolute left-0 z-20 mt-2 flex items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-800 p-3 shadow-xl">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">From</span>
              <input
                type="date"
                defaultValue={from}
                onChange={(e) => apply(e.target.value, to)}
                className="rounded-lg border border-neutral-600 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-100 outline-none focus:border-amber-500"
              />
            </label>
            <span className="mt-4 text-xs text-neutral-500">to</span>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">To</span>
              <input
                type="date"
                defaultValue={to}
                onChange={(e) => apply(from, e.target.value)}
                className="rounded-lg border border-neutral-600 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-100 outline-none focus:border-amber-500"
              />
            </label>
            <button
              onClick={() => setPickerOpen(false)}
              className="mt-4 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-neutral-900 transition hover:bg-amber-400"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
