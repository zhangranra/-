export interface HexagramLineContent {
  position: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  classic: string;
  smallImage: string;
  plain: string;
  stage: string;
  advice: string;
}

export interface HexagramSpecialLineContent {
  title: "用九" | "用六";
  classic: string;
  smallImage: string;
}

export interface HexagramContent {
  sequence: number;
  name: string;
  fullName: string;
  pinyin: string;
  slug: string;
  symbol: string;
  upper: string;
  lower: string;
  theme: string;
  stage: string;
  judgment: string;
  judgmentPlain: string;
  tuan: string;
  greatImage: string;
  opportunity: string;
  risk: string;
  advice: string;
  lines: readonly HexagramLineContent[];
  specialLine?: HexagramSpecialLineContent;
}

export type HexagramSummary = Pick<
  HexagramContent,
  "sequence" | "name" | "fullName" | "pinyin" | "slug" | "symbol" | "upper" | "lower" | "theme"
>;
