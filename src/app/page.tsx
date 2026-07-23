import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-900 px-4 text-center">
      <h1 className="text-2xl font-semibold text-neutral-50">Sales Team Dashboard</h1>
      <p className="max-w-sm text-sm text-neutral-400">
        Reps log daily numbers, the dashboard turns them into performance metrics.
      </p>
      <div className="mt-2 flex gap-3">
        <Link href="/report" className="rounded-md bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200">
          Submit a report
        </Link>
        <Link href="/dashboard" className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-800">
          View dashboard
        </Link>
      </div>
    </main>
  );
}
