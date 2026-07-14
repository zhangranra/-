import { KING_WEN_BY_TRIGRAMS } from "./king-wen-map";
import { TRIGRAMS } from "./trigrams";
import type { BinaryLine, CastResult, CoinToss, HexagramIdentity, LineValue, TrigramCode } from "./types";

export class DivinationError extends Error {}

const isLineValue = (value: number): value is LineValue => [6, 7, 8, 9].includes(value);
const baseLine = (value: LineValue): BinaryLine => (value === 7 || value === 9 ? 1 : 0);
const changedLine = (value: LineValue): BinaryLine => (value === 6 ? 1 : value === 9 ? 0 : baseLine(value));

function identify(lines: readonly BinaryLine[]): HexagramIdentity {
  const lowerCode = lines.slice(0, 3).join("") as TrigramCode;
  const upperCode = lines.slice(3, 6).join("") as TrigramCode;
  const lower = TRIGRAMS[lowerCode];
  const upper = TRIGRAMS[upperCode];
  const identity = KING_WEN_BY_TRIGRAMS[`${upperCode}/${lowerCode}`];
  return { ...identity, upper, lower, lines };
}

export function castHexagram(values: readonly LineValue[]): CastResult {
  if (values.length !== 6) throw new DivinationError("必须正好包含六爻");
  if (!values.every(isLineValue)) throw new DivinationError("爻值只能是 6、7、8、9");
  const originalLines = values.map(baseLine);
  const movingLines = values.flatMap((value, index) => (value === 6 || value === 9 ? [index + 1] : []));
  return {
    values: [...values],
    original: identify(originalLines),
    movingLines,
    changed: movingLines.length ? identify(values.map(changedLine)) : null,
  };
}

export function tossCoins(random: () => number = Math.random): CoinToss {
  const coins = [random(), random(), random()].map((value) => (value < 0.5 ? 2 : 3)) as [
    2 | 3,
    2 | 3,
    2 | 3,
  ];
  return { coins, value: coins.reduce<number>((sum, coin) => sum + coin, 0) as LineValue };
}
