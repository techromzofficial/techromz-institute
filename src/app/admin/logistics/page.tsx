"use client";

import React, {
  Suspense,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import { PageHeader } from "@/components/admin/layout/PageHeader";

import { LogisticsMetricsRow } from "@/features/admin/logistics/components/LogisticsMetricsRow";
import { LogisticsCommandCenterCharts } from "@/features/admin/logistics/components/LogisticsCommandCenterCharts";

import {
  logisticsApi,
  type LogisticsCommandCenterResponse,
} from "@/lib/api/logistics";

function LogisticsContent() {
  const [data, setData] =
    useState<LogisticsCommandCenterResponse | null>(
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

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await logisticsApi.getCommandCenter();

        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        console.error(
          "Failed loading Logistics Command Center:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to load Logistics data.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[
          "Logistics",
          "Command Center",
        ]}
        title="Logistics & Fulfilment Command Center"
        description="Monitor tenant-scoped shipment activity and open supported Logistics operations."
      />

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map(
              (item) => (
                <div
                  key={item}
                  className="h-36 bg-white rounded-xl border border-line shadow-sm animate-pulse"
                />
              ),
            )}
          </div>

          <div className="h-48 bg-white rounded-xl border border-line shadow-sm animate-pulse" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-line shadow-sm p-8">
          <h2 className="text-lg font-semibold text-ink">
            Logistics data unavailable
          </h2>

          <p className="text-sm text-muted mt-2">
            {error}
          </p>
        </div>
      ) : data ? (
        <>
          <LogisticsMetricsRow
            summary={data.summary}
          />

          <LogisticsCommandCenterCharts analytics={data.analytics} />

          <section className="bg-white rounded-xl border border-line shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-line flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  Recent Shipments
                </h2>

                <p className="text-sm text-muted mt-1">
                  Latest shipments available to the current tenant.
                </p>
              </div>

              {data.navigation.find(
                (item) =>
                  item.code === "LG02",
              ) ? (
                <Link
                  href="/admin/logistics/shipments"
                  className="text-sm font-medium text-primary-900 hover:underline"
                >
                  View Shipment Operations
                </Link>
              ) : null}
            </div>

            {data.recent_shipments.length ===
            0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-ink">
                  No shipments found
                </p>

                <p className="text-sm text-muted mt-1">
                  Shipment records will appear here when real order shipments exist for this tenant.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-canvas text-muted font-medium border-b border-line">
                    <tr>
                      <th className="px-6 py-4">
                        Shipment
                      </th>

                      <th className="px-6 py-4">
                        Order
                      </th>

                      <th className="px-6 py-4">
                        Tracking
                      </th>

                      <th className="px-6 py-4">
                        Shipping Method
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4">
                        Est. Delivery
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-line">
                    {data.recent_shipments.map(
                      (shipment) => (
                        <tr
                          key={shipment.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-ink">
                            {
                              shipment.shipment_number
                            }
                          </td>

                          <td className="px-6 py-4 text-ink">
                            {shipment.order_reference ??
                              "—"}
                          </td>

                          <td className="px-6 py-4 text-ink">
                            {shipment.tracking_number ??
                              "Not assigned"}
                          </td>

                          <td className="px-6 py-4 text-ink">
                            {shipment.shipping_method ??
                              "—"}
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-muted">
                              {
                                shipment.status
                              }
                            </span>
                          </td>

                          <td className="px-6 py-4 text-ink">
                            {shipment.estimated_delivery_date ??
                              "—"}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

export default function LogisticsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          Loading Logistics Command Center...
        </div>
      }
    >
      <LogisticsContent />
    </Suspense>
  );
}
