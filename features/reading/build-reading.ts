import { getHexagram } from "../content/hexagrams";
import type { HexagramContent, HexagramLineContent } from "../content/types";
import type { CastResult } from "../divination/types";
import { DOMAIN_PROFILES, type ReadingDomain } from "./domain-profiles";
import { LINE_STAGES } from "./line-stages";

export interface ReadingInput {
  question: string;
  domain: ReadingDomain;
  cast: CastResult;
}

export interface ReadingSection {
  title: string;
  text: string;
  source: string;
}

export interface StructuredReading {
  question: string;
  domain: ReadingDomain;
  domainLabel: string;
  original: HexagramContent;
  changed: HexagramContent | null;
  movingLines: readonly HexagramLineContent[];
  currentSituation: ReadingSection;
  coreTension: ReadingSection;
  trend: ReadingSection;
  opportunity: ReadingSection;
  risk: ReadingSection;
  action: ReadingSection;
  sections: readonly ReadingSection[];
  disclaimer: string;
}

export function buildReading({ question, domain, cast }: ReadingInput): StructuredReading {
  const profile = DOMAIN_PROFILES[domain];
  const original = getHexagram(cast.original.sequence);
  const changed = cast.changed ? getHexagram(cast.changed.sequence) : null;
  const movingLines = original.lines.filter((line) => cast.movingLines.includes(line.position));
  const movingStages = movingLines.map((line) => LINE_STAGES[line.position]);

  const currentSituation: ReadingSection = {
    title: "当前处境",
    text: `${original.theme}；${original.stage}`,
    source: `本卦主题与阶段｜${original.fullName}`,
  };
  const coreTension: ReadingSection = {
    title: "核心矛盾",
    text: [profile.focus, ...(movingStages.length ? movingStages : [original.stage])].join("；"),
    source: movingLines.length
      ? `领域关注｜${profile.label}；动爻阶段｜${movingLines.map((line) => line.title).join("、")}`
      : `领域关注｜${profile.label}；本卦阶段｜${original.fullName}`,
  };
  const trend: ReadingSection = changed
    ? {
        title: "发展趋势",
        text: `${changed.theme}；${changed.stage}`,
        source: `变卦主题与阶段｜${changed.fullName}`,
      }
    : {
        title: "发展趋势",
        text: `局势以本卦主题为主：${original.theme}`,
        source: "无动爻",
      };
  const opportunity: ReadingSection = {
    title: "有利因素",
    text: `${profile.opportunityLead}：${original.opportunity}`,
    source: `领域机会提示｜${profile.label}；本卦有利因素｜${original.fullName}`,
  };
  const risk: ReadingSection = {
    title: "风险提示",
    text: `${profile.riskLead}：${original.risk}`,
    source: `领域风险提示｜${profile.label}；本卦风险提示｜${original.fullName}`,
  };
  const action: ReadingSection = {
    title: "行动参考",
    text: [original.advice, ...movingLines.map((line) => line.advice)].join("；"),
    source: movingLines.length
      ? `本卦行动参考｜${original.fullName}；动爻行动参考｜${movingLines.map((line) => line.title).join("、")}`
      : `本卦行动参考｜${original.fullName}`,
  };
  const sections = [currentSituation, coreTension, trend, opportunity, risk, action];

  return {
    question,
    domain,
    domainLabel: profile.label,
    original,
    changed,
    movingLines,
    currentSituation,
    coreTension,
    trend,
    opportunity,
    risk,
    action,
    sections,
    disclaimer: profile.disclaimer,
  };
}
