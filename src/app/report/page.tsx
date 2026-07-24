import { prisma } from "@/lib/db";
import ReportForm from "./ReportForm";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const reps = await prisma.rep.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true },
  });

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-50">
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Daily Report</h1>
        </div>
        <p className="text-sm text-neutral-300">
          Pick your name and log today&apos;s numbers. Submitting again for the same day updates that day&apos;s entry.
        </p>
        <div className="mt-8">
          <ReportForm reps={reps} />
        </div>
      </div>
    </main>
  );
}
