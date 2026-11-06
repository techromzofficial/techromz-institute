"use client";

import { useState } from "react";
import { customerApi } from "@/lib/api/customers";

interface CustomerLifecycleControlProps {
  customerUuid: string;
  currentState: string;
  lifecycleVersion: number;
  onChanged: () => Promise<void>;
  canManage?: boolean;
}

export function CustomerLifecycleControl({ customerUuid, currentState, lifecycleVersion, onChanged, canManage = false }: CustomerLifecycleControlProps) {
  const [targetState, setTargetState] = useState("");
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    if (!targetState || !reason.trim()) {
      setMessage("Choose a state and provide a reason.");
      return;
    }
    setIsSaving(true);
    setMessage(null);
    try {
      await customerApi.transitionLifecycle(customerUuid, { target_state: targetState, reason: reason.trim(), expected_version: lifecycleVersion });
      setReason("");
      setTargetState("");
      setMessage("Lifecycle updated.");
      await onChanged();
    } catch {
      setMessage("The lifecycle change was not accepted. Refresh and verify your permission or the current version.");
    } finally {
      setIsSaving(false);
    }
  };

  return <section className="rounded-lg border border-line bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row lg:items-end"><div className="min-w-40"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Current lifecycle</p><p className="mt-1 text-sm font-black capitalize text-ink">{currentState}</p></div>{canManage && <><label className="flex-1 text-xs font-semibold text-slate-700">New state<select aria-label="New lifecycle state" value={targetState} onChange={(event) => setTargetState(event.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm"><option value="">Select state</option>{["active", "suspended", "locked", "disabled"].filter((state) => state !== currentState).map((state) => <option key={state} value={state}>{state}</option>)}</select></label><label className="flex-[2] text-xs font-semibold text-slate-700">Reason<input aria-label="Lifecycle reason" value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm" /></label><button type="button" disabled={isSaving} onClick={submit} className="rounded-md bg-[#671021] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{isSaving ? "Updating…" : "Update lifecycle"}</button></>}</div>{message && <p role="status" className="mt-2 text-xs text-slate-600">{message}</p>}</section>;
}
