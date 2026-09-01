import { randomBytes, timingSafeEqual, randomInt } from "crypto";

export function generateCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function verifyCsrfToken(token: string, expected: string): boolean {
  try {
    const tokenBuf = Buffer.from(token, "base64url");
    const expectedBuf = Buffer.from(expected, "base64url");
    if (tokenBuf.length !== expectedBuf.length) {
      return false;
    }
    return timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
}

export function isHoneypotClean(value: string | undefined | null): boolean {
  return value === undefined || value === null || value === "";
}

const MIN_FORM_MS = 3000; // 3 seconds

export function isFormCompletedTooFast(startedAt: string | number | Date): boolean {
  const start =
    typeof startedAt === "string" ? Date.parse(startedAt) : new Date(startedAt).getTime();
  if (Number.isNaN(start)) {
    return true;
  }
  return Date.now() - start < MIN_FORM_MS;
}

export async function verifyTurnstileToken(
  token: string,
  secretKey: string | undefined
): Promise<boolean> {
  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("TURNSTILE_SECRET_KEY is required in production.");
    }
    return true;
  }

  if (!token) {
    return false;
  }

  const formData = new URLSearchParams();
  formData.append("secret", secretKey);
  formData.append("response", token);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { success: boolean; "error-codes"?: string[] };
  return data.success === true;
}

// In-memory duplicate-token guard. Not suitable for multi-instance deployments;
// switch to Redis or a database table in production.
const USED_TOKENS = new Map<string, number>();
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function gcUsedTokens() {
  const now = Date.now();
  for (const [token, expiresAt] of USED_TOKENS.entries()) {
    if (now > expiresAt) {
      USED_TOKENS.delete(token);
    }
  }
}

export function generateSubmissionToken(): string {
  return randomBytes(32).toString("hex");
}

export function markSubmissionTokenUsed(token: string): void {
  USED_TOKENS.set(token, Date.now() + TOKEN_TTL_MS);
  gcUsedTokens();
}

export function isSubmissionTokenUsed(token: string): boolean {
  gcUsedTokens();
  return USED_TOKENS.has(token);
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function normalizeZip(zip: string): string {
  return zip.replace(/\D/g, "").slice(0, 5);
}

export function normalizeDateString(value: string | Date | undefined): Date | undefined {
  if (!value) return undefined;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? undefined : date;
}

// Re-export client-safe file validation helpers so existing imports keep working.
export {
  validateFile,
  type FileValidationOptions,
  type FileValidationError,
} from "@/lib/file-validation";

const REFERENCE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateReferenceNumber(prefix = "THA"): string {
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += REFERENCE_ALPHABET[randomInt(0, REFERENCE_ALPHABET.length)];
  }
  return `${prefix}-${suffix}`;
}
