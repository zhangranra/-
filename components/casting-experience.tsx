"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tossCoins } from "../features/divination/cast";
import type { CoinToss, LineValue } from "../features/divination/types";
import type { ReadingDomain } from "../features/reading/domain-profiles";
import { DOMAIN_PROFILES } from "../features/reading/domain-profiles";
import { encodeReadingParams, type ReadingLineValues } from "../features/routing/reading-params";
import {
  loadDraft,
  loadRecentReadings,
  saveDraft,
  type RecentReading,
} from "../features/storage/reading-store";

interface CastingExperienceProps {
  initialQuestion: string;
  initialDomain: ReadingDomain;
  onComplete?: (values: readonly LineValue[]) => void;
}

interface CastingState {
  question: string;
  domain: ReadingDomain;
  values: readonly LineValue[];
}

const LINE_DETAILS: Readonly<Record<LineValue, { label: string; kind: "yin" | "yang"; coins: CoinToss["coins"] }>> = {
  6: { label: "老阴 · 动爻", kind: "yin", coins: [2, 2, 2] },
  7: { label: "少阳", kind: "yang", coins: [3, 2, 2] },
  8: { label: "少阴", kind: "yin", coins: [3, 3, 2] },
  9: { label: "老阳 · 动爻", kind: "yang", coins: [3, 3, 3] },
};

const MANUAL_VALUES: readonly LineValue[] = [6, 7, 8, 9];
const POSITION_LABELS = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"] as const;

function formatCastingTime(timestamp: number): string {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function getBrowserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function CastingExperience({
  initialQuestion,
  initialDomain,
  onComplete,
}: CastingExperienceProps) {
  const router = useRouter();
  const [casting, setCasting] = useState<CastingState>({
    question: initialQuestion,
    domain: initialDomain,
    values: [],
  });
  const [recentReadings, setRecentReadings] = useState<RecentReading[]>([]);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [latestCoins, setLatestCoins] = useState<CoinToss["coins"] | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [announcement, setAnnouncement] = useState("准备从初爻开始起卦");
  const tossTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      const storage = getBrowserStorage();
      if (!storage) {
        setHasLoadedStorage(true);
        return;
      }

      const draft = loadDraft(storage);

      if (draft && draft.question === initialQuestion && draft.domain === initialDomain) {
        setCasting({
          question: draft.question,
          domain: draft.domain,
          values: draft.values,
        });
      }

      setRecentReadings(loadRecentReadings(storage));
      setHasLoadedStorage(true);
    });

    return () => {
      cancelled = true;
      if (tossTimer.current !== null) {
        window.clearTimeout(tossTimer.current);
        tossTimer.current = null;
      }
    };
  }, [initialDomain, initialQuestion]);

  function persist(values: readonly LineValue[]) {
    const storage = getBrowserStorage();
    if (!storage) return;

    saveDraft(storage, {
      question: casting.question,
      domain: casting.domain,
      values,
      timestamp: Date.now(),
    });
  }

  function finish(values: readonly LineValue[]) {
    if (onComplete) {
      onComplete(values);
      return;
    }

    const params = encodeReadingParams({
      values: values as ReadingLineValues,
      domain: casting.domain,
    });
    router.push(`/reading?${params.toString()}`);
  }

  function addLine(value: LineValue, coins: CoinToss["coins"]) {
    if (casting.values.length >= 6) return;

    const values = [...casting.values, value];
    const position = POSITION_LABELS[values.length - 1];
    setLatestCoins(coins);
    setCasting({ ...casting, values });
    persist(values);
    setAnnouncement(`${position}结果：${value}，${LINE_DETAILS[value].label}`);

    if (values.length === 6) finish(values);
  }

  function handleRandomToss() {
    if (isAnimating || casting.values.length >= 6) return;

    const result = tossCoins();
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setLatestCoins(result.coins);

    if (reducedMotion) {
      addLine(result.value, result.coins);
      return;
    }

    setIsAnimating(true);
    tossTimer.current = window.setTimeout(() => {
      tossTimer.current = null;
      setIsAnimating(false);
      addLine(result.value, result.coins);
    }, 620);
  }

  function handleUndo() {
    if (isAnimating || casting.values.length === 0) return;
    const values = casting.values.slice(0, -1);
    setCasting({ ...casting, values });
    persist(values);
    setAnnouncement(`已撤销，接下来投第 ${values.length + 1} 爻`);
  }

  function handleReset() {
    if (isAnimating) return;
    setCasting({ ...casting, values: [] });
    setLatestCoins(null);
    persist([]);
    setAnnouncement("已清空，从初爻重新开始");
  }

  const isComplete = casting.values.length === 6;
  const displayedLines = casting.values
    .map((value, index) => ({ value, position: index + 1, positionLabel: POSITION_LABELS[index] }))
    .reverse();

  return (
    <>
      <section className="casting-card" aria-labelledby="casting-title">
        <div className="casting-heading">
          <div>
            <p className="eyebrow">三枚铜钱 · 六次成卦</p>
            <h1 id="casting-title">从初爻开始，观察变化</h1>
          </div>
          <div className="casting-progress" aria-label={`已完成 ${casting.values.length} 爻，共 6 爻`}>
            <strong>{isComplete ? "六爻已完成" : `第 ${casting.values.length + 1}/6 爻`}</strong>
            <span>初爻在下，上爻在上</span>
          </div>
        </div>

        <div className="casting-question">
          <span>所问 · {DOMAIN_PROFILES[casting.domain].label}</span>
          <p>“{casting.question}”</p>
        </div>

        <div className="casting-workspace">
          <div className="coin-panel">
            <h2>投掷三枚铜钱</h2>
            <p>让系统随机投掷，或按你手边三枚铜钱的总数手动录入。</p>

            <div className={`coin-row${isAnimating ? " is-tossing" : ""}`} aria-hidden="true">
              {(latestCoins ?? [2, 3, 2]).map((coin, index) => (
                <span className="casting-coin" key={index}>{coin === 3 ? "字" : "背"}</span>
              ))}
            </div>

            <button
              className="primary-button casting-random-button"
              type="button"
              onClick={handleRandomToss}
              disabled={isAnimating || isComplete}
            >
              {isAnimating ? "铜钱翻转中…" : "随机投掷三枚铜钱"}
            </button>

            <div className="manual-entry" aria-labelledby="manual-title">
              <h3 id="manual-title">手动录入结果</h3>
              <div className="manual-options">
                {MANUAL_VALUES.map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => addLine(value, LINE_DETAILS[value].coins)}
                    disabled={isAnimating || isComplete}
                    aria-label={`${LINE_DETAILS[value].label.replace(" · 动爻", "")} ${value}`}
                  >
                    <strong>{value}</strong>
                    <span>{LINE_DETAILS[value].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="casting-announcement" aria-live="polite">{announcement}</p>
          </div>

          <div className="line-stack-panel">
            <div className="line-stack-heading">
              <div><h2>六爻结果</h2><p>画面从上到下排列，记录仍按初爻到上爻保存。</p></div>
              <span>{casting.values.length}/6</span>
            </div>

            {displayedLines.length ? (
              <ol className="cast-line-stack" aria-label="已完成的爻，从上到下排列">
                {displayedLines.map(({ value, position, positionLabel }) => {
                  const detail = LINE_DETAILS[value];
                  return (
                    <li data-testid="cast-line" key={position}>
                      <span className="line-position" data-testid="line-position">{positionLabel}</span>
                      <span className={`cast-line-symbol ${detail.kind}`} aria-hidden="true">
                        {detail.kind === "yin" ? <><i /><i /></> : <i />}
                        {(value === 6 || value === 9) && <b />}
                      </span>
                      <span className="line-result"><strong>{value}</strong>{detail.label}</span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="empty-line-stack">完成第一次投掷后，初爻会出现在这里。</div>
            )}

            <div className="casting-actions">
              <button type="button" onClick={handleUndo} disabled={isAnimating || casting.values.length === 0}>撤销上一爻</button>
              <button type="button" onClick={handleReset} disabled={isAnimating || casting.values.length === 0}>清空重来</button>
            </div>
          </div>
        </div>
      </section>

      <section className="recent-section" id="recent" aria-labelledby="recent-title">
        <div className="recent-heading">
          <div><p className="eyebrow">浏览器本地保存</p><h2 id="recent-title">最近记录</h2></div>
          <p>这些问题与卦例只保存在当前浏览器中。</p>
        </div>

        {!hasLoadedStorage ? (
          <p className="recent-empty">正在读取本地记录…</p>
        ) : recentReadings.length ? (
          <ol className="recent-list">
            {recentReadings.map((reading, index) => (
              <li key={`${reading.timestamp}-${index}`}>
                <span className="recent-domain">{DOMAIN_PROFILES[reading.domain].label}</span>
                <h3>{reading.question}</h3>
                <p>
                  {reading.changedSequence
                    ? `第 ${reading.originalSequence} 卦 → 第 ${reading.changedSequence} 卦`
                    : `第 ${reading.originalSequence} 卦 · 无变卦`}
                </p>
                <time dateTime={new Date(reading.timestamp).toISOString()}>
                  起卦时间：{formatCastingTime(reading.timestamp)}
                </time>
              </li>
            ))}
          </ol>
        ) : (
          <p className="recent-empty">还没有保存的卦例</p>
        )}
      </section>
    </>
  );
}
