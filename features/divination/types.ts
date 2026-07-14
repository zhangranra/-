export type LineValue = 6 | 7 | 8 | 9;
export type BinaryLine = 0 | 1;
export type TrigramCode = "000" | "001" | "010" | "011" | "100" | "101" | "110" | "111";

export interface Trigram {
  name: "乾" | "兑" | "离" | "震" | "巽" | "坎" | "艮" | "坤";
  code: TrigramCode;
  symbol: string;
  nature: string;
  quality: string;
}

export interface HexagramIdentity {
  sequence: number;
  name: string;
  slug: string;
  upper: Trigram;
  lower: Trigram;
  lines: readonly BinaryLine[];
}

export interface CoinToss {
  coins: readonly [2 | 3, 2 | 3, 2 | 3];
  value: LineValue;
}

export interface CastResult {
  values: readonly LineValue[];
  original: HexagramIdentity;
  movingLines: readonly number[];
  changed: HexagramIdentity | null;
}
