import { describe, expect, it } from "vitest";
import { calculatePriority, priorityBand } from "./priority";
import type { KevRecord } from "./types";

const base: KevRecord = {
  cveID: "CVE-2026-0001", vendorProject: "Acme", product: "Edge",
  vulnerabilityName: "Example", dateAdded: "2026-09-01", dueDate: "2026-10-20",
  knownRansomwareCampaignUse: "Unknown", requiredAction: "Patch", remediationDays: 35,
};

const points = (record: Partial<KevRecord>, key: string, asOf = "2026-09-16") =>
  calculatePriority({ ...base, ...record }, asOf).factors.find((factor) => factor.key === key)?.points;

describe("priorityBand", () => {
  it.each([[39,"Tracked"],[40,"Elevated"],[59,"Elevated"],[60,"High"],[79,"High"],[80,"Critical"]] as const)("maps %i to %s", (score, band) => {
    expect(priorityBand(score)).toBe(band);
  });
});

describe("calculatePriority", () => {
  it("adds 40 points only for confirmed ransomware use", () => {
    expect(points({ knownRansomwareCampaignUse: "Known" }, "ransomware")).toBe(40);
    expect(points({ knownRansomwareCampaignUse: "Unknown" }, "ransomware")).toBe(0);
  });

  it.each([[7,30],[8,22],[14,22],[15,14],[21,14],[22,8],[30,8],[31,3]] as const)("scores a %i-day remediation window", (days, expected) => {
    expect(points({ remediationDays: days }, "remediation")).toBe(expected);
  });

  it.each([["2026-09-01",20],["2026-01-01",14],["2024-01-01",8],["2020-01-01",3]] as const)("scores recency for %s", (dateAdded, expected) => {
    expect(points({ dateAdded }, "recency")).toBe(expected);
  });

  it("handles leap-day recency at UTC midnight", () => {
    expect(points({ dateAdded: "2024-02-29" }, "recency", "2024-03-01")).toBe(20);
  });

  it.each([["2026-09-15",10],["2026-10-01",6],["2026-11-01",2]] as const)("scores due status for %s", (dueDate, expected) => {
    expect(points({ dueDate }, "due")).toBe(expected);
  });

  it("returns zero date points with explanations for invalid dates", () => {
    const result = calculatePriority({ ...base, dateAdded: "bad", dueDate: "bad" }, "2026-09-16");
    expect(result.factors.find((factor) => factor.key === "recency")?.points).toBe(0);
    expect(result.factors.find((factor) => factor.key === "due")?.explanation).toContain("Invalid");
  });

  it("returns a bounded total and matching band", () => {
    const result = calculatePriority({ ...base, knownRansomwareCampaignUse: "Known", remediationDays: 7, dueDate: "2026-09-01" }, "2026-09-16");
    expect(result.score).toBe(100);
    expect(result.band).toBe("Critical");
  });
});
