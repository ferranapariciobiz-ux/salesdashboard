"use client";

import { useState } from "react";
import { importClosingData, updateDatesToYear } from "./actions";

export default function ImportPage() {
  const [csv, setCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleImport() {
    if (!csv.trim()) {
      setMessage({ type: "error", text: "Please paste data first" });
      return;
    }

    setLoading(true);
    const result = await importClosingData(csv);
    setLoading(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({
        type: "success",
        text: `✓ Imported ${result.created} records for ${result.repName}`,
      });
      setCsv("");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-neutral-50">Import Data</h1>
        <p className="mb-6 text-sm text-neutral-400">
          Paste your CSV data below. Format: date, rep_name, role, calls_scheduled, calls_taken, qualified_demos, no_shows, cancelled, rescheduled, offers, closes, revenue, cash_collected
        </p>

        <div className="space-y-4">
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder="Paste CSV here..."
            className="h-64 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-4 font-mono text-sm text-neutral-200 placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
          />

          <button
            onClick={handleImport}
            disabled={loading || !csv.trim()}
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

          <div className="mt-8 border-t border-neutral-700 pt-6">
            <h2 className="mb-4 font-semibold text-neutral-200">Fix Date Year</h2>
            <p className="mb-4 text-sm text-neutral-400">
              If your data was imported as 2024 but should be 2026, click below:
            </p>
            <button
              onClick={async () => {
                setLoading(true);
                const result = await updateDatesToYear(2026);
                setLoading(false);
                if (result.error) {
                  setMessage({ type: "error", text: result.error });
                } else {
                  setMessage({
                    type: "success",
                    text: `✓ Updated ${result.updated} dates to 2026`,
                  });
                }
              }}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-600"
            >
              {loading ? "Updating..." : "Update All Dates to 2026"}
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-neutral-700 bg-neutral-800 p-4">
          <h2 className="mb-3 font-semibold text-neutral-200">Example CSV:</h2>
          <pre className="overflow-x-auto rounded bg-neutral-900 p-3 text-xs text-neutral-300">
{`date,rep_name,role,calls_scheduled,calls_taken,qualified_demos,no_shows,cancelled,rescheduled,offers,closes,revenue,cash_collected
2024-03-24,Ferran Aparicio,CLOSER,0,3,2,0,0,0,2,2,0,0
2024-03-25,Ferran Aparicio,CLOSER,0,1,0,0,0,0,1,0,0,0
2024-03-26,Ferran Aparicio,CLOSER,0,2,1,0,0,0,2,1,0,0`}
          </pre>
        </div>
      </div>
    </div>
  );
}
