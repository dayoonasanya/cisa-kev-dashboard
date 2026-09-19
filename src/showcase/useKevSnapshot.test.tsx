import { afterEach,expect,it,vi } from "vitest";
import { cleanup,render,screen,fireEvent } from "@testing-library/react";
import { useKevSnapshot } from "./useKevSnapshot";

afterEach(()=>{cleanup();vi.restoreAllMocks()});
const valid={title:"KEV",catalogVersion:"1",dateReleased:"2026-09-16T00:00:00Z",retrievedAt:"2026-09-16T01:00:00Z",sourceUrl:"https://cisa.gov",records:[]};
function Harness(){const state=useKevSnapshot();return <><span>{state.status}</span><button onClick={state.retry}>retry</button></>}
it("loads, validates, and retries the snapshot",async()=>{const fetchMock=vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ok:true,json:async()=>valid});vi.stubGlobal("fetch",fetchMock);render(<Harness/>);expect(await screen.findByText("fetch-error")).toBeTruthy();fireEvent.click(screen.getByRole("button"));expect(await screen.findByText("ready")).toBeTruthy();expect(fetchMock).toHaveBeenCalledTimes(2);});
it("distinguishes invalid format",async()=>{vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ok:true,json:async()=>({records:null})}));render(<Harness/>);expect(await screen.findByText("format-error")).toBeTruthy();});
