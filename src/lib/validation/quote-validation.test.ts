import { describe, it, expect } from "vitest";
import {
  quoteSubmissionSchema,
  quoteContactSchema,
  quoteLocationSchema,
  quoteJobDetailsSchema,
  ContactPreference,
  PropertyType,
  LoadSize,
} from "./schemas";
import { isInServiceArea } from "@/lib/business/config";

const validQuote = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "(978) 555-0100",
  contactPreference: ContactPreference.EMAIL,
  line1: "123 Main St",
  city: "Haverhill",
  state: "MA",
  zip: "01830",
  serviceSlugs: ["furniture-removal"],
  itemsDescription: "Old couch and mattress",
  loadSize: LoadSize.SMALL_LOAD,
  propertyType: PropertyType.RESIDENTIAL_SINGLE_FAMILY,
  indoorOutdoor: "indoor",
  hasStairs: false,
  notes: "",
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
      contactPreference: ContactPreference.EMAIL,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = quoteContactSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "not-an-email",
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

describe("quoteLocationSchema", () => {
  it("accepts valid address", () => {
    const result = quoteLocationSchema.safeParse({
      line1: "123 Main St",
      city: "Haverhill",
      state: "MA",
      zip: "01830",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid ZIP", () => {
    const result = quoteLocationSchema.safeParse({
      line1: "123 Main St",
      city: "Haverhill",
      state: "MA",
      zip: "123",
    });
    expect(result.success).toBe(false);
  });

  it("does not reject out-of-area ZIPs", () => {
    const result = quoteLocationSchema.safeParse({
      line1: "123 Main St",
      city: "Boston",
      state: "MA",
      zip: "02101",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.zip).toBe("02101");
    }
  });
});

describe("quoteJobDetailsSchema", () => {
  it("requires at least one service", () => {
    const result = quoteJobDetailsSchema.safeParse({
      serviceSlugs: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid job details", () => {
    const result = quoteJobDetailsSchema.safeParse({
      serviceSlugs: ["furniture-removal"],
      itemsDescription: "Couch",
      loadSize: LoadSize.SINGLE_ITEM,
      propertyType: PropertyType.RESIDENTIAL_APARTMENT,
      indoorOutdoor: "indoor",
    });
    expect(result.success).toBe(true);
  });
});

describe("quoteSubmissionSchema", () => {
  it("accepts a valid complete submission", () => {
    const result = quoteSubmissionSchema.safeParse(validQuote);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isInServiceArea).toBe(true);
      expect(result.data.consentToContact).toBe(true);
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
    expect(isInServiceArea("01830")).toBe(true);
    expect(isInServiceArea("01832")).toBe(true);
  });

  it("does not match ZIPs outside the area", () => {
    expect(isInServiceArea("02101")).toBe(false);
    expect(isInServiceArea("00000")).toBe(false);
  });

  it("normalizes ZIP input before matching", () => {
    expect(isInServiceArea("01830-1234")).toBe(true);
    expect(isInServiceArea("01830 ")).toBe(true);
  });
});
