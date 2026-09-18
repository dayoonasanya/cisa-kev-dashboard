export type RansomwareStatus = "Known" | "Unknown" | string;
export interface KevRecord { cveID:string; vendorProject:string; product:string; vulnerabilityName:string; dateAdded:string; dueDate:string; knownRansomwareCampaignUse:RansomwareStatus; forensicTriage:string; requiredAction:string; notes:string; cwes:string[]; remediationDays:number; }
export interface KevDataset { title:string; catalogVersion:string; dateReleased:string; retrievedAt:string; sourceUrl:string; records:KevRecord[]; }
export interface DashboardFilters { vendor:string; year:string; ransomware:string; }
