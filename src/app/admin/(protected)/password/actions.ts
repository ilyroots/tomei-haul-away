"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth, checkRateLimit } from "@/lib/auth/auth";
import { logAuditAction } from "@/lib/audit/audit";
import { prisma } from "@/lib/db/prisma";

const passwordChange = z.object({
  current: z.string().min(1).max(1024),
  next: z.string().min(12).refine((value) => Buffer.byteLength(value, "utf8") <= 72),
  confirm: z.string().max(72),
});

export type PasswordChangeResult = { success: boolean; message: string };

export async function changePassword(
  _previous: PasswordChangeResult | null,
  formData: FormData,
): Promise<PasswordChangeResult> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return { success: false, message: "Sign in again to change your password." };

  const fields = passwordChange.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!fields.success) {
    return { success: false, message: "Enter your current password and a new password of at least 12 characters and at most 72 bytes." };
  }
  const { current, next, confirm } = fields.data;
  if (next !== confirm) return { success: false, message: "The new passwords do not match." };
  if (current === next) return { success: false, message: "Choose a different new password." };
  if (!checkRateLimit(`password-change:${id}`)) {
    return { success: false, message: "Too many attempts. Please try again in 15 minutes." };
  }

  const admin = await prisma.admin.findUnique({
    where: { id },
    select: { isActive: true, passwordHash: true },
  });
  if (!admin?.isActive || !(await bcrypt.compare(current, admin.passwordHash))) {
    return { success: false, message: "The current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(next, 12);
  const updated = await prisma.admin.updateMany({
    where: { id, isActive: true, passwordHash: admin.passwordHash },
    data: { passwordHash },
  });
  if (updated.count !== 1) {
    return { success: false, message: "Your password changed in another session. Sign in again and retry." };
  }
  await logAuditAction({ action: "ADMIN_PASSWORD_CHANGED", entityType: "Admin", entityId: id });
  return { success: true, message: "Password changed. Use your new password the next time you sign in." };
}
