import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as readline from "node:readline";

const prisma = new PrismaClient();

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  let email = process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;
  let name = process.env.ADMIN_NAME;

  if (!email) {
    email = await prompt("Admin email: ");
  }
  if (!email || !email.includes("@")) {
    console.error("A valid email is required.");
    process.exit(1);
  }

  if (!password) {
    // readline does not support hidden input cross-platform without extra packages,
    // so the password is entered visibly. Run this script in a secure terminal.
    password = await prompt("Password (min 12 characters): ");
  }
  if (!password || password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(1);
  }

  if (!name) {
    name = (await prompt("Name (optional): ")) || undefined;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { email: email.toLowerCase() },
    update: {
      passwordHash,
      isActive: true,
      name: name ?? undefined,
    },
    create: {
      email: email.toLowerCase(),
      passwordHash,
      name: name ?? "Admin",
      role: "admin",
      isActive: true,
    },
  });

  console.log(`Admin created/updated: ${admin.email} (${admin.name ?? "Admin"})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
