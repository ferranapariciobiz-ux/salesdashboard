export default function ExportPage() {
  return (
    <div className="min-h-screen bg-neutral-900 p-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-3xl font-bold text-neutral-50">Export Data</h1>
        <p className="mb-8 text-sm text-neutral-400">
          Download every report as a CSV file that opens directly in Excel or Google Sheets.
        </p>

        <div className="space-y-4">
          <a
            href="/dashboard/export/closers"
            className="block rounded-lg border border-neutral-700 bg-neutral-800 p-4 transition hover:border-amber-500"
          >
            <p className="font-semibold text-neutral-50">Closer reports</p>
            <p className="mt-1 text-sm text-neutral-400">All daily closing numbers, revenue and cash collected.</p>
          </a>

          <a
            href="/dashboard/export/setters"
            className="block rounded-lg border border-neutral-700 bg-neutral-800 p-4 transition hover:border-amber-500"
          >
            <p className="font-semibold text-neutral-50">Setter reports</p>
            <p className="mt-1 text-sm text-neutral-400">All daily inbound, triage, and outbound setting numbers.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
