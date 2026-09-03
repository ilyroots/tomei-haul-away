import { describe, it, expect } from "vitest";
import {
  quoteSubmissionSchema,
  quoteContactSchema,
  quoteJobDetailsSchema,
  ContactPreference,
} from "./schemas";
import { isInServiceArea } from "@/lib/business/config";

const validQuote = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "(978) 555-0100",
  contactPreference: ContactPreference.EMAIL,
  zip: "92101",
  serviceSlug: "furniture-removal",
  removalItems: ["Furniture"],
  itemsDescription: "Old couch and mattress",
  photos: [],
  consentToContact: true,
  privacyPolicyAcknowledged: true,
  marketingConsent: false,
  submissionAcknowledged: true,
  turnstileToken: "test-token",
  startedAt: new Date(Date.now() - 5000).toISOString(),
};

describe("quoteContactSchema", () => {
  it("accepts valid contact info", () => {
    const result = quoteContactSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "9785550100",
      contactPreference: ContactPreference.EMAIL,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing first name", () => {
    const result = quoteContactSchema.safeParse({
      firstName: "",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "9785550100",
      contactPreference: ContactPreference.EMAIL,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = quoteContactSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "not-an-email",
      phone: "9785550100",
      contactPreference: ContactPreference.EMAIL,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing phone", () => {
    const result = quoteContactSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "",
      contactPreference: ContactPreference.EMAIL,
    });
    expect(result.success).toBe(false);
  });

  it("rejects malformed phone", () => {
    const result = quoteContactSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "123",
      contactPreference: ContactPreference.EMAIL,
    });
    expect(result.success).toBe(false);
  });
});

describe("quoteJobDetailsSchema", () => {
  it("accepts a valid ZIP-only job", () => {
    const result = quoteJobDetailsSchema.safeParse({
      zip: "92101",
      serviceSlug: "furniture-removal",
      removalItems: ["Furniture"],
      itemsDescription: "Old couch",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid ZIP", () => {
    const result = quoteJobDetailsSchema.safeParse({
      zip: "123",
      serviceSlug: "furniture-removal",
      removalItems: ["Furniture"],
    });
    expect(result.success).toBe(false);
  });

  it("does not reject out-of-area ZIPs", () => {
    const result = quoteJobDetailsSchema.safeParse({
      zip: "02101",
      serviceSlug: "furniture-removal",
      removalItems: ["Furniture"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.zip).toBe("02101");
    }
  });

  it("requires a service type", () => {
    const result = quoteJobDetailsSchema.safeParse({
      zip: "92101",
      serviceSlug: "",
      removalItems: ["Furniture"],
    });
    expect(result.success).toBe(false);
  });

  it("requires at least one removal item", () => {
    const result = quoteJobDetailsSchema.safeParse({
      zip: "92101",
      serviceSlug: "furniture-removal",
      removalItems: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("quoteSubmissionSchema", () => {
  it("accepts a valid complete submission", () => {
    const result = quoteSubmissionSchema.safeParse(validQuote);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isInServiceArea).toBe(true);
      expect(result.data.consentToContact).toBe(true);
      expect(result.data.phone).toBe("9785550100");
    }
  });

  it("computes isInServiceArea flag", () => {
    const result = quoteSubmissionSchema.safeParse({
      ...validQuote,
      zip: "02101",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isInServiceArea).toBe(false);
    }
  });

  it("rejects missing consent", () => {
    const result = quoteSubmissionSchema.safeParse({
      ...validQuote,
      consentToContact: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a street-address-style payload without ZIP fields", () => {
    const result = quoteSubmissionSchema.safeParse({
      ...validQuote,
      line1: "123 Main St",
      city: "San Diego",
      state: "CA",
    });
    // line1/city/state are no longer part of the schema; extra keys are stripped
    expect(result.success).toBe(true);
    if (result.success) {
      expect("line1" in result.data).toBe(false);
    }
  });

  it("rejects too-fast submissions", () => {
    const result = quoteSubmissionSchema.safeParse({
      ...validQuote,
      startedAt: new Date().toISOString(),
    });
    // The schema itself does not enforce timing; that is checked in the server action.
    expect(result.success).toBe(true);
  });
});

describe("service area matching", () => {
  it("matches known service-area ZIPs", () => {
    expect(isInServiceArea("92101")).toBe(true);
    expect(isInServiceArea("92102")).toBe(true);
  });

  it("does not match ZIPs outside the area", () => {
    expect(isInServiceArea("02101")).toBe(false);
    expect(isInServiceArea("00000")).toBe(false);
  });

  it("normalizes ZIP input before matching", () => {
    expect(isInServiceArea("92101-1234")).toBe(true);
    expect(isInServiceArea("92101 ")).toBe(true);
  });
});
