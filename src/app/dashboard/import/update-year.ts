import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL ?? process.env.NETLIFY_DB_URL ?? "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function updateYears() {
  try {
    // Get Ferran Aparicio's rep ID
    const rep = await prisma.rep.findFirst({
      where: { name: "Ferran Aparicio", role: "CLOSER" },
    });

    if (!rep) {
      console.log("Rep not found");
      return;
    }

    // Get all their closing reports
    const reports = await prisma.closingReport.findMany({
      where: { repId: rep.id },
    });

    console.log(`Found ${reports.length} reports to update`);

    // Update each one, shifting from 2024 to 2026 (+2 years)
    for (const report of reports) {
      const oldDate = report.date;
      const newDate = new Date(oldDate);
      newDate.setFullYear(newDate.getFullYear() + 2);

      await prisma.closingReport.update({
        where: { id: report.id },
        data: { date: newDate },
      });
    }

    console.log(`✓ Updated ${reports.length} dates from 2024 to 2026`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

updateYears();
