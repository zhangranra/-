# 观易交互式 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建并发布“观易”首版网站，让用户完成真实的六次铜钱起卦、查看可追溯报告，并浏览六十四卦与周易入门内容。

**Architecture:** 使用 Sites 提供的 Vinext/Next.js App Router 模板。卦象计算、经典内容、规则报告和浏览器存储分成独立模块；静态内容由服务端页面输出，起卦交互与本地记录由客户端组件处理，不使用后端数据库或 AI 接口。

**Tech Stack:** Node.js `>=22.13.0`、Next.js `16.2.6`、React `19.2.6`、TypeScript `5.9.3`、Vinext `0.0.50`、Vite `8.0.13`、Vitest、Testing Library、原生 CSS、Cloudflare Sites。

## Global Constraints

- 品牌名固定为“观易｜东方智慧推演平台”，首页主张固定为“观天地之变，明当下之势”。
- 全局色彩固定为宣纸米白 `#F4F0E8`、浅砂白 `#FBF9F4`、松烟墨 `#20231F`、墨灰 `#686B63`、古铜金 `#A8844F`、朱砂红 `#9A493C`。
- 六爻数组始终自下而上保存：索引 `0` 是初爻，索引 `5` 是上爻。
- `6` 为老阴、`7` 为少阳、`8` 为少阴、`9` 为老阳；只有 `6` 与 `9` 翻转。
- 六十四卦采用文王卦序映射，不能把六位二进制数直接当作卦序。
- 首版不接账号、付费、数据库、AI、纳甲、八字、紫微斗数、姓名学或风水。
- 经典原文、白话解释和现代行动参考必须使用不同标签呈现。
- 健康、法律和投资相关内容只作为传统文化与自我反思参考，不输出诊断、法律结论、证券、仓位、收益或借贷指令。
- 不使用模型生成的 SVG；主视觉由字体、CSS 六爻线条、布局与色彩完成。
- 所有交互支持键盘，并遵循 `prefers-reduced-motion`。
- 完成后删除 starter loading skeleton、`codex-preview` 元数据和未使用的 `react-loading-skeleton` 依赖。

---

## File Map

```text
app/
  layout.tsx                         全局元数据、字体与页面框架
  globals.css                        视觉令牌、布局、响应式与动效
  page.tsx                           首页
  divination/page.tsx                起卦入口页面
  reading/page.tsx                   报告入口页面
  hexagrams/page.tsx                 六十四卦索引
  hexagrams/[slug]/page.tsx          单卦详情
  learn/page.tsx                     周易入门
components/
  site-header.tsx                    全局导航
  site-footer.tsx                    全局声明与页脚
  hexagram-glyph.tsx                 六爻图形
  casting-experience.tsx             六次投掷交互
  reading-report.tsx                 报告展示
  hexagram-browser.tsx               卦象筛选
features/divination/
  types.ts                           爻、卦与计算结果类型
  trigrams.ts                        八卦编码与属性
  king-wen-map.ts                    上下卦到文王卦序映射
  cast.ts                            铜钱与变卦计算
  cast.test.ts                       计算单元测试
features/content/
  types.ts                           卦、爻与领域内容类型
  hexagram-records.ts                按文王卦序保存的 64 卦经典记录
  hexagrams.ts                       六十四卦元数据与经典内容
  content.test.ts                    64 卦与 384 爻完整性测试
  sources.md                         经典文本来源与校对说明
features/reading/
  domain-profiles.ts                 七类问题的措辞边界
  line-stages.ts                     六个爻位的阶段解释
  build-reading.ts                   结构化报告规则
  build-reading.test.ts              报告规则测试
features/storage/
  reading-store.ts                   草稿与最近记录持久化
  reading-store.test.ts              存储降级测试
features/routing/
  reading-params.ts                  报告地址参数解析
  reading-params.test.ts             非法参数与恢复测试
tests/
  rendered-html.test.mjs             构建后首页与路由烟雾测试
public/
  favicon.svg                        简洁文字/六爻品牌图标
  og.png                             品牌社交分享图
```

---

### Task 1: 初始化 Sites 项目与测试基线

**Files:**
- Create from starter: `package.json`, `package-lock.json`, `.openai/hosting.json`, `vite.config.ts`, `next.config.ts`, `tsconfig.json`, `app/*`
- Modify: `package.json`
- Modify: `tests/rendered-html.test.mjs`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Preserve: `docs/superpowers/specs/2026-07-12-guanyi-mvp-design.md`
- Preserve: `docs/superpowers/plans/2026-07-12-guanyi-mvp-implementation.md`

**Interfaces:**
- Consumes: Sites Vinext starter and the approved design spec.
- Produces: `npm run test:unit`, `npm run test`, `npm run build`, and a live development server.

- [ ] **Step 1: Run the required Sites initializer without losing approved docs**

Move `docs` outside the non-empty target, initialize once, then restore it:

```bash
mv docs /tmp/guanyi-approved-docs
/Users/ran/.codex/plugins/cache/openai-bundled/sites/0.1.27/scripts/init-site.sh "$PWD"
mv /tmp/guanyi-approved-docs docs
```

Expected: the starter files and dependencies exist, `.git` history remains intact, and both approved documents are back under `docs/superpowers/`.

- [ ] **Step 2: Start the retained development preview**

```bash
npm run dev
```

Expected: Vinext prints one healthy Local URL. Keep this session running and open that exact URL in Codex once.

- [ ] **Step 3: Verify the untouched starter baseline**

```bash
npm test
```

Expected: the starter build succeeds and both starter HTML tests pass.

- [ ] **Step 4: Install the unit-test tools and add scripts**

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

Set these scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext dev",
    "build": "WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext build",
    "start": "WRANGLER_LOG_PATH=.wrangler/wrangler.log vinext start",
    "test:unit": "vitest run",
    "test:watch": "vitest",
    "test": "npm run test:unit && npm run build && node --test tests/rendered-html.test.mjs",
    "lint": "eslint . --ignore-pattern dist --ignore-pattern .next"
  }
}
```

- [ ] **Step 5: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
});
```

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Run the empty unit-test suite**

```bash
npm run test:unit -- --passWithNoTests
```

Expected: Vitest exits successfully with no matching tests.

- [ ] **Step 7: Commit the scaffold**

```bash
git add .
git commit -m "chore: initialize Guanyi site"
```

---

### Task 2: 实现确定性起卦引擎

**Files:**
- Create: `features/divination/types.ts`
- Create: `features/divination/trigrams.ts`
- Create: `features/divination/king-wen-map.ts`
- Create: `features/divination/cast.ts`
- Test: `features/divination/cast.test.ts`

**Interfaces:**
- Consumes: exactly six `LineValue` values in bottom-to-top order.
- Produces: `castHexagram(values: readonly LineValue[]): CastResult`, `tossCoins(random?: () => number): CoinToss`, and `DivinationError`.

- [ ] **Step 1: Write failing tests for line conversion and validation**

Create `features/divination/cast.test.ts` with these assertions:

```ts
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
```

- [ ] **Step 2: Run the tests and confirm RED**

```bash
npm run test:unit -- features/divination/cast.test.ts
```

Expected: FAIL because `./cast` does not exist.

- [ ] **Step 3: Define the public types**

Create `features/divination/types.ts`:

```ts
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
```

- [ ] **Step 4: Implement trigram and King Wen mappings**

Create `features/divination/trigrams.ts` with all eight bottom-to-top codes:

```ts
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
```

Create `features/divination/king-wen-map.ts` as an immutable `Record<`${TrigramCode}/${TrigramCode}`, { sequence: number; name: string; slug: string }>` containing all 64 upper/lower combinations. Use the standard eight-by-eight table and verify uniqueness in Task 3.

- [ ] **Step 5: Implement the minimal calculation**

Create `features/divination/cast.ts`:

```ts
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
  const coins = [random(), random(), random()].map((value) => (value < 0.5 ? 2 : 3)) as [2 | 3, 2 | 3, 2 | 3];
  return { coins, value: coins.reduce((sum, coin) => sum + coin, 0) as LineValue };
}
```

- [ ] **Step 6: Run the focused and full unit suites**

```bash
npm run test:unit -- features/divination/cast.test.ts
npm run test:unit
```

Expected: all casting tests pass with no warnings.

- [ ] **Step 7: Commit the engine**

```bash
git add features/divination
git commit -m "feat: add deterministic I Ching casting engine"
```

---

### Task 3: 建立完整六十四卦与 384 爻内容层

**Files:**
- Create: `features/content/types.ts`
- Create: `features/content/hexagram-records.ts`
- Create: `features/content/hexagrams.ts`
- Create: `features/content/sources.md`
- Test: `features/content/content.test.ts`
- Modify: `features/divination/king-wen-map.ts`

**Interfaces:**
- Consumes: `sequence` values from `castHexagram`.
- Produces: `HEXAGRAMS`, `getHexagram(sequence)`, `getHexagramBySlug(slug)`, and complete classic line records.

- [ ] **Step 1: Write failing completeness tests**

```ts
import { describe, expect, it } from "vitest";
import { HEXAGRAMS, getHexagram, getHexagramBySlug } from "./hexagrams";

describe("hexagram content", () => {
  it("contains 64 unique King Wen entries", () => {
    expect(HEXAGRAMS).toHaveLength(64);
    expect(new Set(HEXAGRAMS.map((item) => item.sequence)).size).toBe(64);
    expect(new Set(HEXAGRAMS.map((item) => item.slug)).size).toBe(64);
    expect(HEXAGRAMS.map((item) => item.sequence).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 64 }, (_, index) => index + 1),
    );
  });

  it("contains six unique, ordered lines for every hexagram", () => {
    for (const hexagram of HEXAGRAMS) {
      expect(hexagram.lines).toHaveLength(6);
      expect(hexagram.lines.map((line) => line.position)).toEqual([1, 2, 3, 4, 5, 6]);
      expect(hexagram.lines.every((line) => line.classic.trim().length > 0)).toBe(true);
      expect(hexagram.tuan.trim().length).toBeGreaterThan(0);
      expect(hexagram.greatImage.trim().length).toBeGreaterThan(0);
    }
  });

  it("resolves Qian by sequence and slug", () => {
    expect(getHexagram(1).name).toBe("乾");
    expect(getHexagramBySlug("qian").judgment).toContain("元");
  });
});
```

- [ ] **Step 2: Run the test and confirm RED**

```bash
npm run test:unit -- features/content/content.test.ts
```

Expected: FAIL because `./hexagrams` does not exist.

- [ ] **Step 3: Define content types**

```ts
export interface HexagramLineContent {
  position: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  classic: string;
  plain: string;
  stage: string;
  advice: string;
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
}
```

- [ ] **Step 4: Populate and document the canonical content**

Create `HEXAGRAM_RECORDS` in `hexagram-records.ts` in文王卦序 with all 64 names,卦辞、彖传、大象传 and six ordered line records per entry. Use the public-domain Chinese `周易` text as the source for `judgment`, `tuan`, `greatImage` and `lines[].classic`; independently cross-check卦序、卦名 and every line count against a second edition. Record the exact source pages, retrieval date `2026-07-12`, punctuation normalization, and the rule “卦辞、彖传、大象传、爻辞分字段保存” in `features/content/sources.md`.

Use this lookup contract:

```ts
import { HEXAGRAM_RECORDS } from "./hexagram-records";

export const HEXAGRAMS: readonly HexagramContent[] = Object.freeze(HEXAGRAM_RECORDS);

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
```

- [ ] **Step 5: Derive the 64-entry trigram map from the validated catalog**

Ensure `KING_WEN_BY_TRIGRAMS` contains 64 keys, every mapped `sequence` resolves through `getHexagram`, and its names/slugs match the content catalog. Add those assertions to `content.test.ts` before changing the map, run them once to see the mismatch fail, then correct the map.

- [ ] **Step 6: Run focused tests**

```bash
npm run test:unit -- features/content/content.test.ts features/divination/cast.test.ts
```

Expected: 64 unique卦, 384 non-empty爻 records, and all known casting vectors pass.

- [ ] **Step 7: Commit the content layer**

```bash
git add features/content features/divination/king-wen-map.ts
git commit -m "feat: add complete hexagram content catalog"
```

---

### Task 4: 生成可追溯的规则报告

**Files:**
- Create: `features/reading/domain-profiles.ts`
- Create: `features/reading/line-stages.ts`
- Create: `features/reading/build-reading.ts`
- Test: `features/reading/build-reading.test.ts`

**Interfaces:**
- Consumes: `question`, seven-value `ReadingDomain`, and a `CastResult`.
- Produces: `buildReading(input: ReadingInput): StructuredReading` with source labels.

- [ ] **Step 1: Write failing reading tests**

```ts
import { describe, expect, it } from "vitest";
import { castHexagram } from "../divination/cast";
import { buildReading } from "./build-reading";

describe("buildReading", () => {
  it("does not invent a trend when no line moves", () => {
    const reading = buildReading({
      question: "当前项目应该继续推进吗？",
      domain: "decision",
      cast: castHexagram([7, 7, 7, 7, 7, 7]),
    });
    expect(reading.changed).toBeNull();
    expect(reading.trend.text).toContain("本卦主题为主");
    expect(reading.trend.source).toBe("无动爻");
  });

  it("uses moving-line stages and changed theme", () => {
    const reading = buildReading({
      question: "是否适合现在开始新的合作？",
      domain: "cooperation",
      cast: castHexagram([9, 7, 7, 7, 7, 7]),
    });
    expect(reading.movingLines.map((line) => line.position)).toEqual([1]);
    expect(reading.trend.source).toContain("变卦");
    expect(reading.sections.every((section) => section.source.length > 0)).toBe(true);
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
});
```

- [ ] **Step 2: Run and confirm RED**

```bash
npm run test:unit -- features/reading/build-reading.test.ts
```

Expected: FAIL because `build-reading.ts` does not exist.

- [ ] **Step 3: Add the seven domain profiles and six line stages**

Define `ReadingDomain` as `"career" | "relationship" | "wealth" | "study" | "health" | "cooperation" | "decision"`. Each domain profile contains `label`, `focus`, `opportunityLead`, `riskLead`, and `disclaimer`; the health and wealth disclaimers use the exact safety boundaries in Global Constraints.

Define line stages as:

```ts
export const LINE_STAGES = {
  1: "事情仍在萌芽与准备阶段",
  2: "事情进入内部发展与稳定执行阶段",
  3: "事情来到容易进退失据的转折处",
  4: "事情开始进入外部环境并接近关键位置",
  5: "事情来到承担主导责任与作出决定的阶段",
  6: "事情已到极处，需要留意结束、转向与物极必反",
} as const;
```

- [ ] **Step 4: Implement `buildReading`**

The implementation must return original/changed content, selected moving-line records, and these labeled sections: `currentSituation`, `coreTension`, `trend`, `opportunity`, `risk`, `action`. Every section has `{ title, text, source }`. Text combines only validated fields from `HexagramContent`, the applicable `LINE_STAGES`, and the selected domain profile; no random text or model call is allowed.

- [ ] **Step 5: Run reading and full unit tests**

```bash
npm run test:unit -- features/reading/build-reading.test.ts
npm run test:unit
```

Expected: all report rules and prior casting/content tests pass.

- [ ] **Step 6: Commit the reading engine**

```bash
git add features/reading
git commit -m "feat: add traceable reading rules"
```

---

### Task 5: 实现报告地址与本地恢复

**Files:**
- Create: `features/routing/reading-params.ts`
- Test: `features/routing/reading-params.test.ts`
- Create: `features/storage/reading-store.ts`
- Test: `features/storage/reading-store.test.ts`

**Interfaces:**
- Consumes: URLSearchParams and a `Storage`-compatible object.
- Produces: `encodeReadingParams`, `parseReadingParams`, `saveDraft`, `loadDraft`, `saveRecentReading`, and `loadRecentReadings`.

- [ ] **Step 1: Write failing parser and storage tests**

```ts
import { describe, expect, it } from "vitest";
import { encodeReadingParams, parseReadingParams } from "./reading-params";

describe("reading params", () => {
  it("round-trips six values and a domain without exposing the question", () => {
    const params = encodeReadingParams({ values: [9, 7, 8, 6, 7, 8], domain: "career" });
    expect(params.toString()).not.toContain("question");
    expect(parseReadingParams(params)).toEqual({ values: [9, 7, 8, 6, 7, 8], domain: "career" });
  });

  it("returns a clear error for invalid values", () => {
    expect(parseReadingParams(new URLSearchParams("lines=7,7&domain=career"))).toEqual({
      error: "报告参数不完整，请重新起卦。",
    });
  });
});
```

Create a small in-memory `Storage` implementation in `reading-store.test.ts`. Verify valid draft round-tripping, malformed JSON returning `null`, a throwing storage object returning `null`, and recent records being capped at ten.

- [ ] **Step 2: Run and confirm RED**

```bash
npm run test:unit -- features/routing/reading-params.test.ts features/storage/reading-store.test.ts
```

Expected: FAIL because both modules are missing.

- [ ] **Step 3: Implement privacy-preserving URL parameters**

Encode the six values as `lines=9,7,8,6,7,8` and the category as `domain=career`. Validate exactly six integers from `{6,7,8,9}` and one of the seven domains. Never put the question text into the URL.

- [ ] **Step 4: Implement guarded browser storage**

Use keys `guanyi:casting-draft:v1` and `guanyi:recent-readings:v1`. Wrap every `getItem`/`setItem`/`JSON.parse` in `try/catch`; invalid or unavailable storage returns `null`/`[]` and does not throw. Store only question, domain, line values, timestamp, original sequence, and optional changed sequence.

- [ ] **Step 5: Run focused and full unit suites**

```bash
npm run test:unit -- features/routing/reading-params.test.ts features/storage/reading-store.test.ts
npm run test:unit
```

Expected: parser, recovery, casting, content, and reading tests all pass.

- [ ] **Step 6: Commit routing and storage**

```bash
git add features/routing features/storage
git commit -m "feat: add private reading links and local recovery"
```

---

### Task 6: 建立品牌框架与完整首页

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Replace: `app/page.tsx`
- Create: `components/site-header.tsx`
- Create: `components/site-footer.tsx`
- Create: `components/hexagram-glyph.tsx`
- Modify: `tests/rendered-html.test.mjs`
- Remove: `app/_sites-preview/SkeletonPreview.tsx`
- Remove: `app/_sites-preview/preview.css`
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: brand copy, palette, `HexagramIdentity` line arrays, and navigation routes.
- Produces: reusable header/footer/glyph components and server-rendered home content.

- [ ] **Step 1: Replace starter smoke assertions before replacing the UI**

Change `tests/rendered-html.test.mjs` to assert HTTP 200, `lang="zh-CN"`, `<title>` containing “观易”, hero copy “观天地之变，明当下之势”, links to `/divination`, `/hexagrams`, `/learn`, the cultural reference disclaimer, absence of `codex-preview`, and absence of `react-loading-skeleton`.

- [ ] **Step 2: Run the build smoke test and confirm RED**

```bash
npm run build && node --test tests/rendered-html.test.mjs
```

Expected: FAIL because the starter title, skeleton and metadata are still present.

- [ ] **Step 3: Implement the global brand shell**

Set `html lang="zh-CN"`, title `观易｜东方智慧推演平台`, description `以周易卦象理解变化，为当下行动提供可追溯的文化参考。`, favicon, Open Graph text metadata, and a skip link. Build an accessible desktop/mobile header with在线起卦、六十四卦、学习周易、最近记录 links and the global footer disclaimer;最近记录 links to `/divination#recent`.

- [ ] **Step 4: Implement the full homepage**

Build these seven sections in order: hero question form, four-step method, four-step casting flow, example reading, representative hexagrams, five-part learning path, footer statement. The hero form submits by GET to `/divination` with `question` and `domain`; labels remain visible to assistive technology.

- [ ] **Step 5: Implement the visual system**

Use CSS custom properties for the six fixed colors, a Chinese serif heading stack, a Chinese sans body stack, 1200px content max-width, rounded corners between 18–32px, fine borders, restrained shadows, desktop asymmetry, and mobile stacking. Build the abstract hero solely with `HexagramGlyph`, CSS lines and radial gradients. Add focus-visible styles and a reduced-motion media query.

- [ ] **Step 6: Remove starter-only assets**

Run `npm uninstall react-loading-skeleton`, then delete `app/_sites-preview/SkeletonPreview.tsx` and `app/_sites-preview/preview.css` with an explicit patch. Remove the page-level starter metadata and all `codex-preview` markers.

- [ ] **Step 7: Verify homepage and unit suites**

```bash
npm run test:unit
npm run build && node --test tests/rendered-html.test.mjs
```

Expected: unit tests pass; built homepage contains all brand assertions and no starter markers.

- [ ] **Step 8: Commit the brand experience**

```bash
git add app components tests package.json package-lock.json public/favicon.svg
git commit -m "feat: build Guanyi brand homepage"
```

---

### Task 7: 实现六次铜钱起卦体验

**Files:**
- Create: `components/casting-experience.tsx`
- Create: `components/casting-experience.test.tsx`
- Create: `app/divination/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: initial `question`/`domain`, `tossCoins`, draft storage, and `encodeReadingParams`.
- Produces: six bottom-to-top `LineValue` records and a navigation URL for `/reading`.

- [ ] **Step 1: Write the component behavior test**

Render `CastingExperience` with `initialQuestion="是否适合推进这个项目？"`, `initialDomain="career"`, and an `onComplete` spy. Select manual values `9,7,7,7,7,7`; verify the progress advances from `第 1/6 爻` to completion, the visual stack labels the first result as `初爻`, the moving line includes `老阳 · 动爻`, and `onComplete` receives the six values in the same order. Seed two recent readings and verify the `最近记录` section shows both questions and their起卦时间; with no records it shows `还没有保存的卦例`.

- [ ] **Step 2: Run and confirm RED**

```bash
npm run test:unit -- components/casting-experience.test.tsx
```

Expected: FAIL because the component is missing.

- [ ] **Step 3: Implement the casting component**

Use explicit labels for random投掷 and four manual choices. Keep state as `{ question, domain, values }`, append one value per throw, render completed lines visually from top to bottom while preserving the stored bottom-to-top array, and expose undo/reset actions. Save progress after every completed line through `saveDraft`; storage failure must not alter the state.

- [ ] **Step 4: Implement the route page**

Read `question` and `domain` from the incoming search parameters, validate a minimum of four non-whitespace characters, fall back to an editable form when invalid, and on completion navigate to `/reading?lines=...&domain=...`. Save the question in the current local draft so it is not present in the URL. Below the casting card, render the ten most recent saved readings inside a section with `id="recent"`; show the timestamp, original/changed卦序 and question, without sending them to a server.

- [ ] **Step 5: Add accessible motion and mobile layout**

Animate three CSS coins for at most 650ms, announce the result in an `aria-live="polite"` region, disable the throw button during animation, retain a no-animation path for reduced motion, and keep all manual buttons at least 44px high.

- [ ] **Step 6: Run component and full tests**

```bash
npm run test:unit -- components/casting-experience.test.tsx
npm run test:unit
```

Expected: all interaction, calculation, content, reading, routing, and storage tests pass.

- [ ] **Step 7: Commit the casting experience**

```bash
git add app/divination components/casting-experience.tsx components/casting-experience.test.tsx app/globals.css
git commit -m "feat: add six-step coin casting experience"
```

---

### Task 8: 实现结构化解卦报告

**Files:**
- Create: `components/reading-report.tsx`
- Create: `components/reading-report.test.tsx`
- Create: `app/reading/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: parsed report parameters, locally stored question, `castHexagram`, and `buildReading`.
- Produces: a complete report or a recovery screen.

- [ ] **Step 1: Write report presentation tests**

For a Qian-to-Gou reading, verify the component displays the user question, `本卦 乾为天`, `初爻 · 动爻`, `变卦 天风姤`, all six report section titles, the classic line source, the professional-advice disclaimer, and buttons `保存记录`/`再次起卦`. For invalid params, verify a recovery message and links to `/divination` and `/hexagrams`.

- [ ] **Step 2: Run and confirm RED**

```bash
npm run test:unit -- components/reading-report.test.tsx
```

Expected: FAIL because the report component is missing.

- [ ] **Step 3: Implement `ReadingReport`**

Render original and changed glyphs side by side on desktop and stacked on mobile. Mark moving lines with both朱砂色 and text. Render current situation, core tension, trend, opportunity, risk, and action cards; each card includes a visible `依据：...` source label. Render经典卦辞、彖传、大象传 and only the moving爻 texts when moving lines exist; without moving lines render the original卦辞 and the explicit no-change note.

- [ ] **Step 4: Implement the report route**

Parse `lines` and `domain`, recover the question from the draft when available, compute the report once, and pass it to the presentational component. Saving appends a recent record through guarded storage. Invalid params never call `castHexagram` and show the recovery screen.

- [ ] **Step 5: Run report and full tests**

```bash
npm run test:unit -- components/reading-report.test.tsx
npm run test:unit
```

Expected: the report and all previous suites pass.

- [ ] **Step 6: Commit the report UI**

```bash
git add app/reading components/reading-report.tsx components/reading-report.test.tsx app/globals.css
git commit -m "feat: add traceable reading report"
```

---

### Task 9: 实现六十四卦知识库与学习页

**Files:**
- Create: `components/hexagram-browser.tsx`
- Create: `components/hexagram-browser.test.tsx`
- Create: `app/hexagrams/page.tsx`
- Create: `app/hexagrams/[slug]/page.tsx`
- Create: `app/learn/page.tsx`
- Modify: `tests/rendered-html.test.mjs`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `HEXAGRAMS`, `getHexagramBySlug`, `HexagramGlyph`, and trigram fields.
- Produces: searchable 64-item index, 64 static detail routes, and five learning chapters.

- [ ] **Step 1: Write failing browser and route tests**

Component test: search `乾`, verify only matching cards remain; filter upper trigram `坎`, verify every visible card reports `上卦·坎`; clear filters and verify the count returns to 64.

Built route test: request `/hexagrams`, `/hexagrams/qian`, and `/learn` through `dist/server/index.js`; assert status 200 and respectively “六十四卦”、“乾为天” with six爻 sections、and “从阴阳理解变化”.

- [ ] **Step 2: Run and confirm RED**

```bash
npm run test:unit -- components/hexagram-browser.test.tsx
npm run build && node --test tests/rendered-html.test.mjs
```

Expected: FAIL because the routes and browser do not exist.

- [ ] **Step 3: Build the 64-item index**

Render searchable cards with卦序、Unicode卦符、名称、上下卦、主题 and a detail link. Search across Chinese name, pinyin, full name, and theme; upper/lower filters are native labeled selects. Include a visible result count and an empty-state reset button.

- [ ] **Step 4: Build the static detail route**

Return all 64 slugs from `generateStaticParams`. The detail page renders the hexagram identity,卦辞、彖传、大象传、plain interpretation, opportunity, risk, action advice, and six ordered lines. Each line visibly separates `经典爻辞` from `白话与行动参考`. Unknown slugs use `notFound()`.

- [ ] **Step 5: Build the learning page**

Create five linked sections: 阴阳、八卦、六十四卦、六个爻位、动爻与变卦. Each section contains one short concept, one CSS/Unicode example, and one common misconception. End with a CTA to `/divination` and a link to `/hexagrams`.

- [ ] **Step 6: Verify content routes**

```bash
npm run test:unit -- components/hexagram-browser.test.tsx
npm run build && node --test tests/rendered-html.test.mjs
```

Expected: component filters pass and all requested routes return 200 with the expected content.

- [ ] **Step 7: Commit the knowledge experience**

```bash
git add app/hexagrams app/learn components/hexagram-browser.tsx components/hexagram-browser.test.tsx tests/rendered-html.test.mjs app/globals.css
git commit -m "feat: add hexagram library and learning center"
```

---

### Task 10: 社交分享图、全流程验证与发布

**Files:**
- Create: `public/og.png`
- Modify: `app/layout.tsx`
- Modify: `tests/rendered-html.test.mjs`
- Modify if required by verified defects: site files from Tasks 6–9

**Interfaces:**
- Consumes: the finished brand palette, headline, visual motif, retained preview URL, and Sites hosting configuration.
- Produces: a validated production build and a deployed Sites URL.

- [ ] **Step 1: Generate one cohesive social card**

Use the image generation workflow once with a landscape prompt that includes the exact text `观易` and `观天地之变，明当下之势`, the six fixed brand colors, modern Eastern typography, generous paper texture, and an abstract six-line hexagram motif. Inspect the returned image; retry once only if the exact Chinese text is missing or corrupted. Save a validated result as `public/og.png`; if both attempts are unusable, omit `og:image` rather than shipping a broken fallback.

- [ ] **Step 2: Add absolute Open Graph and X metadata**

Use request-host-derived absolute metadata for `/og.png`, title `观易｜东方智慧推演平台`, description `观天地之变，明当下之势`, and `summary_large_image`. Add built HTML assertions for `og:title`, `og:description`, and `og:image` before the metadata change, observe them fail, then implement the metadata.

- [ ] **Step 3: Run the complete automated verification**

```bash
npm run test
npm run lint
git status --short
```

Expected: all unit tests pass, production build succeeds, all rendered HTML tests pass, lint exits 0, and only intentional final artifacts are uncommitted.

- [ ] **Step 4: Perform the approved desktop browser flow**

At the retained Local URL, enter a specific question on the homepage, choose事业, complete six manual throws `9,7,7,7,7,7`, and verify the report shows乾为天、初爻动、天风姤, source labels, and disclaimer. Visit the knowledge index, filter乾, open乾详情, and visit the learning page. Confirm no severe browser console errors.

- [ ] **Step 5: Perform the approved mobile browser flow**

At a narrow mobile viewport, repeat one six-throw flow and verify no horizontal scrolling, the hexagram remains complete, all interactive controls are at least 44px high, focus remains visible, and reduced-motion mode removes looping/flipping motion.

- [ ] **Step 6: Commit the verified release**

```bash
git add app public/og.png tests
git commit -m "feat: prepare Guanyi site for launch"
```

- [ ] **Step 7: Publish with Sites and stop the retained preview after hosting**

Use the Sites hosting workflow against `.openai/hosting.json`. Verify the deployed homepage and return the deployed URL as the primary deliverable. Stop the retained development process only after publishing finishes.

---

## Plan Self-Review Results

- **Spec coverage:** Tasks 2–5 cover calculation, content, reports, privacy and recovery; Tasks 6–9 cover all approved pages, visual rules, accessibility and local interaction; Task 10 covers social metadata, desktop/mobile verification and publishing.
- **Scope:** The work remains one cohesive, testable local-first website with no backend or account subsystem.
- **Type consistency:** `LineValue`, `CastResult`, `ReadingDomain`, `HexagramContent`, URL parameters and storage records have one owner and one stable interface.
- **Safety consistency:** No task introduces AI prediction, professional advice, private questions in URLs, or server-side personal data.
