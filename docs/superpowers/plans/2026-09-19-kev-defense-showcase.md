# KEV National Cyber Defense Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an exceptional public cyber-defense portfolio homepage, preserve the full KEV analyst portal at `/command-center`, and refine the portal for demonstrations without compromising truth, accessibility, or existing behavior.

**Architecture:** Reuse the immutable CISA snapshot and existing pure analytics through a new tested showcase view model. Keep the public homepage and operational portal as separate route-level compositions, share small presentation primitives, and extend URL-state handling through pure parsing/serialization helpers.

**Tech Stack:** Next.js 16 / Vinext, React 19, TypeScript 5.9, Tailwind CSS 4, Lucide React, Recharts 3, Vitest, Testing Library, ChatGPT Sites hosting.

**Spec:** `docs/superpowers/specs/2026-09-19-kev-defense-showcase-design.md`

## Global Constraints

- Retain the product name **KEV Command Center** and treat **National Cyber Defense Operations Center** only as a presentation concept.
- Always display: `Independent portfolio analysis using official public CISA KEV data. Not a U.S. government system.`
- Do not use seals, agency badges, flag treatments, or copy implying government ownership, endorsement, authorization, or operational use.
- Every intelligence value must derive from the checked-in CISA snapshot or clearly labeled project metadata.
- Use **KEV Action Priority**, never “risk score,” “CVSS,” or “official severity.”
- Preserve `Known` and `Unknown` ransomware semantics; `Unknown` never means confirmed absence.
- Default all priority calculations to the dataset release date.
- Preserve device-local watchlists and notes; do not add accounts or server persistence.
- Meet WCAG 2.2 AA intent, keyboard operation, reduced motion, and 360px layouts.
- Prefer CSS and lightweight SVG; add no video, WebGL, live third-party threat API, or general animation framework.
- Preserve the site's current public audience when publishing.

## Review Focus

1. **Legacy root query links:** `/?view=explorer` must reach `/command-center?view=explorer` without losing supported parameters.
2. **Malformed deep-link state:** unknown views, invalid page sizes, and malformed CVE values must fall back safely without breaking the portal.
3. **Empty/invalid homepage data:** the showcase must show explicit empty or validation states and must never fabricate metrics.
4. **Blocked motion or storage:** reduced-motion users and browsers denying local storage must retain complete navigation and analysis.
5. **Narrow and long content:** 360px layouts and unusually long vendor/product names must not introduce horizontal page overflow.

---

## File Map

### Create

- `src/showcase/model.ts` — pure homepage view-model derivation and threat-posture labeling.
- `src/showcase/model.test.ts` — deterministic, empty, boundary, and ordering tests.
- `src/showcase/links.ts` — command-center deep-link construction and query normalization.
- `src/showcase/links.test.ts` — legacy, malformed, and encoding tests.
- `src/showcase/useKevSnapshot.ts` — reusable validated snapshot loading state.
- `src/components/showcase/ShowcaseHome.tsx` — homepage state orchestration.
- `src/components/showcase/ShowcaseHome.test.tsx` — homepage behavior and disclosure coverage.
- `src/components/showcase/ShowcaseHeader.tsx` — responsive public navigation.
- `src/components/showcase/DefenseHero.tsx` — hero copy, actions, and intelligence visual.
- `src/components/showcase/ThreatNetworkVisual.tsx` — accessible SVG/CSS visualization.
- `src/components/showcase/IntelligenceStrip.tsx` — four source-derived headline metrics.
- `src/components/showcase/IntelligencePicture.tsx` — deterministic findings and priority records.
- `src/components/showcase/CapabilityGrid.tsx` — four mission capabilities and deep links.
- `src/components/showcase/MethodologyTrust.tsx` — source, scoring, caveats, and quality evidence.
- `src/components/showcase/CreatorProfile.tsx` — factual creator and technology presentation.
- `src/components/showcase/ShowcaseFooter.tsx` — source metadata and disclosure.
- `src/components/portal/PortalGuide.tsx` — dismissible first-visit guidance.
- `src/components/portal/PresentationBar.tsx` — presentation-mode exit and state summary.
- `app/command-center/page.tsx` — operational portal route.

### Modify

- `app/page.tsx` — render the public showcase and redirect legacy query links client-side.
- `app/layout.tsx` — broaden metadata for the showcase.
- `app/globals.css` — showcase tokens, layouts, animations, responsive, reduced-motion, and print rules.
- `src/components/portal/KevPortal.tsx` — route-safe URL state, counts, guide, and presentation mode.
- `src/components/portal/KevPortal.test.tsx` — pathname, malformed state, guide, counter, and presentation coverage.
- `src/components/portal/PortalHeader.tsx` — showcase return link and operational counters.
- `src/components/portal/PortalNavigation.tsx` — preserve `/command-center` state and improve mobile labels.
- `src/components/vulnerabilities/VulnerabilityDrawer.tsx` — selected-CVE URL synchronization.
- `src/kev/types.ts` — showcase and URL-state interfaces.
- `README.md` — public routes, showcase, verification, and Handshake submission instructions.

---

### Task 1: Derive a Truthful Showcase Intelligence Model

**Files:**
- Create: `src/showcase/model.test.ts`
- Create: `src/showcase/model.ts`
- Modify: `src/kev/types.ts`

**Interfaces:**
- Consumes: `KevDataset`, `deriveBriefing`, `calculatePriority`, dataset release date.
- Produces: `ShowcaseModel`, `ThreatPosture`, and `deriveShowcaseModel(dataset: KevDataset): ShowcaseModel`.

- [ ] **Step 1: Add the showcase types and failing tests**

Add to `src/kev/types.ts`:

```ts
export type ThreatPosture = "Critical action" | "Heightened attention" | "Active monitoring";
export interface ShowcaseModel {
  total:number;
  ransomwareCount:number;
  vendorCount:number;
  criticalCount:number;
  posture:ThreatPosture;
  headline:string;
  ransomwareSummary:string;
  topVendor:{name:string;count:number}|null;
  priorityRecords:KevRecord[];
  asOfDate:string;
}
```

Create table-driven tests proving: dataset values are calculated, ties are deterministic, priority records cap at three, empty datasets return zero values and `Active monitoring`, 0 critical is `Active monitoring`, 1 critical is `Heightened attention`, and 10 critical is `Critical action`.

- [ ] **Step 2: Run the model tests and confirm RED**

Run: `pnpm test src/showcase/model.test.ts`

Expected: FAIL because `./model` does not exist.

- [ ] **Step 3: Implement the pure model**

Implement:

```ts
export function threatPosture(criticalCount:number):ThreatPosture {
  if (criticalCount >= 10) return "Critical action";
  if (criticalCount > 0) return "Heightened attention";
  return "Active monitoring";
}

export function deriveShowcaseModel(dataset:KevDataset):ShowcaseModel {
  const asOfDate=dataset.dateReleased.slice(0,10);
  const briefing=deriveBriefing(dataset.records,asOfDate);
  const criticalCount=briefing.priorityDistribution.Critical;
  return {
    total:briefing.total,
    ransomwareCount:briefing.ransomwareCount,
    vendorCount:briefing.vendors,
    criticalCount,
    posture:threatPosture(criticalCount),
    headline:briefing.headline,
    ransomwareSummary:briefing.ransomwareSummary,
    topVendor:briefing.topVendor,
    priorityRecords:briefing.priorityRecords,
    asOfDate,
  };
}
```

- [ ] **Step 4: Run model and full domain tests**

Run: `pnpm test src/showcase/model.test.ts src/kev/insights.test.ts src/kev/priority.test.ts`

Expected: all tests PASS.

- [ ] **Step 5: Commit the model**

```bash
git add src/showcase/model.ts src/showcase/model.test.ts src/kev/types.ts
git commit -m "feat: derive showcase intelligence model"
```

---

### Task 2: Add Safe Deep Links and Route Compatibility

**Files:**
- Create: `src/showcase/links.test.ts`
- Create: `src/showcase/links.ts`
- Create: `app/command-center/page.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `PortalView`, `URLSearchParams`, optional CVE ID.
- Produces: `buildCommandCenterUrl(input): string`, `normalizePortalParams(params): URLSearchParams`, and separate route entrypoints.

- [ ] **Step 1: Write failing link tests**

Cover:

```ts
expect(buildCommandCenterUrl({view:"explorer",cve:"CVE-2026-0001"}))
  .toBe("/command-center?view=explorer&cve=CVE-2026-0001");
expect(normalizePortalParams(new URLSearchParams("view=wrong&rows=13")).toString()).toBe("");
expect(normalizePortalParams(new URLSearchParams("view=vendors&vendor=A%26B")).get("vendor")).toBe("A&B");
```

Also prove supported legacy parameters `view`, `vendor`, `year`, `ransomware`, `search`, `product`, `priority`, `remediation`, `sort`, `page`, `rows`, `cve`, and `present` survive normalization while unknown keys are removed.

- [ ] **Step 2: Run link tests and confirm RED**

Run: `pnpm test src/showcase/links.test.ts`

Expected: FAIL because `./links` does not exist.

- [ ] **Step 3: Implement parsing and serialization**

Use explicit allowlists. Accept `view` only from `command|explorer|vendors|briefing`, `sort` only from the existing `ExplorerSort` values, `rows` only from `25|50|100`, positive integer pages only, `present=1` only, and CVE values matching `/^CVE-\d{4}-\d{4,}$/i`.

- [ ] **Step 4: Create route entrypoints**

Set `app/command-center/page.tsx` to:

```tsx
import KevPortal from "@/src/components/portal/KevPortal";
export default function CommandCenterPage(){return <KevPortal/>}
```

Temporarily set `app/page.tsx` to render a minimal client legacy-router wrapper that sends a root URL containing supported query state to `/command-center` and otherwise renders a semantic placeholder headed `KEV Command Center`. This placeholder is replaced in Task 4.

- [ ] **Step 5: Run tests and build**

Run: `pnpm test src/showcase/links.test.ts && pnpm build`

Expected: tests PASS and both `/` and `/command-center` appear in the build output.

- [ ] **Step 6: Commit routing**

```bash
git add src/showcase/links.ts src/showcase/links.test.ts app/page.tsx app/command-center/page.tsx
git commit -m "feat: separate showcase and command center routes"
```

---

### Task 3: Extract Reusable Validated Snapshot Loading

**Files:**
- Create: `src/showcase/useKevSnapshot.ts`
- Create: `src/showcase/useKevSnapshot.test.tsx`
- Modify: `src/components/portal/KevPortal.tsx`

**Interfaces:**
- Consumes: `/data/kev-clean.json`, `isKevDataset`.
- Produces: `useKevSnapshot(): {dataset:KevDataset|null;status:SnapshotStatus;retry():void}` with `SnapshotStatus = "loading"|"ready"|"fetch-error"|"format-error"`.

- [ ] **Step 1: Write failing hook harness tests**

Use a small test component to prove loading→ready, rejected fetch→fetch-error→retry→ready, and invalid body→format-error. Verify unmount prevents state updates.

- [ ] **Step 2: Run and confirm RED**

Run: `pnpm test src/showcase/useKevSnapshot.test.tsx`

Expected: FAIL because the hook does not exist.

- [ ] **Step 3: Implement the hook**

Move the existing guarded fetch, validation, retry counter, and active cleanup from `KevPortal` into the hook. Expose a stable `retry` callback that returns status to `loading` before incrementing the request key.

- [ ] **Step 4: Refactor the portal to consume the hook**

Remove duplicated fetching from `KevPortal`; preserve its exact loading, fetch-error, format-error, and retry copy.

- [ ] **Step 5: Run hook and portal regression tests**

Run: `pnpm test src/showcase/useKevSnapshot.test.tsx src/components/portal/KevPortal.test.tsx`

Expected: all tests PASS.

- [ ] **Step 6: Commit loading extraction**

```bash
git add src/showcase/useKevSnapshot.ts src/showcase/useKevSnapshot.test.tsx src/components/portal/KevPortal.tsx
git commit -m "refactor: share validated KEV snapshot loading"
```

---

### Task 4: Build the Semantic Public Showcase

**Files:**
- Create: `src/components/showcase/ShowcaseHome.test.tsx`
- Create: `src/components/showcase/ShowcaseHome.tsx`
- Create: `src/components/showcase/ShowcaseHeader.tsx`
- Create: `src/components/showcase/DefenseHero.tsx`
- Create: `src/components/showcase/IntelligenceStrip.tsx`
- Create: `src/components/showcase/IntelligencePicture.tsx`
- Create: `src/components/showcase/CapabilityGrid.tsx`
- Create: `src/components/showcase/MethodologyTrust.tsx`
- Create: `src/components/showcase/CreatorProfile.tsx`
- Create: `src/components/showcase/ShowcaseFooter.tsx`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `useKevSnapshot`, `deriveShowcaseModel`, `buildCommandCenterUrl`.
- Produces: complete semantic homepage with real intelligence and safe failure states.

- [ ] **Step 1: Write failing homepage tests**

Prove the homepage:

- Always displays `Not a U.S. government system`.
- Shows loading structure, retryable fetch failure, distinct invalid-snapshot failure, and a ready state.
- Renders the four calculated values and three priority records.
- Links the primary CTA to `/command-center`.
- Links a priority CVE to `/command-center?view=explorer&cve=...`.
- Keeps methodology and creator content visible when the data request fails.
- Opens and closes the mobile menu with buttons, closes on Escape, and returns focus to the menu trigger.

- [ ] **Step 2: Run homepage tests and confirm RED**

Run: `pnpm test src/components/showcase/ShowcaseHome.test.tsx`

Expected: FAIL because showcase components do not exist.

- [ ] **Step 3: Implement the orchestration component**

`ShowcaseHome` loads the snapshot once, derives the model only when valid, and composes all sections. Render static hero/methodology/creator content in every state; replace only data-dependent regions with skeleton, retry, validation, or ready content.

- [ ] **Step 4: Implement focused semantic sections**

Use one `h1`, sequential `h2` headings, `<nav aria-label="Showcase">`, `<dl>` for metric values, `<ol>` for priority records, and explicit external-link labels. Use this exact hero copy:

```text
PUBLIC CYBER INTELLIGENCE / CISA KEV ANALYSIS
Confirmed exploitation. Prioritized action. Defensible intelligence.
Turn CISA's public Known Exploited Vulnerabilities catalog into an explainable action queue for security review.
```

Use the exact disclosure from Global Constraints in the hero and footer.

- [ ] **Step 5: Replace the root placeholder and update metadata**

Render `<ShowcaseHome/>` at `/`. Set metadata title to `KEV Command Center | Cyber Defense Intelligence Showcase` and describe it as an independent analysis by Adedayo A. Onasanya.

- [ ] **Step 6: Run homepage, routing, and portal tests**

Run: `pnpm test src/components/showcase/ShowcaseHome.test.tsx src/showcase/links.test.ts src/components/portal/KevPortal.test.tsx`

Expected: all tests PASS.

- [ ] **Step 7: Commit the semantic showcase**

```bash
git add app/page.tsx app/layout.tsx src/components/showcase
git commit -m "feat: add public KEV defense showcase"
```

---

### Task 5: Create the Exceptional Cyber-Defense Visual System

**Files:**
- Create: `src/components/showcase/ThreatNetworkVisual.tsx`
- Create: `src/components/showcase/ThreatNetworkVisual.test.tsx`
- Modify: `src/components/showcase/DefenseHero.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `ShowcaseModel.posture`, `criticalCount`, `ransomwareCount`, `asOfDate`.
- Produces: accessible visual composition with deterministic content and reduced-motion support.

- [ ] **Step 1: Write failing visual semantics tests**

Prove the component exposes a concise text summary containing posture and critical count, marks decorative SVG as `aria-hidden=true`, contains no canvas/video element, and renders meaningful content when animation classes are absent.

- [ ] **Step 2: Run and confirm RED**

Run: `pnpm test src/components/showcase/ThreatNetworkVisual.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the SVG/CSS visualization**

Build a bounded `<figure>` with a hidden accessible summary, three concentric scan rings, twelve static nodes, six connecting paths, a central shield glyph, and a compact posture panel. Node positions are fixed presentation geometry; only counts and labels are data-driven.

- [ ] **Step 4: Add visual tokens and layouts**

Extend `app/globals.css` with scoped `.showcase-*` rules: layered blue-black backgrounds, cyan/emerald/amber/coral tokens, grid texture, editorial hero typography, bordered glass surfaces, and responsive grids. Do not change the meaning of existing portal classes.

- [ ] **Step 5: Add restrained motion and reduced-motion overrides**

Use CSS keyframes only for slow scan rotation, pulse opacity, and short entrance translation. Under `@media (prefers-reduced-motion: reduce)`, set animation and transition durations to `0.01ms`, disable transforms, and show final counter text immediately.

- [ ] **Step 6: Add explicit 360px and long-content protection**

At `max-width: 640px`, stack hero/actions/metrics, allow `overflow-wrap:anywhere` on dynamic names, prevent fixed minimum content widths, and keep the document at `overflow-x:clip` with component-level wrapping rather than clipped controls.

- [ ] **Step 7: Run visual tests, lint, and build**

Run: `pnpm test src/components/showcase/ThreatNetworkVisual.test.tsx src/components/showcase/ShowcaseHome.test.tsx && pnpm lint && pnpm build`

Expected: tests PASS, lint exits 0, build completes.

- [ ] **Step 8: Commit visual system**

```bash
git add app/globals.css src/components/showcase/DefenseHero.tsx src/components/showcase/ThreatNetworkVisual.tsx src/components/showcase/ThreatNetworkVisual.test.tsx
git commit -m "feat: add national cyber defense visual system"
```

---

### Task 6: Add Command-Center URL State and Operational Refinements

**Files:**
- Create: `src/components/portal/PortalGuide.tsx`
- Create: `src/components/portal/PresentationBar.tsx`
- Modify: `src/components/portal/KevPortal.tsx`
- Modify: `src/components/portal/KevPortal.test.tsx`
- Modify: `src/components/portal/PortalHeader.tsx`
- Modify: `src/components/portal/PortalNavigation.tsx`
- Modify: `src/components/vulnerabilities/VulnerabilityDrawer.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: normalized portal parameters, current filters, analyst state, selected CVE.
- Produces: shareable supported state, counters, guide, showcase return, and presentation mode.

- [ ] **Step 1: Add failing portal tests**

Add cases proving:

- `/command-center?view=explorer&vendor=Acme` initializes that view and filter.
- Invalid view/page-size/page values use safe defaults.
- Navigation retains `/command-center` pathname.
- Opening a record adds `cve`, closing removes it, and a valid initial `cve` opens the drawer.
- Header shows active-filter and watchlist counts.
- First-visit guide can be dismissed; storage denial does not block dismissal for the session.
- `present=1` applies presentation mode and the exit action removes only `present`.
- A homepage return link targets `/`.

- [ ] **Step 2: Run the new tests and confirm RED**

Run: `pnpm test src/components/portal/KevPortal.test.tsx`

Expected: new cases FAIL while existing cases remain green.

- [ ] **Step 3: Centralize portal URL state**

Initialize view and supported filters from `normalizePortalParams`. Replace direct `history.replaceState` calls with one helper that starts from the current URL, updates only owned keys, keeps `/command-center`, and preserves unrelated supported portal state.

- [ ] **Step 4: Synchronize selected CVE**

Lift selected CVE ownership from the explorer/drawer boundary as needed. A valid CVE present in the current result set opens; a syntactically valid missing CVE remains closed without error.

- [ ] **Step 5: Add operational counters and return action**

Pass `activeFilterCount` and `watchlistCount` to `PortalHeader`. Show textual labels, not color alone. Add a `/` link labeled `Project overview`.

- [ ] **Step 6: Add guide and presentation mode**

Use session state plus best-effort local storage key `kev-command-center:guide-dismissed:v1`. Presentation mode hides filter controls and secondary chrome through a root class but retains source, disclosure, selected view, keyboard access, and an explicit **Exit presentation mode** button.

- [ ] **Step 7: Run portal and full component tests**

Run: `pnpm test src/components/portal/KevPortal.test.tsx src/components/showcase/ShowcaseHome.test.tsx`

Expected: all tests PASS.

- [ ] **Step 8: Commit portal refinements**

```bash
git add src/components/portal src/components/vulnerabilities/VulnerabilityDrawer.tsx app/globals.css
git commit -m "feat: refine command center presentation workflows"
```

---

### Task 7: Complete Documentation and Release Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-09-19-kev-defense-showcase-design.md` only if implementation revealed a resolved factual mismatch.

**Interfaces:**
- Consumes: completed routes, commands, public URL, GitHub URL.
- Produces: accurate local, portfolio, and Handshake submission guidance.

- [ ] **Step 1: Update README**

Document:

- `/` as the public showcase.
- `/command-center` as the analyst workspace.
- The independent-project disclosure.
- The four homepage intelligence values and how they are calculated.
- Deep-link and presentation-mode behavior.
- Existing installation, test, lint, and build commands.
- Handshake submission links: public site first, GitHub repository second.

- [ ] **Step 2: Run content safety checks**

Run:

```bash
rg -n "official government platform|government-operated|CISA system|live attack|real-time attack" app src README.md
rg -n "Not a U.S. government system" src/components/showcase README.md
```

Expected: the first search has no matches; the second finds the disclosure in the rendered showcase source and README.

- [ ] **Step 3: Run the full verification matrix**

Run:

```bash
node --test scripts/prepare-kev-data.test.mjs
pnpm test
pnpm lint
pnpm build
```

Expected: data test PASS; all Vitest files/tests PASS; ESLint exits 0; Vinext production build completes with both `/` and `/command-center`.

- [ ] **Step 4: Perform manual release checks**

Start `pnpm dev` and verify:

1. Desktop homepage hierarchy and all links.
2. 360px homepage and command center with no horizontal scrolling.
3. Keyboard navigation, mobile menu focus return, dialog focus return, and presentation-mode exit.
4. Reduced-motion mode without ambient scanning or counter interpolation.
5. Root legacy query redirect, priority deep link, invalid URL parameters, and retry states.
6. Print preview for the briefing.

Record the outcome in the plan execution ledger; do not add generated screenshots unless explicitly requested.

- [ ] **Step 5: Commit documentation**

```bash
git add README.md docs/superpowers/specs/2026-09-19-kev-defense-showcase-design.md
git commit -m "docs: prepare KEV showcase release"
```

---

### Task 8: Deliver GitHub and Public Production Release

**Files:**
- No product-file changes after the verified release commit.

**Interfaces:**
- Consumes: verified branch HEAD and unchanged production archive.
- Produces: GitHub branch/merge result and successful public Sites deployment at the existing URL.

- [ ] **Step 1: Confirm exact release state**

Run:

```bash
git status --short
git rev-parse --verify HEAD
git log --oneline --decorate -12
```

Expected: clean worktree and a complete release commit at HEAD.

- [ ] **Step 2: Perform the required whole-branch review**

Use the execution skill's final review flow against the merge base and HEAD, with special attention to the five Review Focus items. Fix Critical or Important findings through RED→GREEN tests and rerun the complete suite.

- [ ] **Step 3: Push through the repository's authenticated GitHub workflow**

Push the reviewed feature branch, then merge only through the method authorized by the repository/user. Confirm the remote default branch contains the exact reviewed source tree before packaging.

- [ ] **Step 4: Build and package the exact pushed revision**

Use the Sites hosting workflow to select the compatible execution profile, build once, package the unchanged commit, and preserve the existing project ID and public access mode.

- [ ] **Step 5: Save and deploy publicly**

Save one version for the pushed commit and deploy it using the existing non-private publishing path. Poll the returned deployment ID until `succeeded` or `failed`; never infer success from the URL alone.

- [ ] **Step 6: Verify handoff**

Confirm the successful deployment response returns `https://cisa-kev-risk-dashboard.onadainnovative.chatgpt.site`. Report the homepage, command-center URL, GitHub repository, verification counts, and any ledgered rulings or deferred minors.
