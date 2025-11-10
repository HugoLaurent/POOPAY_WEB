import { describe, expect, test } from "vitest";
import { formatDuration } from "@/utils/time.js";

describe("formatDuration", () => {
  test("returns N/A for missing or invalid values", () => {
    expect(formatDuration(null)).toBe("N/A");
    expect(formatDuration(undefined)).toBe("N/A");
    expect(formatDuration("abc")).toBe("N/A");
  });

  test("handles durations shorter than a minute", () => {
    expect(formatDuration(12)).toBe("12 s");
    expect(formatDuration(5.4)).toBe("5 s");
  });

  test("formats minutes with remaining seconds", () => {
    expect(formatDuration(125)).toBe("2 min 5 s");
  });

  test("omits seconds when the minute is exact", () => {
    expect(formatDuration(180)).toBe("3 min");
  });
});
