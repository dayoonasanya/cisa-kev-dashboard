# KEV National Cyber Defense Showcase Design

**Date:** 2026-09-19

**Status:** Ready for user review

**Project:** CISA KEV Command Center

**Owner:** Adedayo A. Onasanya

## 1. Purpose

Transform the existing KEV Command Center into an exceptional public cybersecurity portfolio experience for Handshake reviewers, recruiters, and technical audiences. The release will add a cinematic public homepage and refine the operational dashboard without weakening its existing analytics, tests, accessibility, or trust boundaries.

The visual direction is a national cyber-defense operations center: authoritative, precise, and technically credible. The site must never claim to be a CISA or United States government system. It will identify itself as an independent portfolio analysis built from official public CISA data.

## 2. Success Criteria

The release succeeds when:

1. A first-time visitor understands the project, its public data source, and its strongest security finding within ten seconds.
2. The homepage feels government-grade and memorable without becoming theatrical, misleading, or difficult to use.
3. A visitor can enter the existing analytical workspace in one obvious action.
4. Every displayed statistic and intelligence statement is calculated from the checked-in CISA snapshot or clearly labeled project metadata.
5. The creator's role, technical contribution, testing evidence, and Computing & Security Technology focus are visible without overpowering the product.
6. Existing filtering, prioritization, watchlist, notes, briefing, and methodology workflows continue to work.
7. The experience remains usable at 360px width, by keyboard, with a screen reader, and with reduced motion enabled.
8. Automated tests, lint, production build, GitHub delivery, and public deployment all pass before release.

## 3. Audience and Positioning

Primary audiences:

- Handshake AI Skills Studio reviewers.
- Cybersecurity and software-engineering recruiters.
- Hiring managers evaluating analytical thinking, frontend engineering, testing, accessibility, and communication.
- Technical peers reviewing the GitHub repository.

The project will retain the product name **KEV Command Center**. The homepage may use the presentation label **National Cyber Defense Operations Center** as a visual concept, paired with the permanent disclosure:

> Independent portfolio analysis using official public CISA KEV data. Not a U.S. government system.

No seal, agency badge, flag treatment, or wording may imply government ownership, endorsement, authorization, or operational use.

## 4. Information Architecture

### Public homepage: `/`

The homepage introduces the mission, current intelligence picture, project capabilities, methodology, and creator. It contains no private or user-specific state.

### Operational workspace: `/command-center`

The existing four-view analytical portal moves to this route:

- Command Center
- Vulnerability Explorer
- Vendor Intelligence
- Briefing & Methodology

Existing query-driven view and filter state remains shareable. The portal's internal navigation must preserve the `/command-center` pathname.

### Compatibility

Old root-level view query links will be interpreted and redirected to the matching `/command-center` state where practical. No existing analytics behavior or stored analyst state will be discarded.

## 5. Homepage Experience

### 5.1 Header

A restrained fixed header contains:

- KEV Command Center identity.
- Public intelligence status indicator.
- Navigation anchors for Intelligence, Capabilities, Methodology, and About.
- Primary **Enter Command Center** action.
- Mobile navigation with equivalent links and a visible close action.

### 5.2 Hero

The first viewport contains:

- Technical eyebrow: `PUBLIC CYBER INTELLIGENCE / CISA KEV ANALYSIS`.
- Headline: **Confirmed exploitation. Prioritized action. Defensible intelligence.**
- Concise explanation of what the project analyzes and why it matters.
- Primary **Enter Command Center** action.
- Secondary **View Methodology** action.
- A persistent independent-project disclosure.
- A right-side intelligence visualization constructed from CSS, SVG, and real dataset metrics rather than decorative stock imagery.

The visualization combines a restrained network field, scanning arc, status nodes, and a compact priority readout. It must remain meaningful when motion is disabled.

### 5.3 Intelligence strip

Four real values derived from the dataset appear immediately below the hero:

- Total KEV records.
- Confirmed ransomware-linked records.
- Unique vendors represented.
- Critical KEV Action Priority records as of the dataset release date.

Values animate only after entering the viewport and appear immediately under reduced motion.

### 5.4 Current intelligence picture

This section presents deterministic findings from the existing briefing model:

- Primary headline insight.
- Ransomware-linked share.
- Highest-concentration vendor and product.
- Three highest-priority vulnerabilities.

Selecting a vulnerability opens its detail context in `/command-center` through a shareable URL.

### 5.5 Mission capabilities

Four capability panels explain:

1. Confirmed exploitation tracking.
2. Ransomware campaign intelligence.
3. Vendor and product concentration analysis.
4. Transparent remediation prioritization.

Each panel includes a concise evidence statement and a link into the relevant command-center view.

### 5.6 Methodology and trust

The homepage explains:

- The official CISA KEV source.
- The reproducible snapshot date.
- The KEV Action Priority model and its four inputs.
- The distinction between catalog evidence and organizational exposure.
- The meaning of `Known` and `Unknown` ransomware status.
- Browser-local watchlists and notes.
- Automated validation and test coverage.

### 5.7 Creator showcase

The creator section presents:

- **Adedayo A. Onasanya**.
- Computing & Security Technology, Drexel University.
- Focus areas: secure full-stack engineering, network and cloud architecture, and data-informed security operations.
- Technology used in this project.
- Links to GitHub and the live command center.

The tone is confident and factual. It must not introduce unverified employment titles, security clearances, government affiliations, or certifications not already approved for the project.

### 5.8 Final call to action and footer

The closing section invites the visitor to enter the command center or inspect the source. The footer repeats the source, license, snapshot metadata, creator credit, and independent-project disclosure.

## 6. Visual System

The release extends the current dark interface rather than replacing it.

- **Canvas:** blue-black and deep navy layers.
- **Primary accent:** electric cyan for interaction and active intelligence.
- **Operational accent:** emerald for online/validated states.
- **Attention accent:** amber for remediation timing.
- **Critical accent:** coral-red only for confirmed ransomware evidence or critical priority.
- **Typography:** large editorial display type paired with compact technical labels and highly readable body text.
- **Surfaces:** thin borders, controlled translucency, subtle radial light, and sparse grid texture.
- **Motion:** short reveals, slow ambient scanning, data-counter transitions, and restrained pointer response. No continuous movement may compete with reading.

The experience must avoid generic dashboard cards, excessive neon, fake terminal text, flashing warnings, military imagery, and decorative effects that reduce credibility.

## 7. Command-Center Refinements

The operational workspace retains its current information architecture and gains focused improvements:

- A clear **Overview** or **Return to showcase** action.
- Stronger mobile navigation and header hierarchy.
- A compact global threat-posture summary derived from the active dataset scope.
- Visible watchlist count and active-filter count.
- Improved first-visit guidance that can be dismissed without storage being required.
- More polished record detail hierarchy and evidence labeling.
- Shareable URLs for selected view, filters, and selected CVE where supported.
- A presentation mode that minimizes controls and emphasizes key findings for demonstrations and print capture.
- Refined loading, invalid-snapshot, unavailable-storage, no-results, and empty-chart states.

No new scoring inputs, private data, authentication, backend storage, live vulnerability scanning, or organizational exposure claims are introduced.

## 8. Component Architecture

### Routing and data

- `app/page.tsx` renders the public showcase.
- `app/command-center/page.tsx` renders the existing `KevPortal`.
- A shared dataset loader validates `/data/kev-clean.json` and exposes immutable records plus derived homepage intelligence.
- Homepage calculations reuse the existing pure `metrics`, `priority`, and `insights` modules.

### Homepage components

- `ShowcaseHeader`
- `DefenseHero`
- `IntelligenceStrip`
- `ThreatNetworkVisual`
- `IntelligencePicture`
- `CapabilityGrid`
- `MethodologyTrust`
- `CreatorProfile`
- `ShowcaseFooter`

Components remain focused: data derivation stays in pure domain modules or a page-level view model, not inside presentation components.

### Shared presentation primitives

Reusable tokens and small primitives may be added for technical labels, status indicators, section headings, disclosure banners, and motion wrappers. Existing command-center primitives remain the source of truth where appropriate.

## 9. Data Flow

1. The homepage fetches and validates the same generated CISA snapshot used by the command center.
2. A pure showcase view-model function calculates headline metrics, top records, and deterministic findings using the dataset release date as `asOfDate`.
3. The homepage renders validated data only. It does not write analyst state.
4. Deep links encode the target command-center view and relevant CVE or filter state.
5. The command center reads supported URL state, applies normalized filters, and preserves existing device-local watchlists and notes.

All user-facing numbers must be traceable to the snapshot. Animated counters animate presentation only; they never synthesize changing values.

## 10. Error Handling

- While loading, the homepage displays a branded but lightweight structural skeleton.
- A network failure shows a clear retry action and keeps methodology/about content available.
- An invalid snapshot shows a distinct validation message and no fabricated metrics.
- Missing optional fields render the existing `Not provided by CISA` fallback.
- Unsupported or malformed URL parameters are ignored or normalized without breaking navigation.
- Motion and visualization failures never block the primary content or command-center entry action.

## 11. Accessibility and Responsive Behavior

- Semantic landmarks, sequential headings, and descriptive link text.
- Keyboard-operable navigation, mobile menu, deep links, and command-center controls.
- Visible focus treatment on every interactive element.
- No information communicated by color or animation alone.
- Text alternatives for the threat visualization and chart summaries.
- Minimum practical 44px touch targets.
- No horizontal page overflow at 360px.
- Reduced-motion mode removes ambient scanning, counter interpolation, and parallax-like effects.
- Decorative SVG elements are hidden from assistive technology.
- Contrast targets WCAG 2.2 AA.

## 12. Performance

- Prefer CSS and lightweight SVG over video, WebGL, or large generated images.
- Avoid adding a general animation framework unless existing platform capabilities cannot meet the approved motion design.
- Defer below-the-fold enhancements and keep the first viewport usable before optional motion initializes.
- Preserve static snapshot loading and avoid new runtime third-party API calls.
- Maintain a production build without console errors or hydration warnings.

## 13. Testing Strategy

### Domain tests

- Showcase view-model metrics and deterministic ordering.
- Empty and malformed datasets.
- Deep-link construction and parsing.
- Threat-posture labels at relevant boundaries.

### Component tests

- Homepage validated-data and failure states.
- Primary and secondary navigation targets.
- Mobile menu keyboard behavior.
- Highest-priority record links.
- Independent-project disclosure visibility.
- Command-center compatibility at the new pathname.
- Presentation-mode entry and exit.

### Release verification

- Data preparation test.
- Full Vitest suite.
- ESLint.
- Production build.
- Desktop and 360px visual inspection.
- Keyboard-only navigation.
- Reduced-motion inspection.
- Public deployment status and deep-link smoke checks.

## 14. Delivery Sequence

1. Add the shared showcase view model and tests.
2. Move the existing portal to `/command-center` with compatibility coverage.
3. Build the semantic homepage structure and dataset states.
4. Implement the national cyber-defense visual system and threat visualization.
5. Connect intelligence, capability, methodology, and creator sections.
6. Add command-center counters, guidance, shareable state, and presentation mode.
7. Complete responsive, accessibility, reduced-motion, and performance polish.
8. Update README and portfolio submission guidance.
9. Run the complete verification matrix.
10. Commit, push to GitHub, and deploy publicly without changing the existing audience.

## 15. Explicit Non-Goals

- No claim that the site is official, government-operated, endorsed, or connected to CISA beyond use of its public dataset.
- No fabricated live threat feed, attack telemetry, geolocation, or worldwide incident map.
- No authentication, teams, server database, or cross-device analyst synchronization.
- No CVSS, EPSS, severity, exploit maturity, asset exposure, financial impact, or threat intelligence absent from the source.
- No redesign that removes or hides the existing analytical depth.
- No visual spectacle that compromises credibility, accessibility, or performance.
