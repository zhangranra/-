import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "资料来源与授权｜观易",
  description: "观易经典文本的数据来源、版本、署名与共享方式说明。",
};

export default function SourcesPage() {
  return (
    <main id="main-content" className="sources-page">
      <header className="sources-hero section-shell">
        <p className="eyebrow">公开说明</p>
        <h1>资料来源与授权</h1>
        <p>这里说明观易所用经典文本的来源、固定版本、改编范围与再使用条件。</p>
      </header>

      <div className="sources-content section-shell">
        <section aria-labelledby="classical-source-title">
          <h2 id="classical-source-title">经典文本来源</h2>
          <p>
            经典《周易》文本取自
            {" "}
            <a href="https://github.com/kanripo/KR1a0001">Kanseki Repository (Kanripo) · KR1a0001《周易》</a>
            ，固定使用修订版本 <code>8284adbf9e3435d713180e24f05bf75f8b7d1d96</code>，以便核验与复现。
          </p>
        </section>

        <section aria-labelledby="license-title">
          <h2 id="license-title">授权与署名</h2>
          <p>
            上述来源内容依
            {" "}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International（CC BY-SA 4.0）</a>
            {" "}
            提供。署名为“Kanseki Repository (Kanripo), KR1a0001《周易》”。
          </p>
        </section>

        <section aria-labelledby="adaptation-title">
          <h2 id="adaptation-title">改编与现代解释</h2>
          <p>
            观易对经典资料进行了结构化整理，并另行撰写白话说明、主题、阶段、风险、机会与行动参考等现代解释。
            这些内容属于文化学习与自我反思用途，不代表原资料库的观点，也不构成对未来的承诺或专业意见。
          </p>
        </section>

        <section aria-labelledby="share-alike-title">
          <h2 id="share-alike-title">相同方式共享</h2>
          <p>
            转载或继续改编本项目所含的 CC BY-SA 资料时，请保留来源署名、仓库与固定版本链接、改动说明，
            并在 CC BY-SA 4.0 或兼容许可下以相同方式共享。
          </p>
        </section>
      </div>
    </main>
  );
}
