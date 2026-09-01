"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth/auth";
import { adminLoginSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logging/logger";

export type LoginResult =
  { success: true } | { success: false; message: string; errors?: Record<string, string[]> };

export async function loginAdmin(formData: FormData): Promise<LoginResult> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the errors below.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/admin",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      logger.warn("Admin login failed", { email: parsed.data.email, type: error.type });
      return {
        success: false,
        message: "Invalid email or password. Please try again.",
      };
    }
    throw error;
  }
}
