"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { logout } from "../login/actions";

type Tab = "main" | "closers" | "setters";

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

  let content: React.ReactNode;
  let title: string;
  let showBackButton: boolean;
  let currentContent: React.ReactNode;

  switch (activeTab) {
    case "closers":
      content = closersContent;
      title = "Closers Performance";
      showBackButton = true;
      currentContent = closersContent;
      break;
    case "setters":
      content = settersContent;
      title = "Setters Performance";
      showBackButton = true;
      currentContent = settersContent;
      break;
    default:
      content = mainContent;
      title = "Sales Dashboard";
      showBackButton = false;
      currentContent = mainContent;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{title}</h1>
          <div className="flex items-center gap-4">
            {showBackButton ? (
              <button
                onClick={() => setActiveTab("main")}
                className="text-sm underline hover:opacity-75"
              >
                ← Back to main
              </button>
            ) : (
              <Link href="/" className="text-sm underline hover:opacity-75">
                Back to home
              </Link>
            )}
            <form action={logout}>
              <button type="submit" className="text-sm text-neutral-400 underline hover:text-neutral-50">
                Log out
              </button>
            </form>
          </div>
        </div>

        <div className="mb-8 flex gap-4 border-b border-neutral-700 pb-4">
          <button
            onClick={() => setActiveTab("main")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "main"
                ? "text-neutral-50 border-b-2 border-amber-500"
                : "text-neutral-400 hover:text-neutral-50"
            }`}
          >
            Main
          </button>
          <button
            onClick={() => setActiveTab("closers")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "closers"
                ? "text-neutral-50 border-b-2 border-amber-500"
                : "text-neutral-400 hover:text-neutral-50"
            }`}
          >
            Closers
          </button>
          <button
            onClick={() => setActiveTab("setters")}
            className={`px-4 py-2 font-semibold ${
              activeTab === "setters"
                ? "text-neutral-50 border-b-2 border-amber-500"
                : "text-neutral-400 hover:text-neutral-50"
            }`}
          >
            Setters
          </button>
        </div>

        <Fragment key={`content-${activeTab}`}>
          {currentContent}
        </Fragment>
      </div>
    </div>
  );
}
