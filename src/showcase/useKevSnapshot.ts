"use client";
import { useCallback,useEffect,useState } from "react";
import type { KevDataset } from "@/src/kev/types";
import { isKevDataset } from "@/src/kev/validate";
export type SnapshotStatus="loading"|"ready"|"fetch-error"|"format-error";
export function useKevSnapshot(){const [dataset,setDataset]=useState<KevDataset|null>(null),[status,setStatus]=useState<SnapshotStatus>("loading"),[key,setKey]=useState(0);useEffect(()=>{let active=true;fetch("/data/kev-clean.json").then((response)=>{if(!response.ok)throw new Error("fetch");return response.json()}).then((value:unknown)=>{if(!active)return;if(!isKevDataset(value)){setStatus("format-error");return}setDataset(value);setStatus("ready")}).catch(()=>active&&setStatus("fetch-error"));return()=>{active=false}},[key]);const retry=useCallback(()=>{setStatus("loading");setKey((value)=>value+1)},[]);return {dataset,status,retry};}
