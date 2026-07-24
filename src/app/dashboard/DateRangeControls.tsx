"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfWeek(d: Date): Date {
  return addDays(d, -d.getDay());
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function buildPresets() {
  const t = today();
  const yesterday = addDays(t, -1);
  const thisWeekStart = startOfWeek(t);
  const lastWeekStart = addDays(thisWeekStart, -7);
  const lastWeekEnd = addDays(thisWeekStart, -1);
  const thisMonthStart = startOfMonth(t);
  const lastMonthStart = addMonths(thisMonthStart, -1);
  const lastMonthEnd = addDays(thisMonthStart, -1);

  return [
    { label: "Today", from: t, to: t },
    { label: "Yesterday", from: yesterday, to: yesterday },
    { label: "Today and yesterday", from: yesterday, to: t },
    { label: "Last 7 days", from: addDays(t, -6), to: t },
    { label: "Last 14 days", from: addDays(t, -13), to: t },
    { label: "Last 28 days", from: addDays(t, -27), to: t },
    { label: "Last 30 days", from: addDays(t, -29), to: t },
    { label: "This week", from: thisWeekStart, to: t },
    { label: "Last week", from: lastWeekStart, to: lastWeekEnd },
    { label: "This month", from: thisMonthStart, to: t },
    { label: "Last month", from: lastMonthStart, to: lastMonthEnd },
    { label: "This year", from: startOfYear(t), to: t },
    { label: "All time", from: new Date(2020, 0, 1), to: t },
  ].map((p) => ({ label: p.label, from: toIso(p.from), to: toIso(p.to) }));
}

function formatDisplay(iso: string) {
  return fromIso(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatShort(iso: string) {
  return fromIso(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function MonthGrid({
  month,
  from,
  to,
  onPick,
}: {
  month: Date;
  from: string | null;
  to: string | null;
  onPick: (iso: string) => void;
}) {
  const first = startOfMonth(month);
  const gridStart = startOfWeek(first);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <div>
      <p className="mb-2 text-center text-xs font-semibold text-neutral-200">
        {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="text-[10px] font-medium text-neutral-500">
            {d}
          </span>
        ))}
        {cells.map((cellDate) => {
          const iso = toIso(cellDate);
          const inMonth = cellDate.getMonth() === month.getMonth();
          const isFrom = from === iso;
          const isTo = to === iso;
          const inRange = from && to && iso > from && iso < to;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onPick(iso)}
              disabled={!inMonth}
              className={`h-7 w-7 justify-self-center rounded-full text-xs transition ${
                !inMonth
                  ? "invisible"
                  : isFrom || isTo
                    ? "bg-amber-500 font-semibold text-neutral-900"
                    : inRange
                      ? "bg-amber-500/20 text-neutral-100"
                      : "text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              {cellDate.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangeControls({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [displayFrom, setDisplayFrom] = useState(from);
  const [displayTo, setDisplayTo] = useState(to);
  const [syncedRange, setSyncedRange] = useState({ from, to });
  const [draftFrom, setDraftFrom] = useState<string | null>(null);
  const [draftTo, setDraftTo] = useState<string | null>(null);
  const [leftMonth, setLeftMonth] = useState(() => startOfMonth(fromIso(from)));
  const panelRef = useRef<HTMLDivElement>(null);

  const presets = useMemo(() => buildPresets(), []);
  const activePreset = presets.find((p) => p.from === displayFrom && p.to === displayTo)?.label;

  // Picking up an externally-changed `from`/`to` (e.g. browser back/forward)
  // without an effect: adjust state during render per React's guidance at
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (syncedRange.from !== from || syncedRange.to !== to) {
    setSyncedRange({ from, to });
    setDisplayFrom(from);
    setDisplayTo(to);
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("keydown", onEscape);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  function apply(newFrom: string, newTo: string) {
    // Optimistic: update the label instantly, navigate in the background.
    setDisplayFrom(newFrom);
    setDisplayTo(newTo);
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", newFrom);
    params.set("to", newTo);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function openPanel() {
    setDraftFrom(from);
    setDraftTo(to);
    setLeftMonth(startOfMonth(fromIso(from)));
    setOpen(true);
  }

  function pickDay(iso: string) {
    if (draftFrom && !draftTo) {
      if (iso < draftFrom) {
        setDraftTo(draftFrom);
        setDraftFrom(iso);
      } else {
        setDraftTo(iso);
      }
    } else {
      setDraftFrom(iso);
      setDraftTo(null);
    }
  }

  function applyPreset(p: { from: string; to: string }) {
    apply(p.from, p.to);
    setOpen(false);
  }

  function applyCustom() {
    if (draftFrom && draftTo) {
      apply(draftFrom, draftTo);
      setOpen(false);
    }
  }

  return (
    <div className="relative inline-block" ref={panelRef}>
      <button
        onClick={() => (open ? setOpen(false) : openPanel())}
        className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/60 px-3 py-2 text-xs font-medium text-neutral-200 transition-all duration-150 hover:bg-neutral-700/80"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span>{activePreset ?? `${formatDisplay(displayFrom)} – ${formatDisplay(displayTo)}`}</span>
        {isPending && (
          <svg className="h-3 w-3 animate-spin text-amber-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-2 flex w-[640px] max-w-[90vw] overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 shadow-xl">
          <div className="w-44 shrink-0 border-r border-neutral-700 p-2">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Quick select</p>
            <div className="flex max-h-80 flex-col overflow-y-auto">
              {presets.map((p) => {
                const active = activePreset === p.label;
                return (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className={`rounded-lg px-2 py-1.5 text-left text-xs font-medium transition ${
                      active ? "bg-amber-500 text-neutral-900" : "text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Custom range</p>
              <div className="flex items-center gap-2 text-xs text-neutral-300">
                <span className="rounded-lg border border-neutral-600 px-2 py-1">
                  {draftFrom ? formatShort(draftFrom) : "Start"}
                </span>
                <span className="text-neutral-500">–</span>
                <span className="rounded-lg border border-neutral-600 px-2 py-1">
                  {draftTo ? formatShort(draftTo) : "End"}
                </span>
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <button
                onClick={() => setLeftMonth((m) => addMonths(m, -1))}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100"
                aria-label="Previous month"
              >
                ‹
              </button>
              <button
                onClick={() => setLeftMonth((m) => addMonths(m, 1))}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100"
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MonthGrid month={leftMonth} from={draftFrom} to={draftTo} onPick={pickDay} />
              <MonthGrid month={addMonths(leftMonth, 1)} from={draftFrom} to={draftTo} onPick={pickDay} />
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={applyCustom}
                disabled={!draftFrom || !draftTo}
                className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-neutral-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:text-neutral-400"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
