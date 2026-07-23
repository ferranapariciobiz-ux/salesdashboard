"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

function num(formData: FormData, key: string): number {
  const raw = formData.get(key);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function startOfDay(dateStr: string): Date {
  // Dates are entered as plain "YYYY-MM-DD" with no timezone; anchor at UTC
  // midnight so the same string always maps to the same stored day.
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

export async function createRep(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "");

  if (!name) return { ok: false, message: "Name is required." };
  if (role !== "CLOSER" && role !== "SETTER") return { ok: false, message: "Pick a role." };

  await prisma.rep.create({ data: { name, role } });
  revalidatePath("/dashboard/reps");
  revalidatePath("/report");
  return { ok: true, message: `Added ${name}.` };
}

export async function setRepActive(repId: string, active: boolean): Promise<void> {
  await prisma.rep.update({ where: { id: repId }, data: { active } });
  revalidatePath("/dashboard/reps");
  revalidatePath("/report");
}

export async function submitDailyReport(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const repId = String(formData.get("repId") ?? "");
  const dateStr = String(formData.get("date") ?? "");
  if (!repId) return { ok: false, message: "Pick a rep." };
  if (!dateStr) return { ok: false, message: "Pick a date." };

  const rep = await prisma.rep.findUnique({ where: { id: repId } });
  if (!rep) return { ok: false, message: "Rep not found." };

  const date = startOfDay(dateStr);

  if (rep.role === "CLOSER") {
    const data = {
      callsScheduled: num(formData, "callsScheduled"),
      callsTaken: num(formData, "callsTaken"),
      noShows: num(formData, "noShows"),
      cancelled: num(formData, "cancelled"),
      rescheduled: num(formData, "rescheduled"),
      dqs: num(formData, "dqs"),
      offers: num(formData, "offers"),
      closes: num(formData, "closes"),
      depositsAmount: num(formData, "depositsAmount"),
      cashCollected: num(formData, "cashCollected"),
      revenue: num(formData, "revenue"),
    };
    await prisma.closingReport.upsert({
      where: { repId_date: { repId, date } },
      create: { repId, date, ...data },
      update: data,
    });
  } else {
    const data = {
      outboundDials: num(formData, "outboundDials"),
      inboundTriages: num(formData, "inboundTriages"),
      dqs: num(formData, "dqs"),
      newSets: num(formData, "newSets"),
      triagesCompleted: num(formData, "triagesCompleted"),
      inboundCalls: num(formData, "inboundCalls"),
      inboundNoShows: num(formData, "inboundNoShows"),
      inboundRescheduled: num(formData, "inboundRescheduled"),
      inboundCallsTaken: num(formData, "inboundCallsTaken"),
      inboundBadFit: num(formData, "inboundBadFit"),
      inboundFollowUpNeeded: num(formData, "inboundFollowUpNeeded"),
      inboundSets: num(formData, "inboundSets"),
      triagesAssigned: num(formData, "triagesAssigned"),
      triagesCancelledDq: num(formData, "triagesCancelledDq"),
      triagesSuccessful: num(formData, "triagesSuccessful"),
      outboundPickups: num(formData, "outboundPickups"),
      outboundConvos: num(formData, "outboundConvos"),
      outboundDqs: num(formData, "outboundDqs"),
      outboundFollowups: num(formData, "outboundFollowups"),
      outboundSets: num(formData, "outboundSets"),
    };
    await prisma.settingReport.upsert({
      where: { repId_date: { repId, date } },
      create: { repId, date, ...data },
      update: data,
    });
  }

  revalidatePath("/dashboard");
  return { ok: true, message: `Saved ${rep.name}'s report for ${dateStr}.` };
}
