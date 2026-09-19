import type { KevDataset, KevRecord } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRecord(value: unknown): value is KevRecord {
  if (!isObject(value)) return false;
  const strings = ["cveID", "vendorProject", "product", "vulnerabilityName", "dateAdded", "dueDate", "knownRansomwareCampaignUse", "requiredAction"];
  const optionalText=["notes","forensicTriage"].every((key)=>value[key]===undefined||typeof value[key]==="string");
  const cwes=value.cwes===undefined||(Array.isArray(value.cwes)&&value.cwes.every((item)=>typeof item==="string"));
  return strings.every((key) => typeof value[key] === "string") && typeof value.remediationDays === "number" && Number.isFinite(value.remediationDays) && value.remediationDays>=0 && optionalText && cwes;
}

export function isKevDataset(value: unknown): value is KevDataset {
  if (!isObject(value)) return false;
  const metadata = ["title", "catalogVersion", "dateReleased", "retrievedAt", "sourceUrl"];
  return metadata.every((key) => typeof value[key] === "string") && Array.isArray(value.records) && value.records.every(isRecord);
}
