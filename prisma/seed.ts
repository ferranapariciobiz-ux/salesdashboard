import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// Closing report data for Ferran Aparicio from March to July
const closingData = [
  // March 2024
  { date: "2024-03-24", leads: 3, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 3, qualified: 2, offers: 2, closes: 2, revenue: 0, cash: 0 },
  { date: "2024-03-25", leads: 1, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 1, qualified: 0, offers: 1, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-03-26", leads: 2, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 2, qualified: 1, offers: 2, closes: 1, revenue: 0, cash: 0 },
  { date: "2024-03-27", leads: 3, scheduled: 1, noShow: 0, cancelled: 0, rescheduled: 2, showed: 2, qualified: 2, offers: 1, closes: 1, revenue: 5800, cash: 3000 },
  { date: "2024-03-28", leads: 2, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 2, showed: 1, qualified: 1, offers: 0, closes: 1, revenue: 5800, cash: 500 },
  // April 2024
  { date: "2024-04-01", leads: 6, scheduled: 2, noShow: 0, cancelled: 0, rescheduled: 4, showed: 2, qualified: 4, offers: 1, closes: 1, revenue: 100, cash: 2100 },
  { date: "2024-04-02", leads: 8, scheduled: 4, noShow: 1, cancelled: 0, rescheduled: 3, showed: 2, qualified: 2, offers: 0, closes: 1, revenue: 5800, cash: 5800 },
  { date: "2024-04-03", leads: 4, scheduled: 2, noShow: 0, cancelled: 0, rescheduled: 2, showed: 1, qualified: 1, offers: 1, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-04", leads: 10, scheduled: 8, noShow: 1, cancelled: 0, rescheduled: 1, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-05", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-06", leads: 7, scheduled: 3, noShow: 0, cancelled: 0, rescheduled: 4, showed: 3, qualified: 3, offers: 0, closes: 4, revenue: 23200, cash: 3000 },
  { date: "2024-04-07", leads: 5, scheduled: 5, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-08", leads: 6, scheduled: 2, noShow: 0, cancelled: 0, rescheduled: 3, showed: 3, qualified: 3, offers: 2, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-09", leads: 4, scheduled: 1, noShow: 0, cancelled: 0, rescheduled: 3, showed: 1, qualified: 2, offers: 0, closes: 2, revenue: 5900, cash: 2400 },
  { date: "2024-04-10", leads: 2, scheduled: 0, noShow: 0, cancelled: 1, rescheduled: 1, showed: 1, qualified: 1, offers: 1, closes: 1, revenue: 5800, cash: 3000 },
  { date: "2024-04-11", leads: 2, scheduled: 1, noShow: 1, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-12", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-13", leads: 5, scheduled: 2, noShow: 0, cancelled: 1, rescheduled: 2, showed: 1, qualified: 1, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-14", leads: 2, scheduled: 2, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-15", leads: 5, scheduled: 0, noShow: 1, cancelled: 1, rescheduled: 3, showed: 2, qualified: 2, offers: 1, closes: 0, revenue: 100, cash: 100 },
  { date: "2024-04-16", leads: 2, scheduled: 1, noShow: 0, cancelled: 0, rescheduled: 1, showed: 1, qualified: 1, offers: 1, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-17", leads: 5, scheduled: 1, noShow: 0, cancelled: 0, rescheduled: 4, showed: 3, qualified: 3, offers: 2, closes: 1, revenue: 11500, cash: 3500 },
  { date: "2024-04-18", leads: 2, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 2, showed: 2, qualified: 2, offers: 0, closes: 2, revenue: 11600, cash: 1000 },
  { date: "2024-04-19", leads: 2, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 2, showed: 1, qualified: 1, offers: 0, closes: 2, revenue: 5900, cash: 1600 },
  { date: "2024-04-20", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-21", leads: 2, scheduled: 0, noShow: 1, cancelled: 0, rescheduled: 1, showed: 1, qualified: 1, offers: 0, closes: 1, revenue: 5800, cash: 5000 },
  { date: "2024-04-22", leads: 4, scheduled: 2, noShow: 0, cancelled: 0, rescheduled: 2, showed: 2, qualified: 2, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-23", leads: 3, scheduled: 1, noShow: 0, cancelled: 0, rescheduled: 2, showed: 1, qualified: 1, offers: 1, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-24", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 1, revenue: 5800, cash: 500 },
  { date: "2024-04-25", leads: 2, scheduled: 0, noShow: 2, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-26", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-27", leads: 5, scheduled: 2, noShow: 1, cancelled: 0, rescheduled: 2, showed: 1, qualified: 1, offers: 0, closes: 1, revenue: 5800, cash: 500 },
  { date: "2024-04-28", leads: 5, scheduled: 2, noShow: 0, cancelled: 1, rescheduled: 2, showed: 2, qualified: 2, offers: 0, closes: 1, revenue: 5800, cash: 675 },
  { date: "2024-04-29", leads: 2, scheduled: 0, noShow: 2, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-04-30", leads: 3, scheduled: 1, noShow: 2, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 1500 },
  // May 2024
  { date: "2024-05-01", leads: 2, scheduled: 0, noShow: 2, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-05-02", leads: 4, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 4, showed: 3, qualified: 3, offers: 1, closes: 2, revenue: 11600, cash: 6050 },
  { date: "2024-05-03", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-05-04", leads: 5, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 5, showed: 3, qualified: 3, offers: 2, closes: 1, revenue: 100, cash: 100 },
  { date: "2024-05-05", leads: 4, scheduled: 1, noShow: 1, cancelled: 0, rescheduled: 2, showed: 1, qualified: 1, offers: 0, closes: 0, revenue: 5700, cash: 5700 },
  { date: "2024-05-06", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-05-07", leads: 3, scheduled: 1, noShow: 0, cancelled: 1, rescheduled: 2, showed: 1, qualified: 1, offers: 1, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-05-08", leads: 3, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 3, showed: 1, qualified: 1, offers: 0, closes: 1, revenue: 5800, cash: 6800 },
  { date: "2024-05-09", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-05-10", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-05-11", leads: 2, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 2, showed: 1, qualified: 1, offers: 0, closes: 1, revenue: 5800, cash: 2000 },
  { date: "2024-05-12", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-05-13", leads: 6, scheduled: 1, noShow: 0, cancelled: 0, rescheduled: 5, showed: 4, qualified: 4, offers: 2, closes: 2, revenue: 5900, cash: 1600 },
  { date: "2024-05-14", leads: 5, scheduled: 0, noShow: 2, cancelled: 0, rescheduled: 3, showed: 3, qualified: 3, offers: 1, closes: 2, revenue: 11600, cash: 6300 },
  { date: "2024-05-15", leads: 5, scheduled: 0, noShow: 1, cancelled: 0, rescheduled: 4, showed: 3, qualified: 2, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-05-16", leads: 4, scheduled: 1, noShow: 0, cancelled: 1, rescheduled: 2, showed: 2, qualified: 2, offers: 1, closes: 1, revenue: 5800, cash: 2000 },
  { date: "2024-05-17", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-05-18", leads: 5, scheduled: 3, noShow: 0, cancelled: 0, rescheduled: 2, showed: 1, qualified: 1, offers: 0, closes: 0, revenue: 0, cash: 500 },
  { date: "2024-05-19", leads: 1, scheduled: 1, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 1, revenue: 5800, cash: 1000 },
  { date: "2024-05-20", leads: 1, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 1, showed: 1, qualified: 1, offers: 1, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-05-21", leads: 4, scheduled: 0, noShow: 0, cancelled: 1, rescheduled: 3, showed: 3, qualified: 2, offers: 1, closes: 1, revenue: 5800, cash: 1000 },
  { date: "2024-05-22", leads: 1, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 1, showed: 1, qualified: 1, offers: 0, closes: 1, revenue: 5800, cash: 5800 },
  { date: "2024-05-23", leads: 2, scheduled: 1, noShow: 0, cancelled: 0, rescheduled: 1, showed: 1, qualified: 1, offers: 0, closes: 2, revenue: 11600, cash: 8200 },
  { date: "2024-05-24", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-05-25", leads: 3, scheduled: 1, noShow: 0, cancelled: 0, rescheduled: 2, showed: 2, qualified: 2, offers: 1, closes: 1, revenue: 5800, cash: 1400 },
  { date: "2024-05-26", leads: 3, scheduled: 0, noShow: 0, cancelled: 1, rescheduled: 2, showed: 2, qualified: 2, offers: 2, closes: 0, revenue: 0, cash: 500 },
  { date: "2024-05-27", leads: 1, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 1, showed: 1, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-05-28", leads: 2, scheduled: 1, noShow: 0, cancelled: 0, rescheduled: 1, showed: 1, qualified: 1, offers: 1, closes: 1, revenue: 5700, cash: 1000 },
  { date: "2024-05-29", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 100 },
  { date: "2024-05-30", leads: 3, scheduled: 1, noShow: 0, cancelled: 1, rescheduled: 1, showed: 1, qualified: 1, offers: 0, closes: 1, revenue: 5800, cash: 1500 },
  { date: "2024-05-31", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  // June 2024
  { date: "2024-06-01", leads: 6, scheduled: 3, noShow: 2, cancelled: 0, rescheduled: 1, showed: 1, qualified: 1, offers: 0, closes: 1, revenue: 5800, cash: 1000 },
  { date: "2024-06-02", leads: 5, scheduled: 1, noShow: 0, cancelled: 0, rescheduled: 4, showed: 1, qualified: 1, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-06-03", leads: 3, scheduled: 1, noShow: 2, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 3300 },
  { date: "2024-06-04", leads: 6, scheduled: 0, noShow: 1, cancelled: 0, rescheduled: 4, showed: 2, qualified: 2, offers: 1, closes: 1, revenue: 5800, cash: 2000 },
  { date: "2024-06-05", leads: 7, scheduled: 1, noShow: 6, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-06-06", leads: 4, scheduled: 2, noShow: 0, cancelled: 0, rescheduled: 2, showed: 1, qualified: 1, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-06-07", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-06-08", leads: 1, scheduled: 0, noShow: 1, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 2300 },
  { date: "2024-06-09", leads: 3, scheduled: 0, noShow: 1, cancelled: 0, rescheduled: 2, showed: 1, qualified: 2, offers: 1, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-06-10", leads: 1, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 1, showed: 1, qualified: 1, offers: 1, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-06-11", leads: 1, scheduled: 0, noShow: 1, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-06-12", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-06-13", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-06-14", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-06-15", leads: 8, scheduled: 0, noShow: 2, cancelled: 0, rescheduled: 6, showed: 3, qualified: 6, offers: 0, closes: 3, revenue: 11700, cash: 2770 },
  { date: "2024-06-16", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-06-17", leads: 2, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 2, showed: 2, qualified: 2, offers: 2, closes: 0, revenue: 0, cash: 500 },
  { date: "2024-06-18", leads: 2, scheduled: 0, noShow: 0, cancelled: 1, rescheduled: 1, showed: 1, qualified: 1, offers: 0, closes: 1, revenue: 1500, cash: 1400 },
  { date: "2024-06-19", leads: 2, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 2, showed: 2, qualified: 2, offers: 0, closes: 1, revenue: 5800, cash: 4000 },
  { date: "2024-06-20", leads: 1, scheduled: 1, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 1000 },
  { date: "2024-06-21", leads: 3, scheduled: 0, noShow: 1, cancelled: 1, rescheduled: 1, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-06-22", leads: 8, scheduled: 1, noShow: 2, cancelled: 1, rescheduled: 4, showed: 4, qualified: 3, offers: 2, closes: 1, revenue: 200, cash: 1966 },
  { date: "2024-06-23", leads: 5, scheduled: 1, noShow: 1, cancelled: 0, rescheduled: 3, showed: 3, qualified: 3, offers: 3, closes: 0, revenue: 5600, cash: 800 },
  { date: "2024-06-24", leads: 4, scheduled: 1, noShow: 1, cancelled: 0, rescheduled: 2, showed: 1, qualified: 2, offers: 0, closes: 1, revenue: 5800, cash: 1000 },
  { date: "2024-06-25", leads: 3, scheduled: 0, noShow: 1, cancelled: 0, rescheduled: 2, showed: 1, qualified: 1, offers: 0, closes: 1, revenue: 5800, cash: 1000 },
  { date: "2024-06-26", leads: 2, scheduled: 1, noShow: 1, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 1060 },
  { date: "2024-06-27", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 500 },
  { date: "2024-06-28", leads: 3, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 3, showed: 1, qualified: 1, offers: 1, closes: 0, revenue: 0, cash: 100 },
  { date: "2024-06-29", leads: 6, scheduled: 1, noShow: 1, cancelled: 1, rescheduled: 3, showed: 3, qualified: 3, offers: 1, closes: 3, revenue: 17400, cash: 12600 },
  { date: "2024-06-30", leads: 4, scheduled: 0, noShow: 0, cancelled: 1, rescheduled: 3, showed: 2, qualified: 2, offers: 2, closes: 0, revenue: 0, cash: 0 },
  // July 2024
  { date: "2024-07-01", leads: 3, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 3, showed: 2, qualified: 2, offers: 0, closes: 2, revenue: 11600, cash: 6800 },
  { date: "2024-07-02", leads: 1, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 1, showed: 1, qualified: 1, offers: 0, closes: 1, revenue: 477, cash: 477 },
  { date: "2024-07-03", leads: 1, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 1, showed: 0, qualified: 1, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-07-04", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-07-05", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-07-06", leads: 1, scheduled: 0, noShow: 1, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-07-07", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-07-08", leads: 1, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 1, showed: 1, qualified: 1, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-07-09", leads: 1, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 1, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 1500 },
  { date: "2024-07-10", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 600 },
  { date: "2024-07-11", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-07-12", leads: 2, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 2, showed: 2, qualified: 2, offers: 2, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-07-13", leads: 8, scheduled: 2, noShow: 0, cancelled: 1, rescheduled: 5, showed: 4, qualified: 4, offers: 2, closes: 2, revenue: 11600, cash: 7800 },
  { date: "2024-07-14", leads: 5, scheduled: 2, noShow: 0, cancelled: 0, rescheduled: 3, showed: 1, qualified: 1, offers: 0, closes: 2, revenue: 11600, cash: 7830 },
  { date: "2024-07-15", leads: 8, scheduled: 2, noShow: 1, cancelled: 0, rescheduled: 5, showed: 4, qualified: 4, offers: 1, closes: 2, revenue: 11600, cash: 2500 },
  { date: "2024-07-16", leads: 5, scheduled: 2, noShow: 0, cancelled: 1, rescheduled: 2, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 670 },
  { date: "2024-07-17", leads: 3, scheduled: 1, noShow: 0, cancelled: 0, rescheduled: 1, showed: 0, qualified: 0, offers: 0, closes: 1, revenue: 5800, cash: 500 },
  { date: "2024-07-18", leads: 1, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 1, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-07-19", leads: 0, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 0 },
  { date: "2024-07-20", leads: 3, scheduled: 0, noShow: 0, cancelled: 0, rescheduled: 3, showed: 2, qualified: 2, offers: 0, closes: 0, revenue: 0, cash: 1000 },
  { date: "2024-07-21", leads: 1, scheduled: 0, noShow: 1, cancelled: 0, rescheduled: 0, showed: 0, qualified: 0, offers: 0, closes: 0, revenue: 0, cash: 1100 },
  { date: "2024-07-22", leads: 11, scheduled: 1, noShow: 4, cancelled: 0, rescheduled: 6, showed: 4, qualified: 3, offers: 2, closes: 2, revenue: 11600, cash: 5266 },
  { date: "2024-07-23", leads: 10, scheduled: 3, noShow: 4, cancelled: 0, rescheduled: 3, showed: 3, qualified: 3, offers: 0, closes: 2, revenue: 11600, cash: 3000 },
];

const connectionString = process.env.DATABASE_URL ?? process.env.NETLIFY_DB_URL ?? "";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find or create Ferran Aparicio
  let rep = await prisma.rep.findFirst({
    where: { name: "Ferran Aparicio", role: "CLOSER" },
  });

  if (!rep) {
    rep = await prisma.rep.create({
      data: {
        name: "Ferran Aparicio",
        role: "CLOSER",
        active: true,
      },
    });
    console.log(`Created rep: ${rep.name}`);
  } else {
    console.log(`Found existing rep: ${rep.name}`);
  }

  // Insert or update closing reports
  let created = 0;
  let updated = 0;

  for (const data of closingData) {
    const reportDate = new Date(data.date);
    reportDate.setUTCHours(0, 0, 0, 0);

    const result = await prisma.closingReport.upsert({
      where: {
        repId_date: {
          repId: rep.id,
          date: reportDate,
        },
      },
      create: {
        repId: rep.id,
        date: reportDate,
        callsScheduled: data.scheduled,
        callsTaken: data.showed,
        qualifiedDemos: data.qualified,
        noShows: data.noShow,
        cancelled: data.cancelled,
        rescheduled: data.rescheduled,
        dqs: 0,
        offers: data.offers,
        closes: data.closes,
        depositsAmount: 0,
        revenue: data.revenue,
        cashCollected: data.cash,
      },
      update: {
        callsScheduled: data.scheduled,
        callsTaken: data.showed,
        qualifiedDemos: data.qualified,
        noShows: data.noShow,
        cancelled: data.cancelled,
        rescheduled: data.rescheduled,
        offers: data.offers,
        closes: data.closes,
        revenue: data.revenue,
        cashCollected: data.cash,
      },
    });

    if (result.createdAt === result.updatedAt) {
      created++;
    } else {
      updated++;
    }
  }

  console.log(`✓ Created ${created} closing reports`);
  console.log(`✓ Updated ${updated} closing reports`);
  console.log(`✓ Total records: ${created + updated}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
