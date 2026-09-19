import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function MetricCard({label,value,detail,icon:Icon,tone="cyan"}:{label:string;value:string;detail:string;icon:LucideIcon;tone?:"cyan"|"amber"|"red"}){return <article className={`metric-card tone-${tone}`}><div className="metric-icon"><Icon size={18} aria-hidden="true"/></div><div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div></article>}
export function SectionHeading({eyebrow,title,detail}:{eyebrow:string;title:string;detail?:string}){return <div className="section-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div>{detail&&<p>{detail}</p>}</div>}
export function ChartCard({title,summary,children,className=""}:{title:string;summary:string;children:ReactNode;className?:string}){return <section className={`chart-card ${className}`}><div className="chart-card-head"><h3>{title}</h3><span>LIVE FILTERS</span></div><p className="sr-summary">{summary}</p><div className="chart-area">{children}</div></section>}
export function EmptyPanel({title,copy,action}:{title:string;copy:string;action?:ReactNode}){return <section className="empty-panel"><div className="empty-orbit"/><h2>{title}</h2><p>{copy}</p>{action}</section>}
