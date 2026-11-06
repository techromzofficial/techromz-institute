"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ShoppingCart,
  WalletCards,
  PackageCheck,
  Ban,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import { MarketplaceDistributionCharts } from "@/components/admin/marketplace/MarketplaceAnalyticsCharts";
import {
  fetchMarketplaceOrders,
  type MarketplaceOrderParams,
  type MarketplaceOrdersResponse,
} from "@/lib/api/marketplace";

function MarketplaceOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] =
    useState<MarketplaceOrdersResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const paymentStatus =
    searchParams.get("payment_status") ?? "all";
  const fulfillmentStatus =
    searchParams.get("fulfillment_status") ?? "all";
  const page = Number(searchParams.get("page") ?? "1");

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const controller = new AbortController();
    const filters: MarketplaceOrderParams = {
      q: search || undefined,
      status: status !== "all" ? status : undefined,
      payment_status: paymentStatus !== "all" ? paymentStatus : undefined,
      fulfillment_status: fulfillmentStatus !== "all" ? fulfillmentStatus : undefined,
      page,
      per_page: 20,
    };

    setLoading(true);
    setError("");

    fetchMarketplaceOrders(filters, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          setData(response);
        }
      })
      .catch((reason: Error) => {
        if (!controller.signal.aborted) {
          setError(
            reason.message ||
              "Marketplace orders could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [search, status, paymentStatus, fulfillmentStatus, page, requestVersion]);

  function updateFilters(
    values: Record<string, string | number | null>,
  ) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    Object.entries(values).forEach(([key, value]) => {
      if (
        value === null ||
        value === "" ||
        value === "all"
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.push(
      `/admin/marketplace/orders${
        params.toString()
          ? `?${params.toString()}`
          : ""
      }`,
    );
  }

  function submitSearch(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    updateFilters({
      search: searchInput.trim(),
      page: 1,
    });
  }

  if (loading && !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        Loading Marketplace orders…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5" />

          <div>
            <h1 className="font-semibold">
              Marketplace Orders unavailable
            </h1>

            <p className="mt-1 text-sm">
              {error}
            </p>

            <button
              type="button"
              className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold"
              onClick={() =>
                setRequestVersion(
                  (value) => value + 1,
                )
              }
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/marketplace"
        aria-label="Back to Marketplace"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#741d35] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>
      <PageHeader
        crumbs={["Marketplace", "Order Management"]}
        title="Order Management"
        description="Monitor tenant-scoped customer orders using authoritative Commerce data. Unsupported Marketplace Admin actions remain read-only until governed backend capabilities exist."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={() =>
                setRequestVersion(
                  (value) => value + 1,
                )
              }
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<ShoppingCart className="h-5 w-5" />}
          label="Total Orders"
          value={data.summary.total_orders}
          detail="Current tenant"
        />

        <MetricCard
          icon={<WalletCards className="h-5 w-5" />}
          label="Pending"
          value={
            data.summary.status_counts.pending ?? 0
          }
          detail="Persisted order state"
        />

        <MetricCard
          icon={<PackageCheck className="h-5 w-5" />}
          label="Completed"
          value={
            data.summary.status_counts.completed ?? 0
          }
          detail="Persisted order state"
        />

        <MetricCard
          icon={<Ban className="h-5 w-5" />}
          label="Cancelled"
          value={
            data.summary.status_counts.cancelled ?? 0
          }
          detail="Persisted order state"
        />
      </section>

      <MarketplaceDistributionCharts
        title="order status"
        donutData={Object.entries(data.summary.status_counts).map(([name, value]) => ({ name, value }))}
        barData={Object.entries(data.summary.fulfillment_status_counts).map(([name, value]) => ({ name, value }))}
        totalLabel="Orders"
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_repeat(3,minmax(150px,220px))]">
          <form
            onSubmit={submitSearch}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value,
                  )
                }
                placeholder="Search order, customer or seller"
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#741d35]"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white"
            >
              Search
            </button>
          </form>

          <select
            value={status}
            onChange={(event) =>
              updateFilters({
                status: event.target.value,
                page: 1,
              })
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">
              All Order Statuses
            </option>

            {data.filters.statuses.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {formatStatus(item)}
                </option>
              ),
            )}
          </select>

          <select
            value={paymentStatus}
            onChange={(event) =>
              updateFilters({
                payment_status:
                  event.target.value,
                page: 1,
              })
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">
              All Payment Statuses
            </option>

            {data.filters.observed_payment_statuses.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {formatStatus(item)}
                </option>
              ),
            )}
          </select>

          <select
            value={fulfillmentStatus}
            onChange={(event) =>
              updateFilters({
                fulfillment_status:
                  event.target.value,
                page: 1,
              })
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">
              All Fulfilment Statuses
            </option>

            {data.filters.observed_fulfillment_statuses.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {formatStatus(item)}
                </option>
              ),
            )}
          </select>
        </div>
      </section>

      {data.summary.currency_totals.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.summary.currency_totals.map(
            (row) => (
              <article
                key={row.currency}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {row.currency} Order Value
                </p>

                <strong className="mt-2 block text-xl text-slate-950">
                  {row.currency}{" "}
                  {row.total_amount}
                </strong>

                <p className="mt-1 text-xs text-slate-500">
                  {row.orders_count}{" "}
                  {row.orders_count === 1
                    ? "order"
                    : "orders"}
                </p>
              </article>
            ),
          )}
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-950">
            Marketplace Orders
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Showing{" "}
            {data.pagination.from ?? 0}–
            {data.pagination.to ?? 0} of{" "}
            {data.pagination.total}
          </p>
        </div>

        {data.orders.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No orders match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Order
                  </th>
                  <th className="px-5 py-3">
                    Customer
                  </th>
                  <th className="px-5 py-3">
                    Seller
                  </th>
                  <th className="px-5 py-3">
                    Items
                  </th>
                  <th className="px-5 py-3">
                    Order Status
                  </th>
                  <th className="px-5 py-3">
                    Payment
                  </th>
                  <th className="px-5 py-3">
                    Fulfilment
                  </th>
                  <th className="px-5 py-3 text-right">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/marketplace/orders/${order.id}`}
                        className="font-semibold text-[#741d35] hover:underline"
                      >
                        {order.order_reference}
                      </Link>

                      {order.created_at && (
                        <div className="mt-1 text-xs text-slate-400">
                          {new Date(
                            order.created_at,
                          ).toLocaleString()}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">
                        {order.customer?.name ??
                          "—"}
                      </div>

                      {order.customer?.email && (
                        <div className="mt-1 text-xs text-slate-400">
                          {order.customer.email}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {order.supplier
                        ?.company_name ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {order.items_count}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        value={order.status}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        value={
                          order.payment_status
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        value={
                          order.fulfillment_status
                        }
                      />
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-slate-950">
                      {order.amounts.currency &&
                      order.amounts.total
                        ? `${order.amounts.currency} ${order.amounts.total}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
          <span className="text-xs text-slate-500">
            Page{" "}
            {data.pagination.current_page} of{" "}
            {data.pagination.last_page}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                data.pagination.current_page <= 1
              }
              onClick={() =>
                updateFilters({
                  page:
                    data.pagination.current_page -
                    1,
                })
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              disabled={
                data.pagination.current_page >=
                data.pagination.last_page
              }
              onClick={() =>
                updateFilters({
                  page:
                    data.pagination.current_page +
                    1,
                })
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <strong className="mt-2 block text-2xl text-slate-950">
            {value}
          </strong>
        </div>

        <div className="rounded-lg bg-slate-100 p-2 text-[#741d35]">
          {icon}
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {detail}
      </p>
    </article>
  );
}

function StatusBadge({
  value,
}: {
  value: string | null;
}) {
  if (!value) {
    return (
      <span className="text-slate-400">
        —
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
      {formatStatus(value)}
    </span>
  );
}

function formatStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export default function MarketplaceOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          Loading Marketplace orders…
        </div>
      }
    >
      <MarketplaceOrdersContent />
    </Suspense>
  );
}
