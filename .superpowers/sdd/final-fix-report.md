# Guanyi MVP final-fix report

## Result

**DONE_WITH_CONCERNS** — all four must-fix launch findings and the safe final-review minors were resolved and verified. The only retained concerns are non-blocking starter DB/auth scaffolding cleanup and the fact that the visible retained development server was intentionally not started, stopped, or browser-remeasured in this wave.

Functional fix commit: `73af91043fc4cb2a0db655285f5f968a47c5b5cf` (`fix: address final launch review`), based on `9068912`.

Immediately after that commit, `git status --short` produced no output; the functional worktree was clean. This report is committed separately as evidence because `.superpowers/sdd/*` is intentionally ignored by the project.

## Finding-by-finding evidence

### 1. Corrupted local timestamps

Root cause: `isTimestamp()` accepted every finite number. Negative and fractional values were treated as valid local records, and values outside the ECMAScript Date range later reached `toISOString()` and threw `RangeError: Invalid time value`.

Implementation:

- A stored timestamp must now be a number, a safe integer, non-negative, and produce a finite `new Date(value).getTime()`.
- Invalid drafts recover as `null`; invalid recent-reading arrays recover as `[]`.
- Storage-boundary tests cover negative, fractional, and out-of-range values for both drafts and recent readings.
- `/divination` component tests cover negative and fractional recent timestamps.
- Reading-page tests cover an out-of-range matching local draft and verify fallback to the privacy-safe missing-question state.

RED evidence:

- Focused storage command: `PATH=/tmp/guanyi-npm-bin:$PATH npm run test:unit -- features/storage/reading-store.test.ts`
- Result before the guard: 13 tests; 6 failed and 7 passed. All negative, fractional, and out-of-range draft/recent assertions failed because malformed records were returned.
- Route regression proof was also run with the timestamp guard temporarily reverted:
  `PATH=/tmp/guanyi-npm-bin:$PATH npm run test:unit -- components/casting-experience.test.tsx components/reading-report.test.tsx`
- Result: 17 tests; 3 failed and 14 passed, plus one uncaught `RangeError: Invalid time value` at the report `toISOString()` call. The two `/divination` cases incorrectly rendered corrupt records.

GREEN evidence:

- Initial storage GREEN: 13/13 passed.
- Final combined timestamp/storage/rendering command:
  `PATH=/tmp/guanyi-npm-bin:$PATH npm run test:unit -- components/casting-experience.test.tsx components/reading-report.test.tsx features/storage/reading-store.test.ts`
- Result: 3 files, 31/31 tests passed, with no unhandled rendering error.

### 2. WCAG AA bronze text and hover contrast

Root cause: decorative bronze `#a8844f` was also used for small meaningful text and as a hover background behind sand text, producing sub-AA contrast.

Implementation:

- Decorative `--bronze` remains available for rules, borders, and decorative symbols.
- Added text-safe `--bronze-text: #765d38`.
- Small eyebrow, sequence, pinyin, trigram, source, breadcrumb, label, and chapter text now use the safe token.
- Primary/header and outline-button bronze hover backgrounds now use `--bronze-text` with sand text.
- The contract test implements WCAG relative luminance and contrast-ratio calculations instead of checking CSS rule presence alone.

RED evidence:

- Command: `node --test --test-name-pattern='bronze' tests/homepage-contract.test.mjs`
- Result: 1 test, 0 passed, 1 failed because `--bronze-text` did not exist.

GREEN evidence:

- Same command: 1/1 passed.
- Measured ratios:
  - `#765d38` on paper `#f4f0e8`: **5.445:1**.
  - `#765d38` on sand `#fbf9f4`: **5.882:1**.
  - Sand on the dark-bronze hover background is the same **5.882:1**.
- All required pairs exceed 4.5:1.

### 3. ASCII pinyin search and hexagram 21 correction

Root causes:

- Query and catalog strings were only lowercased, so ASCII input did not match tone-marked pinyin.
- The authoritative importer incorrectly listed hexagram 21 噬嗑 as `shì kè`.

Implementation:

- Both query and searchable content now use NFD normalization, combining-mark removal, locale-aware lowercasing, separator normalization, whitespace collapsing, and trimming.
- Corrected the importer to `shì hé`.
- Regenerated `features/content/hexagram-records.ts` from Kanripo revision `8284adbf9e3435d713180e24f05bf75f8b7d1d96`; the generator reported 64 hexagrams and 384 lines.
- Behavior tests verify `qian` finds 乾为天 and `shi he` finds 火雷噬嗑.

RED evidence:

- Command: `PATH=/tmp/guanyi-npm-bin:$PATH npm run test:unit -- components/hexagram-browser.test.tsx`
- Result: 4 tests; the two new ASCII-pinyin cases failed, while 2 existing tests passed.

GREEN evidence:

- Command: `PATH=/tmp/guanyi-npm-bin:$PATH npm run test:unit -- components/hexagram-browser.test.tsx features/content/content.test.ts scripts/import-hexagram-content.test.ts`
- Result: 3 files, 11/11 tests passed.

### 4. Public attribution and licensing

Implementation:

- Added deployed `/sources` page with:
  - Kanseki Repository (Kanripo), KR1a0001《周易》 attribution.
  - Repository `https://github.com/kanripo/KR1a0001`.
  - Pinned revision `8284adbf9e3435d713180e24f05bf75f8b7d1d96`.
  - CC BY-SA 4.0 link `https://creativecommons.org/licenses/by-sa/4.0/`.
  - Structural-adaptation and separately authored modern-interpretation notice.
  - Required attribution, change notice, and same-license/share-alike statement.
- Added a footer link visible on every page.
- Added production-worker route and rendered-content assertions.

RED evidence:

- Command: `node --test --test-name-pattern='public sources' tests/rendered-html.test.mjs`
- Result: 1 test, 0 passed, 1 failed; production worker returned 404 instead of 200.

GREEN evidence:

- After a fresh production build, the focused worker test passed 1/1.
- Final production-worker suite passed 6/6, including route, repository, revision, license, adaptation, share-alike, and homepage footer-link assertions.

### 5. Exact recent-reading save result

Root cause: the report ignored the write result and scanned history for only timestamp, original sequence, and question. An older partial match could therefore report “saved” after the new write threw.

Implementation:

- `saveRecentReading()` now returns `true` only when `setItem()` completes, and `false` for invalid inputs or caught storage failures.
- It still never throws; browser storage remains best effort.
- The report uses the returned boolean directly.
- Regression coverage seeds a complete older matching record, forces the new write to throw, and requires the failure message.

RED evidence:

- Storage API RED: 14 tests; 2 failed and 12 passed because the old function returned `undefined`, not exact `true`/`false`.
- Report false-positive RED: 7 tests; 1 failed and 6 passed. The UI incorrectly displayed `已保存到当前浏览器。` after a quota failure.

GREEN evidence:

- Storage suite passed 14/14.
- Combined storage/report suite passed 2 files, 21/21 tests before the later route-recovery additions.
- Final combined storage/report/casting suite passed 31/31.

### 6. Minimal `/hexagrams` client projection

Root cause: the server passed all 64 full records, including 384 classical lines and modern interpretations, to the client browser component.

Implementation:

- Added explicit `HexagramSummary` type containing only sequence, name, full name, pinyin, slug, symbol, upper trigram, lower trigram, and theme.
- Added `HEXAGRAM_SUMMARIES` projection on the server and changed `/hexagrams` to pass only that array.
- Client props now require `readonly HexagramSummary[]`.
- Tests require exact summary keys, 64 entries, and serialized projection size below one quarter of full records.
- Production-worker test forbids `潛龍勿用` in the library response and enforces a response below 80 KB.

RED evidence:

- Command: `PATH=/tmp/guanyi-npm-bin:$PATH npm run test:unit -- features/content/content.test.ts`
- Result: 7 tests; 1 failed and 6 passed because `HEXAGRAM_SUMMARIES` was absent.

GREEN evidence:

- Command: `PATH=/tmp/guanyi-npm-bin:$PATH npm run test:unit -- features/content/content.test.ts components/hexagram-browser.test.tsx`
- Result: 2 files, 11/11 tests passed.
- Measured built production response:
  - Before: **260,401 bytes**.
  - After: **56,929 bytes**.
  - Reduction: **203,472 bytes (78.1%)**.
  - Full classical line marker present after fix: **false**.

### 7. Reading client full-catalog audit and projection

Audit result: the concern was valid and a clean implementation was possible without weakening privacy or gating, so it was fixed rather than deferred.

Implementation:

- Valid line/domain params are parsed first on the server.
- Only after successful gating does the server cast and build the deterministic structured report using a privacy-safe placeholder question.
- The client no longer imports `castHexagram`, `buildReading`, or the catalog.
- After hydration, the client reads guarded local storage and injects only a matching question and timestamp into the server report.
- Save behavior still receives the local question, domain, six values, timestamp, and projected cast sequences.
- Invalid params still render recovery actions and never call the casting function.
- The question remains absent from the URL and server request.

RED evidence:

- The reading-page behavior test was strengthened to require `castHexagram` before the returned page element was rendered/hydrated.
- Command: `PATH=/tmp/guanyi-npm-bin:$PATH npm run test:unit -- components/reading-report.test.tsx`
- Result: 7 tests; 1 failed and 6 passed because the server-side call count was 0.

GREEN evidence:

- Command: `PATH=/tmp/guanyi-npm-bin:$PATH npm run test:unit -- components/reading-report.test.tsx features/reading/build-reading.test.ts features/routing/reading-params.test.ts`
- Result: 3 files, 27/27 tests passed.
- Fresh built reading client artifact:
  - Before: **202,952 bytes**.
  - After: **7,494 bytes**.
  - Catalog/classical marker found in the reading client: **false**.

### 8. Dormant starter DB/auth surfaces and dependencies

Deferred as non-blocking.

Concrete rationale:

- `db/index.ts`, `db/schema.ts`, Drizzle dependencies/config, the optional D1/R2 fields in `.openai/hosting.json`, the Cloudflare worker `Env`, the Vite binding configuration, the migration-packaging plugin, examples, and README form a coordinated starter surface.
- Removing only packages or only source files would leave inconsistent configuration/documentation; removing the entire surface would be a materially broader hosting-template cleanup with no launch-path benefit and no dedicated coverage.
- `app/chatgpt-auth.ts` is currently unused but is also a standalone documented starter helper. It does not enter the Guanyi routes or client bundles.
- None of these surfaces is invoked by the Guanyi MVP, and the production build confirms no launch blocker. They should be removed only in a separately scoped cleanup with hosting/dependency tests.

## Changed files

- `app/globals.css` — safe bronze token and usages; compliant hover colors; responsive sources-page presentation.
- `app/hexagrams/page.tsx` — passes summary-only records.
- `app/reading/page.tsx` — server-side gated cast and deterministic report projection.
- `app/sources/page.tsx` — public attribution/licensing page.
- `components/casting-experience.test.tsx` — negative/fractional recent timestamp recovery.
- `components/hexagram-browser.tsx` — `HexagramSummary` input and diacritic/separator-normalized search.
- `components/hexagram-browser.test.tsx` — ASCII pinyin behavior.
- `components/reading-report.tsx` — exact save boolean and local-only question/timestamp injection into server report.
- `components/reading-report.test.tsx` — failed-write false-positive, server projection, privacy recovery, and out-of-range timestamp behavior.
- `components/site-footer.tsx` — sources/licensing link.
- `features/content/content.test.ts` — exact summary projection and size coverage.
- `features/content/hexagram-records.ts` — regenerated hexagram 21 pinyin.
- `features/content/hexagrams.ts` — server-side summary projection.
- `features/content/types.ts` — `HexagramSummary` type.
- `features/storage/reading-store.test.ts` — timestamp boundary and exact save-result coverage.
- `features/storage/reading-store.ts` — strict timestamp guard and boolean save result.
- `scripts/import-hexagram-content.mjs` — authoritative `shì hé` correction.
- `tests/homepage-contract.test.mjs` — computed WCAG contrast coverage and safe-token selector contracts.
- `tests/rendered-html.test.mjs` — production summary-payload, licensing route, and footer assertions.

## Final verification

All npm commands used `PATH=/tmp/guanyi-npm-bin:$PATH` as required.

### Full `npm run test`

Exit code: 0.

- Homepage/source contract tests: **6/6 passed**.
- Vitest: **10 files passed; 75/75 tests passed**.
- Production build: **all 5 Vinext phases completed** (client-reference analysis, server-reference analysis, RSC, client, SSR).
- Production-worker rendered tests: **6/6 passed**.
- Exact total: **87 passed, 0 failed**.
- Built routes include `/`, `/divination`, `/hexagrams`, `/hexagrams/:slug`, `/learn`, `/reading`, and `/sources`.

### Lint and whitespace

- `PATH=/tmp/guanyi-npm-bin:$PATH npm run lint`: exit 0; ESLint reported no findings.
- `git diff --check`: exit 0; no whitespace errors.

### Fresh production measurements

- Reading client: **7,494 bytes**.
- `/hexagrams` HTML/RSC response: **56,929 bytes**.
- Full classical line marker in summary response: **absent**.

## Deferred items and concerns

- Starter DB/auth/dependency cleanup is deferred for the coordinated-surface reasons above; it is not a launch blocker.
- The visible retained development server was not started or stopped, per instruction. This wave therefore did not perform a live browser re-measurement; production-worker rendering, build output, and automated behavior coverage are fresh.
- Vinext prints its existing informational note that some routes cannot yet be statically classified; all five build phases and production-worker tests still pass.
- The root task will perform the mandatory final re-review after this handoff.
