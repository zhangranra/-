import { describe, expect, it } from "vitest";
import { encodeReadingParams, parseReadingParams } from "./reading-params";

describe("reading params", () => {
  it("round-trips six values and a domain without exposing the question", () => {
    const params = encodeReadingParams({ values: [9, 7, 8, 6, 7, 8], domain: "career" });

    expect(params.toString()).toBe("lines=9%2C7%2C8%2C6%2C7%2C8&domain=career");
    expect(params.toString()).not.toContain("question");
    expect(parseReadingParams(params)).toEqual({ values: [9, 7, 8, 6, 7, 8], domain: "career" });
  });

  it.each([
    "career",
    "relationship",
    "wealth",
    "study",
    "health",
    "cooperation",
    "decision",
  ] as const)("accepts the %s domain", (domain) => {
    expect(parseReadingParams(new URLSearchParams(`lines=6,7,8,9,6,7&domain=${domain}`))).toEqual({
      values: [6, 7, 8, 9, 6, 7],
      domain,
    });
  });

  it.each([
    "lines=7,7&domain=career",
    "lines=6,7,8,9,6,10&domain=career",
    "lines=6,7,8,9,6,seven&domain=career",
    "lines=6,7,8,9,6,7&domain=unknown",
    "lines=6,7,8,9,6,7",
  ])("returns the recovery error for invalid params: %s", (query) => {
    expect(parseReadingParams(new URLSearchParams(query))).toEqual({
      error: "报告参数不完整，请重新起卦。",
    });
  });
});
