import { describe, expect, it } from "vitest";
import { isKevDataset } from "./validate";

const record = {
  cveID: "CVE-2026-0001",
  vendorProject: "Acme",
  product: "Edge",
  vulnerabilityName: "Example",
  dateAdded: "2026-09-01",
  dueDate: "2026-09-22",
  knownRansomwareCampaignUse: "Unknown",
  forensicTriage: "",
  requiredAction: "Patch",
  notes: "",
  cwes: [],
  remediationDays: 21,
};

const dataset = {
  title: "KEV",
  catalogVersion: "2026.09.16",
  dateReleased: "2026-09-16T00:00:00Z",
  retrievedAt: "2026-09-16T01:00:00Z",
  sourceUrl: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
  records: [record],
};

describe("isKevDataset", () => {
  it("accepts the expected snapshot shape", () => expect(isKevDataset(dataset)).toBe(true));
  it("rejects null", () => expect(isKevDataset(null)).toBe(false));
  it("rejects a missing records array", () => expect(isKevDataset({ ...dataset, records: undefined })).toBe(false));
  it("rejects a record without a CVE ID", () => expect(isKevDataset({ ...dataset, records: [{ ...record, cveID: undefined }] })).toBe(false));
  it("rejects mistyped optional text", () => expect(isKevDataset({ ...dataset, records: [{ ...record, notes: {} }] })).toBe(false));
  it("rejects mistyped CWE collections", () => expect(isKevDataset({ ...dataset, records: [{ ...record, cwes: "CWE-79" }] })).toBe(false));
});
