import { describe, expect, it } from "vitest";
import { deriveBriefing } from "./insights";
import type { KevRecord } from "./types";

const make = (id:string,vendor:string,ransomware="Unknown",days=35):KevRecord => ({cveID:id,vendorProject:vendor,product:"Platform",vulnerabilityName:"Issue",dateAdded:"2026-09-01",dueDate:"2026-09-20",knownRansomwareCampaignUse:ransomware,requiredAction:"Patch",remediationDays:days});

describe("deriveBriefing",()=>{
  it("returns a safe empty briefing",()=>expect(deriveBriefing([],"2026-09-16")).toMatchObject({total:0,topVendor:null,ransomwareShare:0,priorityRecords:[]}));
  it("breaks vendor ties alphabetically",()=>{
    const model=deriveBriefing([make("CVE-1","Zulu"),make("CVE-2","Acme")],"2026-09-16");
    expect(model.topVendor?.name).toBe("Acme");
  });
  it("explains ransomware share and returns three highest priorities",()=>{
    const records=[make("CVE-1","Acme","Known",7),make("CVE-2","Acme","Known",14),make("CVE-3","Bravo","Unknown",7),make("CVE-4","Bravo")];
    const model=deriveBriefing(records,"2026-09-16");
    expect(model.ransomwareShare).toBe(.5);
    expect(model.ransomwareSummary).toContain("50.0%");
    expect(model.priorityRecords).toHaveLength(3);
    expect(model.priorityRecords[0].cveID).toBe("CVE-1");
  });
});
