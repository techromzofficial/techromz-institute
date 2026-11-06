"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

import { logisticsApi } from "@/lib/api/logistics";
import type { LogisticsShipmentDetailCapabilities } from "@/lib/api/logistics";

interface ShipmentLifecycleActionsProps {
  shipmentId: string;
  status: string;
  capabilities: LogisticsShipmentDetailCapabilities;
  onUpdated: () => Promise<void> | void;
}

export function ShipmentLifecycleActions({
  shipmentId,
  status,
  capabilities,
  onUpdated,
}: ShipmentLifecycleActionsProps) {
  const [loading, setLoading] = useState(false);
  const [weightKg, setWeightKg] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>) {
    setLoading(true);
    setError(null);

    try {
      await action();
      await onUpdated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete this shipment action.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!capabilities.manage) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Shipment Workflow
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Read-only Logistics Record
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Shipment Workflow
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Available actions are determined by the current persisted shipment status.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {capabilities.start_picking && (
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            run(() => logisticsApi.startPicking(shipmentId))
          }
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Package size={16} />
          )}
          Start Picking
        </button>
      )}

      {capabilities.pack && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-700">
            Package Weight (kg)
          </label>

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={weightKg}
            onChange={(event) => setWeightKg(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />

          <button
            type="button"
            disabled={
              loading ||
              !weightKg ||
              Number(weightKg) <= 0
            }
            onClick={() =>
              run(() =>
                logisticsApi.packShipment(
                  shipmentId,
                  Number(weightKg),
                ),
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Package size={16} />
            )}
            Pack Shipment
          </button>
        </div>
      )}

      {capabilities.mark_ready_to_ship && (
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            run(() => logisticsApi.markReadyToShip(shipmentId))
          }
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CheckCircle2 size={16} />
          )}
          Mark Ready to Ship
        </button>
      )}

      {capabilities.dispatch && (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Carrier
            </label>
            <input
              type="text"
              value={carrier}
              onChange={(event) => setCarrier(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Tracking Number
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(event) =>
                setTrackingNumber(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="button"
            disabled={
              loading ||
              !carrier.trim() ||
              !trackingNumber.trim()
            }
            onClick={() =>
              run(() =>
                logisticsApi.dispatchShipment(shipmentId, {
                  carrier: carrier.trim(),
                  tracking_number: trackingNumber.trim(),
                }),
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Truck size={16} />
            )}
            Dispatch Shipment
          </button>
        </div>
      )}

      {[
        "dispatched",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "failed_delivery",
        "exception",
        "returned",
        "cancelled",
      ].includes(status) && (
        <p className="text-sm text-slate-600">
          No manual fulfilment action is available for the current shipment status.
        </p>
      )}

      {capabilities.cancel && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (
                window.confirm(
                  "Cancel this shipment and release its active inventory reservations?",
                )
              ) {
                void run(() =>
                  logisticsApi.cancelShipment(shipmentId),
                );
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
          >
            <XCircle size={16} />
            Cancel Shipment
          </button>
        </div>
      )}
    </div>
  );
}
