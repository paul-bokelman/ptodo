import { PrismaClient } from "@prisma/client";
import { env } from "../lib";
import { prismaUtils } from "../lib/utils";

type ExtendedPrismaClient = PrismaClient & { utils: typeof prismaUtils };

interface Global {
  prisma: ExtendedPrismaClient;
}

const prisma =
  (global as unknown as Global).prisma ||
  (new PrismaClient({
    log: ["warn", "error"],
    datasources: { db: { url: env("DATABASE_URL") } },
  }) as ExtendedPrismaClient);

(global as unknown as Global).prisma = prisma;

prisma.utils = prismaUtils;

export { prisma };
