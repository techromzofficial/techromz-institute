"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { logisticsApi } from "@/lib/api/logistics";

const eventTypes = ["location", "departed_facility", "in_transit", "transition", "arrived", "arrived_destination_country", "customs_processing", "customs_cleared", "departed_local_hub", "out_for_delivery", "delivered"];
const fieldClass = "mt-1 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

export default function ShipmentTrackingEventForm({ shipmentId, permitted, onUpdated }: { shipmentId: string; permitted: boolean; onUpdated: () => void | Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ status: "in_transit", event_type: "location", location: "", city: "", country_code: "", latitude: "", longitude: "", occurred_at: new Date().toISOString().slice(0, 16), customer_note: "", internal_note: "" });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(null);
    const latitude = Number(form.latitude); const longitude = Number(form.longitude);
    if (!form.location.trim() || !form.occurred_at || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setError("Enter a location, valid event time, latitude (-90 to 90), and longitude (-180 to 180)."); return;
    }
    setBusy(true);
    try {
      await logisticsApi.addShipmentTrackingEvent(shipmentId, { ...form, status: form.status as "pending"|"dispatched"|"in_transit"|"out_for_delivery"|"delivered", country_code: form.country_code || null, city: form.city || null, latitude, longitude, occurred_at: new Date(form.occurred_at).toISOString(), customer_note: form.customer_note || null, internal_note: form.internal_note || null });
      setOpen(false); await onUpdated();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Tracking event could not be saved."); }
    finally { setBusy(false); }
  };

  if (!open) return <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-900">Authoritative Tracking Event</h2><p className="mt-1 text-sm text-slate-500">Record a verified scan or carrier-reported location. Coordinates are never inferred.</p></div><button type="button" disabled={!permitted} onClick={() => setOpen(true)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:opacity-50">Add Tracking Event</button></div></section>;

  return <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">Add Authoritative Tracking Event</h2><form onSubmit={submit} className="mt-4 space-y-5">{error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}<div className="grid gap-4 md:grid-cols-3"><Field label="Lifecycle Status"><select aria-label="Lifecycle Status" value={form.status} onChange={(e) => update("status", e.target.value)} className={fieldClass}><option value="pending">Pending</option><option value="dispatched">Dispatched</option><option value="in_transit">In Transit</option><option value="out_for_delivery">Out For Delivery</option><option value="delivered">Delivered</option></select></Field><Field label="Event Type"><select aria-label="Event Type" value={form.event_type} onChange={(e) => update("event_type", e.target.value)} className={fieldClass}>{eventTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></Field><Input label="Location / Facility" value={form.location} onChange={(v) => update("location", v)} required/><Input label="City" value={form.city} onChange={(v) => update("city", v)}/><Input label="Country Code" value={form.country_code} onChange={(v) => update("country_code", v.toUpperCase().slice(0, 2))}/><Input label="Event Time" type="datetime-local" value={form.occurred_at} onChange={(v) => update("occurred_at", v)} required/><Input label="Latitude" type="number" value={form.latitude} onChange={(v) => update("latitude", v)} required/><Input label="Longitude" type="number" value={form.longitude} onChange={(v) => update("longitude", v)} required/><Input label="Customer Note" value={form.customer_note} onChange={(v) => update("customer_note", v)}/><Input label="Internal Note" value={form.internal_note} onChange={(v) => update("internal_note", v)}/></div><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Cancel</button><button disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? "Saving…" : "Save Tracking Event"}</button></div></form></section>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-xs font-medium text-slate-700"><span className="block">{label}</span>{children}</label>; }
function Input({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <Field label={label}><input aria-label={label} type={type} step={type === "number" ? "any" : undefined} required={required} value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}/></Field>; }
