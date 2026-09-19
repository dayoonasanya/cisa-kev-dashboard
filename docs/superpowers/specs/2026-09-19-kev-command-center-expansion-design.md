# KEV Command Center Expansion Design

**Date:** 2026-09-19

**Status:** Ready for user review

**Project:** CISA KEV Risk Dashboard

**Owner:** Adedayo A. Onasanya

## 1. Purpose

Transform the existing single-page CISA Known Exploited Vulnerabilities dashboard into a polished, portfolio-grade security operations portal. The finished experience should demonstrate security analysis, data interpretation, interface design, and production engineering to Handshake reviewers and prospective employers.

This release is a hybrid foundation: it will behave like a focused analyst workspace while remaining a privacy-safe static client application. It will not require accounts, a private database, or confidential organizational data. The code will keep browser-only analyst state isolated so a future authenticated persistence layer can replace it without rewriting the core analytics.

## 2. Success Criteria

The expansion succeeds when:

1. A first-time viewer understands the primary security finding within ten seconds.
2. An analyst can find a specific CVE, vendor, product, ransomware-linked record, or remediation window quickly.
3. Selecting a vulnerability reveals enough context to explain why it matters and what CISA requires.
4. Every derived score is transparent, reproducible, and clearly distinguished from CVSS or an organizational risk assessment.
5. The portal works on mobile and desktop, supports keyboard navigation, and respects reduced-motion preferences.
6. The project builds cleanly, has automated tests for analytics and interaction-critical logic, publishes successfully to the existing Sites URL, and is pushed to the existing GitHub repository.

## 3. Scope

### Included

- A persistent portal shell with responsive navigation.
- An executive overview with headline findings and coordinated filters.
- A searchable and sortable vulnerability explorer with pagination.
- A vulnerability detail drawer containing source fields, remediation timing, evidence labels, and official links.
- Vendor and product intelligence views derived from the same CISA snapshot.
- A transparent prioritization model based only on available KEV fields.
- A browser-local analyst watchlist and notes workflow.
- A print-friendly executive briefing.
- A methodology and data-quality view.
- Loading, empty, error, and no-results states.
- Updated project documentation and screenshots suitable for Handshake submission.

### Excluded from this release

- User registration, authentication, teams, or role-based access.
- Server-side databases or synchronization across devices.
- Vulnerability scanning, asset inventory, or claims about an organization's exposure.
- Invented CVSS values, exploit maturity, financial loss, severity, or threat intelligence not present in the source data.
- Automatic live refresh from third-party APIs at runtime.
- Email, ticketing, SIEM, or SOAR integrations.

## 4. Information Architecture

The portal will use four primary views inside one application shell:

1. **Command Center** — executive headline, core metrics, coordinated charts, priority queue preview, and active-filter summary.
2. **Vulnerability Explorer** — full-text search, advanced filters, sortable columns, pagination, watchlist controls, and record details.
3. **Vendor Intelligence** — vendor and product concentration, ransomware-linked proportions, remediation-window comparisons, and selectable vendor profiles.
4. **Briefing & Methodology** — printable briefing, source metadata, score explanation, caveats, definitions, and data-quality notes.

Navigation will use URL query parameters for the active view and shareable filters where practical. Selecting a CVE opens an accessible drawer rather than navigating away, preserving analytical context.

## 5. Visual Direction

The visual language is a refined security operations command center rather than a generic admin template:

- Deep navy canvas with layered blue-black surfaces.
- Cyan as the primary analytical accent, amber for deadlines, and coral-red only for confirmed ransomware evidence or urgent priority.
- High-contrast typography with a compact technical label style and generous editorial headlines.
- Subtle grid, glow, and scanning-line details used sparingly; content remains readable without decoration.
- Consistent cards, table density, spacing, focus rings, and status chips.
- Motion limited to short transitions and count/filter feedback, disabled when reduced motion is requested.
- Mobile navigation becomes a compact top bar and sheet; tables become stacked record cards where necessary.

The dashboard will identify the work as **KEV Command Center** with a restrained byline for Adedayo A. Onasanya and his Computing & Security Technology focus.

## 6. Component Architecture

The current monolithic `KevDashboard.tsx` will be decomposed into focused units.

### Application shell

- `KevPortal` owns dataset loading, global filters, active record, and view selection.
- `PortalSidebar` and `MobileNavigation` render the responsive navigation.
- `PortalHeader` displays source freshness, catalog version, and global actions.

### Domain and analytics

- `src/kev/types.ts` remains the source of dataset types and gains explicit derived-model types.
- `src/kev/metrics.ts` retains pure aggregate calculations.
- `src/kev/query.ts` owns search, filtering, sorting, and pagination.
- `src/kev/priority.ts` owns the transparent prioritization calculation and explanation.
- `src/kev/insights.ts` produces deterministic headline and comparison sentences from calculated values.

### Views

- `CommandCenterView` contains metrics, priority preview, and the strongest three or four charts.
- `VulnerabilityExplorerView` contains search, filter controls, results, sorting, and pagination.
- `VendorIntelligenceView` contains vendor/product comparisons and vendor selection.
- `BriefingView` contains a print-ready summary and methodology.

### Reusable interaction components

- `FilterBar`, `MetricCard`, `InsightCard`, and `ChartCard` provide consistent presentation.
- `VulnerabilityTable` and `VulnerabilityCardList` provide desktop and mobile result formats.
- `VulnerabilityDrawer` presents the selected record.
- `PriorityBadge` displays score band and opens the explanation.
- `WatchlistButton` and `AnalystNotes` use a dedicated storage adapter.

No component will calculate domain metrics inline. Views consume tested pure functions and render their results.

## 7. Data Flow and State

1. `KevPortal` fetches `/data/kev-clean.json` once and validates the expected top-level shape before rendering analytical views.
2. Raw records remain immutable in memory.
3. Global filters are normalized into a single filter model.
4. Pure selectors derive filtered records, summary metrics, charts, table results, and briefing insights.
5. Search, sort, page, selected CVE, and active view are interaction state. Shareable state is reflected in URL parameters; transient drawer state may remain local.
6. Watchlist IDs and analyst notes are stored through a versioned local-storage adapter. Storage failures fall back to session memory and display a non-blocking notice.

The browser-local analyst state must be visibly labeled **Saved on this device** so users do not mistake it for a shared case-management system.

## 8. Prioritization Model

The application will use the term **KEV Action Priority**, never “risk score” or “CVSS.” It is a portfolio demonstration derived from fields present in the catalog, not an official CISA rating.

Each record receives a 0–100 score from four documented signals:

- **Confirmed ransomware use: 40 points** when `knownRansomwareCampaignUse` is `Known`.
- **Short remediation window: up to 30 points**: 30 for 0–7 days, 22 for 8–14, 14 for 15–21, 8 for 22–30, and 3 for longer windows.
- **Catalog recency: up to 20 points** based on time since `dateAdded`: 20 within 90 days, 14 within one year, 8 within three years, and 3 thereafter.
- **Due-date status: up to 10 points**: 10 if the federal due date has passed, 6 if due within 30 days, and 2 otherwise.

Bands are `Critical` (80–100), `High` (60–79), `Elevated` (40–59), and `Tracked` (0–39). The UI will show the contributing signals for every score and state that users must combine KEV evidence with their own asset exposure and business impact.

For reproducibility, all calculations use an explicit `asOfDate`. The interface defaults it to the dataset release date rather than the viewer's current clock.

## 9. Explorer Behavior

- Search covers CVE ID, vendor, product, vulnerability name, description, required action, and notes.
- Filters include vendor, product, year added, ransomware status, priority band, and remediation-window band.
- Sort options include action priority, newest catalog addition, earliest due date, vendor, and CVE.
- Default ordering is descending KEV Action Priority, then newest catalog addition, then CVE ID.
- Desktop shows a compact data table; mobile shows cards with the same information hierarchy.
- Pagination defaults to 25 records and supports 25, 50, and 100 rows.
- Empty results retain the active controls and offer a one-click reset.
- Clicking a row or CVE opens the record drawer without losing the current result position.

## 10. Vulnerability Detail Drawer

The drawer will include:

- CVE ID, vendor, product, vulnerability name, and concise description.
- KEV Action Priority band, numeric score, and factor-by-factor explanation.
- Ransomware status with the exact distinction between `Known` and `Unknown`.
- Date added, federal due date, and assigned remediation-window length.
- Required action and catalog notes.
- Known CWE values when present.
- Watchlist toggle and device-local analyst note.
- Links to the official CISA catalog and the NVD CVE record.

Unknown or absent source fields display `Not provided by CISA`; the interface will not infer values.

## 11. Briefing and Export

The briefing view will assemble deterministic content from the current filter state:

- Scope and snapshot metadata.
- Headline finding.
- Four summary metrics.
- Priority distribution.
- Top vendor/product concentration.
- Ransomware-linked share.
- Three highest-priority records in the current view.
- Caveats and methodology.

The primary export is browser print/PDF using a dedicated print stylesheet. This avoids a new document-generation dependency and produces a shareable artifact for reviewers.

## 12. Error Handling and Trust

- Dataset fetch failure produces a clear recovery state with a retry action.
- Invalid dataset shape produces a separate “snapshot format not recognized” message.
- Chart sections handle empty data without rendering misleading axes.
- Local-storage denial or quota errors never block analysis.
- External links open safely with `noopener`/`noreferrer` behavior.
- Every statistic and chart derives from the same filtered record set unless explicitly labeled as catalog-wide.
- Dataset release date, version, record count, source link, and limitations remain visible from every view.

## 13. Accessibility and Responsive Requirements

- Semantic landmarks and heading hierarchy.
- Keyboard-operable navigation, table rows, drawer, filters, pagination, and watchlist actions.
- Visible focus states meeting contrast requirements.
- Text labels supplement all colors and icons.
- Charts have concise text takeaways and accessible summaries.
- Drawer focus is trapped and restored on close by the existing accessible UI primitive.
- Touch targets are at least 44px where practical.
- Layout remains functional at 360px width and scales cleanly through large desktop screens.

## 14. Testing Strategy

### Unit tests

- Search normalization and multi-field matches.
- Combined filters.
- Deterministic sorting and pagination boundaries.
- Every KEV Action Priority factor, band threshold, and tie-breaker.
- Insight sentence calculations.
- Local-storage serialization, versioning, and failure fallback.

### Component tests

- Explorer filter changes and reset behavior.
- Row selection opens the correct vulnerability.
- Drawer content and score explanation.
- Watchlist and notes persistence behavior.
- Empty and dataset-error states.

### Release verification

- Full automated test suite.
- Lint and production build.
- Desktop and mobile visual inspection.
- Keyboard navigation and print-preview inspection.
- Published URL smoke test in a private session.

## 15. Delivery Sequence

1. Extract and test domain query, priority, and insight functions.
2. Build the portal shell and design tokens.
3. Rebuild the overview as the Command Center.
4. Add the explorer and detail drawer.
5. Add vendor intelligence.
6. Add watchlist, notes, and local persistence.
7. Add briefing, print styles, and methodology.
8. Complete accessibility, responsive, and visual polish.
9. Verify, publish to the existing Sites project, update README and screenshots, commit, and push to GitHub.

## 16. Future Extension Boundary

The storage adapter and domain selectors form the upgrade seam for a later operational release. A future authenticated backend may replace local watchlists and notes with per-user records, but it must not change the analytics API or reinterpret the CISA source fields. Live data refresh, asset inventory, and organizational exposure correlation remain separate future projects requiring their own security and privacy designs.
