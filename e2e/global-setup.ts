import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const TEST_ADMIN_EMAIL = "e2e-admin@example.com";
const TEST_ADMIN_PASSWORD = "e2e-test-password-12345";

async function globalSetup() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("DATABASE_URL is not set; skipping E2E admin seeding.");
    return;
  }

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    const passwordHash = await bcrypt.hash(TEST_ADMIN_PASSWORD, 12);
    await prisma.admin.upsert({
      where: { email: TEST_ADMIN_EMAIL },
      update: { passwordHash, isActive: true },
      create: {
        email: TEST_ADMIN_EMAIL,
        passwordHash,
        name: "E2E Test Admin",
        role: "admin",
        isActive: true,
      },
    });
    console.log(`Seeded E2E admin: ${TEST_ADMIN_EMAIL}`);
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
export { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD };
