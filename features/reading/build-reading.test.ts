import { describe, expect, it } from "vitest";
import { castHexagram } from "../divination/cast";
import { DOMAIN_PROFILES } from "./domain-profiles";
import { LINE_STAGES } from "./line-stages";
import { buildReading } from "./build-reading";

describe("reading rules", () => {
  it("defines the seven supported domain profiles", () => {
    expect(Object.keys(DOMAIN_PROFILES)).toEqual([
      "career",
      "relationship",
      "wealth",
      "study",
      "health",
      "cooperation",
      "decision",
    ]);
    expect(Object.values(DOMAIN_PROFILES).every((profile) =>
      [profile.label, profile.focus, profile.opportunityLead, profile.riskLead, profile.disclaimer]
        .every((value) => value.length > 0),
    )).toBe(true);
    expect(DOMAIN_PROFILES.wealth.disclaimer).toContain("不涉及具体证券、仓位、收益或借贷指令");
    expect(DOMAIN_PROFILES.health.disclaimer).toContain("专业意见");
  });

  it("defines all six line stages from bottom to top", () => {
    expect(LINE_STAGES).toEqual({
      1: "事情仍在萌芽与准备阶段",
      2: "事情进入内部发展与稳定执行阶段",
      3: "事情来到容易进退失据的转折处",
      4: "事情开始进入外部环境并接近关键位置",
      5: "事情来到承担主导责任与作出决定的阶段",
      6: "事情已到极处，需要留意结束、转向与物极必反",
    });
  });
});

describe("buildReading", () => {
  it("does not invent a trend when no line moves", () => {
    const reading = buildReading({
      question: "当前项目应该继续推进吗？",
      domain: "decision",
      cast: castHexagram([7, 7, 7, 7, 7, 7]),
    });

    expect(reading.changed).toBeNull();
    expect(reading.movingLines).toEqual([]);
    expect(reading.trend.text).toContain("本卦主题为主");
    expect(reading.trend.text).toContain(reading.original.theme);
    expect(reading.trend.source).toBe("无动爻");
  });

  it("uses moving-line stages and changed theme", () => {
    const reading = buildReading({
      question: "是否适合现在开始新的合作？",
      domain: "cooperation",
      cast: castHexagram([9, 7, 7, 7, 7, 7]),
    });

    expect(reading.movingLines.map((line) => line.position)).toEqual([1]);
    expect(reading.coreTension.text).toContain(LINE_STAGES[1]);
    expect(reading.changed?.sequence).toBe(44);
    expect(reading.trend.text).toContain(reading.changed?.theme);
    expect(reading.trend.source).toContain("变卦");
    expect(reading.sections.every((section) => section.source.length > 0)).toBe(true);
  });

  it("selects every moving-line record in bottom-to-top order", () => {
    const reading = buildReading({
      question: "接下来的学习节奏如何调整？",
      domain: "study",
      cast: castHexagram([6, 7, 8, 9, 7, 6]),
    });

    expect(reading.movingLines.map((line) => line.position)).toEqual([1, 4, 6]);
    expect(reading.movingLines.every((line) => line.classic.length > 0)).toBe(true);
    expect(reading.coreTension.text).toContain(LINE_STAGES[4]);
    expect(reading.action.source).toContain("动爻行动参考");
  });

  it("keeps health guidance non-diagnostic", () => {
    const reading = buildReading({
      question: "最近身体状态应该注意什么？",
      domain: "health",
      cast: castHexagram([8, 8, 8, 8, 8, 8]),
    });

    expect(JSON.stringify(reading)).not.toMatch(/诊断|处方|停药|治愈/);
    expect(reading.disclaimer).toContain("专业意见");
  });

  it("labels each section and derives it from catalog or profile fields", () => {
    const reading = buildReading({
      question: "新的岗位机会是否值得评估？",
      domain: "career",
      cast: castHexagram([7, 7, 7, 7, 7, 7]),
    });

    expect(reading.sections).toEqual([
      reading.currentSituation,
      reading.coreTension,
      reading.trend,
      reading.opportunity,
      reading.risk,
      reading.action,
    ]);
    expect(reading.currentSituation.text).toContain(reading.original.theme);
    expect(reading.currentSituation.text).toContain(reading.original.stage);
    expect(reading.coreTension.text).toContain(DOMAIN_PROFILES.career.focus);
    expect(reading.opportunity.text).toContain(reading.original.opportunity);
    expect(reading.risk.text).toContain(reading.original.risk);
    expect(reading.action.text).toContain(reading.original.advice);
    expect(reading.sections.every(({ title, text, source }) =>
      title.length > 0 && text.length > 0 && source.length > 0,
    )).toBe(true);
  });
});
