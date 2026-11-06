"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleSlash2, PackageCheck, RotateCcw, Truck } from "lucide-react";
import {
  logisticsApi,
  type LogisticsReturnItem,
  type LogisticsReturnResponse,
  type ReturnInventoryOption,
} from "@/lib/api/logistics";
import { LogisticsStatusCharts, statusData } from "@/features/admin/logistics/components/LogisticsStatusCharts";

type Disposition = "restock" | "quarantine" | "damaged";
type DispositionForm = { quantity: number; disposition: Disposition; inventoryId: number };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The operation could not be completed.";
}

function formatStatus(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusClasses(status: string): string {
  if (["completed", "received", "approved"].includes(status)) return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  if (["rejected", "cancelled"].includes(status)) return "bg-red-50 text-red-700 ring-red-600/20";
  return "bg-amber-50 text-amber-700 ring-amber-600/20";
}

export default function LogisticsReturnsPage() {
  const [data, setData] = useState<LogisticsReturnResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [receiveQuantities, setReceiveQuantities] = useState<Record<number, number>>({});
  const [inspectQuantities, setInspectQuantities] = useState<Record<number, number>>({});
  const [dispositionForms, setDispositionForms] = useState<Record<number, DispositionForm>>({});
  const [inventoryOptions, setInventoryOptions] = useState<Record<number, ReturnInventoryOption[]>>({});
  const [loadingOptions, setLoadingOptions] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await logisticsApi.getReturns());
      setError(null);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const mutate = async (key: string, operation: () => Promise<unknown>) => {
    setSubmitting(key);
    setError(null);
    try {
      await operation();
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSubmitting(null);
    }
  };

  const loadInventoryOptions = async (returnId: number, itemId: number) => {
    setLoadingOptions(itemId);
    setError(null);
    try {
      const response = await logisticsApi.getReturnInventoryOptions(returnId, itemId);
      setInventoryOptions((current) => ({ ...current, [itemId]: response.data }));
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoadingOptions(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link href="/admin/logistics" aria-label="Back to Logistics overview" className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"><ArrowLeft size={18} /></Link>
        <div><h1 className="text-2xl font-bold text-slate-900">Returns, Collections & Reverse Logistics</h1><p className="mt-1 text-sm text-slate-500">Receive, inspect and disposition authoritative Marketplace returns.</p></div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Shipments" value={data?.summary.total_shipments ?? 0} icon={<Truck size={22} />} />
        <SummaryCard label="Return Records" value={data?.summary.return_records ?? 0} icon={<RotateCcw size={22} />} />
        <SummaryCard label="Active Collections" value={data?.summary.active_collections ?? 0} icon={<PackageCheck size={22} />} />
        <SummaryCard label="Completed Returns" value={data?.summary.completed_returns ?? 0} icon={<CircleSlash2 size={22} />} />
      </div>

      {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {data ? <LogisticsStatusCharts data={statusData(data.status_counts)} noun="Returns" distributionTitle="Return Status Distribution" summaryTitle="Reverse Logistics Status Summary" /> : null}

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-semibold text-slate-900">Reverse Logistics Records</h2><p className="mt-1 text-sm text-slate-500">Physical processing is recorded separately from financial refunds.</p></div>
        <div className="relative min-h-[300px]">
          {loading && !data ? <Loading /> : !data?.return_records.length ? <EmptyReturns /> : (
            <div className="divide-y divide-slate-200">
              {data.return_records.map((record) => (
                <article key={record.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div><h3 className="font-semibold text-slate-900">Return {record.id}</h3><p className="mt-1 text-sm text-slate-500">{record.order ? `Order ${record.order.order_number}` : "Order unavailable"}</p></div>
                    <span className={`inline-flex self-start rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClasses(record.status)}`}>{formatStatus(record.status)}</span>
                  </div>

                  {record.order?.items.length ? (
                    <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Returned item</th><th className="px-4 py-3">Ordered</th><th className="px-4 py-3">Receive</th></tr></thead><tbody className="divide-y divide-slate-100">{record.order.items.map((item) => {
                        const quantity = receiveQuantities[record.id] ?? 1;
                        const invalid = quantity < 1 || quantity > item.quantity;
                        return <tr key={item.id}><td className="px-4 py-3"><div className="font-medium text-slate-900">{item.product_name ?? item.sku ?? `Order item ${item.id}`}</div><div className="text-xs text-slate-500">{item.sku ?? "No SKU"}</div></td><td className="px-4 py-3 text-slate-600">{item.quantity} {item.unit ?? ""}</td><td className="px-4 py-3">{data.capabilities.receive_return ? <div className="flex items-center gap-2"><label className="sr-only" htmlFor={`receive-${record.id}`}>Receive quantity for return {record.id}</label><input id={`receive-${record.id}`} aria-label={`Receive quantity for return ${record.id}`} type="number" min={1} max={item.quantity} value={quantity} onChange={(event) => setReceiveQuantities((current) => ({ ...current, [record.id]: Number(event.target.value) }))} className="w-20 rounded-lg border border-slate-200 px-2 py-1.5" /><button type="button" disabled={invalid || submitting !== null} onClick={() => void mutate(`receive-${record.id}`, () => logisticsApi.receiveReturn(record.id, { order_item_id: item.id, quantity }))} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting === `receive-${record.id}` ? "Receiving…" : "Receive Return"}</button></div> : <span className="text-xs text-slate-400">Not permitted</span>}</td></tr>;
                      })}</tbody></table>
                    </div>
                  ) : null}

                  {record.items.length ? <div className="mt-5 space-y-3">{record.items.map((item) => <ProcessingCard key={item.id} item={item} returnId={record.id} canInspect={data.capabilities.inspect_return} canDispose={data.capabilities.close_return} submitting={submitting} inspectQuantity={inspectQuantities[item.id] ?? 1} dispositionForm={dispositionForms[item.id] ?? { quantity: 1, disposition: "restock", inventoryId: 0 }} options={inventoryOptions[item.id]} optionsLoading={loadingOptions === item.id} setInspectQuantity={(quantity) => setInspectQuantities((current) => ({ ...current, [item.id]: quantity }))} setDispositionForm={(form) => setDispositionForms((current) => ({ ...current, [item.id]: form }))} inspect={(quantity) => mutate(`inspect-${item.id}`, () => logisticsApi.inspectReturn(record.id, item.id, quantity))} loadOptions={() => loadInventoryOptions(record.id, item.id)} dispose={(form) => mutate(`dispose-${item.id}`, () => logisticsApi.disposeReturn(record.id, item.id, { inventory_balance_id: form.inventoryId, disposition: form.disposition, quantity: form.quantity, idempotency_key: crypto.randomUUID() }))} />)}</div> : <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No physical items have been received for this return.</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><InfoCard title="Domain Availability"><InfoRow label="Return records" value={data?.domain.available ? "Available" : "Unavailable"} /><InfoRow label="Collection workflow" value={data?.domain.collection_workflow_available ? "Available" : "Unavailable"} /><InfoRow label="Reverse-logistics workflow" value={data?.domain.reverse_logistics_workflow_available ? "Available" : "Unavailable"} /></InfoCard><InfoCard title="Finance Boundary"><p className="text-sm leading-6 text-slate-600">Payment refunds remain part of Finance. They do not prove that products were physically received, inspected or dispositioned by Logistics.</p></InfoCard></div>
    </div>
  );
}

type ProcessingProps = { item: LogisticsReturnItem; returnId: number; canInspect: boolean; canDispose: boolean; submitting: string | null; inspectQuantity: number; dispositionForm: DispositionForm; options?: ReturnInventoryOption[]; optionsLoading: boolean; setInspectQuantity: (quantity: number) => void; setDispositionForm: (form: DispositionForm) => void; inspect: (quantity: number) => Promise<void>; loadOptions: () => Promise<void>; dispose: (form: DispositionForm) => Promise<void> };
function ProcessingCard(props: ProcessingProps) {
  const disposed = props.item.dispositions.reduce((total, disposition) => total + disposition.quantity, 0);
  const inspectRemaining = props.item.received_quantity - props.item.inspected_quantity;
  const dispositionRemaining = props.item.inspected_quantity - disposed;
  const inspectInvalid = props.inspectQuantity < 1 || props.inspectQuantity > inspectRemaining;
  const dispositionInvalid = props.dispositionForm.quantity < 1 || props.dispositionForm.quantity > dispositionRemaining || !props.dispositionForm.inventoryId;
  return <div className="rounded-lg border border-slate-200 p-4"><div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><Metric label="Requested" value={props.item.requested_quantity} /><Metric label="Received" value={props.item.received_quantity} /><Metric label="Inspected" value={props.item.inspected_quantity} /><Metric label="Awaiting disposition" value={dispositionRemaining} /></div>{props.canInspect && inspectRemaining > 0 ? <div className="mt-4 flex flex-wrap items-end gap-2"><Field label="Inspect quantity"><input aria-label={`Inspect quantity for item ${props.item.id}`} type="number" min={1} max={inspectRemaining} value={props.inspectQuantity} onChange={(event) => props.setInspectQuantity(Number(event.target.value))} className="w-24 rounded-lg border border-slate-200 px-3 py-2" /></Field><button type="button" disabled={inspectInvalid || props.submitting !== null} onClick={() => void props.inspect(props.inspectQuantity)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50">{props.submitting === `inspect-${props.item.id}` ? "Inspecting…" : "Inspect"}</button></div> : null}{props.canDispose && dispositionRemaining > 0 ? <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-5"><Field label="Disposition"><select aria-label={`Disposition for item ${props.item.id}`} value={props.dispositionForm.disposition} onChange={(event) => props.setDispositionForm({ ...props.dispositionForm, disposition: event.target.value as Disposition })} className="w-full rounded-lg border border-slate-200 px-3 py-2"><option value="restock">Restock</option><option value="quarantine">Quarantine</option><option value="damaged">Damaged</option></select></Field><Field label="Quantity"><input aria-label={`Disposition quantity for item ${props.item.id}`} type="number" min={1} max={dispositionRemaining} value={props.dispositionForm.quantity} onChange={(event) => props.setDispositionForm({ ...props.dispositionForm, quantity: Number(event.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2" /></Field><div className="flex items-end"><button type="button" disabled={props.optionsLoading} onClick={() => void props.loadOptions()} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium">{props.optionsLoading ? "Loading…" : "Load destination"}</button></div><Field label="Inventory destination"><select aria-label={`Inventory destination for item ${props.item.id}`} disabled={!props.options} value={props.dispositionForm.inventoryId || ""} onChange={(event) => props.setDispositionForm({ ...props.dispositionForm, inventoryId: Number(event.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-50"><option value="">Select inventory</option>{props.options?.map((option) => <option key={option.inventory_balance_id} value={option.inventory_balance_id}>{option.warehouse?.name ?? "Warehouse"} / {option.location?.name ?? "Default"}</option>)}</select></Field><div className="flex items-end"><button type="button" disabled={dispositionInvalid || props.submitting !== null} onClick={() => void props.dispose(props.dispositionForm)} className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{props.submitting === `dispose-${props.item.id}` ? "Recording…" : "Record disposition"}</button></div></div> : null}</div>;
}

function SummaryCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) { return <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><div><div className="text-sm text-slate-500">{label}</div><div className="mt-1 text-2xl font-bold text-slate-900">{value}</div></div><div className="text-slate-400">{icon}</div></div></div>; }
function Loading() { return <div className="absolute inset-0 flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-b-slate-900" /></div>; }
function EmptyReturns() { return <div className="p-10 text-center"><RotateCcw size={32} className="mx-auto text-slate-300" /><h3 className="mt-4 font-semibold text-slate-900">No physical return records available</h3><p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">Marketplace returns will appear here when physical processing is required.</p></div>; }
function Metric({ label, value }: { label: string; value: number }) { return <div><div className="text-xs uppercase text-slate-400">{label}</div><div className="mt-1 font-semibold text-slate-900">{value}</div></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-700">{label}<div className="mt-1">{children}</div></label>; }
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">{title}</h2><div className="mt-4 space-y-3">{children}</div></div>; }
function InfoRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 text-sm"><span className="text-slate-600">{label}</span><span className="font-medium text-slate-900">{value}</span></div>; }
