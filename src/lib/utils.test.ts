import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate } from "./utils";

describe("cn", () => {
  it("merges classes and resolves Tailwind conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});

describe("formatCurrency", () => {
  it("formats a number as USD", () => {
    expect(formatCurrency(125)).toBe("$125");
  });

  it("returns placeholder for missing values", () => {
    expect(formatCurrency(undefined)).toBe("$—");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const date = new Date("2025-09-01T12:00:00.000Z");
    const formatted = formatDate(date);
    expect(formatted).toMatch(/2025/);
    expect(formatted).not.toBe("—");
  });
});
