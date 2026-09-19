import type { AnalystState } from "../kev/types";

export const ANALYST_STORAGE_KEY="kev-command-center:analyst-state:v1";
interface StoredState {version:1;watchlist:string[];notes:Record<string,string>}
export interface AnalystStore {getState():AnalystState;toggleWatchlist(cveID:string):void;setNote(cveID:string,note:string):void;subscribe(listener:()=>void):()=>void}

const empty=(persistenceAvailable=true):AnalystState=>({watchlist:[],notes:{},persistenceAvailable});

export function createAnalystStore(storage?:Storage):AnalystStore {
  let state=empty(Boolean(storage));const listeners=new Set<()=>void>();
  if(storage){try{const raw=storage.getItem(ANALYST_STORAGE_KEY);if(raw){const parsed=JSON.parse(raw) as Partial<StoredState>;if(parsed.version===1&&Array.isArray(parsed.watchlist)&&parsed.watchlist.every((id)=>typeof id==="string")&&parsed.notes&&typeof parsed.notes==="object")state={watchlist:[...new Set(parsed.watchlist)],notes:{...parsed.notes},persistenceAvailable:true};}}catch{state=empty(false);}}
  const persist=()=>{if(!storage||!state.persistenceAvailable)return;try{const saved:StoredState={version:1,watchlist:state.watchlist,notes:state.notes};storage.setItem(ANALYST_STORAGE_KEY,JSON.stringify(saved));}catch{state={...state,persistenceAvailable:false};}};
  const notify=()=>listeners.forEach((listener)=>listener());
  return {
    getState:()=>({watchlist:[...state.watchlist],notes:{...state.notes},persistenceAvailable:state.persistenceAvailable}),
    toggleWatchlist(cveID){state={...state,watchlist:state.watchlist.includes(cveID)?state.watchlist.filter((id)=>id!==cveID):[...state.watchlist,cveID]};persist();notify();},
    setNote(cveID,note){const value=note.slice(0,2000),notes={...state.notes};if(value)notes[cveID]=value;else delete notes[cveID];state={...state,notes};persist();notify();},
    subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);},
  };
}
