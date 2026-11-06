"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

import { ShipmentLifecycleActions } from "@/features/admin/logistics/components/ShipmentLifecycleActions";
import { ShipmentAllocationPanel } from "@/features/admin/logistics/components/ShipmentAllocationPanel";
import ShipmentAssignmentPanel from "@/features/admin/logistics/components/ShipmentAssignmentPanel";
import ShipmentRouteEditor from "@/features/admin/logistics/components/ShipmentRouteEditor";
import ShipmentTrackingEventForm from "@/features/admin/logistics/components/ShipmentTrackingEventForm";
import {
  logisticsApi,
  type LogisticsShipmentDetailResponse,
} from "@/lib/api/logistics";

const ShipmentTrackingMap = dynamic(() => import("@/features/admin/logistics/components/ShipmentTrackingMap"), { ssr: false, loading: () => <div className="grid min-h-[320px] place-items-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500">Loading shipment map...</div> });

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDateTime(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Date(
    value,
  ).toLocaleString();
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString();
}

export default function ShipmentDetailPage() {
  const params = useParams();

  const shipmentId =
    params.shipmentId as string;

  const [data, setData] =
    useState<LogisticsShipmentDetailResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const loadShipment =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await logisticsApi.getShipment(
            shipmentId,
          );

        setData(response);
      } catch (err) {
        console.error(
          "Failed to load shipment detail:",
          err,
        );

        setError(
          "Unable to load this shipment.",
        );
      } finally {
        setLoading(false);
      }
    }, [shipmentId]);

  useEffect(() => {
    void loadShipment();
  }, [loadShipment]);

  if (loading) {
    return (
      <div className="shipment-detail-page">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading shipment...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/logistics/shipments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          Back to Shipment Operations
        </Link>

        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6">
          <h2 className="text-sm font-semibold text-rose-900">
            Shipment unavailable
          </h2>

          <p className="mt-2 text-sm text-rose-700">
            {error ??
              "Unable to load this shipment."}
          </p>
        </div>
      </div>
    );
  }

  const shipment =
    data.shipment;
  const statusHistory = shipment.status_history ?? [];
  const trackingHistory = shipment.tracking_history ?? [];

  return (
    <div className="shipment-detail-page space-y-6">
      <div className="shipment-detail-header">
        <div className="detail-header-top">
          <Link
            href="/admin/logistics/shipments"
            className="back-btn-rich"
          >
            <ArrowLeft size={16} />
            Back to Shipment Operations
          </Link>
        </div>

        <div className="header-identities">
          <div>
            <h1 className="public-ref">
              {
                shipment.shipment_number
              }
            </h1>

            <span className="db-ref">
              Shipment ID:{" "}
              {shipment.id}
            </span>
          </div>

          <span
            className={`status-badge-rich ${
              shipment.status ===
              "delivered"
                ? "success"
                : shipment.status ===
                    "pending"
                  ? "warning"
                  : shipment.status ===
                      "cancelled"
                    ? "danger"
                    : "neutral"
            }`}
          >
            {formatStatus(
              shipment.status,
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">
              Shipment Information
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Shipment Number
                </div>

                <div className="mt-1 font-medium text-slate-900">
                  {
                    shipment.shipment_number
                  }
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  UUID
                </div>

                <div className="mt-1 break-all text-slate-700">
                  {shipment.uuid}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Carrier
                </div>

                <div className="mt-1 text-slate-900">
                  {shipment.carrier ??
                    "Not assigned"}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tracking Number
                </div>

                <div className="mt-1 text-slate-900">
                  {shipment.tracking_number ??
                    "Not assigned"}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Shipping Method
                </div>

                <div className="mt-1 text-slate-900">
                  {shipment.shipping_method ??
                    "—"}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </div>

                <div className="mt-1 text-slate-900">
                  {formatStatus(
                    shipment.status,
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">
              Route & Schedule
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Origin
                </div>

                <div className="mt-1 text-slate-900">
                  {shipment.origin_port ??
                    "—"}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Destination
                </div>

                <div className="mt-1 text-slate-900">
                  {shipment.destination_port ??
                    "—"}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Estimated Ship Date
                </div>

                <div className="mt-1 text-slate-900">
                  {formatDate(
                    shipment.estimated_ship_date,
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Estimated Delivery Date
                </div>

                <div className="mt-1 text-slate-900">
                  {formatDate(
                    shipment.estimated_delivery_date,
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Shipped At
                </div>

                <div className="mt-1 text-slate-900">
                  {formatDateTime(
                    shipment.shipped_at,
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Delivered At
                </div>

                <div className="mt-1 text-slate-900">
                  {formatDateTime(
                    shipment.delivered_at,
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <ShipmentTrackingMap tracking={data.tracking_map ?? { origin: null, destination: null, latest_location: null, events: [], is_live: false }} carrier={shipment.carrier} trackingNumber={shipment.tracking_number} />
            <ShipmentRouteEditor shipmentId={shipmentId} data={data} onUpdated={loadShipment} />
            <ShipmentTrackingEventForm shipmentId={shipmentId} permitted={data.capabilities.add_tracking_event ?? data.capabilities.manage} onUpdated={loadShipment} />
          </div>

          {data.capabilities.allocate && shipment.order && (
            <div className="mt-6">
              <ShipmentAllocationPanel
                shipmentId={shipmentId}
                items={shipment.order.items}
                onUpdated={loadShipment}
              />
            </div>
          )}

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Shipment History</h2>
            {statusHistory.length === 0 && trackingHistory.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No shipment history has been recorded.</p>
            ) : (
              <ol className="mt-5 space-y-4 border-l border-slate-200 pl-5">
                {[
                  ...statusHistory.map((entry) => ({
                    key: `status-${entry.id}`,
                    occurredAt: entry.occurred_at,
                    title: `${formatStatus(entry.previous_status)} → ${formatStatus(entry.new_status)}`,
                    detail: `Status update · ${formatStatus(entry.source)}`,
                  })),
                  ...trackingHistory.map((entry) => ({
                    key: `tracking-${entry.id}`,
                    occurredAt: entry.occurred_at,
                    title: entry.status ? formatStatus(entry.status) : formatStatus(entry.event_type),
                    detail: ["Carrier tracking", entry.location].filter(Boolean).join(" · "),
                  })),
                ].sort((left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime()).map((entry) => (
                  <li key={entry.key} className="relative">
                    <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-400" />
                    <div className="text-sm font-medium text-slate-900">{entry.title}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{entry.detail} · {formatDateTime(entry.occurredAt)}</div>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <ShipmentAssignmentPanel shipmentId={shipmentId} canChange={data.capabilities.change_carrier} currentCarrierId={shipment.retail_carrier_id} currentServiceId={shipment.retail_carrier_service_id} currentCost={Number(shipment.shipping_cost??0)} onUpdated={loadShipment}/>
        </div>

        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Related Order
            </h2>

            {shipment.order ? (
              <>
                <div className="mb-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Order Number
                  </div>

                  <div className="mt-1 font-medium text-slate-900">
                    {
                      shipment.order
                        .order_number
                    }
                  </div>
                </div>

                <div className="mb-5">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Order ID
                  </div>

                  <div className="mt-1 text-slate-900">
                    {
                      shipment.order.id
                    }
                  </div>
                </div>

                <Link
                  href={`/admin/marketplace/orders/${shipment.order.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  View Order
                  <ExternalLink
                    size={15}
                  />
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No related order is available.
              </p>
            )}
          </div>

          <div className="mt-6">
            <ShipmentLifecycleActions
              shipmentId={shipmentId}
              status={shipment.status}
              capabilities={data.capabilities}
              onUpdated={
                loadShipment
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
