"use client";

import React, {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import {
  useParams,
} from "next/navigation";

import {
  logisticsApi,
  type LogisticsFulfilmentOrderDetailResponse,
} from "@/lib/api/logistics";

function formatStatus(
  value: string | null,
) {
  if (!value) {
    return "Not set";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
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

function formatAmount(
  value: string | number | null,
  currency: string | null,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  const amount =
    typeof value === "number"
      ? value
      : Number(value);

  if (
    Number.isNaN(amount)
  ) {
    return "—";
  }

  return `${currency ?? ""} ${amount.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`.trim();
}

function statusTone(
  status: string | null,
) {
  if (
    status === "confirmed"
  ) {
    return "success";
  }

  if (
    status === "pending"
  ) {
    return "warning";
  }

  return "neutral";
}

export default function FulfilmentOrderDetailPage() {
  const params = useParams();

  const orderId =
    params.orderId as string;

  const [data, setData] =
    useState<LogisticsFulfilmentOrderDetailResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await logisticsApi.getFulfilmentOrder(
            orderId,
          );

        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        console.error(
          "Failed to load fulfilment order detail:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to load this fulfilment order.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading fulfilment order...
        </div>
      </div>
    );
  }

  if (
    error ||
    !data
  ) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/logistics/fulfilment-orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Fulfilment Orders
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          {error ??
            "Fulfilment order not found."}
        </div>
      </div>
    );
  }

  const order =
    data.order;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/admin/logistics/fulfilment-orders"
          aria-label="Back to Fulfilment Orders"
          className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {order.order_number}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Fulfilment Order Detail
              </p>
            </div>

            <span
              className={`status-badge-rich ${statusTone(
                order.fulfillment_status,
              )}`}
            >
              {formatStatus(
                order.fulfillment_status,
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">
              Order Information
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Order Number
                </div>

                <div className="mt-1 font-medium text-slate-900">
                  {order.order_number}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Order ID
                </div>

                <div className="mt-1 text-slate-900">
                  {order.id}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  UUID
                </div>

                <div className="mt-1 break-all text-slate-700">
                  {order.uuid}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Order Status
                </div>

                <div className="mt-1 text-slate-900">
                  {formatStatus(
                    order.order_status,
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Fulfilment Status
                </div>

                <div className="mt-1 text-slate-900">
                  {formatStatus(
                    order.fulfillment_status,
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Expected Delivery
                </div>

                <div className="mt-1 text-slate-900">
                  {formatDate(
                    order.expected_delivery_date,
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Order Total
                </div>

                <div className="mt-1 font-medium text-slate-900">
                  {formatAmount(
                    order.total_amount,
                    order.currency,
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Order Items
              </h2>
            </div>

            {order.items.length >
            0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Product
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        SKU
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Variant
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Quantity
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Unit Price
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {order.items.map(
                      (item) => (
                        <tr
                          key={
                            item.id
                          }
                        >
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {item.product_name ??
                              "—"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            {item.sku ??
                              "—"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            {item.variant_label ??
                              "—"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            {item.quantity}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            {formatAmount(
                              item.unit_price,
                              item.currency,
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-slate-900">
                            {formatAmount(
                              item.total_amount,
                              item.currency,
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                No order items are available.
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Related Shipments
              </h2>
            </div>

            {order.shipments.length >
            0 ? (
              <div className="divide-y divide-slate-100">
                {order.shipments.map(
                  (shipment) => (
                    <div
                      key={
                        shipment.id
                      }
                      className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <div className="font-medium text-slate-900">
                          {
                            shipment.shipment_number
                          }
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          {shipment.carrier ??
                            "Carrier not assigned"}
                          {" · "}
                          {shipment.tracking_number ??
                            "Tracking not assigned"}
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          {shipment.shipping_method ??
                            "Shipping method not set"}
                          {" · "}
                          Expected{" "}
                          {formatDate(
                            shipment.estimated_delivery_date,
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`status-badge-rich ${
                            shipment.status ===
                            "delivered"
                              ? "success"
                              : shipment.status ===
                                  "pending"
                                ? "warning"
                                : "neutral"
                          }`}
                        >
                          {formatStatus(
                            shipment.status,
                          )}
                        </span>

                        <Link
                          href={`/admin/logistics/shipments/${encodeURIComponent(
                            shipment.shipment_number,
                          )}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Open Shipment
                          <ExternalLink
                            size={14}
                          />
                        </Link>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                No shipment records are linked to this order.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Related Entities
            </h2>

            <div className="space-y-5">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Supplier
                </div>

                <div className="mt-1 font-medium text-slate-900">
                  {order.supplier
                    ?.company_name ??
                    "—"}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Buyer
                </div>

                <div className="mt-1 font-medium text-slate-900">
                  {order.buyer
                    ?.name ??
                    "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Marketplace Order
            </h2>

            <Link
              href={`/admin/marketplace/orders/${order.id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"            >
              View Marketplace Order
              <ExternalLink
                size={15}
              />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm font-semibold text-slate-900">
              Read-only fulfilment record
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Allocation, warehouse assignment, picking, packing and dispatch remain disabled until an authoritative fulfilment workflow is implemented.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}