import { prisma } from "@/lib/db";
import { toCsv, toIsoDate } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const reports = await prisma.settingReport.findMany({
    include: { rep: true },
    orderBy: [{ rep: { name: "asc" } }, { date: "asc" }],
  });

  const csv = toCsv(
    [
      "date",
      "rep_name",
      "role",
      "inbound_calls",
      "inbound_no_shows",
      "inbound_rescheduled",
      "inbound_calls_taken",
      "inbound_bad_fit",
      "inbound_follow_up_needed",
      "inbound_sets",
      "triages_assigned",
      "triages_cancelled_dq",
      "triages_successful",
      "outbound_dials",
      "outbound_pickups",
      "outbound_convos",
      "outbound_dqs",
      "outbound_followups",
      "outbound_sets",
    ],
    reports.map((r) => [
      toIsoDate(r.date),
      r.rep.name,
      r.rep.role,
      r.inboundCalls,
      r.inboundNoShows,
      r.inboundRescheduled,
      r.inboundCallsTaken,
      r.inboundBadFit,
      r.inboundFollowUpNeeded,
      r.inboundSets,
      r.triagesAssigned,
      r.triagesCancelledDq,
      r.triagesSuccessful,
      r.outboundDials,
      r.outboundPickups,
      r.outboundConvos,
      r.outboundDqs,
      r.outboundFollowups,
      r.outboundSets,
    ])
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="setter-reports-${toIsoDate(new Date())}.csv"`,
    },
  });
}
