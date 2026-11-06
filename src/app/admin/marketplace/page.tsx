"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  CircleAlert,
  Layers3,
  Megaphone,
  Radio,
  RefreshCw,
  RotateCcw,
  ShoppingCart,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { MarketplaceDistributionCharts } from "@/components/admin/marketplace/MarketplaceAnalyticsCharts";
import {
  fetchMarketplaceCommandCenter,
  type MarketplaceCommandCenterResponse,
} from "@/lib/api/marketplace";

const lifecycle = [
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["production", "Production"],
  ["shipped", "Shipped"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
] as const;

export default function MarketplaceCommandCenterPage() {
  const [data, setData] =
    useState<MarketplaceCommandCenterResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    fetchMarketplaceCommandCenter(controller.signal)
      .then((response) => {
        setData(response);
      })
      .catch((reason: Error & { name?: string }) => {
        if (reason.name === "AbortError") {
          return;
        }

        setData(null);
        setError(
          reason.message ||
            "Marketplace activity could not be loaded.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [requestVersion]);

  if (loading && !data) {
    return (
      <div
        role="status"
        className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm"
      >
        Loading Marketplace Command Center…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <h1 className="font-semibold">
              Marketplace Command Center is unavailable
            </h1>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-red-100"
              onClick={() =>
                setRequestVersion((value) => value + 1)
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
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#741d35]">
            Marketplace · Command &amp; Control
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Marketplace Command Center
          </h1>

          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Tenant-scoped Marketplace activity using authoritative
            Commerce, Supplier and Catalogue data.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/marketplace/orders"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            View Orders
          </Link>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5d172b]"
            onClick={() =>
              setRequestVersion((value) => value + 1)
            }
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          icon={<ShoppingCart className="h-5 w-5" />}
          label="Total Orders"
          value={String(data.summary.orders.total)}
          detail="Orders belonging to the current tenant"
        />

        <MetricCard
          icon={<Users className="h-5 w-5" />}
          label="Marketplace Sellers"
          value={String(data.summary.suppliers.total)}
          detail="Tenant Supplier records"
        />

        <MetricCard
          icon={<Boxes className="h-5 w-5" />}
          label="Catalogue Products"
          value={String(data.summary.products.total)}
          detail="Tenant Catalogue products"
        />

        <MetricCard
          icon={<Layers3 className="h-5 w-5" />}
          label="Total Listings"
          value={String(data.summary.listings.total)}
          detail={`${data.summary.listings.published} published`}
        />

        <MetricCard
          icon={<Radio className="h-5 w-5" />}
          label="Total Channels"
          value={String(data.summary.channels.total)}
          detail={`${data.summary.channels.active} active`}
        />

        <MetricCard
          icon={<Megaphone className="h-5 w-5" />}
          label="Active Promotions"
          value={String(data.summary.promotions.active)}
          detail="Persisted active promotions"
        />

        <MetricCard
          icon={<CircleAlert className="h-5 w-5" />}
          label="Open Policy Violations"
          value={String(data.summary.policy_violations.open)}
          detail="Cases currently open"
        />

        <MetricCard
          icon={<RotateCcw className="h-5 w-5" />}
          label="Open Returns & Disputes"
          value={String(data.summary.returns_disputes.open)}
          detail="Open or in-progress cases"
        />
      </section>

      <MarketplaceDistributionCharts
        title="order status"
        donutData={Object.entries(data.order_status_counts).map(([name, value]) => ({ name, value }))}
        totalLabel="Orders"
      />

      <section>
        <div className="mb-3">
          <h2 className="font-semibold text-slate-950">
            Commercial Value by Currency
          </h2>

          <p className="text-xs text-slate-500">
            Monetary totals remain separated by persisted currency.
          </p>
        </div>

        {data.currency_totals.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-7 text-center text-sm text-slate-500 shadow-sm">
            No order value is currently available for this tenant.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.currency_totals.map((row) => (
              <MetricCard
                key={row.currency}
                icon={<Tag className="h-5 w-5" />}
                label={`${row.currency} Recorded Order Value`}
                value={`${row.currency} ${row.total_amount}`}
                detail={`${row.orders_count} ${
                  row.orders_count === 1 ? "order" : "orders"
                }`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-950">
            Order Lifecycle Pipeline
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Authoritative persisted Commerce order states.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {lifecycle.map(([status, label]) => (
            <Link
              key={status}
              href={`/admin/marketplace/orders?status=${status}`}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-[#741d35] hover:bg-white"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </span>

              <strong className="mt-2 block text-2xl text-slate-950">
                {data.order_status_counts[status] ?? 0}
              </strong>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <main>
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-950">
                  Recent Marketplace Orders
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest tenant-scoped Commerce orders
                </p>
              </div>

              <Link
                className="text-sm font-semibold text-[#741d35] hover:underline"
                href="/admin/marketplace/orders"
              >
                View all →
              </Link>
            </div>

            {data.recent_orders.length === 0 ? (
              <p className="p-10 text-center text-sm text-slate-500">
                No Marketplace orders exist for this tenant.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">Seller</th>
                      <th className="px-5 py-3">Order Status</th>
                      <th className="px-5 py-3">
                        Payment
                      </th>
                      <th className="px-5 py-3">
                        Fulfilment
                      </th>
                      <th className="px-5 py-3 text-right">
                        Value
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {data.recent_orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <Link
                            className="font-semibold text-[#741d35] hover:underline"
                            href={`/admin/marketplace/orders/${order.id}`}
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

                        <td className="px-5 py-4 text-slate-700">
                          {order.supplier?.company_name ?? "—"}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge value={order.status} />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            value={order.payment_status}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            value={order.fulfillment_status}
                          />
                        </td>

                        <td className="px-5 py-4 text-right font-semibold text-slate-950">
                          {order.currency && order.total_amount
                            ? `${order.currency} ${order.total_amount}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-[#741d35]" />

              <h2 className="font-semibold text-slate-950">
                Marketplace Domains
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              <DomainState label="Listings" available={data.domains.listings.available} />
              <DomainState label="Channels" available={data.domains.channels.available} />
              <DomainState label="Promotions" available={data.domains.promotions.available} />
              <DomainState label="Policy Violations" available={data.domains.policy_violations.available} />
              <DomainState label="Returns & Disputes" available={data.domains.returns_disputes.available} />
              <DomainState label="Sellers" available={data.domains.sellers.available} />
              <DomainState label="Orders" available={data.domains.orders.available} />
              <DomainState label="Settings" available={data.domains.settings.available} />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">Marketplace Navigation</h2>
            <div className="mt-4 space-y-2">
              {data.navigation.map((item) => (
                <Link
                  key={item.code}
                  href={item.href}
                  className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-[#741d35] hover:text-[#741d35]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
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
  value: string;
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
    return <span className="text-slate-400">—</span>;
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
      {value.replaceAll("_", " ")}
    </span>
  );
}

function DomainState({
  label,
  available,
}: {
  label: string;
  available: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-3">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <span
        className={
          available
            ? "text-xs font-semibold text-emerald-700"
            : "text-xs font-semibold text-slate-400"
        }
      >
        {available ? "Available" : "Not configured"}
      </span>
    </div>
  );
}
