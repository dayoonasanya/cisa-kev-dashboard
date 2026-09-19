import { describe,expect,it } from "vitest";
import { buildCommandCenterUrl,normalizePortalParams } from "./links";

describe("command center links",()=>{
  it("builds encoded explorer links",()=>expect(buildCommandCenterUrl({view:"explorer",cve:"CVE-2026-0001"})).toBe("/command-center?view=explorer&cve=CVE-2026-0001"));
  it("drops malformed values",()=>expect(normalizePortalParams(new URLSearchParams("view=wrong&rows=13&page=-2&cve=bad")).toString()).toBe(""));
  it("preserves supported encoded state",()=>{const value=normalizePortalParams(new URLSearchParams("view=vendors&vendor=A%26B&present=1&unknown=x"));expect(value.get("vendor")).toBe("A&B");expect(value.get("present")).toBe("1");expect(value.has("unknown")).toBe(false);});
});
