import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the hexagram library", async () => {
  const response = await render("/hexagrams");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /六十四卦/);
  assert.match(html, /乾为天/);
  assert.match(html, /href=["']\/hexagrams\/qian["']/i);
});

test("server-renders a complete static hexagram detail", async () => {
  const response = await render("/hexagrams/qian");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /乾为天/);
  assert.match(html, /经典卦辞/);
  assert.match(html, /彖传/);
  assert.match(html, /大象传/);
  assert.equal((html.match(/<span>经典爻辞<\/span>/g) ?? []).length, 6);
  assert.equal((html.match(/<span>白话与行动参考<\/span>/g) ?? []).length, 6);
});

test("server-renders the learning center", async () => {
  const response = await render("/learn");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /从阴阳理解变化/);
  for (const chapter of ["阴阳", "八卦", "六十四卦", "六个爻位", "动爻与变卦"]) {
    assert.match(html, new RegExp(chapter));
  }
  assert.match(html, /href=["']\/divination["']/i);
  assert.match(html, /href=["']\/hexagrams["']/i);
});

test("server-renders the Guanyi brand homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang=["']zh-CN["']/i);
  assert.match(html, /<title>观易｜东方智慧推演平台<\/title>/i);
  assert.match(html, /<link[^>]+href=["']\/favicon\.png["']/i);
  assert.match(html, /观天地之变，明当下之势/);
  assert.match(html, /href=["']\/divination["']/i);
  assert.match(html, /href=["']\/hexagrams["']/i);
  assert.match(html, /href=["']\/learn["']/i);
  assert.match(html, /href=["']\/divination#recent["']/i);
  assert.match(
    html,
    /<form(?=[^>]*\baction=["']\/divination["'])(?=[^>]*\bmethod=["']get["'])[^>]*>/i,
  );
  assert.match(html, /<(?:input|textarea)[^>]*\bname=["']question["']/i);
  assert.match(html, /<select[^>]*\bname=["']domain["']/i);
  assert.match(html, /本网站内容仅供传统文化学习与自我反思参考/);
  assert.doesNotMatch(html, /codex-preview/i);
  assert.doesNotMatch(html, /react-loading-skeleton/i);

  const orderedSections = [
    "观天地之变，明当下之势",
    "不是替你预言",
    "六次投掷",
    "每一条参考，都知道从何而来",
    "读一卦，也读变化的全貌",
    "不背术语，先理解变化如何发生",
    "在变化中辨明位置",
  ];
  let previousIndex = -1;
  for (const marker of orderedSections) {
    const currentIndex = html.indexOf(marker);
    assert.ok(currentIndex > previousIndex, `${marker} should follow the prior homepage section`);
    previousIndex = currentIndex;
  }
});
