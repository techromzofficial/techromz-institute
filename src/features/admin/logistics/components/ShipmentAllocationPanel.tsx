"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  logisticsApi,
  type LogisticsAllocationOption,
  type LogisticsShipmentOrderItem,
} from "@/lib/api/logistics";

interface Props {
  shipmentId: string;
  items: LogisticsShipmentOrderItem[];
  onUpdated: () => Promise<void> | void;
}

export function ShipmentAllocationPanel({ shipmentId, items, onUpdated }: Props) {
  const eligibleItems = items.filter((item) => item.remaining_quantity > 0);
  const [itemId, setItemId] = useState<number | null>(eligibleItems[0]?.id ?? null);
  const [options, setOptions] = useState<LogisticsAllocationOption[]>([]);
  const [balanceId, setBalanceId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const item = eligibleItems.find((candidate) => candidate.id === itemId);
  const balance = options.find((candidate) => candidate.inventory_balance_id === balanceId);
  const maximum = Math.min(item?.remaining_quantity ?? 0, balance?.available_quantity ?? 0);
  const validQuantity = Number.isInteger(Number(quantity)) && Number(quantity) > 0 && Number(quantity) <= maximum;

  useEffect(() => {
    if (!itemId) return;
    let current = true;
    setLoadingOptions(true);
    setError(null);
    setBalanceId(null);
    setQuantity("");
    logisticsApi.getAllocationOptions(shipmentId, itemId)
      .then((response) => {
        if (current) setOptions(response.data);
      })
      .catch(() => {
        if (current) {
          setOptions([]);
          setError("Unable to load eligible inventory.");
        }
      })
      .finally(() => {
        if (current) setLoadingOptions(false);
      });
    return () => { current = false; };
  }, [itemId, shipmentId]);

  const balanceLabel = useMemo(() => (option: LogisticsAllocationOption) => {
    const warehouse = option.warehouse ? `${option.warehouse.code ?? option.warehouse.name}` : "Unknown warehouse";
    const location = option.location ? ` / ${option.location.code ?? option.location.name}` : "";
    return `${warehouse}${location} — ${option.available_quantity} available`;
  }, []);

  async function submit() {
    if (!itemId || !balanceId || !validQuantity) return;
    setSubmitting(true);
    setError(null);
    try {
      await logisticsApi.allocateInventory(shipmentId, {
        order_item_id: itemId,
        inventory_balance_id: balanceId,
        quantity: Number(quantity),
      });
      await onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to allocate inventory.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Allocate Inventory</h2>
      <p className="mt-1 text-sm text-slate-500">Reserve eligible stock for an outstanding order item.</p>
      {error && <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      {eligibleItems.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">All order items are fully allocated.</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-xs font-medium text-slate-700">Order item
            <select value={itemId ?? ""} onChange={(event) => setItemId(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {eligibleItems.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.product_name ?? candidate.sku ?? `Item ${candidate.id}`} — {candidate.remaining_quantity} remaining</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-700">Inventory balance
            <select disabled={loadingOptions || options.length === 0} value={balanceId ?? ""} onChange={(event) => setBalanceId(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50">
              <option value="">{loadingOptions ? "Loading inventory…" : options.length ? "Choose inventory" : "No eligible stock"}</option>
              {options.map((option) => <option key={option.inventory_balance_id} value={option.inventory_balance_id}>{balanceLabel(option)}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-700">Quantity (max {maximum})
            <input type="number" min="1" max={maximum || undefined} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <div className="md:col-span-3">
            <button type="button" disabled={submitting || !balanceId || !validQuantity} onClick={() => void submit()} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {submitting && <Loader2 size={16} className="animate-spin" />} Allocate Inventory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
