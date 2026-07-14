import { HEXAGRAM_RECORDS } from "./hexagram-records";
import type { HexagramContent, HexagramSummary } from "./types";

export const HEXAGRAMS: readonly HexagramContent[] = Object.freeze(HEXAGRAM_RECORDS);
export const HEXAGRAM_SUMMARIES: readonly HexagramSummary[] = Object.freeze(
  HEXAGRAMS.map(({ sequence, name, fullName, pinyin, slug, symbol, upper, lower, theme }) => ({
    sequence,
    name,
    fullName,
    pinyin,
    slug,
    symbol,
    upper,
    lower,
    theme,
  })),
);

const bySequence = new Map(HEXAGRAMS.map((item) => [item.sequence, item]));
const bySlug = new Map(HEXAGRAMS.map((item) => [item.slug, item]));

export function getHexagram(sequence: number): HexagramContent {
  const item = bySequence.get(sequence);
  if (!item) throw new Error(`未知卦序：${sequence}`);
  return item;
}

export function getHexagramBySlug(slug: string): HexagramContent {
  const item = bySlug.get(slug);
  if (!item) throw new Error(`未知卦名：${slug}`);
  return item;
}

export type { HexagramContent, HexagramLineContent, HexagramSpecialLineContent, HexagramSummary } from "./types";
