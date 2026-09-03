import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = {
    authSecretConfigured: Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    appUrlConfigured: Boolean(process.env.APP_URL || process.env.AUTH_URL || process.env.NEXTAUTH_URL),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString(), config });
  } catch (error) {
    logger.error("Health check failed", { error });
    return NextResponse.json(
      { status: "error", message: "Database unavailable", config },
      { status: 503 },
    );
  }
}
