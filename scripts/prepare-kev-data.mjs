import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SOURCE_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
const REQUIRED = ["cveID", "vendorProject", "product", "vulnerabilityName", "dateAdded", "shortDescription", "requiredAction", "dueDate"];

const cleanText = (value) => typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

export function prepareKev(source, retrievedAt = new Date().toISOString()) {
  if (!source || !Array.isArray(source.vulnerabilities)) throw new Error("CISA feed is missing vulnerabilities[]");
  const rows = source.vulnerabilities;
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))].sort();
  const missing = Object.fromEntries(columns.map((key) => [key, rows.filter((row) => row[key] == null || row[key] === "").length]));
  const types = Object.fromEntries(columns.map((key) => [key, [...new Set(rows.filter((row) => row[key] != null).map((row) => Array.isArray(row[key]) ? "array" : typeof row[key]))].sort()]));
  const invalidRequiredCounts = Object.fromEntries(REQUIRED.map((key) => [key, rows.filter((row) => row[key] == null || cleanText(row[key]) === "").length]));
  const invalidDateCounts = Object.fromEntries(["dateAdded", "dueDate"].map((key) => [key, rows.filter((row) => !validDate(cleanText(row[key]))).length]));
  const seenExact = new Set();
  const seenCve = new Set();
  let exactDuplicates = 0;
  let duplicateCves = 0;
  let rejectedRows = 0;
  const records = [];

  for (const raw of rows) {
    const signature = JSON.stringify(raw);
    if (seenExact.has(signature)) { exactDuplicates += 1; continue; }
    seenExact.add(signature);
    const row = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value : cleanText(value)]));
    if (REQUIRED.some((key) => !row[key]) || !validDate(row.dateAdded) || !validDate(row.dueDate)) { rejectedRows += 1; continue; }
    if (seenCve.has(row.cveID)) { duplicateCves += 1; continue; }
    seenCve.add(row.cveID);
    const remediationDays = Math.round((Date.parse(`${row.dueDate}T00:00:00Z`) - Date.parse(`${row.dateAdded}T00:00:00Z`)) / 86400000);
    records.push({
      cveID: row.cveID,
      vendorProject: row.vendorProject,
      product: row.product,
      vulnerabilityName: row.vulnerabilityName,
      dateAdded: row.dateAdded,
      dueDate: row.dueDate,
      knownRansomwareCampaignUse: row.knownRansomwareCampaignUse || "Unknown",
      forensicTriage: row.forensicTriage || "Unknown",
      requiredAction: row.requiredAction,
      notes: row.notes || "",
      cwes: Array.isArray(row.cwes) ? row.cwes : [],
      remediationDays,
    });
  }

  records.sort((a, b) => a.dateAdded.localeCompare(b.dateAdded) || a.cveID.localeCompare(b.cveID));
  const profile = {
    sourceRows: rows.length,
    cleanRows: records.length,
    columns,
    types,
    missing,
    invalidRequiredCounts,
    invalidDateCounts,
    exactDuplicates,
    duplicateCves,
    rejectedRows,
    ransomwareValues: [...new Set(records.map((row) => row.knownRansomwareCampaignUse))].sort(),
    categoricalValues: {
      knownRansomwareCampaignUse: [...new Set(records.map((row) => row.knownRansomwareCampaignUse))].sort(),
      forensicTriage: [...new Set(records.map((row) => row.forensicTriage))].sort(),
    },
    transformations: ["trimmed and collapsed whitespace", "validated ISO date strings", "removed exact duplicates", "kept first occurrence of duplicate CVE IDs", "rejected rows missing required fields or valid dates"],
  };
  if (profile.sourceRows - exactDuplicates - duplicateCves - rejectedRows !== profile.cleanRows) throw new Error("Profile counts do not reconcile");
  return {
    output: {
      title: source.title || "CISA Catalog of Known Exploited Vulnerabilities",
      catalogVersion: source.catalogVersion,
      dateReleased: source.dateReleased,
      retrievedAt,
      sourceUrl: SOURCE_URL,
      records,
    },
    profile,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const input = process.argv[2];
  if (!input) throw new Error("Usage: node scripts/prepare-kev-data.mjs <source.json>");
  const source = JSON.parse(fs.readFileSync(input, "utf8"));
  const { output, profile } = prepareKev(source);
  fs.mkdirSync(path.resolve("public/data"), { recursive: true });
  fs.writeFileSync(path.resolve("public/data/kev-clean.json"), JSON.stringify(output));
  fs.writeFileSync(path.resolve("public/data/profile.json"), JSON.stringify(profile, null, 2));
  process.stdout.write(`${JSON.stringify(profile, null, 2)}\n`);
}
