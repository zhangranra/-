import { describe, expect, it } from "vitest";
import { castHexagram, tossCoins } from "./cast";

describe("castHexagram", () => {
  it("maps six 7s to Qian with no changed hexagram", () => {
    const result = castHexagram([7, 7, 7, 7, 7, 7]);
    expect(result.original.sequence).toBe(1);
    expect(result.original.name).toBe("乾");
    expect(result.movingLines).toEqual([]);
    expect(result.changed).toBeNull();
  });

  it("maps six 8s to Kun", () => {
    expect(castHexagram([8, 8, 8, 8, 8, 8]).original.sequence).toBe(2);
  });

  it("changes Qian first line to Gou", () => {
    const result = castHexagram([9, 7, 7, 7, 7, 7]);
    expect(result.original.sequence).toBe(1);
    expect(result.movingLines).toEqual([1]);
    expect(result.changed?.sequence).toBe(44);
  });

  it("changes Kun first line to Fu", () => {
    const result = castHexagram([6, 8, 8, 8, 8, 8]);
    expect(result.original.sequence).toBe(2);
    expect(result.movingLines).toEqual([1]);
    expect(result.changed?.sequence).toBe(24);
  });

  it("rejects invalid line counts and values", () => {
    expect(() => castHexagram([7, 7] as never)).toThrow("必须正好包含六爻");
    expect(() => castHexagram([7, 7, 7, 7, 7, 5] as never)).toThrow("爻值只能是 6、7、8、9");
  });
});

describe("tossCoins", () => {
  it("derives the score from three deterministic coins", () => {
    const numbers = [0.1, 0.9, 0.1];
    const toss = tossCoins(() => numbers.shift() ?? 0);
    expect(toss.coins).toEqual([2, 3, 2]);
    expect(toss.value).toBe(7);
  });
});
