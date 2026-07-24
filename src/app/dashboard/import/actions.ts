"use server";

import { prisma } from "@/lib/db";

export async function deleteAllData() {
  try {
    const rep = await prisma.rep.findFirst({
      where: { name: "Ferran Aparicio", role: "CLOSER" },
    });

    if (!rep) return { error: "Rep not found" };

    const deleted = await prisma.closingReport.deleteMany({
      where: { repId: rep.id },
    });

    return { success: true, deleted: deleted.count };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function updateDatesToYear(targetYear: number) {
  try {
    const rep = await prisma.rep.findFirst({
      where: { name: "Ferran Aparicio", role: "CLOSER" },
    });

    if (!rep) return { error: "Ferran Aparicio not found" };

    const reports = await prisma.closingReport.findMany({
      where: { repId: rep.id },
    });

    for (const report of reports) {
      const newDate = new Date(report.date);
      newDate.setFullYear(targetYear);

      await prisma.closingReport.update({
        where: { id: report.id },
        data: { date: newDate },
      });
    }

    return { success: true, updated: reports.length };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function importClosingData(csvData: string) {
  try {
    const lines = csvData.trim().split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      return { error: "No data rows found" };
    }

    const delimiter = lines[0].includes("\t") ? "\t" : ",";

    const repName = "Ferran Aparicio";
    let rep = await prisma.rep.findFirst({
      where: { name: repName, role: "CLOSER" },
    });

    if (!rep) {
      rep = await prisma.rep.create({
        data: { name: repName, role: "CLOSER", active: true },
      });
    }

    // Parse all records first
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map((v) => v.trim());
      if (!values[0]) continue;

      const dateStr = values[0];
      if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) continue;

      const [year, month, day] = dateStr.split("-").map(Number);
      records.push({
        date: new Date(year, month - 1, day, 0, 0, 0, 0),
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
      });
    }

    // Process in batches of 10
    const batchSize = 10;
    for (let batch = 0; batch < records.length; batch += batchSize) {
      const batchRecords = records.slice(batch, batch + batchSize);

      await Promise.all(
        batchRecords.map((rec) =>
          prisma.closingReport.upsert({
            where: { repId_date: { repId: rep.id, date: rec.date } },
            create: { repId: rep.id, date: rec.date, dqs: 0, depositsAmount: 0, ...rec },
            update: rec,
          })
        )
      );
    }

    return { success: true, created: records.length, repName };
  } catch (err) {
    console.error("Import error:", err);
    return { error: `Failed: ${String(err).substring(0, 150)}` };
  }
}
