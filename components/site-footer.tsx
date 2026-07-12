import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-shell footer-main">
        <div className="footer-statement">
          <span className="footer-mark" aria-hidden="true">观</span>
          <div><p>在变化中辨明位置，<br />在行动前留一刻自省。</p><small>观易 · 东方智慧推演平台</small></div>
        </div>
        <nav className="footer-nav" aria-label="页脚导航">
          <div><strong>开始</strong><Link href="/divination">在线起卦</Link><Link href="/divination#recent">最近记录</Link></div>
          <div><strong>探索</strong><Link href="/hexagrams">六十四卦</Link><Link href="/learn">学习周易</Link></div>
        </nav>
      </div>
      <div className="section-shell footer-legal">
        <p>本网站内容仅供传统文化学习与自我反思参考，不构成医疗、法律、投资或其他专业建议，也不承诺预测未来。</p>
        <span>© 2026 观易</span>
      </div>
    </footer>
  );
}
