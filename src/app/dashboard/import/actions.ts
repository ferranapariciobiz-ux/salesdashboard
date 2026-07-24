"use server";

import { prisma } from "@/lib/db";
import type { Role } from "@/generated/prisma/client";

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function splitLine(line: string, delimiter: string): string[] {
  if (delimiter === "\t") return line.split("\t");

  // Comma-delimited CSV with quoted fields (e.g. "$5,800.00")
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function toNumber(v: string | undefined): number {
  if (!v) return 0;
  const cleaned = v.replace(/[$,\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

const DATE_LABEL_RE = /^([A-Za-z]{3,9})\s+(\d{1,2})$/;

// Accepts a raw paste straight from the Google Sheet (tab-separated) or a
// CSV export of it (comma-separated, quoted $ values). Columns are matched
// by header name so a hand transcription step - and its transcription
// errors - is never needed.
export async function importSheetData(
  raw: string,
  year: number,
  repName: string,
  role: Role,
  replaceExisting: boolean
) {
  try {
    const lines = raw
      .split("\n")
      .map((l) => l.replace(/\r$/, ""))
      .filter((l) => l.trim().length > 0);

    if (lines.length < 2) return { error: "No data found" };

    const delimiter = lines[0].includes("\t") ? "\t" : ",";
    const headers = splitLine(lines[0], delimiter).map((h) => h.trim().toLowerCase());

    const dateIdxs = headers.reduce<number[]>((acc, h, i) => {
      if (h === "date") acc.push(i);
      return acc;
    }, []);
    if (dateIdxs.length === 0) {
      return { error: "Couldn't find a 'Date' column in the first row" };
    }
    // If there are two Date columns (raw CSV export), the second is the
    // "Jan 1" style label; the first is a full date that may carry the
    // sheet's default year instead of the real one.
    const dateIdx = dateIdxs[dateIdxs.length - 1];

    const colIdx = (name: string) => headers.indexOf(name.toLowerCase());

    const idx = {
      scheduled: colIdx("Demos Scheduled"),
      noShow: colIdx("Demo No Show"),
      cancelled: colIdx("Demo Cancelled"),
      rescheduled: colIdx("Demo Rescheduled"),
      taken: colIdx("Showed Demos"),
      qualified: colIdx("Qualified Demos"),
      offers: colIdx("Offers Made"),
      closes: colIdx("Closes"),
      revenue: colIdx("Revenue"),
      cash: colIdx("Cash Collected"),
    };

    const missing = Object.entries(idx)
      .filter(([, i]) => i < 0)
      .map(([k]) => k);
    if (missing.length) {
      return { error: `Missing expected columns: ${missing.join(", ")}` };
    }

    const records: {
      date: Date;
      callsScheduled: number;
      callsTaken: number;
      qualifiedDemos: number;
      noShows: number;
      cancelled: number;
      rescheduled: number;
      offers: number;
      closes: number;
      revenue: number;
      cashCollected: number;
    }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = splitLine(lines[i], delimiter);
      const label = (cols[dateIdx] || "").trim();
      const m = DATE_LABEL_RE.exec(label);
      if (!m) continue; // month header row or empty row

      const month = MONTHS[m[1].slice(0, 3).toLowerCase()];
      const day = Number(m[2]);
      if (!month || !day) continue;

      records.push({
        date: new Date(year, month - 1, day, 0, 0, 0, 0),
        callsScheduled: toNumber(cols[idx.scheduled]),
        callsTaken: toNumber(cols[idx.taken]),
        qualifiedDemos: toNumber(cols[idx.qualified]),
        noShows: toNumber(cols[idx.noShow]),
        cancelled: toNumber(cols[idx.cancelled]),
        rescheduled: toNumber(cols[idx.rescheduled]),
        offers: toNumber(cols[idx.offers]),
        closes: toNumber(cols[idx.closes]),
        revenue: toNumber(cols[idx.revenue]),
        cashCollected: toNumber(cols[idx.cash]),
      });
    }

    if (records.length === 0) {
      return { error: "No rows matched a date like 'Mar 24' — check the Date column" };
    }

    let rep = await prisma.rep.findFirst({ where: { name: repName, role } });
    if (!rep) {
      rep = await prisma.rep.create({ data: { name: repName, role, active: true } });
    }

    if (replaceExisting) {
      await prisma.closingReport.deleteMany({ where: { repId: rep.id } });
    }

    const batchSize = 10;
    for (let b = 0; b < records.length; b += batchSize) {
      const batch = records.slice(b, b + batchSize);
      await Promise.all(
        batch.map((rec) => {
          const { date, ...rest } = rec;
          return prisma.closingReport.upsert({
            where: { repId_date: { repId: rep.id, date } },
            create: { repId: rep.id, date, dqs: 0, depositsAmount: 0, ...rest },
            update: rest,
          });
        })
      );
    }

    const totalRevenue = records.reduce((sum, r) => sum + r.revenue, 0);

    return { success: true, count: records.length, repName, totalRevenue };
  } catch (err) {
    console.error("Import error:", err);
    return { error: `Import failed: ${String(err).substring(0, 200)}` };
  }
}

export async function deleteAllData(repName: string, role: Role) {
  try {
    const rep = await prisma.rep.findFirst({ where: { name: repName, role } });
    if (!rep) return { error: "Rep not found" };

    const deleted = await prisma.closingReport.deleteMany({ where: { repId: rep.id } });
    return { success: true, deleted: deleted.count };
  } catch (err) {
    return { error: String(err) };
  }
}
