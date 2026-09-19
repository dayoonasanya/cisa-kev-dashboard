import { Minimize2 } from "lucide-react";
export default function PresentationBar({onExit}:{onExit:()=>void}){return <div className="presentation-bar"><span><Minimize2/> Presentation mode</span><button onClick={onExit}>Exit presentation mode</button></div>}
