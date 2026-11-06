"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Plus, Search, Truck, X } from "lucide-react";
import {
  logisticsApi,
  type RetailCarrier,
  type RetailCarrierListResponse,
  type RetailCarrierPayload,
} from "@/lib/api/logistics";
import { LogisticsStatusCharts } from "@/features/admin/logistics/components/LogisticsStatusCharts";

const EMPTY_FORM: RetailCarrierPayload = {
  name: "",
  code: "",
  status: "active",
  provider_type: "courier",
  integration_mode: "manual",
  contact_name: null,
  contact_phone: null,
  contact_email: null,
  account_reference: null,
  coverage: null,
  tracking_url_template: null,
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The operation could not be completed.";
}

function StatusBadge({ status }: { status: RetailCarrier["status"] }) {
  const classes = status === "active"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
    : "bg-slate-100 text-slate-600 ring-slate-500/20";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${classes}`}>{status}</span>;
}

export default function LogisticsCarriersPage() {
  const formRef = React.useRef<HTMLElement | null>(null);
  const nameInputRef = React.useRef<HTMLInputElement | null>(null);
  const [data, setData] = useState<RetailCarrierListResponse | null>(null);
  const [form, setForm] = useState<RetailCarrierPayload>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | RetailCarrier["status"]>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await logisticsApi.getRetailCarriers());
      setError(null);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const carriers = data?.data ?? [];
  const filteredCarriers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return carriers.filter((carrier) => {
      const matchesSearch = !term || carrier.name.toLowerCase().includes(term) || carrier.code.toLowerCase().includes(term);
      return matchesSearch && (!statusFilter || carrier.status === statusFilter);
    });
  }, [carriers, search, statusFilter]);

  const resetForm = () => { setEditingId(null); setForm({ ...EMPTY_FORM }); setError(null); };
  const startCreate = () => {
    resetForm();
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    nameInputRef.current?.focus({ preventScroll: true });
  };
  const beginEdit = (carrier: RetailCarrier) => {
    setEditingId(carrier.id);
    setForm({ name: carrier.name, code: carrier.code, status: carrier.status === "archived" ? "inactive" : carrier.status, provider_type: carrier.provider_type, integration_mode: carrier.integration_mode, contact_name: carrier.contact_name, contact_phone: carrier.contact_phone, contact_email: carrier.contact_email, account_reference: carrier.account_reference, coverage: carrier.coverage, tracking_url_template: carrier.tracking_url_template });
    setError(null);
  };

  const save = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (editingId !== null) await logisticsApi.updateRetailCarrier(editingId, form);
      else await logisticsApi.createRetailCarrier(form);
      resetForm();
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (carrier: RetailCarrier) => {
    setActionId(carrier.id);
    setError(null);
    try {
      await logisticsApi.setRetailCarrierStatus(carrier.id, carrier.status === "active" ? "inactive" : "active");
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setActionId(null);
    }
  };

  const archiveCarrier = async (carrier: RetailCarrier) => {
    const reason = window.prompt(`Why are you archiving ${carrier.name}?`);
    if (!reason?.trim()) return;
    setActionId(carrier.id);
    setError(null);
    try {
      await logisticsApi.archiveRetailCarrier(carrier.id, reason.trim());
      resetForm();
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setActionId(null);
    }
  };

  const canShowForm = editingId !== null ? data?.capabilities.update : data?.capabilities.create;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link href="/admin/logistics" aria-label="Back to Logistics overview" className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Retail Carriers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage tenant-owned carriers used by retail fulfilment workflows.</p>
        </div>
        <div className="flex flex-col items-end gap-1"><button type="button" disabled={!data?.capabilities.create} title={!data?.capabilities.create ? "Logistics manage permission is required" : undefined} onClick={startCreate} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16}/>Add Carrier</button>{data&&!data.capabilities.create?<span className="text-xs text-amber-700">Logistics manage permission required</span>:null}</div>
      </div>

      {data ? <LogisticsStatusCharts data={Object.entries(carriers.reduce<Record<string, number>>((counts, carrier) => ({ ...counts, [carrier.provider_type]: (counts[carrier.provider_type] ?? 0) + 1 }), {})).map(([key, count]) => ({ key, count }))} noun="Carriers" distributionTitle="Carrier Type Distribution" summaryTitle="Carrier Type Summary" /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Carriers" value={carriers.length} />
        <SummaryCard label="Active Carriers" value={carriers.filter((carrier) => carrier.status === "active").length} />
        <SummaryCard label="Inactive Carriers" value={carriers.filter((carrier) => carrier.status === "inactive").length} />
      </div>

      {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {canShowForm ? (
        <section ref={formRef} className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div><h2 className="font-semibold text-slate-900">{editingId === null ? "Configure Retail Carrier" : "Edit Carrier"}</h2><p className="mt-1 text-sm text-slate-500">Only operational carrier metadata is stored here. No credentials are exposed.</p></div>
            {editingId !== null ? <button type="button" onClick={resetForm} aria-label="Cancel editing" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button> : <Plus size={20} className="text-slate-400" />}
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            <Field label="Carrier name"><input ref={nameInputRef} aria-label="Carrier name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400" /></Field>
            <Field label="Carrier code"><input aria-label="Carrier code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400" /></Field>
            <Field label="Provider type"><select aria-label="Provider type" value={form.provider_type} onChange={(event) => setForm({ ...form, provider_type: event.target.value as RetailCarrierPayload["provider_type"] })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="courier">Courier</option><option value="freight">Freight</option><option value="postal">Postal</option><option value="three_pl">3PL</option><option value="in_house">In-house</option></select></Field>
            <Field label="Integration mode"><select aria-label="Integration mode" value={form.integration_mode} onChange={(event) => setForm({ ...form, integration_mode: event.target.value as RetailCarrierPayload["integration_mode"] })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="manual">Manual</option><option value="api">Direct API</option><option value="aggregator">Aggregator</option></select></Field>
            <Field label="Contact person"><input aria-label="Contact person" value={form.contact_name ?? ""} onChange={(event) => setForm({ ...form, contact_name: event.target.value || null })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm" /></Field>
            <Field label="Contact email"><input aria-label="Contact email" type="email" value={form.contact_email ?? ""} onChange={(event) => setForm({ ...form, contact_email: event.target.value || null })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm" /></Field>
            <Field label="Contact phone"><input aria-label="Contact phone" value={form.contact_phone ?? ""} onChange={(event) => setForm({ ...form, contact_phone: event.target.value || null })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm" /></Field>
            <Field label="Account reference"><input aria-label="Account reference" value={form.account_reference ?? ""} onChange={(event) => setForm({ ...form, account_reference: event.target.value || null })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm" /></Field>
            <div className="md:col-span-2"><Field label="Service coverage"><textarea aria-label="Service coverage" value={form.coverage ?? ""} onChange={(event) => setForm({ ...form, coverage: event.target.value || null })} rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm" /></Field></div>
            <div className="md:col-span-2"><Field label="Tracking URL template"><input aria-label="Tracking URL template" value={form.tracking_url_template ?? ""} onChange={(event) => setForm({ ...form, tracking_url_template: event.target.value || null })} placeholder="https://carrier.example/track/{tracking_number}" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400" /></Field></div>
          </div>
          <div className="flex justify-end border-t border-slate-200 px-5 py-4">
            <button type="button" disabled={submitting || !form.name.trim() || !form.code.trim()} onClick={() => void save()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Saving…" : editingId === null ? "Create Carrier" : "Update Carrier"}</button>
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Configured Carriers</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search carriers" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search carrier name or code…" className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400" /></div>
            <select aria-label="Filter carrier status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 sm:w-52"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          </div>
        </div>
        <div className="relative min-h-[260px] overflow-x-auto">
          {loading ? <Loading /> : filteredCarriers.length === 0 ? <Empty icon={<Truck size={32} />} title={carriers.length ? "No carriers match these filters" : "No carriers configured"} /> : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Carrier</th><th className="px-5 py-3">Tracking</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{filteredCarriers.map((carrier) => <tr key={carrier.id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="font-medium text-slate-900">{carrier.name}</div><div className="mt-1 text-xs text-slate-500">{carrier.code}</div></td><td className="max-w-xs truncate px-5 py-4 text-slate-600">{carrier.tracking_url_template ?? "—"}</td><td className="px-5 py-4"><StatusBadge status={carrier.status} /></td><td className="px-5 py-4"><div className="flex justify-end gap-2">{data?.capabilities.update && carrier.status !== "archived" ? <button type="button" onClick={() => beginEdit(carrier)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"><Edit3 size={14} /> Edit</button> : null}{((carrier.status === "active" && data?.capabilities.deactivate) || (carrier.status === "inactive" && data?.capabilities.activate)) ? <button type="button" disabled={actionId === carrier.id} onClick={() => void changeStatus(carrier)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">{actionId === carrier.id ? "Updating…" : carrier.status === "active" ? "Deactivate" : "Activate"}</button> : null}{data?.capabilities.archive && carrier.status !== "archived" ? <button type="button" disabled={actionId === carrier.id} onClick={() => void archiveCarrier(carrier)} className="rounded-lg border border-amber-200 px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-50 disabled:opacity-50">Archive</button> : null}</div></td></tr>)}</tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="text-sm text-slate-500">{label}</div><div className="mt-1 text-2xl font-bold text-slate-900">{value}</div></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-700">{label}<div className="mt-2">{children}</div></label>; }
function Loading() { return <div className="absolute inset-0 flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-b-slate-900" /></div>; }
function Empty({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="p-10 text-center text-slate-400">{icon}<h3 className="mt-3 font-semibold text-slate-900">{title}</h3></div>; }
