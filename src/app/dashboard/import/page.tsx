"use client";

import { useState } from "react";
import { importSheetData, deleteAllData } from "./actions";

export default function ImportPage() {
  const [raw, setRaw] = useState("");
  const [year, setYear] = useState(2026);
  const [repName, setRepName] = useState("Ferran Aparicio");
  const [role, setRole] = useState<"CLOSER" | "SETTER">("CLOSER");
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  async function handleImport() {
    if (!raw.trim()) {
      setMessage({ type: "error", text: "Paste your sheet data first" });
      return;
    }

    setLoading(true);
    const result = await importSheetData(raw, year, repName, role, replaceExisting);
    setLoading(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({
        type: "success",
        text: `✓ Imported ${result.count} days for ${result.repName}. Total revenue: $${result.totalRevenue!.toLocaleString()}`,
      });
      setRaw("");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-50">Import Data</h1>
          <a
            href="/dashboard"
            className="text-sm font-medium text-neutral-300 underline transition hover:text-neutral-50"
          >
            ← Back to Dashboard
          </a>
        </div>
        <p className="mb-6 text-sm text-neutral-400">
          Select all the cells in your Google Sheet (including the header row) and paste them
          below — no reformatting needed. Columns are matched by name, so nothing gets misaligned.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <label className="text-sm text-neutral-300">
              Rep name
              <input
                type="text"
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
              />
            </label>
            <label className="text-sm text-neutral-300">
              Role
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "CLOSER" | "SETTER")}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
              >
                <option value="CLOSER">Closer</option>
                <option value="SETTER">Setter</option>
              </select>
            </label>
            <label className="text-sm text-neutral-300">
              Year
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 focus:border-amber-500 focus:outline-none"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-800"
            />
            Replace all existing data for this rep before importing
          </label>

          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Paste your sheet here (header row + data rows)..."
            className="h-64 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-4 font-mono text-sm text-neutral-200 placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
          />

          <button
            onClick={handleImport}
            disabled={loading || !raw.trim()}
            className="rounded-lg bg-amber-500 px-6 py-2 font-semibold text-neutral-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-neutral-600 disabled:text-neutral-400"
          >
            {loading ? "Importing..." : "Import Data"}
          </button>

          {message && (
            <div
              className={`rounded-lg p-4 text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-900/30 text-green-200"
                  : "bg-red-900/30 text-red-200"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-lg border border-red-700/50 bg-red-900/20 p-4">
          <p className="mb-3 text-sm font-medium text-red-200">Wipe all data for this rep (no reimport)</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
              className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-red-500 focus:outline-none"
            />
            <button
              onClick={async () => {
                if (deleteConfirm !== "DELETE") {
                  setMessage({ type: "error", text: "Type DELETE to confirm" });
                  return;
                }
                setLoading(true);
                const result = await deleteAllData(repName, role);
                setLoading(false);
                setDeleteConfirm("");
                if (result.error) {
                  setMessage({ type: "error", text: result.error });
                } else {
                  setMessage({ type: "success", text: `✓ Deleted ${result.deleted} records for ${repName}` });
                }
              }}
              disabled={loading || deleteConfirm !== "DELETE"}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-600"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
