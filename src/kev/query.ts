import { calculatePriority } from "./priority";
import type { ExplorerQuery, KevRecord, PagedResult } from "./types";

export function normalizeSearch(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

export function uniqueOptions(records: KevRecord[], field: keyof KevRecord): string[] {
  return [...new Set(records.map((record) => record[field]).filter((value): value is string => typeof value === "string" && value.length > 0))].sort((a,b)=>a.localeCompare(b));
}

function searchable(record: KevRecord): string {
  return normalizeSearch([record.cveID,record.vendorProject,record.product,record.vulnerabilityName,record.requiredAction,record.notes ?? "",...(record.cwes ?? [])].join(" "));
}

function remediationMatches(days: number, band: string): boolean {
  if (!band) return true;
  if (band === "0-7") return days <= 7;
  if (band === "8-14") return days >= 8 && days <= 14;
  if (band === "15-21") return days >= 15 && days <= 21;
  if (band === "22-30") return days >= 22 && days <= 30;
  return band === "31+" ? days >= 31 : true;
}

export function queryRecords(records: KevRecord[], query: ExplorerQuery, asOfDate: string): PagedResult<KevRecord> {
  const needle = normalizeSearch(query.search);
  const filtered = records.filter((record) => {
    const { filters } = query;
    return (!needle || searchable(record).includes(needle)) &&
      (!filters.vendor || record.vendorProject === filters.vendor) &&
      (!filters.product || record.product === filters.product) &&
      (!filters.year || record.dateAdded.startsWith(filters.year)) &&
      (!filters.ransomware || record.knownRansomwareCampaignUse === filters.ransomware) &&
      (!filters.priority || calculatePriority(record, asOfDate).band === filters.priority) &&
      remediationMatches(record.remediationDays, filters.remediation);
  });

  const sorted = [...filtered].sort((a,b) => {
    let compared = 0;
    if (query.sort === "priority") compared = calculatePriority(b,asOfDate).score - calculatePriority(a,asOfDate).score || b.dateAdded.localeCompare(a.dateAdded);
    if (query.sort === "newest") compared = b.dateAdded.localeCompare(a.dateAdded);
    if (query.sort === "due") compared = a.dueDate.localeCompare(b.dueDate);
    if (query.sort === "vendor") compared = a.vendorProject.localeCompare(b.vendorProject) || a.product.localeCompare(b.product);
    if (query.sort === "cve") compared = a.cveID.localeCompare(b.cveID);
    return compared || a.cveID.localeCompare(b.cveID);
  });
  const total = sorted.length, pageCount = total ? Math.ceil(total / query.pageSize) : 0;
  const page = pageCount ? Math.min(Math.max(1,query.page),pageCount) : 1;
  const start = (page - 1) * query.pageSize;
  return { items: sorted.slice(start,start + query.pageSize), total, page, pageSize: query.pageSize, pageCount };
}
