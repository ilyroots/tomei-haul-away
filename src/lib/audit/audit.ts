"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logging/logger";
import type { Prisma } from "@prisma/client";

export type AuditActionParams = {
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function logAuditAction({
  action,
  entityType,
  entityId,
  metadata,
}: AuditActionParams) {
  try {
    const session = await auth();
    const requestHeaders = await headers();
    const ipAddress =
      requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip") ?? null;
    const userAgent = requestHeaders.get("user-agent") ?? null;

    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        actorId: session?.user?.id ?? null,
        actorType: session?.user?.id ? "Admin" : "System",
        metadata: (metadata ?? {}) as Prisma.InputJsonValue,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    logger.error("Failed to write audit log", { error, action, entityType, entityId });
  }
}
