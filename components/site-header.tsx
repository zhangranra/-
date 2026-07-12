import Link from "next/link";

const navItems = [
  ["在线起卦", "/divination"],
  ["六十四卦", "/hexagrams"],
  ["学习周易", "/learn"],
  ["最近记录", "/divination#recent"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="观易首页">
          <span aria-hidden="true">观</span>
          <strong>观易</strong>
          <small>东方智慧推演</small>
        </Link>
        <nav className="desktop-nav" aria-label="主要导航">
          {navItems.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <Link className="header-action" href="/divination">开始起卦 <span aria-hidden="true">→</span></Link>
        <details className="mobile-menu">
          <summary aria-label="打开导航菜单"><span /><span /><span /></summary>
          <nav aria-label="移动端主要导航">
            {navItems.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
          </nav>
        </details>
      </div>
    </header>
  );
}
