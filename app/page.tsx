import Link from "next/link";
import { HexagramGlyph } from "@/components/hexagram-glyph";

const methods = [
  {
    number: "01",
    title: "确定性计算",
    copy: "六次铜钱结果按固定规则换算为本卦、动爻与变卦，同样的输入始终得到同样的卦象。",
  },
  {
    number: "02",
    title: "经典文本",
    copy: "卦辞、爻辞与《象》传单独标注，古文原意与现代说明清楚分层。",
  },
  {
    number: "03",
    title: "规则解释",
    copy: "判断只组合已确定的卦象事实、爻位阶段与问题领域，每条结论都能找到依据。",
  },
  {
    number: "04",
    title: "通俗表达",
    copy: "把变化线索整理成处境、趋势、风险和行动参考，不把文化推演写成命运断言。",
  },
] as const;

const castingSteps = [
  ["一", "静心设问", "一次只问一件具体的事，写清你正在权衡的行动与时间范围。"],
  ["二", "六次投掷", "从初爻开始，以三枚铜钱完成六次投掷；也可录入手边真实铜钱的结果。"],
  ["三", "查看变化", "系统确定本卦、动爻和变卦，并展示上下卦与每一爻的位置。"],
  ["四", "获得参考", "结合经典原文与阶段规则，得到来源清楚、可回看的行动提示。"],
] as const;

const hexagrams = [
  ["䷀", "乾", "创始进取", "qian"],
  ["䷁", "坤", "包容承载", "kun"],
  ["䷂", "屯", "艰难初生", "zhun"],
  ["䷃", "蒙", "启蒙求知", "meng"],
  ["䷊", "泰", "通达协同", "tai"],
  ["䷋", "否", "阻隔闭塞", "pi"],
  ["䷰", "革", "变革除旧", "ge"],
  ["䷱", "鼎", "建立新序", "ding"],
] as const;

const learningPath = [
  ["01", "阴阳", "先理解两种力量如何对立、互补并随时位转换。"],
  ["02", "八卦", "认识乾、坤、震、巽、坎、离、艮、兑的自然象与核心性质。"],
  ["03", "六十四卦", "观察上下卦相遇后，如何描述一段局势的结构与阶段。"],
  ["04", "爻位", "从初爻到上爻，读懂一件事由萌芽、显现到收束的位置变化。"],
  ["05", "动爻与变卦", "辨认当下最活跃的转折，以及变化可能指向的新局面。"],
] as const;

const qianLines = [1, 1, 1, 1, 1, 1] as const;
const gouLines = [0, 1, 1, 1, 1, 1] as const;

export default function Home() {
  return (
    <main id="main-content">
      <section className="hero section-shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">周易 · 变化 · 行动</p>
          <h1 id="hero-title">观天地之变，明当下之势</h1>
          <p className="hero-lead">
            从一个具体问题出发，以六次铜钱起卦理解局势。卦象由固定规则计算，解释来自经典文本与清晰可查的阶段依据。
          </p>

          <form className="question-form" action="/divination" method="get">
            <div className="field-group field-question">
              <label htmlFor="question">你此刻想厘清什么？</label>
              <input
                id="question"
                name="question"
                type="text"
                minLength={4}
                required
                placeholder="例如：我是否应在这个季度争取新的项目机会？"
              />
            </div>
            <div className="field-group field-domain">
              <label htmlFor="domain">问题领域</label>
              <select id="domain" name="domain" defaultValue="career">
                <option value="career">事业</option>
                <option value="relationship">感情</option>
                <option value="finance">财运</option>
                <option value="study">学业</option>
                <option value="health">健康</option>
                <option value="cooperation">合作</option>
                <option value="general">一般决策</option>
              </select>
            </div>
            <button className="primary-button" type="submit">
              开始起卦 <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="form-note">问题仅用于本次推演；历史记录默认保存在你的浏览器中。</p>
        </div>

        <div className="hero-visual" aria-label="由本卦、动爻与变卦构成的抽象六爻变化图">
          <div className="orbit orbit-one" aria-hidden="true" />
          <div className="orbit orbit-two" aria-hidden="true" />
          <div className="visual-seal" aria-hidden="true">易</div>
          <div className="hero-glyph hero-glyph-original">
            <span>本卦</span>
            <HexagramGlyph lines={qianLines} name="乾为天" movingLines={[1]} />
            <strong>乾</strong>
          </div>
          <div className="change-mark" aria-hidden="true">
            <i />
            <span>初爻动</span>
          </div>
          <div className="hero-glyph hero-glyph-changed">
            <span>之卦</span>
            <HexagramGlyph lines={gouLines} name="天风姤" />
            <strong>姤</strong>
          </div>
        </div>
      </section>

      <section className="method-section section-pad" aria-labelledby="method-title">
        <div className="section-shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">可信的方法</p>
              <h2 id="method-title">不是替你预言，<br />而是陪你看清变化</h2>
            </div>
            <p>计算与解释彼此分离：先确定卦象事实，再说明这些事实为何与当下问题有关。</p>
          </div>
          <div className="method-grid">
            {methods.map((method) => (
              <article className="method-card" key={method.number}>
                <span>{method.number}</span>
                <h3>{method.title}</h3>
                <p>{method.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="flow-section section-pad" aria-labelledby="flow-title">
        <div className="section-shell flow-layout">
          <div className="flow-intro">
            <p className="eyebrow">一次完整起卦</p>
            <h2 id="flow-title">六次投掷，<br />看见局势的层次</h2>
            <p>每一爻都从下向上生成。你会看到结果如何从三枚铜钱，逐步成为一幅可解释的六爻图。</p>
            <Link className="text-link" href="/divination">了解起卦方式 <span aria-hidden="true">↗</span></Link>
          </div>
          <ol className="flow-list">
            {castingSteps.map(([number, title, copy]) => (
              <li key={number}>
                <span className="step-number">{number}</span>
                <div><h3>{title}</h3><p>{copy}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="example-section section-pad" aria-labelledby="example-title">
        <div className="section-shell">
          <div className="section-heading centered-heading">
            <p className="eyebrow">报告示例</p>
            <h2 id="example-title">每一条参考，都知道从何而来</h2>
            <p>以下为虚构问题，用来展示报告如何区分卦象事实、经典依据与现代行动参考。</p>
          </div>
          <article className="reading-card">
            <div className="reading-question">
              <span>所问 · 事业</span>
              <h3>“我是否应在这个季度主动争取新的项目负责人机会？”</h3>
              <p>示例结果 · 乾为天，初九动，之卦天风姤</p>
            </div>
            <div className="reading-figure">
              <div><HexagramGlyph lines={qianLines} name="乾为天" movingLines={[1]} size="compact" /><span>本卦 · 乾</span></div>
              <b aria-hidden="true">→</b>
              <div><HexagramGlyph lines={gouLines} name="天风姤" size="compact" /><span>变卦 · 姤</span></div>
            </div>
            <div className="reading-insight">
              <div className="source-tag">依据 · 乾卦初九</div>
              <blockquote>“潜龙勿用。”</blockquote>
              <p>主动性正在积累，但目前更适合先验证资源、职责边界与支持者，而不是立刻把意愿变成承诺。</p>
              <div className="advice-line"><span>行动参考</span><strong>先约一次职责澄清会，再决定是否正式提出申请。</strong></div>
            </div>
          </article>
        </div>
      </section>

      <section className="hexagram-section section-pad" aria-labelledby="hexagram-title">
        <div className="section-shell">
          <div className="section-heading row-heading">
            <div><p className="eyebrow">六十四种局势</p><h2 id="hexagram-title">读一卦，也读变化的全貌</h2></div>
            <Link className="outline-button" href="/hexagrams">查看六十四卦 <span aria-hidden="true">→</span></Link>
          </div>
          <div className="hexagram-grid">
            {hexagrams.map(([symbol, name, theme, slug], index) => (
              <Link className="hexagram-card" href={`/hexagrams/${slug}`} key={name}>
                <span className="hexagram-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="hexagram-symbol" aria-hidden="true">{symbol}</span>
                <span><strong>{name}</strong><small>{theme}</small></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="learn-section section-pad" aria-labelledby="learn-title">
        <div className="section-shell learn-layout">
          <div className="learn-copy">
            <p className="eyebrow">从零开始学习</p>
            <h2 id="learn-title">不背术语，先理解变化如何发生</h2>
            <p>五个短章节，把阴阳、卦象与爻位放回日常经验。每章都有概念、示例和常见误解，适合第一次接触《周易》的人。</p>
            <Link className="primary-button link-button" href="/learn">开始学习 <span aria-hidden="true">→</span></Link>
          </div>
          <ol className="learning-list">
            {learningPath.map(([number, title, copy]) => (
              <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
