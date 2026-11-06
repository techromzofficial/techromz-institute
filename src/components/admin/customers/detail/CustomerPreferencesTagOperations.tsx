"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { CustomerPreference, CustomerTag, customerApi } from "@/lib/api/customers";

interface Props { customerUuid: string; canManage: boolean; }
const fieldClass = "w-full rounded-md border border-line px-3 py-2 text-xs disabled:bg-slate-100";
const actionClass = "rounded-md bg-[#671021] px-3 py-2 text-xs font-bold text-white disabled:opacity-50";

function errorMessage(reason: unknown) {
  if (reason instanceof ApiError) {
    const error = reason as { status?: number; message: string; errors?: Record<string, string[]> };
    if (error.status === 403) return "You do not have permission to update this Customer.";
    return Object.values(error.errors ?? {}).flat().join(" ") || error.message;
  }
  return "The Customer operation could not be completed.";
}

export function CustomerPreferencesTagOperations({ customerUuid, canManage }: Props) {
  const [preferences, setPreferences] = useState<CustomerPreference | null>(null);
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [preferenceResponse, tagResponse] = await Promise.all([customerApi.getPreferences(customerUuid), customerApi.getTags(customerUuid)]);
      setPreferences(preferenceResponse.data); setTags(tagResponse.data);
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

  const addTag = (event: FormEvent) => {
    event.preventDefault();
    if (!newTag.trim()) return;
    void run(async () => { await customerApi.addTag(customerUuid, newTag.trim()); setNewTag(""); });
  };

  if (loading) return <div role="status" className="rounded-lg border border-line bg-white p-8 text-center text-sm text-slate-500">Loading Customer preferences and tags…</div>;

  return <div className="grid gap-4 lg:grid-cols-2">
    {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 lg:col-span-2">{error}</div>}
    <section className="rounded-lg border border-line bg-white p-4 shadow-sm"><h3 className="text-sm font-bold text-ink">Customer preferences</h3>{preferences ? <div className="mt-3 grid gap-3">
      <label className="text-xs font-semibold text-slate-700">Language<input disabled={!canManage} value={preferences.preferred_language ?? ""} onChange={(e) => setPreferences({ ...preferences, preferred_language: e.target.value || null })} className={`${fieldClass} mt-1`} placeholder="en" /></label>
      <label className="text-xs font-semibold text-slate-700">Currency<input disabled={!canManage} maxLength={3} value={preferences.preferred_currency ?? ""} onChange={(e) => setPreferences({ ...preferences, preferred_currency: e.target.value.toUpperCase() || null })} className={`${fieldClass} mt-1`} placeholder="LKR" /></label>
      <label className="text-xs font-semibold text-slate-700">Preferred contact channels<input disabled={!canManage} value={preferences.preferred_contact_channels.join(", ")} onChange={(e) => setPreferences({ ...preferences, preferred_contact_channels: e.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} className={`${fieldClass} mt-1`} placeholder="email, sms" /></label>
      <label className="text-xs font-semibold text-slate-700">Notification channels<input disabled={!canManage} value={preferences.notification_channels.join(", ")} onChange={(e) => setPreferences({ ...preferences, notification_channels: e.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} className={`${fieldClass} mt-1`} placeholder="email, push" /></label>
      {canManage && <button disabled={submitting} onClick={() => void run(() => customerApi.updatePreferences(customerUuid, { preferred_language: preferences.preferred_language, preferred_currency: preferences.preferred_currency, preferred_contact_channels: preferences.preferred_contact_channels, notification_channels: preferences.notification_channels }))} className={actionClass}>Save preferences</button>}
    </div> : <p className="mt-3 text-xs text-slate-500">No preferences recorded.</p>}</section>
    <section className="rounded-lg border border-line bg-white p-4 shadow-sm"><h3 className="text-sm font-bold text-ink">Manual Customer tags</h3>{canManage && <form onSubmit={addTag} className="mt-3 flex gap-2"><input aria-label="New tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} className={fieldClass} placeholder="Add a tag" /><button disabled={submitting || !newTag.trim()} className={actionClass}>Add</button></form>}<div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag.uuid} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{tag.name}{canManage && <button aria-label={`Remove ${tag.name}`} disabled={submitting} onClick={() => void run(() => customerApi.removeTag(customerUuid, tag.uuid))} className="text-rose-600">×</button>}</span>)}{!tags.length && <p className="text-xs text-slate-500">No tags recorded.</p>}</div></section>
  </div>;
}
