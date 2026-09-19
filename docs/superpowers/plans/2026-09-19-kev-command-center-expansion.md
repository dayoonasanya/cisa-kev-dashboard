# KEV Command Center Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the current single-page dashboard into a polished, portfolio-grade KEV security operations portal with transparent prioritization, exploration, device-local analyst workflows, and a printable briefing.

**Architecture:** Keep the application client-side and driven by the existing immutable CISA snapshot. Extract all calculations into pure, tested domain modules; let a `KevPortal` container coordinate navigation, global filters, selected records, and storage-backed analyst state; compose four focused views from reusable presentation components.

**Tech Stack:** Next.js 16 / Vinext, React 19, TypeScript 5.9, Tailwind CSS 4, Recharts 3, Base UI/shadcn components, Lucide icons, Vitest, Testing Library, ChatGPT Sites hosting.

**Spec:** `docs/superpowers/specs/2026-09-19-kev-command-center-expansion-design.md`

## Global Constraints

- Use only fields present in the checked-in generated CISA snapshot; do not invent CVSS, severity, exposure, exploit maturity, or financial impact.
- Call the derived 0–100 measure **KEV Action Priority**, never “risk score” or “CVSS.”
- Default `asOfDate` to the dataset release date so calculations remain reproducible.
- Label watchlists and notes **Saved on this device**; this release has no accounts or shared persistence.
- Use `Known` and `Unknown` ransomware labels exactly; `Unknown` never means “no ransomware use.”
- Keep all analytical functions pure and out of rendering components.
- Preserve source version, release date, record count, official CISA link, and caveats across views.
- Support keyboard navigation, visible focus, reduced motion, 360px mobile layouts, and print/PDF output.
- Publish to the existing ChatGPT Sites project and push the verified code to the existing GitHub repository.

## Review Focus

1. **Malformed or absent dataset fields:** reject an invalid top-level snapshot cleanly and render absent optional record fields as `Not provided by CISA`.
2. **Search punctuation and casing:** `cve-2024`, `CVE 2024`, mixed case, and surrounding whitespace must yield predictable normalized matching.
3. **Combined filters with no results:** preserve controls, show an explicit empty state, and allow one-click reset without chart or pagination errors.
4. **Unavailable local storage:** analysis must remain usable through in-memory fallback and a non-blocking persistence notice.
5. **Boundary scores and dates:** priority bands, due-date states, leap-year dates, and pagination boundaries must be deterministic at exact thresholds.

## File Map

### Create

- `vitest.config.ts` — browser-like unit/component test configuration.
- `src/kev/priority.ts` and `src/kev/priority.test.ts` — KEV Action Priority model and boundaries.
- `src/kev/query.ts` and `src/kev/query.test.ts` — normalization, filters, sorting, and pagination.
- `src/kev/insights.ts` and `src/kev/insights.test.ts` — deterministic analyst-facing sentences and briefing data.
- `src/kev/validate.ts` and `src/kev/validate.test.ts` — runtime dataset-shape guard.
- `src/analyst/storage.ts` and `src/analyst/storage.test.ts` — versioned local watchlist/notes adapter with memory fallback.
- `src/components/portal/KevPortal.tsx` — dataset loading and portal-level orchestration.
- `src/components/portal/PortalNavigation.tsx` — desktop/mobile navigation.
- `src/components/portal/PortalHeader.tsx` — source freshness and actions.
- `src/components/portal/FilterBar.tsx` — coordinated global controls.
- `src/components/portal/common.tsx` — focused reusable metric, insight, status, and chart shells.
- `src/components/views/CommandCenterView.tsx` — executive overview.
- `src/components/views/VulnerabilityExplorerView.tsx` — search, filters, table/cards, and paging.
- `src/components/views/VendorIntelligenceView.tsx` — vendor/product analysis.
- `src/components/views/BriefingView.tsx` — briefing, methodology, and print surface.
- `src/components/vulnerabilities/VulnerabilityDrawer.tsx` — detailed record view and analyst actions.
- `src/components/vulnerabilities/PriorityBadge.tsx` — accessible score band display.
- `src/components/portal/KevPortal.test.tsx` — critical portal interaction coverage.

### Modify

- `package.json` — test dependencies and scripts.
- `src/kev/types.ts` — portal, query, priority, and analyst-state types.
- `src/kev/metrics.ts` — reusable aggregates without UI concerns.
- `app/page.tsx` — render `KevPortal`.
- `app/layout.tsx` — title, description, and theme metadata.
- `app/globals.css` — portal design system, responsive layouts, and print rules.
- `README.md` — expanded features, scoring methodology, testing, and portfolio instructions.

### Remove after replacement

- `src/components/dashboard/KevDashboard.tsx` — delete only after the new portal passes tests and build.

---

### Task 1: Establish the Test Harness and Domain Types

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Modify: `src/kev/types.ts`
- Create: `src/kev/validate.test.ts`
- Create: `src/kev/validate.ts`

**Interfaces:**
- Consumes: existing `KevRecord` and `KevDataset` JSON shape.
- Produces: `isKevDataset(value: unknown): value is KevDataset`, `PortalView`, `PriorityBand`, `PriorityResult`, `ExplorerFilters`, `ExplorerSort`, `ExplorerQuery`, and `PagedResult<T>`.

- [ ] **Step 1: Add the test command and dependencies**

Add scripts `"test": "vitest run"` and `"test:watch": "vitest"` to `package.json`. Add exact dev dependencies through pnpm:

```bash
pnpm add -D vitest @testing-library/react @testing-library/user-event jsdom
```

- [ ] **Step 2: Add the Vitest configuration**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, ".") } },
  test: { environment: "jsdom", globals: true, css: false },
});
```

- [ ] **Step 3: Write the failing dataset validation tests**

Create `src/kev/validate.test.ts` with tests proving that a minimal valid dataset passes, `null` fails, a missing `records` array fails, and a record missing `cveID` fails.

```ts
import { describe, expect, it } from "vitest";
import { isKevDataset } from "./validate";

const record = { cveID:"CVE-2026-0001", vendorProject:"Acme", product:"Edge", vulnerabilityName:"Example", dateAdded:"2026-09-01", dueDate:"2026-09-22", knownRansomwareCampaignUse:"Unknown", forensicTriage:"", requiredAction:"Patch", notes:"", cwes:[], remediationDays:21 };
const dataset = { title:"KEV", catalogVersion:"2026.09.16", dateReleased:"2026-09-16T00:00:00Z", retrievedAt:"2026-09-16T01:00:00Z", sourceUrl:"https://www.cisa.gov/known-exploited-vulnerabilities-catalog", records:[record] };

describe("isKevDataset", () => {
  it("accepts the expected snapshot shape", () => expect(isKevDataset(dataset)).toBe(true));
  it("rejects null", () => expect(isKevDataset(null)).toBe(false));
  it("rejects a missing records array", () => expect(isKevDataset({ ...dataset, records: undefined })).toBe(false));
  it("rejects a record without a CVE ID", () => expect(isKevDataset({ ...dataset, records:[{ ...record, cveID: undefined }] })).toBe(false));
});
```

- [ ] **Step 4: Run the validation test and confirm RED**

Run: `pnpm test src/kev/validate.test.ts`

Expected: FAIL because `./validate` does not exist.

- [ ] **Step 5: Add types and minimal validation**

Extend `src/kev/types.ts` with the exact models from the spec. Implement `isKevDataset` with object, metadata-string, records-array, and required record-field checks. Keep optional display fields permissive so missing source values can render the documented fallback.

- [ ] **Step 6: Run validation tests and quality checks**

Run: `pnpm test src/kev/validate.test.ts && pnpm lint`

Expected: all validation tests PASS and ESLint exits 0.

- [ ] **Step 7: Commit the harness**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts src/kev/types.ts src/kev/validate.ts src/kev/validate.test.ts
git commit -m "test: establish KEV portal domain harness"
```

---

### Task 2: Implement Transparent KEV Action Priority

**Files:**
- Create: `src/kev/priority.test.ts`
- Create: `src/kev/priority.ts`

**Interfaces:**
- Consumes: `KevRecord`, `PriorityBand`, dataset release date as `asOfDate`.
- Produces: `calculatePriority(record: KevRecord, asOfDate: string): PriorityResult` and `priorityBand(score: number): PriorityBand`.

- [ ] **Step 1: Write score-factor and boundary tests**

Create table-driven tests for ransomware points, all remediation buckets, all recency buckets, overdue/30-day/later due dates, and scores 39/40/59/60/79/80. Add a leap-day test with `asOfDate="2024-03-01"` and `dateAdded="2024-02-29"`.

```ts
it.each([[39,"Tracked"],[40,"Elevated"],[59,"Elevated"],[60,"High"],[79,"High"],[80,"Critical"]] as const)("maps %i to %s", (score, band) => {
  expect(priorityBand(score)).toBe(band);
});
```

- [ ] **Step 2: Run priority tests and confirm RED**

Run: `pnpm test src/kev/priority.test.ts`

Expected: FAIL because priority exports do not exist.

- [ ] **Step 3: Implement the exact scoring model**

Return `{ score, band, factors }`, where every factor contains `{ key, label, points, explanation }`. Parse ISO dates at UTC midnight, clamp the total to 0–100, and treat invalid dates as zero points with an explanatory factor rather than throwing.

- [ ] **Step 4: Run priority tests and full suite**

Run: `pnpm test src/kev/priority.test.ts && pnpm test`

Expected: all tests PASS.

- [ ] **Step 5: Commit priority logic**

```bash
git add src/kev/priority.ts src/kev/priority.test.ts
git commit -m "feat: add transparent KEV action priority"
```

---

### Task 3: Build Query, Filter, Sort, and Pagination Selectors

**Files:**
- Create: `src/kev/query.test.ts`
- Create: `src/kev/query.ts`
- Modify: `src/kev/metrics.ts`

**Interfaces:**
- Consumes: `KevRecord[]`, `ExplorerQuery`, `asOfDate`, and `calculatePriority`.
- Produces: `normalizeSearch(value: string): string`, `queryRecords(records, query, asOfDate): PagedResult<KevRecord>`, `uniqueOptions(records, field)`, and existing aggregate functions.

- [ ] **Step 1: Write failing query tests**

Test normalized case/whitespace/hyphen matching, search across every specified text field, combined vendor/product/year/ransomware/priority/remediation filters, every sort option, stable tie-breaking by CVE ID, empty results, page 1, final partial page, an out-of-range page clamped to the final page, and page sizes 25/50/100.

```ts
it("normalizes common CVE search punctuation", () => {
  expect(normalizeSearch("  cve 2026 0001 ")).toBe("cve20260001");
});
```

- [ ] **Step 2: Run query tests and confirm RED**

Run: `pnpm test src/kev/query.test.ts`

Expected: FAIL because `./query` does not exist.

- [ ] **Step 3: Implement the query pipeline**

Apply operations in this order: normalized search, field filters, priority/remediation filters, stable sort, page clamping, slice. Return `{ items, total, page, pageSize, pageCount }`; for zero results use `page=1` and `pageCount=0`.

- [ ] **Step 4: Refactor shared aggregates**

Keep `median`, `groupCount`, and `deriveMetrics` pure. Remove duplicated filtering behavior only after equivalent query tests protect it.

- [ ] **Step 5: Run query tests and full suite**

Run: `pnpm test src/kev/query.test.ts && pnpm test && pnpm lint`

Expected: all tests PASS and lint exits 0.

- [ ] **Step 6: Commit query selectors**

```bash
git add src/kev/query.ts src/kev/query.test.ts src/kev/metrics.ts
git commit -m "feat: add KEV explorer query pipeline"
```

---

### Task 4: Add Deterministic Insights and Analyst Storage

**Files:**
- Create: `src/kev/insights.test.ts`
- Create: `src/kev/insights.ts`
- Create: `src/analyst/storage.test.ts`
- Create: `src/analyst/storage.ts`

**Interfaces:**
- Consumes: filtered records, metrics, priority results, `Storage | undefined`.
- Produces: `deriveBriefing(records, asOfDate): BriefingModel` and `createAnalystStore(storage?): AnalystStore` with `getState`, `toggleWatchlist`, `setNote`, and `subscribe`.

- [ ] **Step 1: Write failing insight tests**

Cover non-empty and empty record sets, deterministic top-vendor tie resolution, ransomware share wording, and the three highest-priority records.

- [ ] **Step 2: Write failing storage tests**

Cover watchlist toggling, note trimming, JSON reload, version mismatch reset, malformed JSON recovery, and a storage implementation that throws on both reads and writes.

```ts
it("falls back to memory when storage throws", () => {
  const broken = { getItem(){ throw new Error("denied"); }, setItem(){ throw new Error("denied"); } } as unknown as Storage;
  const store = createAnalystStore(broken);
  store.toggleWatchlist("CVE-2026-0001");
  expect(store.getState().watchlist).toContain("CVE-2026-0001");
  expect(store.getState().persistenceAvailable).toBe(false);
});
```

- [ ] **Step 3: Run both tests and confirm RED**

Run: `pnpm test src/kev/insights.test.ts src/analyst/storage.test.ts`

Expected: FAIL because both modules are missing.

- [ ] **Step 4: Implement insights and versioned storage**

Use storage key `kev-command-center:analyst-state:v1` and stored shape `{ version:1, watchlist:string[], notes:Record<string,string> }`. Never throw storage errors to the UI. Limit each note to 2,000 characters.

- [ ] **Step 5: Run domain tests and suite**

Run: `pnpm test src/kev/insights.test.ts src/analyst/storage.test.ts && pnpm test`

Expected: all tests PASS.

- [ ] **Step 6: Commit domain services**

```bash
git add src/kev/insights.ts src/kev/insights.test.ts src/analyst/storage.ts src/analyst/storage.test.ts
git commit -m "feat: add analyst insights and local workspace"
```

---

### Task 5: Build the Portal Shell and Command Center

**Files:**
- Create: `src/components/portal/KevPortal.test.tsx`
- Create: `src/components/portal/KevPortal.tsx`
- Create: `src/components/portal/PortalNavigation.tsx`
- Create: `src/components/portal/PortalHeader.tsx`
- Create: `src/components/portal/FilterBar.tsx`
- Create: `src/components/portal/common.tsx`
- Create: `src/components/views/CommandCenterView.tsx`
- Create: `src/components/vulnerabilities/PriorityBadge.tsx`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: validated `KevDataset`, selectors from Tasks 2–4, current URL query.
- Produces: portal shell, `PortalView` navigation, coordinated global filters, dataset loading/error states, and overview view.

- [ ] **Step 1: Write failing shell interaction tests**

Mock only `fetch` at the network boundary. Assert loading copy, valid snapshot rendering, malformed snapshot error, retry after fetch failure, navigation to Explorer, filter reset, and source metadata visibility. Assert the Command Center contains text summaries for each chart so its meaning is not color-only.

- [ ] **Step 2: Run component test and confirm RED**

Run: `pnpm test src/components/portal/KevPortal.test.tsx`

Expected: FAIL because `KevPortal` does not exist.

- [ ] **Step 3: Implement the shell and overview**

Build the responsive sidebar/top bar, source header, metric row, coordinated filter bar, priority distribution, top vendors, additions trend, ransomware-linked products, and priority queue preview. Use accessible buttons for navigation; update URL parameters with `history.replaceState` without causing a reload.

- [ ] **Step 4: Establish the visual system**

Replace page-specific CSS with named tokens and portal classes for canvas, navigation, surfaces, typography, status colors, tables, drawers, focus, responsive breakpoints, reduced motion, and loading/error states. Keep coral-red exclusive to urgent/confirmed evidence.

- [ ] **Step 5: Update the route and metadata**

Render `KevPortal` from `app/page.tsx`. Set title to `KEV Command Center | Adedayo A. Onasanya` and description to `An interactive CISA Known Exploited Vulnerabilities analysis and prioritization portal.`

- [ ] **Step 6: Run shell tests, lint, and build**

Run: `pnpm test src/components/portal/KevPortal.test.tsx && pnpm lint && pnpm build`

Expected: tests PASS, lint exits 0, and production build exits 0.

- [ ] **Step 7: Commit the portal foundation**

```bash
git add app src/components/portal src/components/views/CommandCenterView.tsx src/components/vulnerabilities/PriorityBadge.tsx
git commit -m "feat: build KEV command center shell"
```

---

### Task 6: Add Vulnerability Explorer and Detail Workflow

**Files:**
- Modify: `src/components/portal/KevPortal.test.tsx`
- Create: `src/components/views/VulnerabilityExplorerView.tsx`
- Create: `src/components/vulnerabilities/VulnerabilityDrawer.tsx`
- Modify: `src/components/portal/KevPortal.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `queryRecords`, `calculatePriority`, global filter state, `AnalystStore`.
- Produces: explorer controls/results, accessible record selection, detail drawer, watchlist, and notes.

- [ ] **Step 1: Add failing explorer interaction tests**

Assert search finds the intended CVE, combined filters produce the empty state, reset restores results, sorting changes the first row, page-size selection changes result count, row activation opens the correct drawer, Escape closes it and restores focus, watchlist toggles, notes persist after drawer reopen, and missing optional fields show `Not provided by CISA`.

- [ ] **Step 2: Run the focused tests and confirm RED**

Run: `pnpm test src/components/portal/KevPortal.test.tsx -t "explorer|drawer|watchlist|notes"`

Expected: FAIL because Explorer is not implemented.

- [ ] **Step 3: Implement Explorer desktop and mobile results**

Use a semantic table at desktop widths and cards below the mobile breakpoint. Keep identical CVE, vendor/product, priority, ransomware, added date, and due date content. Reset page to 1 whenever search, filters, sort, or page size changes.

- [ ] **Step 4: Implement the accessible detail drawer**

Use the existing `Drawer` primitive. Include all source fields, priority factor breakdown, CISA/NVD links, watchlist action, a 2,000-character note field, and the **Saved on this device** label.

- [ ] **Step 5: Run focused tests and full checks**

Run: `pnpm test src/components/portal/KevPortal.test.tsx && pnpm test && pnpm lint && pnpm build`

Expected: all tests PASS, lint exits 0, and build exits 0.

- [ ] **Step 6: Commit the explorer**

```bash
git add src/components/views/VulnerabilityExplorerView.tsx src/components/vulnerabilities/VulnerabilityDrawer.tsx src/components/portal/KevPortal.tsx src/components/portal/KevPortal.test.tsx app/globals.css
git commit -m "feat: add KEV vulnerability explorer"
```

---

### Task 7: Add Vendor Intelligence and Printable Briefing

**Files:**
- Modify: `src/components/portal/KevPortal.test.tsx`
- Create: `src/components/views/VendorIntelligenceView.tsx`
- Create: `src/components/views/BriefingView.tsx`
- Modify: `src/components/portal/KevPortal.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: filtered records, `deriveBriefing`, global vendor selection, dataset metadata.
- Produces: vendor comparison/profile view, methodology, and print-ready briefing.

- [ ] **Step 1: Add failing vendor and briefing tests**

Assert selecting a vendor updates its product breakdown, zero-record vendors cannot be selected, comparisons expose counts and ransomware proportions, the briefing carries the active scope, the three priority records appear, methodology calls the measure KEV Action Priority, and the print button calls `window.print`.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `pnpm test src/components/portal/KevPortal.test.tsx -t "vendor|briefing|print|methodology"`

Expected: FAIL because both views are missing.

- [ ] **Step 3: Implement Vendor Intelligence**

Render ranked vendors, selectable vendor profile, product distribution, ransomware-linked proportion, and remediation-window comparison. Label counts as catalog entries rather than vulnerabilities present in any organization.

- [ ] **Step 4: Implement Briefing and methodology**

Render snapshot scope, deterministic headline, four metrics, priority distribution, top concentration, ransomware share, three priority records, source metadata, full score explanation, caveats, and a print action.

- [ ] **Step 5: Add print CSS**

Under `@media print`, hide navigation, filters, non-print actions, and drawers; set a white background, black text, non-breaking briefing sections, and explicit link URLs where helpful.

- [ ] **Step 6: Run focused tests and full checks**

Run: `pnpm test src/components/portal/KevPortal.test.tsx && pnpm test && pnpm lint && pnpm build`

Expected: all tests PASS, lint exits 0, and build exits 0.

- [ ] **Step 7: Commit intelligence and briefing views**

```bash
git add src/components/views/VendorIntelligenceView.tsx src/components/views/BriefingView.tsx src/components/portal/KevPortal.tsx src/components/portal/KevPortal.test.tsx app/globals.css
git commit -m "feat: add vendor intelligence and briefing"
```

---

### Task 8: Complete Polish, Documentation, Publication, and GitHub Delivery

**Files:**
- Modify: `app/globals.css`
- Modify: `README.md`
- Delete: `src/components/dashboard/KevDashboard.tsx`
- Create or update: repository preview screenshot according to the hosting workflow's supported capture path.

**Interfaces:**
- Consumes: all completed portal views.
- Produces: verified responsive release, updated documentation, published Sites deployment, and synchronized GitHub main branch.

- [ ] **Step 1: Remove the replaced dashboard**

Delete `src/components/dashboard/KevDashboard.tsx`, confirm no imports remain with:

```bash
rg "KevDashboard|components/dashboard" app src
```

Expected: no matches.

- [ ] **Step 2: Run accessibility and responsive inspection**

Use the Sites preview workflow. Inspect at 1440×900, 1024×768, 390×844, and 360×800. Keyboard-test view navigation, all filters, result rows, drawer close/focus restoration, pagination, watchlist, notes, and print action. Correct overflow, clipped labels, low contrast, missing focus, and touch targets below 44px.

- [ ] **Step 3: Inspect trust and empty/error states**

Verify source metadata on all four views; confirm known/unknown language, score disclaimer, device-only label, no-result reset, malformed snapshot error, failed fetch retry, and empty chart summaries.

- [ ] **Step 4: Update README**

Document all four views, KEV Action Priority factors and disclaimer, device-local state, test/build commands, data reproduction, live URL, GitHub portfolio purpose, and a current screenshot.

- [ ] **Step 5: Run the final local verification gate**

```bash
pnpm test
node --test scripts/prepare-kev-data.test.mjs
pnpm lint
pnpm build
git diff --check
git status --short
```

Expected: all tests PASS, lint/build exit 0, no whitespace errors, and only intended files remain modified.

- [ ] **Step 6: Commit the release candidate**

```bash
git add app src README.md package.json pnpm-lock.yaml vitest.config.ts
git add -u
git commit -m "feat: complete KEV command center portal"
```

- [ ] **Step 7: Publish to the existing Sites project**

Follow the `sites-hosting` publish procedure using the existing `.openai/hosting.json`. Do not register a new site. Record the returned deployment URL and confirm it matches the established project.

- [ ] **Step 8: Smoke-test the published URL**

Open the live site in a clean/private browser session. Verify the four views load, the snapshot record count is present, Explorer search works, a CVE drawer opens, and mobile layout has no horizontal page overflow.

- [ ] **Step 9: Push the verified commits to GitHub**

```bash
git status --short
git log --oneline --decorate -10
git push origin main
git status -sb
```

Expected: push succeeds and local `main` is aligned with `origin/main`.

- [ ] **Step 10: Report delivery evidence**

Provide the test count, lint/build results, published URL, GitHub commit SHA, feature summary, and any deliberately deferred items from the specification's exclusion list.
