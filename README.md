# CISA KEV Command Center

A portfolio-grade security intelligence portal built from the U.S. Cybersecurity and Infrastructure Security Agency's public **Known Exploited Vulnerabilities (KEV)** catalog. It turns confirmed exploitation evidence into an explainable review queue without presenting catalog frequency as organizational exposure.

**Live dashboard:** https://cisa-kev-risk-dashboard.onadainnovative.chatgpt.site

The public root is a cinematic cybersecurity engineering showcase. The complete analyst workspace is available at `/command-center`, with optional `?present=1` presentation mode for demonstrations.

> Independent portfolio analysis using official public CISA KEV data. Not a U.S. government system.

## Four connected workspaces

- **Command Center** — headline intelligence, coordinated filters, portfolio metrics, interactive trends, and a ranked action queue.
- **Vulnerability Explorer** — normalized search, compound filters, five sort modes, pagination, evidence detail, local watchlist, and analyst notes.
- **Vendor Intelligence** — ranked catalog concentration, selectable vendor profiles, product mix, ransomware-linked share, and remediation-window comparison.
- **Briefing & Methodology** — a deterministic executive summary, priority distribution, top three review records, model caveats, and a print-ready layout.

## KEV Action Priority

The portal includes a transparent 0–100 portfolio triage score with four components:

- Confirmed ransomware campaign use: up to 40 points
- Federal remediation-window urgency: up to 30 points
- Catalog recency: up to 20 points
- Due-date status: up to 10 points

This is a project-specific review aid—not CVSS, EPSS, or an official CISA severity rating. Before acting, validate asset presence, affected product version, exposure, compensating controls, and business criticality in your own environment.

## Data source and methodology

The project uses the official public [CISA KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog). The preparation pipeline profiles the source, validates required fields and dates, removes exact duplicates, preserves unknown ransomware status, and calculates the number of days between catalog addition and the assigned federal remediation deadline.

Important interpretation notes:

- `dateAdded` is the catalog admission date, not the disclosure or first-exploitation date.
- `dueDate` is a U.S. federal remediation deadline, not a universal service-level agreement.
- `Unknown` ransomware status means unconfirmed, not that ransomware use did not occur.
- Vendor frequency does not establish that a vendor is inherently insecure.
- Watchlist selections and analyst notes remain only in the current browser's local storage. No account or server database is involved.

The CISA dataset is made available under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

## Technology

- Next.js / Vinext
- React 19 and TypeScript
- Recharts
- Tailwind CSS
- Node.js data preparation and validation
- ChatGPT Sites hosting

## Run locally

Requirements: Node.js 22.13 or newer and pnpm.

```bash
pnpm install
mkdir -p data/source
curl -L https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json \
  -o data/source/known_exploited_vulnerabilities.json
node scripts/prepare-kev-data.mjs data/source/known_exploited_vulnerabilities.json
pnpm dev
```

Then open the local URL printed by the development server.

The source and generated dataset files are intentionally not stored in GitHub. This keeps the repository lightweight and ensures the analysis can be reproduced from CISA's official feed.

## Quality checks

```bash
node --test scripts/prepare-kev-data.test.mjs
pnpm test
pnpm lint
pnpm build
```

The automated suite covers dataset validation, priority boundaries, normalized search, compound filters, stable sorting, pagination, briefing derivation, storage fallback, portal states, view navigation, the details workflow, vendor profiles, and printing.

## Portfolio intent

This project demonstrates secure data handling, reproducible analysis, explicit uncertainty, accessible interaction design, responsive information architecture, deterministic business logic, test-driven development, and production deployment. It uses only public CISA data; no personal, employer, customer, or proprietary information is included.

## Handshake submission

Submit the public site as the primary project link and the GitHub repository as supporting evidence:

- Showcase: https://cisa-kev-risk-dashboard.onadainnovative.chatgpt.site
- Command center: https://cisa-kev-risk-dashboard.onadainnovative.chatgpt.site/command-center
- Source: https://github.com/dayoonasanya/cisa-kev-dashboard

## Author

**Adedayo A. Onasanya**  
Computing & Security Technology, Drexel University
