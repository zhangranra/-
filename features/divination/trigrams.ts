import type { Trigram, TrigramCode } from "./types";

export const TRIGRAMS: Record<TrigramCode, Trigram> = {
  "111": { name: "乾", code: "111", symbol: "☰", nature: "天", quality: "刚健" },
  "110": { name: "兑", code: "110", symbol: "☱", nature: "泽", quality: "悦纳" },
  "101": { name: "离", code: "101", symbol: "☲", nature: "火", quality: "明辨" },
  "100": { name: "震", code: "100", symbol: "☳", nature: "雷", quality: "发动" },
  "011": { name: "巽", code: "011", symbol: "☴", nature: "风", quality: "入微" },
  "010": { name: "坎", code: "010", symbol: "☵", nature: "水", quality: "行险" },
  "001": { name: "艮", code: "001", symbol: "☶", nature: "山", quality: "知止" },
  "000": { name: "坤", code: "000", symbol: "☷", nature: "地", quality: "承载" },
};
