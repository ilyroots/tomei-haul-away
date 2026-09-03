import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import {
  generateReferenceNumber,
  generateSubmissionToken,
  isSubmissionTokenUsed,
  markSubmissionTokenUsed,
  normalizeEmail,
  normalizePhone,
  normalizeZip,
  isHoneypotClean,
  isFormCompletedTooFast,
  verifyTurnstileToken,
  validateFile,
} from "./helpers";

describe("normalizeEmail", () => {
  it("lowercases and trims email", () => {
    expect(normalizeEmail("  Jane@Example.COM  ")).toBe("jane@example.com");
  });
});

describe("normalizePhone", () => {
  it("strips non-digit characters", () => {
    expect(normalizePhone("(978) 555-0100")).toBe("9785550100");
    expect(normalizePhone("+1 978-555-0100")).toBe("19785550100");
  });
});

describe("normalizeZip", () => {
  it("strips non-digits and truncates to 5 characters", () => {
    expect(normalizeZip("92101-1234")).toBe("92101");
    expect(normalizeZip(" 92101 ")).toBe("92101");
  });
});

describe("generateReferenceNumber", () => {
  it("produces a THA- prefix followed by 6 alphanumeric characters", () => {
    const ref = generateReferenceNumber();
    expect(ref).toMatch(/^THA-[A-Z0-9]{6}$/);
  });

  it("supports custom prefixes", () => {
    const ref = generateReferenceNumber("ABC");
    expect(ref).toMatch(/^ABC-[A-Z0-9]{6}$/);
  });
});

describe("submission token helpers", () => {
  it("generates unique tokens", () => {
    const a = generateSubmissionToken();
    const b = generateSubmissionToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(30);
  });

  it("tracks used tokens", () => {
    const token = generateSubmissionToken();
    expect(isSubmissionTokenUsed(token)).toBe(false);
    markSubmissionTokenUsed(token);
    expect(isSubmissionTokenUsed(token)).toBe(true);
  });
});

describe("isHoneypotClean", () => {
  it("returns true for empty values", () => {
    expect(isHoneypotClean(undefined)).toBe(true);
    expect(isHoneypotClean(null)).toBe(true);
    expect(isHoneypotClean("")).toBe(true);
  });

  it("returns false for non-empty values", () => {
    expect(isHoneypotClean("spam")).toBe(false);
  });
});

describe("isFormCompletedTooFast", () => {
  it("returns true for recent timestamps", () => {
    const now = new Date().toISOString();
    expect(isFormCompletedTooFast(now)).toBe(true);
  });

  it("returns false for timestamps older than the minimum", () => {
    const old = new Date(Date.now() - 10000).toISOString();
    expect(isFormCompletedTooFast(old)).toBe(false);
  });
});

describe("verifyTurnstileToken", () => {
  let originalFetch: typeof global.fetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("returns true when secret key is not set and not in production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const result = await verifyTurnstileToken("token", undefined);
    expect(result).toBe(true);
    vi.unstubAllEnvs();
  });

  it("returns false when token is missing", async () => {
    const result = await verifyTurnstileToken("", "secret");
    expect(result).toBe(false);
  });

  it("returns success value from Turnstile API", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const result = await verifyTurnstileToken("token", "secret");
    expect(result).toBe(true);
  });
});

describe("validateFile", () => {
  const createFile = (name: string, type: string, size: number) => ({ name, type, size });

  it("returns null for a valid file", () => {
    const file = createFile("photo.jpg", "image/jpeg", 1024);
    expect(validateFile(file, { maxSizeBytes: 2048, allowedMimeTypes: ["image/jpeg"] })).toBe(null);
  });

  it("returns file-too-large for oversized files", () => {
    const file = createFile("photo.jpg", "image/jpeg", 2049);
    expect(validateFile(file, { maxSizeBytes: 2048 })).toBe("file-too-large");
  });

  it("returns invalid-type for disallowed MIME types", () => {
    const file = createFile("doc.pdf", "application/pdf", 1024);
    expect(validateFile(file, { maxSizeBytes: 2048, allowedMimeTypes: ["image/jpeg"] })).toBe(
      "invalid-type"
    );
  });

  it("returns empty-file for zero-byte files", () => {
    const file = createFile("empty.jpg", "image/jpeg", 0);
    expect(validateFile(file, { maxSizeBytes: 2048 })).toBe("empty-file");
  });

  it("returns invalid-extension for disallowed extensions", () => {
    const file = createFile("doc.pdf", "application/pdf", 1024);
    expect(
      validateFile(file, {
        maxSizeBytes: 2048,
        allowedExtensions: ["jpg", "png"],
      })
    ).toBe("invalid-extension");
  });
});
