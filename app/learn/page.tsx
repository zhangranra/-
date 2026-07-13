import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "从零学周易｜观易",
  description: "用五个短章理解阴阳、八卦、六十四卦、爻位与变卦。",
};

const chapters = [
  {
    id: "yin-yang", number: "01", title: "阴阳", subtitle: "两种力量不是好与坏",
    concept: "阴与阳描述事物中相反而互补的趋势：收敛与展开、安静与行动。它们会随时间与位置转换。",
    example: <div className="yin-yang-example" aria-label="阳爻与阴爻示例"><span><i />阳爻</span><span><i /><i />阴爻</span></div>,
    misconception: "常见误解：把阳当成绝对的好、把阴当成绝对的坏。两者是状态，不是道德判决。",
  },
  {
    id: "trigrams", number: "02", title: "八卦", subtitle: "三爻组成一种基本性质",
    concept: "三条阴阳爻共有八种组合，对应乾、兑、离、震、巽、坎、艮、坤。自然象帮助我们记忆其运动性质。",
    example: <div className="unicode-example" aria-label="八卦符号"><span>☰<small>乾·天</small></span><span>☵<small>坎·水</small></span><span>☶<small>艮·山</small></span><span>☷<small>坤·地</small></span></div>,
    misconception: "常见误解：认为一卦只对应一个具体事物。天、水、山是理解性质的类比，不是唯一含义。",
  },
  {
    id: "hexagrams", number: "03", title: "六十四卦", subtitle: "上下卦相遇成为局势",
    concept: "一个下卦与一个上卦重叠，形成六爻卦。下卦可视为内在或起点，上卦可视为外部或展开。",
    example: <div className="combine-example" aria-label="乾卦与坤卦组成泰卦"><span>☰<small>下卦·乾</small></span><b>+</b><span>☷<small>上卦·坤</small></span><b>=</b><span>䷊<small>地天泰</small></span></div>,
    misconception: "常见误解：只凭卦名判断吉凶。卦名是入口，还需结合上下卦、卦辞与所处阶段。",
  },
  {
    id: "line-positions", number: "04", title: "六个爻位", subtitle: "从萌芽到收束的六个位置",
    concept: "六爻从下往上数：初、二、三、四、五、上。它们提示一件事正在起步、展开、转折还是收束。",
    example: <ol className="position-example" aria-label="六个爻位由下向上"><li>上爻·收束</li><li>五爻·主导</li><li>四爻·过渡</li><li>三爻·转折</li><li>二爻·显现</li><li>初爻·起步</li></ol>,
    misconception: "常见误解：把最上面当成最好的位置。越接近上爻，往往越需要考虑收敛与转化。",
  },
  {
    id: "changing-lines", number: "05", title: "动爻与变卦", subtitle: "动爻标记当下最活跃的转折",
    concept: "起卦时，老阴与老阳会变，动爻翻转后形成变卦。本卦说明当前结构，变卦提示可能演化的方向。",
    example: <div className="change-example" aria-label="阳爻变为阴爻"><span><i />老阳</span><b>→</b><span><i /><i />阴爻</span></div>,
    misconception: "常见误解：把变卦当成必然发生的未来。它是在当前变化条件下的趋势参考，不是预言。",
  },
] as const;

export default function LearnPage() {
  return (
    <main id="main-content" className="learning-page">
      <section className="learning-hero section-shell" aria-labelledby="learning-title">
        <p className="eyebrow">从零开始学周易</p>
        <h1 id="learning-title">从阴阳理解变化</h1>
        <p>不用急着背诵卦辞。先用五个短章建立一张地图，知道卦象在描述什么，也知道它不是什么。</p>
        <nav className="chapter-nav" aria-label="学习章节">
          {chapters.map((chapter) => <a href={`#${chapter.id}`} key={chapter.id}><span>{chapter.number}</span>{chapter.title}</a>)}
        </nav>
      </section>

      <div className="learning-chapters">
        {chapters.map((chapter) => (
          <section className="learning-chapter section-shell" id={chapter.id} key={chapter.id} aria-labelledby={`${chapter.id}-title`}>
            <header><span>{chapter.number}</span><div><p>{chapter.subtitle}</p><h2 id={`${chapter.id}-title`}>{chapter.title}</h2></div></header>
            <div className="chapter-body">
              <article><h3>一个概念</h3><p>{chapter.concept}</p></article>
              <figure><figcaption>一个例子</figcaption>{chapter.example}</figure>
              <aside><h3>别这样理解</h3><p>{chapter.misconception}</p></aside>
            </div>
          </section>
        ))}
      </div>

      <section className="learning-cta section-shell">
        <div><p className="eyebrow">从概念到练习</p><h2>带着一个具体问题，开始你的第一次推演</h2><p>结果会清楚分开卦象事实、经典依据与行动参考。</p></div>
        <div><Link className="primary-button link-button" href="/divination">开始起卦 <span aria-hidden="true">→</span></Link><Link className="outline-button" href="/hexagrams">查看六十四卦</Link></div>
      </section>
    </main>
  );
}
