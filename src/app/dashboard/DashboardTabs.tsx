"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "../login/actions";

type Tab = "main" | "closers" | "setters";

const NAV_ITEMS: { key: Tab; label: string }[] = [
  { key: "main", label: "Main" },
  { key: "closers", label: "Closers" },
  { key: "setters", label: "Setters" },
];

const TITLES: Record<Tab, string> = {
  main: "Sales Dashboard",
  closers: "Closers Performance",
  setters: "Setters Performance",
};

export default function DashboardTabs({
  mainContent,
  closersContent,
  settersContent,
}: {
  mainContent: React.ReactNode;
  closersContent: React.ReactNode;
  settersContent: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("main");

  const content: Record<Tab, React.ReactNode> = {
    main: mainContent,
    closers: closersContent,
    setters: settersContent,
  };

  return (
    <div className="flex min-h-screen bg-neutral-900 text-neutral-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950/40 px-3 py-6">
        <Link href="/" className="mb-8 px-2 text-sm font-semibold tracking-tight hover:opacity-80">
          Sales Dashboard
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                activeTab === item.key
                  ? "bg-amber-500 text-neutral-900"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-neutral-800 pt-4">
          <Link
            href="/dashboard/reps"
            className="rounded-lg px-3 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100"
          >
            Manage reps
          </Link>
          <Link
            href="/dashboard/import"
            className="rounded-lg px-3 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100"
          >
            Import data
          </Link>
          <Link
            href="/report"
            className="rounded-lg px-3 py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100"
          >
            Submit a report
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <h1 className="mb-8 text-3xl font-bold">{TITLES[activeTab]}</h1>
          {content[activeTab]}
        </div>
      </main>
    </div>
  );
}
