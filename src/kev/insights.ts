import { groupCount } from "./metrics";
import { calculatePriority } from "./priority";
import type { KevRecord, PriorityBand } from "./types";

export interface BriefingModel {
  total:number; vendors:number; topVendor:{name:string;count:number}|null;
  ransomwareCount:number; ransomwareShare:number; ransomwareSummary:string; headline:string;
  priorityRecords:KevRecord[]; priorityDistribution:Record<PriorityBand,number>;
}

export function deriveBriefing(records:KevRecord[],asOfDate:string):BriefingModel {
  const ransomwareCount=records.filter((record)=>record.knownRansomwareCampaignUse==="Known").length;
  const ransomwareShare=records.length?ransomwareCount/records.length:0;
  const topVendor=groupCount(records,(record)=>record.vendorProject)[0]??null;
  const ranked=[...records].sort((a,b)=>calculatePriority(b,asOfDate).score-calculatePriority(a,asOfDate).score||b.dateAdded.localeCompare(a.dateAdded)||a.cveID.localeCompare(b.cveID));
  const priorityDistribution:Record<PriorityBand,number>={Critical:0,High:0,Elevated:0,Tracked:0};
  records.forEach((record)=>priorityDistribution[calculatePriority(record,asOfDate).band]++);
  return {
    total:records.length,
    vendors:new Set(records.map((record)=>record.vendorProject)).size,
    topVendor,
    ransomwareCount,
    ransomwareShare,
    ransomwareSummary:records.length?`${ransomwareCount.toLocaleString()} entries (${(ransomwareShare*100).toFixed(1)}%) have confirmed ransomware campaign use.`:"No records match the current scope.",
    headline:topVendor?`${topVendor.name} leads this view with ${topVendor.count.toLocaleString()} catalog entries.`:"No catalog entries match this view.",
    priorityRecords:ranked.slice(0,3),
    priorityDistribution,
  };
}
