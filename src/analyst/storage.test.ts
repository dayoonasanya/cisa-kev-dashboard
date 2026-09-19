import { describe,expect,it,vi } from "vitest";
import { ANALYST_STORAGE_KEY,createAnalystStore } from "./storage";

class MemoryStorage implements Storage {
  data=new Map<string,string>(); get length(){return this.data.size;}
  clear(){this.data.clear();} key(index:number){return [...this.data.keys()][index]??null;}
  getItem(key:string){return this.data.get(key)??null;} removeItem(key:string){this.data.delete(key);}
  setItem(key:string,value:string){this.data.set(key,value);}
}

describe("createAnalystStore",()=>{
  it("toggles watchlist entries and notifies subscribers",()=>{const storage=new MemoryStorage(),store=createAnalystStore(storage),listener=vi.fn();store.subscribe(listener);store.toggleWatchlist("CVE-1");expect(store.getState().watchlist).toEqual(["CVE-1"]);expect(listener).toHaveBeenCalledOnce();store.toggleWatchlist("CVE-1");expect(store.getState().watchlist).toEqual([]);});
  it("trims notes to 2,000 characters and reloads JSON",()=>{const storage=new MemoryStorage();createAnalystStore(storage).setNote("CVE-1","x".repeat(2100));const reloaded=createAnalystStore(storage);expect(reloaded.getState().notes["CVE-1"]).toHaveLength(2000);});
  it.each(["bad json",JSON.stringify({version:2,watchlist:["CVE-1"],notes:{}})])("resets invalid state %s",(raw)=>{const storage=new MemoryStorage();storage.setItem(ANALYST_STORAGE_KEY,raw);expect(createAnalystStore(storage).getState().watchlist).toEqual([]);});
  it("falls back to memory when storage throws",()=>{const broken={getItem(){throw new Error("denied")},setItem(){throw new Error("denied")}} as unknown as Storage;const store=createAnalystStore(broken);store.toggleWatchlist("CVE-2026-0001");expect(store.getState().watchlist).toContain("CVE-2026-0001");expect(store.getState().persistenceAvailable).toBe(false);});
});
