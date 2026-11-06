"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import {
  ArrowLeft,
  Search,
  X,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  logisticsApi,
  type LogisticsTrackingResponse,
} from "@/lib/api/logistics";

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

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

export default function LogisticsTrackingPage() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const [data, setData] =
    useState<LogisticsTrackingResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const currentSearch =
    searchParams.get("search") ?? "";

  const currentStatus =
    searchParams.get("status") ?? "";

  const trackedOnly =
    searchParams.get("tracked_only") ===
    "1";

  const currentPage =
    Number(
      searchParams.get("page") ?? "1",
    ) || 1;

  const [searchTerm, setSearchTerm] =
    useState(currentSearch);

  const updateUrl =
    useCallback(
      (next: {
        search?: string;
        status?: string;
        tracked_only?: boolean;
        page?: number;
      }) => {
        const params =
          new URLSearchParams(
            searchParams.toString(),
          );

        const merged = {
          search: currentSearch,
          status: currentStatus,
          tracked_only:
            trackedOnly,
          page: currentPage,
          ...next,
        };

        if (merged.search) {
          params.set(
            "search",
            merged.search,
          );
        } else {
          params.delete("search");
        }

        if (merged.status) {
          params.set(
            "status",
            merged.status,
          );
        } else {
          params.delete("status");
        }

        if (merged.tracked_only) {
          params.set(
            "tracked_only",
            "1",
          );
        } else {
          params.delete(
            "tracked_only",
          );
        }

        if (
          merged.page &&
          merged.page > 1
        ) {
          params.set(
            "page",
            String(merged.page),
          );
        } else {
          params.delete("page");
        }

        const query =
          params.toString();

        router.push(
          query
            ? `/admin/logistics/tracking?${query}`
            : "/admin/logistics/tracking",
        );
      },
      [
        router,
        searchParams,
        currentSearch,
        currentStatus,
        trackedOnly,
        currentPage,
      ],
    );

  useEffect(() => {
    setSearchTerm(
      currentSearch,
    );
  }, [currentSearch]);

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          if (
            searchTerm !==
            currentSearch
          ) {
            updateUrl({
              search:
                searchTerm,
              page: 1,
            });
          }
        },
        500,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    searchTerm,
    currentSearch,
    updateUrl,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await logisticsApi.getTracking(
            {
              search:
                currentSearch ||
                undefined,

              status:
                currentStatus ||
                undefined,

              tracked_only:
                trackedOnly ||
                undefined,

              page:
                currentPage,

              per_page: 25,
            },
          );

        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        console.error(
          "Failed to load Logistics tracking:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to load shipment tracking records.",
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
  }, [
    currentSearch,
    currentStatus,
    trackedOnly,
    currentPage,
  ]);

  const hasFilters =
    currentSearch !== "" ||
    currentStatus !== "" ||
    trackedOnly;

  const clearFilters = () => {
    setSearchTerm("");

    updateUrl({
      search: "",
      status: "",
      tracked_only: false,
      page: 1,
    });
  };

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
            Shipment Tracking
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review tracking identifiers and shipment delivery progress from the active shipment domain.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">
            Total Shipments
          </div>

          <div className="mt-1 text-2xl font-bold text-slate-900">
            {data?.summary.total ?? 0}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">
            With Tracking Number
          </div>

          <div className="mt-1 text-2xl font-bold text-slate-900">
            {data?.summary.with_tracking_number ??
              0}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">
            Delivered
          </div>

          <div className="mt-1 text-2xl font-bold text-slate-900">
            {data?.summary.delivered ??
              0}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_auto_auto]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value,
                    )
                  }
                  placeholder="Search shipment, tracking number, carrier or order..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={currentStatus}
                onChange={(event) =>
                  updateUrl({
                    status:
                      event.target.value,
                    page: 1,
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
              >
                <option value="">
                  All Persisted Statuses
                </option>

                {data?.filters.statuses.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {formatValue(status)}
                    </option>
                  ),
                )}
              </select>
            </div>

            <label className="mt-7 inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={trackedOnly}
                onChange={(event) =>
                  updateUrl({
                    tracked_only:
                      event.target.checked,
                    page: 1,
                  })
                }
              />

              Tracked only
            </label>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-7 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <X size={15} />
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="relative min-h-[320px] overflow-x-auto">
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-b-slate-900" />
            </div>
          ) : null}

          {error ? (
            <div className="p-8">
              <h2 className="font-semibold text-slate-900">
                Tracking data unavailable
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>
            </div>
          ) : data &&
            data.data.length > 0 ? (
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Shipment
                  </th>
                  <th className="px-5 py-3">
                    Order
                  </th>
                  <th className="px-5 py-3">
                    Carrier / Tracking
                  </th>
                  <th className="px-5 py-3">
                    Route
                  </th>
                  <th className="px-5 py-3">
                    Delivery
                  </th>
                  <th className="px-5 py-3">
                    Status
                  </th>
                  <th className="px-5 py-3">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.data.map(
                  (shipment) => (
                    <tr
                      key={shipment.id}
                      className="align-top"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {
                            shipment.shipment_number
                          }
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {formatValue(
                            shipment.shipping_method,
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-700">
                          {
                            shipment.order
                              .order_number
                          }
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-slate-700">
                          {shipment.carrier ??
                            "Carrier not assigned"}
                        </div>

                        <div className="mt-1 font-mono text-xs text-slate-500">
                          {shipment.tracking_number ??
                            "No tracking number"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div>
                          {shipment.origin_port ??
                            "—"}
                        </div>

                        <div className="my-1 text-xs text-slate-400">
                          ↓
                        </div>

                        <div>
                          {shipment.destination_port ??
                            "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div>
                          ETA:{" "}
                          {formatDate(
                            shipment.estimated_delivery_date,
                          )}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Delivered:{" "}
                          {formatDate(
                            shipment.delivered_at,
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {formatValue(
                            shipment.status,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/logistics/shipments/${shipment.id}`}
                          className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
                        >
                          Open Shipment
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center">
              <h2 className="font-semibold text-slate-900">
                No tracking records found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                No tenant shipment records match the current tracking filters.
              </p>
            </div>
          )}
        </div>

        {data &&
        data.pagination.last_page > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <div className="text-sm text-slate-500">
              Page{" "}
              {
                data.pagination
                  .current_page
              }{" "}
              of{" "}
              {data.pagination.last_page}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  data.pagination
                    .current_page <= 1
                }
                onClick={() =>
                  updateUrl({
                    page:
                      data.pagination
                        .current_page -
                      1,
                  })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  data.pagination
                    .current_page >=
                  data.pagination
                    .last_page
                }
                onClick={() =>
                  updateUrl({
                    page:
                      data.pagination
                        .current_page +
                      1,
                  })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-900">
          Read-only tracking registry
        </div>

        <p className="mt-1 text-sm text-slate-600">
          Carrier synchronization, tracking refresh, status mutation and event-history management are disabled. This screen only reflects persisted active shipment records.
        </p>
      </div>
    </div>
  );
}