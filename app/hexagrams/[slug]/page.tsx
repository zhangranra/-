import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HexagramGlyph } from "@/components/hexagram-glyph";
import { HEXAGRAMS, getHexagramBySlug, type HexagramContent } from "@/features/content/hexagrams";
import { TRIGRAMS } from "@/features/divination/trigrams";
import type { BinaryLine, TrigramCode } from "@/features/divination/types";

interface HexagramDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return HEXAGRAMS.map(({ slug }) => ({ slug }));
}

function resolveHexagram(slug: string): HexagramContent {
  try {
    return getHexagramBySlug(slug);
  } catch {
    notFound();
  }
}

function linesFor(hexagram: HexagramContent): readonly BinaryLine[] {
  const codeFor = (name: string) => {
    const match = Object.values(TRIGRAMS).find((trigram) => trigram.name === name);
    if (!match) throw new Error(`未知八卦：${name}`);
    return match.code;
  };
  const code = `${codeFor(hexagram.lower)}${codeFor(hexagram.upper)}` as `${TrigramCode}${TrigramCode}`;
  return [...code].map((line) => Number(line) as BinaryLine);
}

export async function generateMetadata({ params }: HexagramDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hexagram = resolveHexagram(slug);
  return {
    title: `${hexagram.fullName}｜六十四卦｜观易`,
    description: `${hexagram.fullName}：${hexagram.judgmentPlain}`,
  };
}

export default async function HexagramDetailPage({ params }: HexagramDetailPageProps) {
  const { slug } = await params;
  const hexagram = resolveHexagram(slug);

  return (
    <main id="main-content" className="hexagram-detail-page">
      <nav className="detail-breadcrumb section-shell" aria-label="面包屑">
        <Link href="/hexagrams">六十四卦</Link><span aria-hidden="true">/</span><span>{hexagram.fullName}</span>
      </nav>

      <section className="detail-hero section-shell" aria-labelledby="detail-title">
        <div className="detail-identity">
          <p className="eyebrow">第 {hexagram.sequence} 卦 · {hexagram.theme}</p>
          <h1 id="detail-title">{hexagram.fullName}</h1>
          <p className="detail-pinyin">{hexagram.pinyin} · {hexagram.symbol}</p>
          <p className="detail-lead">{hexagram.judgmentPlain}</p>
          <div className="detail-trigrams">
            <span>上卦·{hexagram.upper}</span><span>下卦·{hexagram.lower}</span><span>{hexagram.stage}</span>
          </div>
        </div>
        <div className="detail-glyph-panel">
          <span className="detail-unicode" aria-hidden="true">{hexagram.symbol}</span>
          <HexagramGlyph lines={linesFor(hexagram)} name={hexagram.fullName} />
          <small>六爻由下向上阅读</small>
        </div>
      </section>

      <section className="detail-classics section-shell" aria-labelledby="classics-title">
        <div className="detail-section-heading">
          <p className="eyebrow">经典原文</p>
          <h2 id="classics-title">从卦辞到象传</h2>
        </div>
        <div className="detail-classic-grid">
          <article><span>01</span><h3>经典卦辞</h3><blockquote>{hexagram.judgment}</blockquote><p>{hexagram.judgmentPlain}</p></article>
          <article><span>02</span><h3>彖传</h3><blockquote>{hexagram.tuan}</blockquote></article>
          <article><span>03</span><h3>大象传</h3><blockquote>{hexagram.greatImage}</blockquote></article>
        </div>
      </section>

      <section className="detail-guidance" aria-labelledby="guidance-title">
        <div className="section-shell">
          <div className="detail-section-heading">
            <p className="eyebrow">当代理解</p>
            <h2 id="guidance-title">把卦意放回行动</h2>
          </div>
          <div className="guidance-grid">
            <article><span>机会</span><p>{hexagram.opportunity}</p></article>
            <article><span>风险</span><p>{hexagram.risk}</p></article>
            <article><span>行动建议</span><p>{hexagram.advice}</p></article>
          </div>
        </div>
      </section>

      <section className="detail-lines section-shell" aria-labelledby="lines-title">
        <div className="detail-section-heading">
          <p className="eyebrow">六爻阶段</p>
          <h2 id="lines-title">从初爻到上爻</h2>
          <p>爻位按事情从萌芽、展开到收束的顺序排列。</p>
        </div>
        <ol className="detail-line-list">
          {hexagram.lines.map((line) => (
            <li key={line.position}>
              <div className="line-position"><span>{String(line.position).padStart(2, "0")}</span><h3>{line.title}</h3><small>{line.stage}</small></div>
              <div className="line-classic"><span>经典爻辞</span><blockquote>{line.classic}</blockquote><small>{line.smallImage}</small></div>
              <div className="line-plain"><span>白话与行动参考</span><p>{line.plain}</p><strong>{line.advice}</strong></div>
            </li>
          ))}
        </ol>
        {hexagram.specialLine && (
          <aside className="special-line">
            <span>{hexagram.specialLine.title}</span>
            <blockquote>{hexagram.specialLine.classic}</blockquote>
            <p>{hexagram.specialLine.smallImage}</p>
          </aside>
        )}
      </section>

      <section className="detail-next section-shell">
        <div><p className="eyebrow">继续探索</p><h2>把卦象放进你的问题</h2></div>
        <div><Link className="primary-button link-button" href="/divination">开始起卦 <span aria-hidden="true">→</span></Link><Link className="outline-button" href="/hexagrams">返回六十四卦</Link></div>
      </section>
    </main>
  );
}
