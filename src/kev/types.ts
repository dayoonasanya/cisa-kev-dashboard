export type RansomwareStatus = "Known" | "Unknown" | string;
export type PortalView = "command" | "explorer" | "vendors" | "briefing";
export type PriorityBand = "Critical" | "High" | "Elevated" | "Tracked";
export type ExplorerSort = "priority" | "newest" | "due" | "vendor" | "cve";

export interface KevRecord { cveID:string; vendorProject:string; product:string; vulnerabilityName:string; dateAdded:string; dueDate:string; knownRansomwareCampaignUse:RansomwareStatus; forensicTriage?:string; requiredAction:string; notes?:string; cwes?:string[]; remediationDays:number; }
export interface KevDataset { title:string; catalogVersion:string; dateReleased:string; retrievedAt:string; sourceUrl:string; records:KevRecord[]; }
export interface DashboardFilters { vendor:string; year:string; ransomware:string; }
export interface ExplorerFilters extends DashboardFilters { product:string; priority:string; remediation:string; }
export interface ExplorerQuery { search:string; filters:ExplorerFilters; sort:ExplorerSort; page:number; pageSize:25|50|100; }
export interface PriorityFactor { key:string; label:string; points:number; explanation:string; }
export interface PriorityResult { score:number; band:PriorityBand; factors:PriorityFactor[]; }
export interface PagedResult<T> { items:T[]; total:number; page:number; pageSize:number; pageCount:number; }
export interface AnalystState { watchlist:string[]; notes:Record<string,string>; persistenceAvailable:boolean; }
export type ThreatPosture = "Critical action" | "Heightened attention" | "Active monitoring";
export interface ShowcaseModel { total:number; ransomwareCount:number; vendorCount:number; criticalCount:number; posture:ThreatPosture; headline:string; ransomwareSummary:string; topVendor:{name:string;count:number}|null; priorityRecords:KevRecord[]; asOfDate:string; }
