"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import {
  fetchMarketplaceSettings,
  updateMarketplaceSettings,
  type MarketplaceSettingsResponse,
} from "@/lib/api/marketplace";

type ApiProblem = Error & { status?: number };

export default function MarketplaceSettingsPage() {
  const [data, setData] = useState<MarketplaceSettingsResponse | null>(null);
  const [days, setDays] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  const applyResponse = useCallback((response: MarketplaceSettingsResponse) => {
    setData(response);
    setDays(response.settings ? String(response.settings.return_window_days) : "");
  }, []);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      applyResponse(await fetchMarketplaceSettings(signal));
    } catch (reasonCaught) {
      if (signal?.aborted) return;
      setData(null);
      setError(errorMessage(reasonCaught, "Marketplace settings could not be loaded."));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [applyResponse]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load, requestVersion]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data?.capabilities.can_update) return;

    const returnWindowDays = Number(days);
    const trimmedReason = reason.trim();
    if (!Number.isInteger(returnWindowDays) || returnWindowDays < 1 || returnWindowDays > 365) {
      setFormError("Return Window must be a whole number between 1 and 365 days.");
      return;
    }
    if (trimmedReason.length < 5 || trimmedReason.length > 2000) {
      setFormError("Change Reason must be between 5 and 2000 characters.");
      return;
    }

    const version = data.settings?.version ?? 0;
    setSaving(true);
    setFormError("");
    setNotice("");
    try {
      const response = await updateMarketplaceSettings({
        return_window_days: returnWindowDays,
        version,
        reason: trimmedReason,
      });
      applyResponse(response);
      setReason("");
      setNotice("Marketplace settings saved.");
    } catch (reasonCaught) {
      const problem = reasonCaught as ApiProblem;
      if (problem.status === 409) {
        setNotice("Marketplace settings changed elsewhere. Review the refreshed settings before saving again.");
        await load();
      } else {
        setFormError(errorMessage(reasonCaught, "Marketplace settings could not be saved."));
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) return <StatePanel>Loading Marketplace settings…</StatePanel>;

  if (error && !data) {
    return (
      <StatePanel tone="error">
        <p>{error}</p>
        <button type="button" onClick={() => setRequestVersion((value) => value + 1)} className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 font-semibold">Try again</button>
      </StatePanel>
    );
  }

  if (!data) return null;
  const canUpdate = data.capabilities.can_update;

  return (
    <div className="space-y-6">
      <Link href="/admin/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-[#741d35] hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </Link>
      <PageHeader
        crumbs={["Marketplace", "Settings"]}
        title="Marketplace Settings"
        description="Configure the tenant Marketplace commercial return window."
        actions={
          <button type="button" onClick={() => setRequestVersion((value) => value + 1)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        }
      />

      {notice && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">{notice}</div>}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Settings className="mt-0.5 h-5 w-5 text-[#741d35]" />
            <div><h2 className="font-semibold text-slate-950">Commercial return policy</h2><p className="mt-1 text-sm text-slate-500">Controls the number of days in the Marketplace return window.</p></div>
          </div>

          {!data.settings && <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Marketplace settings have not yet been configured.</p>}

          <div className="mt-6 space-y-5">
            <label className="block text-sm font-semibold text-slate-700">
              Return Window (Days)
              <input aria-label="Return Window (Days)" type="number" min={1} max={365} step={1} required value={days} disabled={!canUpdate || saving} onChange={(event) => setDays(event.target.value)} className="mt-2 block w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Change Reason
              <textarea aria-label="Change Reason" minLength={5} maxLength={2000} required value={reason} disabled={!canUpdate || saving} onChange={(event) => setReason(event.target.value)} rows={4} className="mt-2 block w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100" />
              <span className="mt-1 block text-xs font-normal text-slate-500">Required for the authoritative audit record.</span>
            </label>
          </div>

          {formError && <p role="alert" className="mt-4 text-sm text-red-700">{formError}</p>}
          {canUpdate && <button type="submit" disabled={saving} className="mt-6 rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save Settings"}</button>}
        </form>

        <aside className="space-y-4">
          <Info label="Current Version" value={data.settings ? String(data.settings.version) : "Not configured"} />
          <Info label="Created" value={formatDateTime(data.settings?.created_at ?? null)} />
          <Info label="Updated" value={formatDateTime(data.settings?.updated_at ?? null)} />
        </aside>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        Marketplace Settings currently controls the commercial return-window configuration only. Logistics owns physical return movement, while Finance owns refunds and settlement.
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-sm font-semibold text-slate-900">{value}</p></article>;
}

function StatePanel({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "error" }) {
  return <div className={`rounded-xl border p-12 text-center text-sm shadow-sm ${tone === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-500"}`}>{children}</div>;
}

function formatDateTime(value: string | null) {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Unavailable";
}

function errorMessage(reason: unknown, fallback: string) {
  return reason instanceof Error && reason.message ? reason.message : fallback;
}
