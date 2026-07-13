import { describe, expect, it } from "vitest";
import { KING_WEN_BY_TRIGRAMS } from "../divination/king-wen-map";
import { HEXAGRAMS, HEXAGRAM_SUMMARIES, getHexagram, getHexagramBySlug } from "./hexagrams";

describe("hexagram content", () => {
  it("contains 64 unique King Wen entries", () => {
    expect(HEXAGRAMS).toHaveLength(64);
    expect(new Set(HEXAGRAMS.map((item) => item.sequence)).size).toBe(64);
    expect(new Set(HEXAGRAMS.map((item) => item.slug)).size).toBe(64);
    expect(HEXAGRAMS.map((item) => item.sequence).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 64 }, (_, index) => index + 1),
    );
  });

  it("projects only the fields needed by the client-side hexagram browser", () => {
    expect(HEXAGRAM_SUMMARIES).toHaveLength(64);
    expect(Object.keys(HEXAGRAM_SUMMARIES[0]).sort()).toEqual([
      "fullName",
      "lower",
      "name",
      "pinyin",
      "sequence",
      "slug",
      "symbol",
      "theme",
      "upper",
    ]);
    expect(JSON.stringify(HEXAGRAM_SUMMARIES).length).toBeLessThan(JSON.stringify(HEXAGRAMS).length / 4);
  });

  it("contains six unique, ordered lines for every hexagram", () => {
    for (const hexagram of HEXAGRAMS) {
      expect(hexagram.lines).toHaveLength(6);
      expect(hexagram.lines.map((line) => line.position)).toEqual([1, 2, 3, 4, 5, 6]);
      expect(new Set(hexagram.lines.map((line) => line.position)).size).toBe(6);
      expect(hexagram.lines.every((line) => line.classic.trim().length > 0)).toBe(true);
      expect(hexagram.lines.every((line) => line.smallImage.trim().length > 0)).toBe(true);
      expect(hexagram.judgment.trim().length).toBeGreaterThan(0);
      expect(hexagram.tuan.trim().length).toBeGreaterThan(0);
      expect(hexagram.greatImage.trim().length).toBeGreaterThan(0);
    }

    expect(HEXAGRAMS.flatMap((hexagram) => hexagram.lines)).toHaveLength(384);
    expect(getHexagram(1).specialLine?.title).toBe("用九");
    expect(getHexagram(2).specialLine?.title).toBe("用六");
    expect(HEXAGRAMS.slice(2).every((hexagram) => hexagram.specialLine === undefined)).toBe(true);
  });

  it("keeps modern interpretation fields non-empty and separate", () => {
    for (const hexagram of HEXAGRAMS) {
      expect(hexagram.fullName.trim()).not.toBe("");
      expect(hexagram.pinyin.trim()).not.toBe("");
      expect(hexagram.symbol.trim()).not.toBe("");
      expect(hexagram.upper.trim()).not.toBe("");
      expect(hexagram.lower.trim()).not.toBe("");
      expect(hexagram.theme.trim()).not.toBe("");
      expect(hexagram.stage.trim()).not.toBe("");
      expect(hexagram.judgmentPlain.trim()).not.toBe("");
      expect(hexagram.opportunity.trim()).not.toBe("");
      expect(hexagram.risk.trim()).not.toBe("");
      expect(hexagram.advice.trim()).not.toBe("");

      for (const line of hexagram.lines) {
        expect(line.title.trim()).not.toBe("");
        expect(line.plain.trim()).not.toBe("");
        expect(line.stage.trim()).not.toBe("");
        expect(line.advice.trim()).not.toBe("");
        expect(line.plain).not.toBe(line.classic);
      }
    }
  });

  it("uses authored hexagram- and line-specific modern interpretations", () => {
    const modernStrings = HEXAGRAMS.flatMap((hexagram) => [
      hexagram.judgmentPlain,
      hexagram.opportunity,
      hexagram.risk,
      hexagram.advice,
      ...hexagram.lines.flatMap((line) => [line.plain, line.advice]),
    ]);

    expect(modernStrings).toHaveLength(1_024);
    expect(new Set(modernStrings).size).toBe(modernStrings.length);
    expect(modernStrings.join("\n")).not.toMatch(
      /应结合原文审慎判断|把握.+中的有利条件|避免在.+时急于求成|先辨明处境，再选择稳妥行动/,
    );
  });

  it("resolves Qian by sequence and slug", () => {
    expect(getHexagram(1).name).toBe("乾");
    expect(getHexagramBySlug("qian").judgment).toContain("元");
    expect(() => getHexagram(0)).toThrow("未知卦序：0");
    expect(() => getHexagramBySlug("missing")).toThrow("未知卦名：missing");
  });

  it("matches every exhaustive trigram-map entry", () => {
    const entries = Object.values(KING_WEN_BY_TRIGRAMS);
    expect(entries).toHaveLength(64);

    for (const entry of entries) {
      const content = getHexagram(entry.sequence);
      expect(content.name).toBe(entry.name);
      expect(content.slug).toBe(entry.slug);
    }
  });
});
