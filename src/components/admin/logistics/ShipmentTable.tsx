"use client";

import React from "react";
import Link from "next/link";
import type { LogisticsShipmentRow } from "@/lib/api/logistics";

interface ShipmentTableProps {
  shipments: LogisticsShipmentRow[];
}

function formatStatus(status: string) {
  if (!status) return "Unknown";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "delivered") {
    return "success";
  }

  if (normalized === "pending") {
    return "warning";
  }

  return "neutral";
}

export function ShipmentTable({
  shipments,
}: ShipmentTableProps) {
  if (shipments.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white">
        No shipments match the current filters.
      </div>
    );
  }

  return (
    <div className="table-container-horizontal-scroll">
      <table className="enterprise-table-rich">
        <thead>
          <tr>
            <th>Shipment</th>
            <th>Order</th>
            <th>Tracking</th>
            <th>Carrier</th>
            <th>Shipping Method</th>
            <th>Route</th>
            <th>Status</th>
            <th>Est. Delivery</th>
            <th className="text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {shipments.map((shipment) => (
            <tr key={shipment.id}>
              <td>
                <div className="cell-primary">
                  {shipment.shipment_number}
                </div>

                <div className="cell-secondary">
                  ID: {shipment.id}
                </div>
              </td>

              <td>
                {shipment.order ? (
                  <>
                    <div className="cell-primary">
                      {
                        shipment.order
                          .order_number
                      }
                    </div>

                    <div className="cell-secondary">
                      Order ID:{" "}
                      {shipment.order.id}
                    </div>
                  </>
                ) : (
                  <span className="text-slate-400">
                    —
                  </span>
                )}
              </td>

              <td>
                {shipment.tracking_number ??
                  "Not assigned"}
              </td>

              <td>
                {shipment.carrier ??
                  "Not assigned"}
              </td>

              <td>
                {shipment.shipping_method ??
                  "—"}
              </td>

              <td>
                <div className="cell-primary">
                  {shipment.origin_port ??
                    "—"}
                </div>

                <div className="cell-secondary">
                  to{" "}
                  {shipment.destination_port ??
                    "—"}
                </div>
              </td>

              <td>
                <span
                  className={`status-badge-rich ${statusClass(
                    shipment.status,
                  )}`}
                >
                  {formatStatus(
                    shipment.status,
                  )}
                </span>
              </td>

              <td>
                {shipment.estimated_delivery_date ??
                  "—"}
              </td>

              <td className="text-right">
                <div className="actions-cell justify-end">
                  <Link
                    href={`/admin/logistics/shipments/${encodeURIComponent(
                      shipment.shipment_number,
                    )}`}
                    className="button small primary"
                  >
                    Open Shipment
                  </Link>

                  {shipment.order ? (
                    <Link
                      href={`/admin/marketplace/orders/${shipment.order.id}`}
                      className="button small"
                    >
                      View Order
                    </Link>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}