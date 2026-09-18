import test from "node:test";
import assert from "node:assert/strict";
import { prepareKev } from "./prepare-kev-data.mjs";

const row = { cveID: "CVE-2024-1000", vendorProject: " Vendor ", product: "Product", vulnerabilityName: "Name", dateAdded: "2024-01-01", shortDescription: "desc", requiredAction: "act", dueDate: "2024-01-22", knownRansomwareCampaignUse: "Unknown" };

test("profiles, cleans, deduplicates, and preserves Unknown", () => {
  const source = { catalogVersion: "1", dateReleased: "2024-01-01T00:00:00Z", vulnerabilities: [row, row, { ...row, product: "Duplicate CVE" }, { ...row, cveID: "CVE-2024-1001", dateAdded: "bad" }] };
  const { output, profile } = prepareKev(source, "2024-01-02T00:00:00Z");
  assert.equal(profile.sourceRows, 4);
  assert.equal(profile.exactDuplicates, 1);
  assert.equal(profile.duplicateCves, 1);
  assert.equal(profile.rejectedRows, 1);
  assert.equal(output.records.length, 1);
  assert.equal(output.records[0].vendorProject, "Vendor");
  assert.equal(output.records[0].knownRansomwareCampaignUse, "Unknown");
  assert.equal(output.records[0].remediationDays, 21);
});
