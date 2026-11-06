"use client";

import React, {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  CircleSlash2,
  Truck,
} from "lucide-react";

import {
  logisticsApi,
  type LogisticsExceptionResponse,
} from "@/lib/api/logistics";
import { LogisticsStatusCharts } from "@/features/admin/logistics/components/LogisticsStatusCharts";

function formatValue(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export default function LogisticsExceptionsPage() {
  const [data, setData] =
    useState<LogisticsExceptionResponse | null>(
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
          await logisticsApi.getExceptions();

        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        console.error(
          "Failed to load Logistics exceptions:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to load the operational exception monitor.",
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
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/admin/logistics"
          aria-label="Back to Logistics overview"
          className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Operational Exceptions Monitor
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review persisted shipment-status observations without inventing unsupported exception classifications.
          </p>
        </div>
      </div>

      {data ? <LogisticsStatusCharts data={data.observed_statuses.map((item) => ({ key: item.status, count: item.total }))} noun="Shipments" distributionTitle="Observed Shipment Status Distribution" summaryTitle="Operational Status Summary" /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">
                Total Shipments
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {data?.summary.total_shipments ??
                  0}
              </div>
            </div>

            <Truck
              size={22}
              className="text-slate-400"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">
                Classified Exceptions
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {data?.summary.classified_exceptions ??
                  0}
              </div>
            </div>

            <AlertTriangle
              size={22}
              className="text-slate-400"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">
                Open Exceptions
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {data?.summary.open_exceptions ??
                  0}
              </div>
            </div>

            <CircleSlash2
              size={22}
              className="text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Observed Shipment Statuses
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            These are persisted shipment statuses only. They are not automatically treated as operational exceptions.
          </p>
        </div>

        <div className="relative min-h-[220px]">
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-b-slate-900" />
            </div>
          ) : null}

          {error ? (
            <div className="p-8">
              <h3 className="font-semibold text-slate-900">
                Exception monitor unavailable
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>
            </div>
          ) : data &&
            data.observed_statuses.length >
              0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">
                      Persisted Status
                    </th>

                    <th className="px-5 py-3">
                      Shipment Count
                    </th>

                    <th className="px-5 py-3">
                      Exception Classification
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.observed_statuses.map(
                    (status) => (
                      <tr key={status.status}>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {formatValue(
                              status.status,
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-900">
                          {status.total}
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          Not classified
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <h3 className="font-semibold text-slate-900">
                No shipment statuses observed
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                No tenant shipment records are currently available for exception monitoring.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Exception Records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Dedicated Logistics exception records are not yet implemented in the authoritative backend.
          </p>
        </div>

        <div className="p-10 text-center">
          <AlertTriangle
            size={30}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-4 font-semibold text-slate-900">
            No classified exception records
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Shipment statuses are visible above, but this system does not currently classify them as damage, loss, delay, failed delivery or any other exception type.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-900">
          Exception classification unavailable
        </div>

        <p className="mt-1 text-sm text-slate-600">
          Exception creation, assignment, resolution, claims and shipment-status mutation remain disabled until an authoritative Logistics exception workflow is implemented.
        </p>
      </div>
    </div>
  );
}
