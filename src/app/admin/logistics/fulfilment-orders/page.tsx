"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Search,
  X,
} from "lucide-react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  logisticsApi,
  type LogisticsFulfilmentOrderListResponse,
} from "@/lib/api/logistics";
import { LogisticsStatusCharts, statusData } from "@/features/admin/logistics/components/LogisticsStatusCharts";

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
  value: string | number,
  currency: string | null,
) {
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

function FulfilmentOrdersContent() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const [data, setData] =
    useState<LogisticsFulfilmentOrderListResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [searchTerm, setSearchTerm] =
    useState(
      searchParams.get("search") ??
        "",
    );

  const currentSearch =
    searchParams.get("search") ??
    "";

  const currentStatus =
    searchParams.get(
      "fulfillment_status",
    ) ?? "";

  const currentPage =
    Math.max(
      Number(
        searchParams.get("page"),
      ) || 1,
      1,
    );

  const currentPerPage =
    Math.max(
      Number(
        searchParams.get(
          "per_page",
        ),
      ) || 10,
      1,
    );

  const updateUrl =
    useCallback(
      (next: {
        search?: string;
        fulfillment_status?: string;
        page?: number;
        per_page?: number;
      }) => {
        const params =
          new URLSearchParams(
            searchParams.toString(),
          );

        const merged = {
          search:
            currentSearch,
          fulfillment_status:
            currentStatus,
          page:
            currentPage,
          per_page:
            currentPerPage,
          ...next,
        };

        if (merged.search) {
          params.set(
            "search",
            merged.search,
          );
        } else {
          params.delete(
            "search",
          );
        }

        if (
          merged.fulfillment_status
        ) {
          params.set(
            "fulfillment_status",
            merged.fulfillment_status,
          );
        } else {
          params.delete(
            "fulfillment_status",
          );
        }

        if (
          merged.page &&
          merged.page > 1
        ) {
          params.set(
            "page",
            String(
              merged.page,
            ),
          );
        } else {
          params.delete(
            "page",
          );
        }

        if (
          merged.per_page &&
          merged.per_page !== 10
        ) {
          params.set(
            "per_page",
            String(
              merged.per_page,
            ),
          );
        } else {
          params.delete(
            "per_page",
          );
        }

        const query =
          params.toString();

        router.push(
          query
            ? `/admin/logistics/fulfilment-orders?${query}`
            : "/admin/logistics/fulfilment-orders",
        );
      },
      [
        router,
        searchParams,
        currentSearch,
        currentStatus,
        currentPage,
        currentPerPage,
      ],
    );

  useEffect(() => {
    setSearchTerm(
      currentSearch,
    );
  }, [currentSearch]);

  useEffect(() => {
    let cancelled = false;

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
      cancelled = true;
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
          await logisticsApi.getFulfilmentOrders(
            {
              search:
                currentSearch ||
                undefined,

              fulfillment_status:
                currentStatus ||
                undefined,

              page:
                currentPage,

              per_page:
                currentPerPage,
            },
          );

        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        console.error(
          "Failed to load fulfilment orders:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to load fulfilment orders.",
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
    currentPage,
    currentPerPage,
  ]);

  const clearFilters = () => {
    setSearchTerm("");

    updateUrl({
      search: "",
      fulfillment_status:
        "",
      page: 1,
    });
  };

  const hasActiveFilters =
    currentSearch !== "" ||
    currentStatus !== "";

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
            Fulfilment Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review tenant-scoped order fulfilment records using persisted order data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">
            Total Orders
          </div>

          <div className="mt-1 text-2xl font-bold text-slate-900">
            {data?.summary.total ??
              0}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">
            Pending Fulfilment
          </div>

          <div className="mt-1 text-2xl font-bold text-slate-900">
            {data?.summary.pending ??
              0}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">
            Confirmed Fulfilment
          </div>

          <div className="mt-1 text-2xl font-bold text-slate-900">
            {data?.summary.confirmed ??
              0}
          </div>
        </div>
      </div>

      {data ? <LogisticsStatusCharts data={statusData(data.status_counts)} noun="Orders" distributionTitle="Fulfilment Status Distribution" summaryTitle="Fulfilment Bottleneck Summary" /> : null}

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={
                    searchTerm
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearchTerm(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Search order or supplier..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400"
                />
              </div>
            </div>

            <div className="w-full lg:w-64">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Fulfilment Status
              </label>

              <select
                value={
                  currentStatus
                }
                onChange={(
                  event,
                ) =>
                  updateUrl({
                    fulfillment_status:
                      event
                        .target
                        .value,
                    page: 1,
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400"
              >
                <option value="">
                  All Persisted Statuses
                </option>

                {data?.filters.fulfillment_statuses.map(
                  (
                    status,
                  ) => (
                    <option
                      key={
                        status
                      }
                      value={
                        status
                      }
                    >
                      {formatStatus(
                        status,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <X size={15} />
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="relative min-h-[300px] overflow-x-auto">
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-b-slate-900" />
            </div>
          ) : null}

          {error ? (
            <div className="p-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Fulfilment data unavailable
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>
            </div>
          ) : data &&
            data.data.length >
              0 ? (
            <table className="w-full min-w-[1050px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Order
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Supplier
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Buyer
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fulfilment
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Order Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Items
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Shipments
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Expected Delivery
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Order Total
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.data.map(
                  (order) => (
                    <tr
                      key={
                        order.id
                      }
                      className="hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {
                            order.order_number
                          }
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          ID:{" "}
                          {
                            order.id
                          }
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {order
                          .supplier
                          ?.company_name ??
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {order
                          .buyer
                          ?.name ??
                          "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`status-badge-rich ${statusTone(
                            order.fulfillment_status,
                          )}`}
                        >
                          {formatStatus(
                            order.fulfillment_status,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {formatStatus(
                          order.order_status,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {
                          order.item_count
                        }
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {
                          order.shipment_count
                        }
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {formatDate(
                          order.expected_delivery_date,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-900">
                        {formatAmount(
                          order.total_amount,
                          order.currency,
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/logistics/fulfilment-orders/${order.id}`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Open Fulfilment
                          <ExternalLink size={14} />
                        </Link>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center">
              <h2 className="text-base font-semibold text-slate-900">
                No fulfilment orders found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                No tenant-scoped orders match the current filters.
              </p>
            </div>
          )}
        </div>

        {!error &&
        data &&
        data.total > 0 ? (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              Page{" "}
              {
                data.current_page
              }{" "}
              of{" "}
              {
                data.last_page
              }{" "}
              ·{" "}
              {
                data.total
              }{" "}
              orders
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={
                  data.current_page <=
                  1
                }
                onClick={() =>
                  updateUrl({
                    page:
                      data.current_page -
                      1,
                  })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  data.current_page >=
                  data.last_page
                }
                onClick={() =>
                  updateUrl({
                    page:
                      data.current_page +
                      1,
                  })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-900">
          Read-only fulfilment view
        </div>

        <p className="mt-1 text-sm text-slate-600">
          Allocation, warehouse assignment, picking, packing and dispatch actions remain disabled until an authoritative fulfilment workflow is implemented.
        </p>
      </div>
    </div>
  );
}

export default function FulfilmentOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">
          Loading Fulfilment Orders...
        </div>
      }
    >
      <FulfilmentOrdersContent />
    </Suspense>
  );
}
