import { PrismaClient } from "@prisma/client";
import { TEST_ADMIN_EMAIL } from "./global-setup";

async function globalTeardown() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return;
  }

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    await prisma.admin.deleteMany({
      where: { email: TEST_ADMIN_EMAIL },
    });
    console.log(`Cleaned up E2E admin: ${TEST_ADMIN_EMAIL}`);
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;
