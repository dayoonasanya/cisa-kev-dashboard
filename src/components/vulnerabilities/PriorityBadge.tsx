import type { PriorityBand } from "@/src/kev/types";
export default function PriorityBadge({band,score,compact=false}:{band:PriorityBand;score:number;compact?:boolean}){return <span className={`priority-badge priority-${band.toLowerCase()}`} aria-label={`KEV Action Priority ${band}, ${score} out of 100`}><i/>{compact?score:`${band} · ${score}`}</span>}
