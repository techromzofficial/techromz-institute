"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { CustomerAddress, customerApi } from "@/lib/api/customers";

interface Props { customerUuid: string; canManage: boolean; }
type AddressForm = {
  label: string; contact_name: string; phone: string; address_line_1: string;
  address_line_2: string; city: string; state: string; postal_code: string;
  country: string; address_role: "shipping" | "billing" | "both";
};

const emptyForm: AddressForm = { label: "", contact_name: "", phone: "", address_line_1: "", address_line_2: "", city: "", state: "", postal_code: "", country: "", address_role: "shipping" };
const fieldClass = "w-full rounded-md border border-line px-3 py-2 text-xs focus:border-[#671021] focus:outline-none";
const actionClass = "rounded-md bg-[#671021] px-3 py-2 text-xs font-bold text-white disabled:opacity-50";

function errorMessage(reason: unknown) {
  if (reason instanceof ApiError) {
    const apiError = reason as { status?: number; message: string; errors?: Record<string, string[]> };
    if (apiError.status === 403) return "You do not have permission to manage Customer addresses.";
    return Object.values(apiError.errors ?? {}).flat().join(" ") || apiError.message;
  }
  return "The address operation could not be completed.";
}

export function CustomerAddressOperations({ customerUuid, canManage }: Props) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { setAddresses((await customerApi.getAddresses(customerUuid)).data); }
    catch (reason) { setError(errorMessage(reason)); }
    finally { setLoading(false); }
  }, [customerUuid]);

  useEffect(() => { void load(); }, [load]);

  const run = async (operation: () => Promise<unknown>) => {
    setSubmitting(true); setError(null);
    try { await operation(); await load(); }
    catch (reason) { setError(errorMessage(reason)); }
    finally { setSubmitting(false); }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const payload = { ...form, country: form.country.toUpperCase() };
    void run(async () => {
      if (editing) await customerApi.updateAddress(customerUuid, editing.uuid, payload);
      else await customerApi.createAddress(customerUuid, payload);
      setEditing(null); setForm(emptyForm);
    });
  };

  const beginEdit = (address: CustomerAddress) => {
    setEditing(address);
    setForm({ label: address.label ?? "", contact_name: address.contact_name ?? "", phone: address.phone ?? "", address_line_1: address.address_line_1, address_line_2: address.address_line_2 ?? "", city: address.city ?? "", state: address.state ?? "", postal_code: address.postal_code ?? "", country: address.country, address_role: address.address_role });
  };

  const confirmDelete = (address: CustomerAddress) => {
    const identity = address.label || [address.address_line_1, address.city, address.country].filter(Boolean).join(", ");
    if (!window.confirm(`Remove address “${identity}”? The server will enforce default and protected-address rules.`)) return;
    void run(() => customerApi.deleteAddress(customerUuid, address.uuid));
  };

  if (loading) return <div role="status" className="rounded-lg border border-line bg-white p-8 text-center text-sm text-slate-500">Loading Customer addresses…</div>;

  return <div className="space-y-4">
    {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">{error}</div>}
    {canManage && <form onSubmit={submit} className="rounded-lg border border-line bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-ink">{editing ? "Edit address" : "Add address"}</h3>{editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} className="text-xs font-bold text-slate-500">Cancel edit</button>}</div>
      <div className="grid gap-3 md:grid-cols-3">
        <input aria-label="Address label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Label" className={fieldClass} />
        <input aria-label="Contact name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} placeholder="Contact name" className={fieldClass} />
        <input aria-label="Address phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className={fieldClass} />
        <input required aria-label="Address line 1" value={form.address_line_1} onChange={(e) => setForm({ ...form, address_line_1: e.target.value })} placeholder="Address line 1" className={fieldClass} />
        <input aria-label="Address line 2" value={form.address_line_2} onChange={(e) => setForm({ ...form, address_line_2: e.target.value })} placeholder="Address line 2" className={fieldClass} />
        <input aria-label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className={fieldClass} />
        <input aria-label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className={fieldClass} />
        <input aria-label="Postal code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} placeholder="Postal code" className={fieldClass} />
        <input required maxLength={2} aria-label="Country code" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country code (LK)" className={fieldClass} />
        <select aria-label="Address role" value={form.address_role} onChange={(e) => setForm({ ...form, address_role: e.target.value as AddressForm["address_role"] })} className={fieldClass}><option value="shipping">Shipping</option><option value="billing">Billing</option><option value="both">Shipping & billing</option></select>
      </div>
      <button disabled={submitting} className={`${actionClass} mt-3`}><Plus className="mr-1 inline h-3.5 w-3.5" />{editing ? "Save address" : "Add address"}</button>
    </form>}
    {!addresses.length ? <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">No Customer addresses recorded.</div> : <div className="grid gap-3 md:grid-cols-2">{addresses.map((address) => <article key={address.uuid} className="rounded-lg border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-ink">{address.label || address.address_role}</h3><p className="mt-1 text-xs text-slate-600">{[address.address_line_1, address.address_line_2, address.city, address.state, address.postal_code, address.country].filter(Boolean).join(", ")}</p></div>{canManage && <div className="flex gap-1"><button aria-label={`Edit ${address.label || "address"}`} onClick={() => beginEdit(address)} className="rounded border border-line p-2 text-slate-600"><Pencil className="h-3.5 w-3.5" /></button><button aria-label={`Delete ${address.label || "address"}`} disabled={submitting} onClick={() => confirmDelete(address)} className="rounded border border-line p-2 text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button></div>}</div>
      <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold">{address.is_default_shipping && <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">Default shipping</span>}{address.is_default_billing && <span className="rounded bg-sky-50 px-2 py-1 text-sky-700">Default billing</span>}<span className="rounded bg-slate-100 px-2 py-1 text-slate-600">{address.status}</span></div>
      {canManage && <div className="mt-3 flex gap-3">{!address.is_default_shipping && ["shipping", "both"].includes(address.address_role) && <button disabled={submitting} onClick={() => void run(() => customerApi.setDefaultAddress(customerUuid, address.uuid, "shipping"))} className="text-[10px] font-bold text-[#671021]"><Star className="mr-1 inline h-3 w-3" />Set shipping default</button>}{!address.is_default_billing && ["billing", "both"].includes(address.address_role) && <button disabled={submitting} onClick={() => void run(() => customerApi.setDefaultAddress(customerUuid, address.uuid, "billing"))} className="text-[10px] font-bold text-[#671021]"><Star className="mr-1 inline h-3 w-3" />Set billing default</button>}</div>}
    </article>)}</div>}
  </div>;
}
