import type { Metadata } from "next";
import { HexagramBrowser } from "@/components/hexagram-browser";
import { HEXAGRAM_SUMMARIES } from "@/features/content/hexagrams";

export const metadata: Metadata = {
  title: "六十四卦知识库｜观易",
  description: "按卦名、拼音、上下卦与主题查找六十四卦，阅读经典原文与现代行动参考。",
};

export default function HexagramsPage() {
  return (
    <main id="main-content" className="library-page">
      <section className="library-hero section-shell" aria-labelledby="library-title">
        <p className="eyebrow">六十四种处境</p>
        <h1 id="library-title">六十四卦</h1>
        <p>
          每一卦都是一种局势结构。从上下卦、卦辞与六爻阶段入手，看见所处位置与可以采取的行动。
        </p>
      </section>
      <section className="library-content section-shell" aria-label="六十四卦索引">
        <HexagramBrowser hexagrams={HEXAGRAM_SUMMARIES} />
      </section>
    </main>
  );
}
