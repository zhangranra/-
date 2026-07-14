"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HexagramSummary } from "../features/content/hexagrams";

const TRIGRAM_NAMES = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"] as const;

interface HexagramBrowserProps {
  hexagrams: readonly HexagramSummary[];
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase("zh-CN")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function HexagramBrowser({ hexagrams }: HexagramBrowserProps) {
  const [query, setQuery] = useState("");
  const [upper, setUpper] = useState("");
  const [lower, setLower] = useState("");

  const results = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query);
    return hexagrams.filter((hexagram) => {
      const searchable = normalizeSearchText(
        [hexagram.name, hexagram.fullName, hexagram.pinyin, hexagram.theme].join(" "),
      );
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery))
        && (!upper || hexagram.upper === upper)
        && (!lower || hexagram.lower === lower)
      );
    });
  }, [hexagrams, lower, query, upper]);

  const clearFilters = () => {
    setQuery("");
    setUpper("");
    setLower("");
  };

  return (
    <div className="hexagram-browser">
      <div className="hexagram-tools">
        <label className="browser-search">
          <span>搜索六十四卦</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="输入卦名、拼音或主题"
          />
        </label>
        <label>
          <span>上卦</span>
          <select value={upper} onChange={(event) => setUpper(event.target.value)}>
            <option value="">全部上卦</option>
            {TRIGRAM_NAMES.map((name) => <option value={name} key={name}>{name}</option>)}
          </select>
        </label>
        <label>
          <span>下卦</span>
          <select value={lower} onChange={(event) => setLower(event.target.value)}>
            <option value="">全部下卦</option>
            {TRIGRAM_NAMES.map((name) => <option value={name} key={name}>{name}</option>)}
          </select>
        </label>
        <button className="filter-reset" type="button" onClick={clearFilters}>清除筛选</button>
      </div>

      <div className="browser-summary" aria-live="polite">
        <strong>{results.length} 个结果</strong>
        <span>可按卦名、拼音、上下卦或所处主题查找</span>
      </div>

      {results.length ? (
        <div className="library-grid">
          {results.map((hexagram) => (
            <article className="library-card" data-testid="hexagram-card" key={hexagram.sequence}>
              <div className="library-card-top">
                <span className="library-sequence">第 {String(hexagram.sequence).padStart(2, "0")} 卦</span>
                <span className="library-symbol" aria-hidden="true">{hexagram.symbol}</span>
              </div>
              <p className="library-pinyin">{hexagram.pinyin}</p>
              <h2>{hexagram.fullName}</h2>
              <p className="library-theme">{hexagram.theme}</p>
              <div className="library-trigrams">
                <span>上卦·{hexagram.upper}</span>
                <span>下卦·{hexagram.lower}</span>
              </div>
              <Link href={`/hexagrams/${hexagram.slug}`}>阅读此卦 <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="library-empty" role="status">
          <span aria-hidden="true">☷</span>
          <h2>暂时没有匹配的卦</h2>
          <p>试试更换关键词或放宽上下卦条件。</p>
          <button className="outline-button" type="button" onClick={clearFilters}>重置所有条件</button>
        </div>
      )}
    </div>
  );
}
