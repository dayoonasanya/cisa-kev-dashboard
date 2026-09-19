import type { KevRecord, PriorityBand, PriorityFactor, PriorityResult } from "./types";

const DAY = 86_400_000;

function parseDay(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const timestamp = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const date = new Date(timestamp);
  return date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() === Number(match[2]) - 1 && date.getUTCDate() === Number(match[3]) ? timestamp : null;
}

export function priorityBand(score: number): PriorityBand {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Elevated";
  return "Tracked";
}

function remediationFactor(days: number): PriorityFactor {
  const points = days <= 7 ? 30 : days <= 14 ? 22 : days <= 21 ? 14 : days <= 30 ? 8 : 3;
  return { key: "remediation", label: "Remediation window", points, explanation: `${days} days assigned between catalog addition and the federal due date.` };
}

function recencyFactor(dateAdded: string, asOfDate: string): PriorityFactor {
  const added = parseDay(dateAdded), asOf = parseDay(asOfDate);
  if (added === null || asOf === null) return { key: "recency", label: "Catalog recency", points: 0, explanation: "Invalid catalog date; no recency points assigned." };
  const days = Math.max(0, Math.floor((asOf - added) / DAY));
  const points = days <= 90 ? 20 : days <= 365 ? 14 : days <= 1095 ? 8 : 3;
  return { key: "recency", label: "Catalog recency", points, explanation: `Added ${days} days before the snapshot date.` };
}

function dueFactor(dueDate: string, asOfDate: string): PriorityFactor {
  const due = parseDay(dueDate), asOf = parseDay(asOfDate);
  if (due === null || asOf === null) return { key: "due", label: "Federal due date", points: 0, explanation: "Invalid due date; no due-date points assigned." };
  const days = Math.ceil((due - asOf) / DAY);
  if (days < 0) return { key: "due", label: "Federal due date", points: 10, explanation: `Federal due date passed ${Math.abs(days)} days before the snapshot.` };
  if (days <= 30) return { key: "due", label: "Federal due date", points: 6, explanation: `Federal due date falls within ${days} days of the snapshot.` };
  return { key: "due", label: "Federal due date", points: 2, explanation: `Federal due date falls ${days} days after the snapshot.` };
}

export function calculatePriority(record: KevRecord, asOfDate: string): PriorityResult {
  const factors: PriorityFactor[] = [
    { key: "ransomware", label: "Ransomware evidence", points: record.knownRansomwareCampaignUse === "Known" ? 40 : 0, explanation: record.knownRansomwareCampaignUse === "Known" ? "CISA confirms known ransomware campaign use." : "CISA lists ransomware campaign use as Unknown." },
    remediationFactor(record.remediationDays),
    recencyFactor(record.dateAdded, asOfDate),
    dueFactor(record.dueDate, asOfDate),
  ];
  const score = Math.min(100, Math.max(0, factors.reduce((sum, factor) => sum + factor.points, 0)));
  return { score, band: priorityBand(score), factors };
}
