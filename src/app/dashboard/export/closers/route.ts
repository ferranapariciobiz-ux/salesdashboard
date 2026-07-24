import { prisma } from "@/lib/db";
import { toCsv, toIsoDate } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const reports = await prisma.closingReport.findMany({
    include: { rep: true },
    orderBy: [{ rep: { name: "asc" } }, { date: "asc" }],
  });

  const csv = toCsv(
    [
      "date",
      "rep_name",
      "role",
      "calls_scheduled",
      "calls_taken",
      "qualified_demos",
      "no_shows",
      "cancelled",
      "rescheduled",
      "dqs",
      "offers",
      "closes",
      "no_closes",
      "deposits_amount",
      "revenue",
      "cash_collected",
    ],
    reports.map((r) => [
      toIsoDate(r.date),
      r.rep.name,
      r.rep.role,
      r.callsScheduled,
      r.callsTaken,
      r.qualifiedDemos,
      r.noShows,
      r.cancelled,
      r.rescheduled,
      r.dqs,
      r.offers,
      r.closes,
      r.noCloses,
      r.depositsAmount,
      r.revenue,
      r.cashCollected,
    ])
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="closer-reports-${toIsoDate(new Date())}.csv"`,
    },
  });
}
