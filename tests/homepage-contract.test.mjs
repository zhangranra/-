import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("form controls keep an explicit keyboard focus ring", async () => {
  const styles = await readFile(new URL("app/globals.css", root), "utf8");
  const focusRule = styles.match(
    /\.field-group input:focus-visible,\s*\.field-group select:focus-visible\s*\{([^}]*)\}/,
  );

  assert.ok(focusRule, "expected a focus-visible rule for question controls");
  assert.match(focusRule[1], /outline:\s*3px solid var\(--cinnabar\)/);
  assert.doesNotMatch(focusRule[1], /outline:\s*0/);
  assert.match(styles, /:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--cinnabar\)/s);
});

test("publishes a Guanyi raster favicon and removes the starter SVG", async () => {
  const [layout, favicon] = await Promise.all([
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("public/favicon.png", root)),
  ]);

  assert.match(layout, /icon:\s*"\/favicon\.png"/);
  assert.match(layout, /shortcut:\s*"\/favicon\.png"/);
  assert.deepEqual([...favicon.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  await assert.rejects(access(new URL("public/favicon.svg", root)));
});

test("keeps the casting action prominent at tablet widths", async () => {
  const styles = await readFile(new URL("app/globals.css", root), "utf8");
  const tabletRules = styles.match(
    /@media \(max-width: 1020px\)\s*\{([\s\S]*?)\n\}\n\n@media \(max-width: 780px\)/,
  );

  assert.ok(tabletRules, "expected the 1020px tablet breakpoint");
  assert.doesNotMatch(tabletRules[1], /\.header-action\s*\{[^}]*display:\s*none/s);
});

test("mobile menu exposes distinct open and closed accessible labels", async () => {
  const [header, styles] = await Promise.all([
    readFile(new URL("components/site-header.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(header, /className="menu-label menu-label-closed">打开导航菜单/);
  assert.match(header, /className="menu-label menu-label-open">关闭导航菜单/);
  assert.doesNotMatch(header, /summary aria-label="打开导航菜单"/);
  assert.match(styles, /\.mobile-menu\[open\] \.menu-label-closed\s*\{[^}]*display:\s*none/s);
  assert.match(styles, /\.mobile-menu\[open\] \.menu-label-open\s*\{[^}]*display:\s*block/s);
});

test("mobile header and footer links keep 44px hit targets", async () => {
  const styles = await readFile(new URL("app/globals.css", root), "utf8");
  const mobileRules = styles.match(
    /@media \(max-width: 780px\)\s*\{([\s\S]*?)\n\}\n\n@media \(max-width: 520px\)/,
  );

  assert.ok(mobileRules, "expected the 780px mobile breakpoint");
  assert.match(mobileRules[1], /\.brand\s*\{[^}]*min-height:\s*44px/s);
  assert.match(mobileRules[1], /\.header-action\s*\{[^}]*min-height:\s*44px/s);
  assert.match(
    mobileRules[1],
    /\.footer-nav a\s*\{(?=[^}]*display:\s*flex)(?=[^}]*align-items:\s*center)(?=[^}]*min-height:\s*44px)[^}]*\}/s,
  );
});
