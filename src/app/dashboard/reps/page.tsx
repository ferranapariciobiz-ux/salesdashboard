import { prisma } from "@/lib/db";
import AddRepForm from "./AddRepForm";
import RepRow from "./RepRow";

export const dynamic = "force-dynamic";

export default async function RepsPage() {
  const reps = await prisma.rep.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });
  const activeReps = reps.filter((r) => r.active);

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Reps</h1>
          <a
            href="/dashboard"
            className="text-sm font-medium text-neutral-300 underline transition hover:text-neutral-50"
          >
            ← Back to Dashboard
          </a>
        </div>
        <p className="text-sm text-neutral-300">
          Add closers and setters here. New reps immediately show up on the daily report form.
        </p>

        {activeReps.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-neutral-50">Active Reps on Dashboard</h2>
            <div className="grid gap-2">
              {activeReps.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg bg-neutral-800 px-4 py-2 border border-neutral-700 text-sm"
                >
                  <span className="font-medium text-neutral-50">{r.name}</span>
                  <span className="ml-2 text-xs text-neutral-400">
                    ({r.role === "CLOSER" ? "Closer" : "Setter"})
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8">
          <AddRepForm />
        </div>

        <ul className="mt-8 divide-y divide-neutral-700 rounded-md border border-neutral-700">
          {reps.map((r) => (
            <RepRow key={r.id} rep={{ id: r.id, name: r.name, role: r.role, active: r.active }} />
          ))}
          {reps.length === 0 && (
            <li className="px-4 py-3 text-sm text-neutral-400">No reps yet.</li>
          )}
        </ul>
      </div>
    </main>
  );
}
