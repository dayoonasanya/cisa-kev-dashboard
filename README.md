# CISA KEV Risk Dashboard

An interactive cybersecurity dashboard that explores where risk is concentrated in the U.S. Cybersecurity and Infrastructure Security Agency's **Known Exploited Vulnerabilities (KEV)** catalog.

**Live dashboard:** https://cisa-kev-risk-dashboard.onadainnovative.chatgpt.site

## What the dashboard shows

- Total KEV entries and vendors represented
- Vulnerability concentration across vendors
- Catalog additions over the latest 36 months
- Products associated with confirmed ransomware use
- Distribution of federal remediation windows
- Interactive filters for vendor, year added, and ransomware status

## Key finding

In catalog version `2026.09.16`, Microsoft accounts for 22.7% of the 1,713 catalog entries, while 21.0% of all entries have confirmed ransomware campaign use. These figures are prioritization signals—not vendor security ratings—and should be interpreted alongside organizational exposure and business impact.

## Data source and methodology

The project uses the official public [CISA KEV catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog). The preparation pipeline profiles the source, validates required fields and dates, removes exact duplicates, preserves unknown ransomware status, and calculates the number of days between catalog addition and the assigned federal remediation deadline.

Important interpretation notes:

- `dateAdded` is the catalog admission date, not the disclosure or first-exploitation date.
- `dueDate` is a U.S. federal remediation deadline, not a universal service-level agreement.
- `Unknown` ransomware status means unconfirmed, not that ransomware use did not occur.
- Vendor frequency does not establish that a vendor is inherently insecure.

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
node scripts/prepare-kev-data.mjs data/source/known_exploited_vulnerabilities.json
pnpm dev
```

Then open the local URL printed by the development server.

## Quality checks

```bash
node --test scripts/prepare-kev-data.test.mjs
pnpm lint
pnpm build
```

## Author

**Adedayo A. Onasanya**  
Computing & Security Technology, Drexel University
