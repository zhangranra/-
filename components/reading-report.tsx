"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CastResult, LineValue } from "../features/divination/types";
import type { StructuredReading } from "../features/reading/build-reading";
import type { ReadingDomain } from "../features/reading/domain-profiles";
import type { ReadingLineValues } from "../features/routing/reading-params";
import {
  loadDraft,
  saveRecentReading,
} from "../features/storage/reading-store";
import { HexagramGlyph } from "./hexagram-glyph";

interface ReadingReportProps {
  cast: CastResult;
  reading: StructuredReading;
  values: readonly LineValue[];
  timestamp?: number;
}

interface ReadingReportLoaderProps {
  values: ReadingLineValues;
  cast: CastResult;
  reading: StructuredReading;
}

interface LoadedReport {
  reading: StructuredReading;
  timestamp?: number;
}

const POSITION_LABELS = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"] as const;

function getBrowserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function draftMatches(
  draft: ReturnType<typeof loadDraft>,
  values: ReadingLineValues,
  domain: ReadingDomain,
): boolean {
  return Boolean(
    draft
      && draft.domain === domain
      && draft.values.length === values.length
      && draft.values.every((value, index) => value === values[index]),
  );
}

function formatReadingTime(timestamp: number): string {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function ReadingReport({ cast, reading, values, timestamp }: ReadingReportProps) {
  const [saveStatus, setSaveStatus] = useState("");

  function handleSave() {
    const storage = getBrowserStorage();
    if (!storage) {
      setSaveStatus("当前浏览器未能保存记录，请保留本页作为参考。");
      return;
    }

    const savedAt = timestamp ?? Date.now();
    const saved = saveRecentReading(storage, {
      question: reading.question,
      domain: reading.domain,
      values,
      timestamp: savedAt,
      originalSequence: cast.original.sequence,
      ...(cast.changed ? { changedSequence: cast.changed.sequence } : {}),
    });
    setSaveStatus(saved ? "已保存到当前浏览器。" : "当前浏览器未能保存记录，请保留本页作为参考。");
  }

  return (
    <main className="report-page section-shell" id="main-content">
      <header className="report-hero">
        <div>
          <p className="eyebrow">结构化解卦 · {reading.domainLabel}</p>
          <h1>变化已有迹可循</h1>
        </div>
        <div className="report-question">
          <span>本次所问</span>
          <p>{reading.question}</p>
          {timestamp && <time dateTime={new Date(timestamp).toISOString()}>起卦时间：{formatReadingTime(timestamp)}</time>}
        </div>
      </header>

      <section className="report-hexagrams" aria-label="本卦与变卦">
        <article className="report-hexagram-card">
          <div>
            <span>第 {reading.original.sequence} 卦</span>
            <h2>本卦 {reading.original.fullName}</h2>
            <p>上{reading.original.upper} · 下{reading.original.lower}</p>
          </div>
          <HexagramGlyph
            lines={cast.original.lines}
            movingLines={cast.movingLines}
            name={reading.original.fullName}
          />
        </article>

        {reading.changed && cast.changed ? (
          <>
            <div className="report-change-arrow" aria-hidden="true">→</div>
            <article className="report-hexagram-card changed">
              <div>
                <span>第 {reading.changed.sequence} 卦</span>
                <h2>变卦 {reading.changed.fullName}</h2>
                <p>上{reading.changed.upper} · 下{reading.changed.lower}</p>
              </div>
              <HexagramGlyph lines={cast.changed.lines} name={reading.changed.fullName} />
            </article>
          </>
        ) : (
          <p className="no-change-note">无动爻，局势以本卦主题为主。</p>
        )}

        {cast.movingLines.length > 0 && (
          <div className="moving-line-summary" aria-label="动爻位置">
            <span>动爻</span>
            <ul>
              {cast.movingLines.map((position) => (
                <li key={position}>{POSITION_LABELS[position - 1]} · 动爻</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="report-analysis" aria-labelledby="report-analysis-title">
        <div className="report-section-heading">
          <p className="eyebrow">规则解释 · 逐条标注</p>
          <h2 id="report-analysis-title">六项判断</h2>
        </div>
        <div className="report-analysis-grid">
          {reading.sections.map((section) => (
            <article className="report-analysis-card" key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.text}</p>
              <span>依据：{section.source}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="report-classics" aria-labelledby="report-classics-title">
        <div className="report-section-heading">
          <p className="eyebrow">经典原文 · 与现代解释分层</p>
          <h2 id="report-classics-title">经典依据</h2>
        </div>

        <div className="classic-text-grid">
          <article>
            <h3>经典卦辞</h3>
            <blockquote>{reading.original.judgment}</blockquote>
            <p>{reading.original.judgmentPlain}</p>
            <span>来源：{reading.original.fullName}卦辞</span>
          </article>
          <article>
            <h3>彖传</h3>
            <blockquote>{reading.original.tuan}</blockquote>
            <span>来源：{reading.original.fullName}彖传</span>
          </article>
          <article>
            <h3>大象传</h3>
            <blockquote>{reading.original.greatImage}</blockquote>
            <span>来源：{reading.original.fullName}大象传</span>
          </article>
        </div>

        {reading.movingLines.length > 0 && (
          <div className="moving-classics" aria-labelledby="moving-classics-title">
            <h3 id="moving-classics-title">动爻原文</h3>
            {reading.movingLines.map((line) => (
              <article key={line.position}>
                <div>
                  <span>{POSITION_LABELS[line.position - 1]} · 动爻</span>
                  <h4>{line.title}</h4>
                </div>
                <blockquote>{line.classic}</blockquote>
                <p>{line.plain}</p>
                <small>来源：经典爻辞｜{reading.original.fullName} · {line.title}</small>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="report-footer">
        <div>
          <span>文化参考声明</span>
          <p>{reading.disclaimer}</p>
        </div>
        <div className="report-actions">
          <button className="primary-button" type="button" onClick={handleSave}>保存记录</button>
          <Link className="report-secondary-button" href="/divination">再次起卦</Link>
        </div>
        <p className="report-save-status" role="status" aria-live="polite">{saveStatus}</p>
      </footer>
    </main>
  );
}

export function ReadingReportLoader({ values, cast, reading }: ReadingReportLoaderProps) {
  const [loaded, setLoaded] = useState<LoadedReport | null>(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      const storage = getBrowserStorage();
      const draft = storage ? loadDraft(storage) : null;
      const matchedDraft = draftMatches(draft, values, reading.domain) ? draft : null;

      setLoaded({
        reading: {
          ...reading,
          question: matchedDraft?.question.trim() || reading.question,
        },
        ...(matchedDraft ? { timestamp: matchedDraft.timestamp } : {}),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [reading, values]);

  if (!loaded) {
    return (
      <main className="report-page section-shell" id="main-content">
        <p className="report-loading" role="status">正在读取本地问题并生成报告…</p>
      </main>
    );
  }

  return (
    <ReadingReport
      cast={cast}
      reading={loaded.reading}
      values={values}
      timestamp={loaded.timestamp}
    />
  );
}

export function ReadingRecovery({ message }: { message: string }) {
  return (
    <main className="report-page section-shell" id="main-content">
      <section className="report-recovery" aria-labelledby="report-recovery-title">
        <p className="eyebrow">报告恢复</p>
        <h1 id="report-recovery-title">暂时无法生成这份报告</h1>
        <p>{message}</p>
        <div className="report-actions">
          <Link className="primary-button" href="/divination">重新起卦</Link>
          <Link className="report-secondary-button" href="/hexagrams">查看六十四卦</Link>
        </div>
      </section>
    </main>
  );
}
