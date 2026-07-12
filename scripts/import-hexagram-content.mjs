#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_REPOSITORY = "https://github.com/kanripo/KR1a0001.git";
const SOURCE_COMMIT = "8284adbf9e3435d713180e24f05bf75f8b7d1d96";
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = join(projectRoot, "features/content/hexagram-records.ts");

const pinyin = [
  "qián", "kūn", "zhūn", "méng", "xū", "sòng", "shī", "bǐ",
  "xiǎo xù", "lǚ", "tài", "pǐ", "tóng rén", "dà yǒu", "qiān", "yù",
  "suí", "gǔ", "lín", "guān", "shì kè", "bì", "bō", "fù",
  "wú wàng", "dà xù", "yí", "dà guò", "kǎn", "lí", "xián", "héng",
  "dùn", "dà zhuàng", "jìn", "míng yí", "jiā rén", "kuí", "jiǎn", "xiè",
  "sǔn", "yì", "guài", "gòu", "cuì", "shēng", "kùn", "jǐng",
  "gé", "dǐng", "zhèn", "gèn", "jiàn", "guī mèi", "fēng", "lǚ",
  "xùn", "duì", "huàn", "jié", "zhōng fú", "xiǎo guò", "jì jì", "wèi jì",
];

const fullNames = [
  "乾为天", "坤为地", "水雷屯", "山水蒙", "水天需", "天水讼", "地水师", "水地比",
  "风天小畜", "天泽履", "地天泰", "天地否", "天火同人", "火天大有", "地山谦", "雷地豫",
  "泽雷随", "山风蛊", "地泽临", "风地观", "火雷噬嗑", "山火贲", "山地剥", "地雷复",
  "天雷无妄", "山天大畜", "山雷颐", "泽风大过", "坎为水", "离为火", "泽山咸", "雷风恒",
  "天山遁", "雷天大壮", "火地晋", "地火明夷", "风火家人", "火泽睽", "水山蹇", "雷水解",
  "山泽损", "风雷益", "泽天夬", "天风姤", "泽地萃", "地风升", "泽水困", "水风井",
  "泽火革", "火风鼎", "震为雷", "艮为山", "风山渐", "雷泽归妹", "雷火丰", "火山旅",
  "巽为风", "兑为泽", "风水涣", "水泽节", "风泽中孚", "雷山小过", "水火既济", "火水未济",
];

const themes = [
  "创始进取", "包容承载", "艰难初生", "启蒙求知", "等待时机", "化解争讼", "统众守纪", "亲近协作",
  "小有积蓄", "谨慎践履", "通达和合", "闭塞自守", "同道协作", "丰盛有成", "谦逊持中", "顺势和乐",
  "随时应变", "整治积弊", "临事督导", "观察示范", "决断障碍", "文饰有度", "剥落守静", "复归正道",
  "守真不妄", "蓄德养才", "颐养自立", "过重调衡", "涉险守中", "光明依附", "感应相合", "恒久守正",
  "退避保全", "壮盛守礼", "晋升进明", "晦明自护", "齐家有序", "求同存异", "遇阻止步", "解难舒缓",
  "减损有度", "增益共享", "果决去弊", "相遇防微", "聚合人心", "顺势上升", "困境守志", "井养不穷",
  "革故鼎新", "鼎新定制", "震动警醒", "知止安定", "循序渐进", "婚合守礼", "丰盛防衰", "旅居守正",
  "顺入谦逊", "悦纳沟通", "涣散重聚", "节制立度", "诚信感通", "小有超越", "既成防变", "未成慎终",
];

const lineStages = ["起步", "显现", "转折", "过渡", "主导", "收束"];
const lineAdvice = [
  "先观察基础，不宜躁进。",
  "找到支点，稳步展开。",
  "留意转折，及时校正。",
  "进退之间，审慎取舍。",
  "承担主责，守中而行。",
  "收束复盘，防止走极端。",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function acquireSource(providedDirectory) {
  if (providedDirectory) return { directory: resolve(providedDirectory), temporary: false };

  const directory = mkdtempSync(join(tmpdir(), "guanyi-kanripo-"));
  execFileSync("git", ["clone", "--filter=blob:none", "--no-checkout", SOURCE_REPOSITORY, directory], {
    stdio: "inherit",
  });
  execFileSync("git", ["-C", directory, "checkout", "--detach", SOURCE_COMMIT], { stdio: "inherit" });
  return { directory, temporary: true };
}

function verifySource(directory) {
  const revision = execFileSync("git", ["-C", directory, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  assert(revision === SOURCE_COMMIT, `来源版本不匹配：预期 ${SOURCE_COMMIT}，实际 ${revision}`);
}

function cleanPage(page) {
  return page
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .join("")
    .replaceAll("¶", "")
    .replace(/\s+/g, "")
    .trim();
}

function splitQianImages(text) {
  const body = text.replace(/^《象》曰：/, "");
  const sentences = body.match(/[^。]+。/g) ?? [];
  assert(sentences.length === 8, `乾卦象传应分为大象、六小象及用九象，共 8 段；实际 ${sentences.length}`);
  return sentences.map((sentence) => `《象》曰：${sentence}`);
}

function parseHexagram(sourceDirectory, sequence, metadata) {
  const filename = join(sourceDirectory, `KR1a0001_${String(sequence).padStart(3, "0")}.txt`);
  const raw = readFileSync(filename, "utf8");
  const pages = raw.split(/<pb:[^>]+>¶\s*/).slice(1).map(cleanPage).filter(Boolean);
  const heading = pages[0];
  const trigramMatch = heading.match(/([䷀-䷿])([乾坤震巽坎離艮兌]+)下([乾坤震巽坎離艮兌]+)上/);
  assert(trigramMatch, `${filename} 缺少卦象或上下卦标记`);

  const record = {
    sequence,
    name: metadata.name,
    fullName: fullNames[sequence - 1],
    pinyin: pinyin[sequence - 1],
    slug: metadata.slug,
    symbol: trigramMatch[1],
    upper: trigramMatch[3].replace("離", "离").replace("兌", "兑"),
    lower: trigramMatch[2].replace("離", "离").replace("兌", "兑"),
    theme: themes[sequence - 1],
    stage: `${themes[sequence - 1]}阶段`,
    judgment: "",
    judgmentPlain: `${metadata.name}卦提醒：面对${themes[sequence - 1]}，宜审时而动。`,
    tuan: "",
    greatImage: "",
    opportunity: `把握${themes[sequence - 1]}中的有利条件。`,
    risk: `避免在${themes[sequence - 1]}时急于求成。`,
    advice: "先辨明处境，再选择稳妥行动。",
    lines: [],
  };

  let activeTarget = null;
  for (const page of pages.slice(1)) {
    if (!record.judgment && /^《(?!彖|象|文言)/.test(page)) {
      record.judgment = page;
      continue;
    }
    if (!record.tuan && page.startsWith("《彖》曰：")) {
      record.tuan = page;
      continue;
    }

    const ordinaryLine = page.match(/^(初[六九]|[六九][二三四五]|上[六九])[、：](.+)$/);
    if (ordinaryLine && record.lines.length < 6) {
      const position = record.lines.length + 1;
      const line = {
        position,
        title: ordinaryLine[1],
        classic: ordinaryLine[2],
        smallImage: "",
        plain: `此爻处于${metadata.name}卦的${lineStages[position - 1]}，应结合原文审慎判断。`,
        stage: lineStages[position - 1],
        advice: lineAdvice[position - 1],
      };
      record.lines.push(line);
      activeTarget = line;
      continue;
    }

    const specialLine = page.match(/^(用[九六])：(.+)$/);
    if (specialLine && !record.specialLine) {
      record.specialLine = { title: specialLine[1], classic: specialLine[2], smallImage: "" };
      activeTarget = record.specialLine;
      continue;
    }

    if (page.startsWith("《象》曰：")) {
      if (sequence === 1 && !record.greatImage) {
        const images = splitQianImages(page);
        record.greatImage = images[0];
        record.lines.forEach((line, index) => {
          line.smallImage = images[index + 1];
        });
        assert(record.specialLine, "乾卦缺少用九");
        record.specialLine.smallImage = images[7];
        continue;
      }
      if (!record.greatImage && record.lines.length === 0) {
        record.greatImage = page;
        continue;
      }
      if (activeTarget && !activeTarget.smallImage) {
        activeTarget.smallImage = page;
      }
    }
  }

  assert(record.judgment, `${metadata.name}缺少卦辞`);
  assert(record.tuan, `${metadata.name}缺少彖传`);
  assert(record.greatImage, `${metadata.name}缺少大象传`);
  assert(record.lines.length === 6, `${metadata.name}应有六爻，实际 ${record.lines.length}`);
  assert(record.lines.every((line) => line.classic && line.smallImage), `${metadata.name}存在缺失的爻辞或小象传`);
  if (sequence <= 2) {
    assert(record.specialLine?.classic && record.specialLine.smallImage, `${metadata.name}缺少用九/用六及其象传`);
  } else {
    assert(!record.specialLine, `${metadata.name}不应包含用九/用六`);
  }
  return record;
}

function readMapMetadata() {
  const source = readFileSync(join(projectRoot, "features/divination/king-wen-map.ts"), "utf8");
  const entries = [...source.matchAll(/entry\((\d+), "([^"]+)", "([^"]+)"\)/g)].map((match) => ({
    sequence: Number(match[1]),
    name: match[2],
    slug: match[3],
  }));
  entries.sort((left, right) => left.sequence - right.sequence);
  assert(entries.length === 64, `文王卦映射应有 64 条，实际 ${entries.length}`);
  assert(new Set(entries.map((entry) => entry.sequence)).size === 64, "文王卦映射卦序重复");
  assert(new Set(entries.map((entry) => entry.slug)).size === 64, "文王卦映射 slug 重复");
  return entries;
}

function serialize(records) {
  const body = JSON.stringify(records, null, 2);
  return `// Generated by scripts/import-hexagram-content.mjs from Kanseki Repository\n` +
    `// KR1a0001 at ${SOURCE_COMMIT}. Do not edit by hand.\n` +
    `import type { HexagramContent } from "./types";\n\n` +
    `export const HEXAGRAM_RECORDS = ${body} as const satisfies readonly HexagramContent[];\n`;
}

const source = acquireSource(process.argv[2]);
try {
  verifySource(source.directory);
  const metadata = readMapMetadata();
  const records = metadata.map((item) => parseHexagram(source.directory, item.sequence, item));
  assert(records.flatMap((record) => record.lines).length === 384, "普通爻记录总数必须为 384");
  writeFileSync(outputPath, serialize(records));
  process.stdout.write(`生成 ${records.length} 卦、${records.flatMap((record) => record.lines).length} 爻：${outputPath}\n`);
} finally {
  if (source.temporary) rmSync(source.directory, { recursive: true, force: true });
}
