import { deriveBriefing } from "@/src/kev/insights";
import type { KevDataset,ShowcaseModel,ThreatPosture } from "@/src/kev/types";

export function threatPosture(criticalCount:number):ThreatPosture {
  if(criticalCount>=10)return "Critical action";
  if(criticalCount>0)return "Heightened attention";
  return "Active monitoring";
}

export function deriveShowcaseModel(dataset:KevDataset):ShowcaseModel {
  const asOfDate=dataset.dateReleased.slice(0,10),briefing=deriveBriefing(dataset.records,asOfDate),criticalCount=briefing.priorityDistribution.Critical;
  return {total:briefing.total,ransomwareCount:briefing.ransomwareCount,vendorCount:briefing.vendors,criticalCount,posture:threatPosture(criticalCount),headline:briefing.headline,ransomwareSummary:briefing.ransomwareSummary,topVendor:briefing.topVendor,priorityRecords:briefing.priorityRecords,asOfDate};
}
