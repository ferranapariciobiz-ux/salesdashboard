"use server";

import { prisma } from "@/lib/db";

export async function importClosingData(csvData: string) {
  try {
    const lines = csvData.trim().split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      return { error: "No data rows found" };
    }

    const delimiter = lines[0].includes("\t") ? "\t" : ",";
    const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());

    const repName = "Ferran Aparicio";
    let rep = await prisma.rep.findFirst({
      where: { name: repName, role: "CLOSER" },
    });

    if (!rep) {
      rep = await prisma.rep.create({
        data: { name: repName, role: "CLOSER", active: true },
      });
    }

    let count = 0;
    for (let i = 1; i < Math.min(lines.length, 101); i++) {
      const values = lines[i].split(delimiter).map((v) => v.trim());
      if (!values[0]) continue;

      const dateStr = values[0];
      if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) continue;

      const [year, month, day] = dateStr.split("-").map(Number);
      const reportDate = new Date(year, month - 1, day, 0, 0, 0, 0);

      await prisma.closingReport.upsert({
        where: { repId_date: { repId: rep.id, date: reportDate } },
        create: {
          repId: rep.id,
          date: reportDate,
          callsScheduled: Number(values[3]) || 0,
          callsTaken: Number(values[4]) || 0,
          qualifiedDemos: Number(values[5]) || 0,
          noShows: Number(values[6]) || 0,
          cancelled: Number(values[7]) || 0,
          rescheduled: Number(values[8]) || 0,
          dqs: 0,
          offers: Number(values[9]) || 0,
          closes: Number(values[10]) || 0,
          depositsAmount: 0,
          revenue: Number(values[11]) || 0,
          cashCollected: Number(values[12]) || 0,
        },
        update: {
          callsScheduled: Number(values[3]) || 0,
          callsTaken: Number(values[4]) || 0,
          qualifiedDemos: Number(values[5]) || 0,
          noShows: Number(values[6]) || 0,
          cancelled: Number(values[7]) || 0,
          rescheduled: Number(values[8]) || 0,
          offers: Number(values[9]) || 0,
          closes: Number(values[10]) || 0,
          revenue: Number(values[11]) || 0,
          cashCollected: Number(values[12]) || 0,
        },
      });

      count++;
    }

    return { success: true, created: count, repName };
  } catch (err) {
    return { error: `Import failed: ${String(err).substring(0, 100)}` };
  }
}
