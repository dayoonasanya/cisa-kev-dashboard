"use client";
import { AlertTriangle,LoaderCircle,ShieldCheck } from "lucide-react";
import { useCallback,useEffect,useMemo,useState } from "react";
import type { DashboardFilters,KevDataset,PortalView } from "@/src/kev/types";
import { filterRecords } from "@/src/kev/metrics";
import { isKevDataset } from "@/src/kev/validate";
import CommandCenterView from "@/src/components/views/CommandCenterView";
import VulnerabilityExplorerView from "@/src/components/views/VulnerabilityExplorerView";
import VendorIntelligenceView from "@/src/components/views/VendorIntelligenceView";
import BriefingView from "@/src/components/views/BriefingView";
import { createAnalystStore } from "@/src/analyst/storage";
import FilterBar from "./FilterBar";
import PortalHeader from "./PortalHeader";
import PortalNavigation from "./PortalNavigation";

const EMPTY:DashboardFilters={vendor:"",year:"",ransomware:""};
const EMPTY_RECORDS:KevDataset["records"]=[];
const isView=(value:string|null):value is PortalView=>["command","explorer","vendors","briefing"].includes(value??"");
const browserStorage=()=>{try{return typeof window==="undefined"?undefined:window.localStorage}catch{return undefined}};

export default function KevPortal(){const [dataset,setDataset]=useState<KevDataset|null>(null),[status,setStatus]=useState<"loading"|"ready"|"fetch-error"|"format-error">("loading"),[retry,setRetry]=useState(0),[view,setView]=useState<PortalView>(()=>{if(typeof window==="undefined")return "command";const current=new URLSearchParams(location.search).get("view");return isView(current)?current:"command"}),[filters,setFilters]=useState<DashboardFilters>(EMPTY),[menuOpen,setMenuOpen]=useState(false);
  const [analystStore]=useState(()=>createAnalystStore(browserStorage())),[analystState,setAnalystState]=useState(()=>analystStore.getState());
  useEffect(()=>analystStore.subscribe(()=>setAnalystState(analystStore.getState())),[analystStore]);
  useEffect(()=>{if(!menuOpen)return;const onKeyDown=(event:KeyboardEvent)=>{if(event.key==="Escape")setMenuOpen(false)};document.addEventListener("keydown",onKeyDown);requestAnimationFrame(()=>document.querySelector<HTMLButtonElement>(".mobile-nav-close")?.focus());return()=>document.removeEventListener("keydown",onKeyDown)},[menuOpen]);
  useEffect(()=>{let active=true;fetch("/data/kev-clean.json").then((response)=>{if(!response.ok)throw new Error("fetch");return response.json()}).then((value:unknown)=>{if(!active)return;if(!isKevDataset(value)){setStatus("format-error");return;}setDataset(value);setStatus("ready");}).catch(()=>active&&setStatus("fetch-error"));return()=>{active=false};},[retry]);
  const navigate=useCallback((next:PortalView)=>{setView(next);setMenuOpen(false);const url=new URL(location.href);url.searchParams.set("view",next);history.replaceState({},"",url);},[]);
  const records=dataset?.records??EMPTY_RECORDS,filtered=useMemo(()=>filterRecords(records,filters),[records,filters]),vendors=useMemo(()=>[...new Set(records.map((record)=>record.vendorProject))].sort(),[records]),years=useMemo(()=>[...new Set(records.map((record)=>record.dateAdded.slice(0,4)))].sort().reverse(),[records]);
  if(status==="loading")return <main className="status-screen"><div className="loading-mark"><LoaderCircle className="spin"/><ShieldCheck/></div><h1>Loading the CISA snapshot…</h1><p>Validating public intelligence before analysis.</p></main>;
  const retryLoad=()=>{setStatus("loading");setRetry((value)=>value+1)};
  if(status==="fetch-error")return <main className="status-screen"><AlertTriangle/><h1>Dataset unavailable</h1><p>The public snapshot could not be loaded. Your analyst state is untouched.</p><button onClick={retryLoad}>Retry loading</button></main>;
  if(status==="format-error"||!dataset)return <main className="status-screen"><AlertTriangle/><h1>Snapshot format not recognized</h1><p>The file loaded, but it does not match the expected CISA KEV structure.</p><button onClick={retryLoad}>Retry loading</button></main>;
  const asOfDate=dataset.dateReleased.slice(0,10);const content=view==="command"?<CommandCenterView records={filtered} asOfDate={asOfDate} onOpenExplorer={()=>navigate("explorer")}/>:view==="explorer"?<VulnerabilityExplorerView records={filtered} asOfDate={asOfDate} analystState={analystState} onToggleWatchlist={analystStore.toggleWatchlist} onSetNote={analystStore.setNote}/>:view==="vendors"?<VendorIntelligenceView records={filtered}/>:<BriefingView records={filtered} dataset={dataset} asOfDate={asOfDate}/>;
  return <main className="portal-shell"><div className={menuOpen?"mobile-backdrop open":"mobile-backdrop"} onClick={()=>setMenuOpen(false)}/><div className={menuOpen?"nav-wrap open":"nav-wrap"}><PortalNavigation view={view} onChange={navigate} onClose={()=>setMenuOpen(false)}/></div><section className="portal-main"><PortalHeader dataset={dataset} onMenu={()=>setMenuOpen(true)}/><div className="portal-content"><FilterBar filters={filters} vendors={vendors} years={years} onChange={(key,value)=>setFilters((current)=>({...current,[key]:value}))} onReset={()=>setFilters(EMPTY)}/>{content}</div><footer className="portal-footer"><span>Analysis by Adedayo A. Onasanya</span><span>{filtered.length.toLocaleString()} of {records.length.toLocaleString()} records in scope</span><span>CISA KEV data · CC0 1.0</span></footer></section></main>;
}
