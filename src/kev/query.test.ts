import { describe, expect, it } from "vitest";
import { normalizeSearch, queryRecords, uniqueOptions } from "./query";
import type { ExplorerQuery, KevRecord } from "./types";

const make = (id: number, patch: Partial<KevRecord> = {}): KevRecord => ({
  cveID: `CVE-2026-${String(id).padStart(4,"0")}`, vendorProject: id % 2 ? "Acme" : "Bravo",
  product: id % 2 ? "Edge" : "Server", vulnerabilityName: `Issue ${id}`,
  dateAdded: `2026-0${Math.min(id,9)}-01`, dueDate: `2026-${String(Math.min(id + 1,12)).padStart(2,"0")}-01`,
  knownRansomwareCampaignUse: id === 1 ? "Known" : "Unknown", requiredAction: `Patch ${id}`,
  notes: id === 2 ? "Remote access note" : "", cwes: ["CWE-79"], remediationDays: id <= 2 ? 7 : 35, ...patch,
});
const records = [1,2,3,4,5,6].map((id) => make(id));
const baseQuery: ExplorerQuery = { search:"", filters:{vendor:"",product:"",year:"",ransomware:"",priority:"",remediation:""}, sort:"cve", page:1, pageSize:25 };

describe("normalizeSearch", () => {
  it("normalizes common CVE search punctuation", () => expect(normalizeSearch("  cve 2026 0001 ")).toBe("cve20260001"));
});

describe("queryRecords", () => {
  it.each(["cve 2026 0001","acme","edge","issue 1","patch 1","remote access","cwe79"])("searches source fields for %s", (search) => {
    expect(queryRecords(records,{...baseQuery,search},"2026-09-16").total).toBeGreaterThan(0);
  });

  it("combines field, priority, and remediation filters", () => {
    const result = queryRecords(records,{...baseQuery,filters:{vendor:"Acme",product:"Edge",year:"2026",ransomware:"Known",priority:"Critical",remediation:"0-7"}},"2026-09-16");
    expect(result.items.map((item)=>item.cveID)).toEqual(["CVE-2026-0001"]);
  });

  it.each(["priority","newest","due","vendor","cve"] as const)("sorts deterministically by %s", (sort) => {
    const first = queryRecords(records,{...baseQuery,sort},"2026-09-16").items;
    const second = queryRecords([...records].reverse(),{...baseQuery,sort},"2026-09-16").items;
    expect(first.map((item)=>item.cveID)).toEqual(second.map((item)=>item.cveID));
  });

  it("returns an explicit empty page", () => expect(queryRecords(records,{...baseQuery,search:"missing"},"2026-09-16")).toMatchObject({items:[],total:0,page:1,pageCount:0}));

  it("clamps an out-of-range page and returns a partial final page", () => {
    const many = Array.from({length:52},(_,index)=>make(index+1));
    const result = queryRecords(many,{...baseQuery,page:99,pageSize:25},"2026-09-16");
    expect(result).toMatchObject({total:52,page:3,pageCount:3});
    expect(result.items).toHaveLength(2);
  });

  it.each([25,50,100] as const)("supports %i rows per page", (pageSize) => {
    const many = Array.from({length:110},(_,index)=>make(index+1));
    expect(queryRecords(many,{...baseQuery,pageSize},"2026-09-16").items).toHaveLength(pageSize);
  });
});

describe("uniqueOptions", () => {
  it("returns sorted unique field values", () => expect(uniqueOptions(records,"vendorProject")).toEqual(["Acme","Bravo"]));
});
