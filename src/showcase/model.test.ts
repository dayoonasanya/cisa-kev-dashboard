import { describe,expect,it } from "vitest";
import type { KevDataset,KevRecord } from "@/src/kev/types";
import { deriveShowcaseModel,threatPosture } from "./model";

const record=(id:string,known="Unknown",vendor="Acme"):KevRecord=>({cveID:id,vendorProject:vendor,product:"Edge",vulnerabilityName:"Issue",dateAdded:"2026-09-01",dueDate:"2026-09-02",knownRansomwareCampaignUse:known,requiredAction:"Patch",remediationDays:1});
const dataset=(records:KevRecord[]):KevDataset=>({title:"KEV",catalogVersion:"1",dateReleased:"2026-09-16T00:00:00Z",retrievedAt:"2026-09-16T01:00:00Z",sourceUrl:"https://cisa.gov",records});

describe("showcase model",()=>{
  it.each([[0,"Active monitoring"],[1,"Heightened attention"],[10,"Critical action"]] as const)("maps %i critical records to %s",(count,label)=>expect(threatPosture(count)).toBe(label));
  it("derives truthful deterministic metrics",()=>{const value=deriveShowcaseModel(dataset([record("CVE-2026-0002","Known","Bravo"),record("CVE-2026-0001","Unknown","Acme")]));expect(value.total).toBe(2);expect(value.ransomwareCount).toBe(1);expect(value.vendorCount).toBe(2);expect(value.priorityRecords.map((item)=>item.cveID)).toEqual(["CVE-2026-0002","CVE-2026-0001"]);expect(value.asOfDate).toBe("2026-09-16");});
  it("returns a safe empty model",()=>{const value=deriveShowcaseModel(dataset([]));expect(value).toMatchObject({total:0,ransomwareCount:0,vendorCount:0,criticalCount:0,posture:"Active monitoring",priorityRecords:[]});});
});
