import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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

test("server-renders the Guanyi brand homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang=["']zh-CN["']/i);
  assert.match(html, /<title>[^<]*观易[^<]*<\/title>/i);
  assert.match(html, /观天地之变，明当下之势/);
  assert.match(html, /href=["']\/divination["']/i);
  assert.match(html, /href=["']\/hexagrams["']/i);
  assert.match(html, /href=["']\/learn["']/i);
  assert.match(html, /本网站内容仅供传统文化学习与自我反思参考/);
  assert.doesNotMatch(html, /codex-preview/i);
  assert.doesNotMatch(html, /react-loading-skeleton/i);
});
