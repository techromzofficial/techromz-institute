"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { CustomerConsent, CustomerPrivacyRequest, customerApi } from "@/lib/api/customers";

interface Props { customerUuid: string; canUpdate: boolean; canManagePrivacy: boolean; }
const transitions: Record<string, string[]> = { pending: ["in_review", "cancelled"], in_review: ["approved", "rejected"], approved: ["processing"], processing: ["completed"], completed: [], rejected: [], cancelled: [] };
const allowedTransitions = (request: CustomerPrivacyRequest) =>
  request.status === "approved" && ["anonymization", "deletion"].includes(request.request_type)
    ? []
    : transitions[request.status] ?? [];
const fieldClass = "w-full rounded-md border border-line px-3 py-2 text-xs focus:border-[#671021] focus:outline-none";
const actionClass = "rounded-md bg-[#671021] px-3 py-2 text-xs font-bold text-white disabled:opacity-50";

function errorMessage(reason: unknown) {
  if (reason instanceof ApiError) {
    const error = reason as { status?: number; message: string; errors?: Record<string, string[]> };
    if (error.status === 403) return "You do not have permission to perform this Customer privacy action.";
    return Object.values(error.errors ?? {}).flat().join(" ") || error.message;
  }
  return "The consent or privacy operation could not be completed.";
}

export function CustomerConsentPrivacyOperations({ customerUuid, canUpdate, canManagePrivacy }: Props) {
  const [consents, setConsents] = useState<CustomerConsent[]>([]);
  const [requests, setRequests] = useState<CustomerPrivacyRequest[]>([]);
  const [policyUuid, setPolicyUuid] = useState("");
  const [purpose, setPurpose] = useState("marketing");
  const [decision, setDecision] = useState("granted");
  const [requestType, setRequestType] = useState("access");
  const [requestReason, setRequestReason] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [consentResponse, requestResponse] = await Promise.all([customerApi.getConsents(customerUuid), customerApi.getPrivacyRequests(customerUuid)]);
      setConsents(consentResponse.data); setRequests(requestResponse.data);
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setLoading(false); }
  }, [customerUuid]);
  useEffect(() => { void load(); }, [load]);

  const run = async (operation: () => Promise<unknown>) => {
    setSubmitting(true); setError(null);
    try { await operation(); await load(); }
    catch (reason) { setError(errorMessage(reason)); }
    finally { setSubmitting(false); }
  };

  const captureConsent = (event: FormEvent) => {
    event.preventDefault();
    void run(() => customerApi.createConsent(customerUuid, { purpose, decision, policy_version_uuid: policyUuid, source: "admin_api" }));
  };
  const withdrawConsent = (consent: CustomerConsent) => {
    if (!window.confirm(`Withdraw ${consent.purpose} consent record “${consent.uuid}”? This records a withdrawal and preserves consent history.`)) return;
    void run(() => customerApi.withdrawConsent(customerUuid, consent.uuid, "Withdrawn by administrator at customer request"));
  };
  const createPrivacyRequest = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => { await customerApi.createPrivacyRequest(customerUuid, { request_type: requestType, reason: requestReason }); setRequestReason(""); });
  };
  const transitionRequest = (request: CustomerPrivacyRequest) => {
    const allowed = allowedTransitions(request);
    const target = selected[request.uuid] || allowed[0];
    if (!target || !allowed.includes(target)) return;
    if (!window.confirm(`Transition ${request.request_type} privacy request “${request.uuid}” from “${request.status}” to “${target}”? The server will enforce authorization, version, retention, and lifecycle rules.`)) return;
    void run(() => customerApi.updatePrivacyRequest(customerUuid, request.uuid, { status: target, expected_version: request.version }));
  };

  if (loading) return <div role="status" className="rounded-lg border border-line bg-white p-8 text-center text-sm text-slate-500">Loading consent and privacy records…</div>;

  return <div className="space-y-4">
    {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">{error}</div>}
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-lg border border-line bg-white p-4 shadow-sm"><h3 className="text-sm font-bold text-ink">Consent history</h3>
        {canUpdate && <form onSubmit={captureConsent} className="mt-3 grid gap-2 sm:grid-cols-2"><select aria-label="Consent purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className={fieldClass}><option value="privacy_policy">Privacy policy</option><option value="marketing">Marketing</option><option value="analytics">Analytics</option><option value="communications">Communications</option></select><select aria-label="Consent decision" value={decision} onChange={(e) => setDecision(e.target.value)} className={fieldClass}><option value="granted">Granted</option><option value="denied">Denied</option></select><input required aria-label="Policy version UUID" value={policyUuid} onChange={(e) => setPolicyUuid(e.target.value)} placeholder="Authoritative policy version UUID" className={`${fieldClass} sm:col-span-2`} /><button disabled={submitting} className={`${actionClass} sm:col-span-2`}>Record consent</button></form>}
        <div className="mt-4 divide-y divide-line">{consents.map((consent) => <article key={consent.uuid} className="py-3"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-ink">{consent.purpose}</p><p className="text-[11px] text-slate-500">{consent.status}</p></div>{canUpdate && consent.status === "granted" && !consent.withdrawn_at && <button disabled={submitting} onClick={() => withdrawConsent(consent)} className="text-xs font-bold text-rose-600">Withdraw</button>}</div></article>)}{!consents.length && <p className="py-3 text-xs text-slate-500">No consent history recorded.</p>}</div>
      </section>
      <section className="rounded-lg border border-line bg-white p-4 shadow-sm"><h3 className="text-sm font-bold text-ink">Privacy requests</h3>
        {canManagePrivacy && <form onSubmit={createPrivacyRequest} className="mt-3 grid gap-2"><select aria-label="Privacy request type" value={requestType} onChange={(e) => setRequestType(e.target.value)} className={fieldClass}>{["access", "export", "correction", "anonymization", "restriction", "deletion"].map((type) => <option key={type} value={type}>{type}</option>)}</select><textarea required aria-label="Privacy request reason" value={requestReason} onChange={(e) => setRequestReason(e.target.value)} placeholder="Reason supplied by the customer" className={fieldClass} /><button disabled={submitting} className={actionClass}>Create privacy request</button></form>}
        <div className="mt-4 divide-y divide-line">{requests.map((request) => { const allowed = allowedTransitions(request); return <article key={request.uuid} className="py-3"><p className="text-xs font-bold text-ink">{request.request_type}</p><p className="text-[11px] text-slate-500">{request.status}{request.reason ? ` · ${request.reason}` : ""}</p>{canManagePrivacy && allowed.length > 0 && <div className="mt-2 flex gap-2"><select aria-label={`Next status for ${request.request_type} request`} value={selected[request.uuid] || allowed[0]} onChange={(e) => setSelected({ ...selected, [request.uuid]: e.target.value })} className={fieldClass}>{allowed.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select><button disabled={submitting} onClick={() => transitionRequest(request)} className={actionClass}>Apply transition</button></div>}</article>; })}{!requests.length && <p className="py-3 text-xs text-slate-500">No privacy requests recorded.</p>}</div>
      </section>
    </div>
  </div>;
}
