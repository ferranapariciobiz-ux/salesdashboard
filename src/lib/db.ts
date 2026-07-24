import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Read lazily rather than throwing at module load: Next's build-time
// "collect page configuration" step imports every route module (even
// force-dynamic ones) just to read their exports, so throwing here would
// break `next build` in any environment where the DB env var isn't set
// yet, even though no query actually runs until a request comes in.
const connectionString = process.env.DATABASE_URL ?? process.env.NETLIFY_DB_URL ?? "";

const adapter = new PrismaPg({ connectionString });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
