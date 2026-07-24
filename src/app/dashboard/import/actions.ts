"use server";

import { prisma } from "@/lib/db";

export async function importClosingData(csvData: string) {
  const lines = csvData.trim().split("\n");
  if (lines.length < 2) {
    return { error: "No data to import" };
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    if (!values[0]) continue; // skip empty lines

    const record: Record<string, string | number> = {};
    headers.forEach((header, idx) => {
      const value = values[idx];
      // Try to parse as number
      if (value && !isNaN(Number(value))) {
        record[header] = Number(value);
      } else {
        record[header] = value;
      }
    });
    records.push(record);
  }

  try {
    // Find or create the rep
    let rep = await prisma.rep.findFirst({
      where: { name: String(records[0].rep_name || ""), role: String(records[0].role || "CLOSER") as any },
    });

    if (!rep) {
      rep = await prisma.rep.create({
        data: {
          name: String(records[0].rep_name || "Unknown"),
          role: String(records[0].role || "CLOSER") as any,
          active: true,
        },
      });
    }

    let created = 0;
    let updated = 0;

    for (const record of records) {
      const dateStr = String(record.date);
      const [year, month, day] = dateStr.split("-").map(Number);
      const reportDate = new Date(year, month - 1, day);
      reportDate.setUTCHours(0, 0, 0, 0);

      await prisma.closingReport.upsert({
        where: {
          repId_date: {
            repId: rep.id,
            date: reportDate,
          },
        },
        create: {
          repId: rep.id,
          date: reportDate,
          callsScheduled: Number(record.calls_scheduled) || 0,
          callsTaken: Number(record.calls_taken) || 0,
          qualifiedDemos: Number(record.qualified_demos) || 0,
          noShows: Number(record.no_shows) || 0,
          cancelled: Number(record.cancelled) || 0,
          rescheduled: Number(record.rescheduled) || 0,
          dqs: 0,
          offers: Number(record.offers) || 0,
          closes: Number(record.closes) || 0,
          depositsAmount: 0,
          revenue: Number(record.revenue) || 0,
          cashCollected: Number(record.cash_collected) || 0,
        },
        update: {
          callsScheduled: Number(record.calls_scheduled) || 0,
          callsTaken: Number(record.calls_taken) || 0,
          qualifiedDemos: Number(record.qualified_demos) || 0,
          noShows: Number(record.no_shows) || 0,
          cancelled: Number(record.cancelled) || 0,
          rescheduled: Number(record.rescheduled) || 0,
          offers: Number(record.offers) || 0,
          closes: Number(record.closes) || 0,
          revenue: Number(record.revenue) || 0,
          cashCollected: Number(record.cash_collected) || 0,
        },
      });

      created++;
    }

    return { success: true, created, repName: rep.name };
  } catch (err) {
    console.error(err);
    return { error: String(err) };
  }
}
