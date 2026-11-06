"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import { MarketplaceDistributionCharts } from "@/components/admin/marketplace/MarketplaceAnalyticsCharts";
import {
  fetchMarketplaceReturns,
  type MarketplaceReturnParams,
  type MarketplaceReturnsResponse,
} from "@/lib/api/marketplace";

function MarketplaceReturnsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] =
    useState<MarketplaceReturnsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "all";
  const status = searchParams.get("status") ?? "all";
  const page = Number(searchParams.get("page") ?? "1");

  const [searchInput, setSearchInput] =
    useState(search);

  const requestParams = useMemo<MarketplaceReturnParams>(
    () => ({
      q: search || undefined,
      type: type === "return" || type === "dispute" ? type : undefined,
      status: status !== "all" ? status : undefined,
      page,
      per_page: 20,
    }),
    [search, type, status, page],
  );

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    fetchMarketplaceReturns(requestParams, controller.signal)
      .then((response) => {
        setData(response);
      })
      .catch((reason: Error) => {
        if (controller.signal.aborted) return;
        setData(null);
        setError(reason.message || "Marketplace returns and disputes could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [requestParams, requestVersion]);

  function updateFilters(
    values: Record<string, string | number | null>,
  ) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    Object.entries(values).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === "" ||
          value === "all"
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      },
    );

    router.push(
      `/admin/marketplace/returns${
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
        Loading Marketplace returns and disputes…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <h1 className="font-semibold">
              Returns & Disputes unavailable
            </h1>

            <p className="mt-1 text-sm">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setRequestVersion(
                  (value) => value + 1,
                )
              }
              className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold"
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
        crumbs={[
          "Marketplace",
          "Returns & Disputes",
        ]}
        title="Returns & Disputes"
        description="Monitor Marketplace commercial return and dispute cases while preserving Logistics and Finance ownership boundaries."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setRequestVersion(
                  (value) => value + 1,
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Total Cases"
          value={data.summary.total_cases}
        />

        <MetricCard
          label="Open Cases"
          value={data.summary.open_cases}
        />

        <MetricCard
          label="Returns"
          value={data.summary.return_cases}
        />

        <MetricCard
          label="Disputes"
          value={data.summary.dispute_cases}
        />

        <MetricCard
          label="Resolved"
          value={data.summary.resolved_cases}
        />
      </section>

      <MarketplaceDistributionCharts
        title="return and dispute"
        donutData={Object.entries(data.summary.status_counts).map(([name, value]) => ({ name, value }))}
        barData={Object.entries(data.summary.type_counts).map(([name, value]) => ({ name, value }))}
        totalLabel="Cases"
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_220px_220px]">
          <form
            onSubmit={submitSearch}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search case, reason or order number"
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
            value={type}
            onChange={(event) =>
              updateFilters({
                type: event.target.value,
                page: 1,
              })
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">
              All Case Types
            </option>

            {data.filters.types.map((item) => (
              <option
                key={item}
                value={item}
              >
                {formatLabel(item)}
              </option>
            ))}
          </select>

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
              All Statuses
            </option>

            {data.filters.statuses.map((item) => (
              <option
                key={item}
                value={item}
              >
                {formatLabel(item)}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-950">
            Commercial Cases
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Showing {data.pagination.from ?? 0}–
            {data.pagination.to ?? 0} of{" "}
            {data.pagination.total}
          </p>
        </div>

        {data.returns.length === 0 ? (
          <div className="p-12 text-center">
            <RotateCcw className="mx-auto h-8 w-8 text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-900">
              No returns or disputes
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No Marketplace return or dispute cases match the current tenant and filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Case
                  </th>

                  <th className="px-5 py-3">
                    Type
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3">
                    Order
                  </th>

                  <th className="px-5 py-3">
                    Seller
                  </th>

                  <th className="px-5 py-3">
                    Reason
                  </th>

                  <th className="px-5 py-3">
                    Requested
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.returns.map((returnCase) => (
                  <tr
                    key={returnCase.id}
                    className="hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/marketplace/returns/${returnCase.uuid || returnCase.id}`}
                        className="font-semibold text-[#741d35] hover:underline"
                      >
                        {returnCase.subject}
                      </Link>

                      <div className="mt-1 text-xs text-slate-400">
                        Case #{returnCase.id}
                      </div>

                      {returnCase.description && (
                        <div className="mt-1 max-w-md truncate text-xs text-slate-500">
                          {returnCase.description}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        value={returnCase.type}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        value={returnCase.status}
                      />
                    </td>

                    <td className="px-5 py-4">
                      {returnCase.order ? (
                        <>
                          <Link
                            href={`/admin/marketplace/orders/${returnCase.order.id}`}
                            className="font-medium text-[#741d35] hover:underline"
                          >
                            {
                              returnCase.order
                                .order_number
                            }
                          </Link>

                          <div className="mt-1 text-xs text-slate-500">
                            {formatMoney(
                              returnCase.order.total,
                            )}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {returnCase.supplier ? (
                        <Link
                          href={`/admin/marketplace/sellers/${returnCase.supplier.id}`}
                          className="font-medium text-[#741d35] hover:underline"
                        >
                          {
                            returnCase.supplier
                              .company_name
                          }
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {returnCase.reason_code
                        ? formatLabel(
                            returnCase.reason_code,
                          )
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDateTime(
                        returnCase.requested_at,
                      )}
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

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Reverse Logistics
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Physical collection, reverse shipment, tracking, receipt and fulfilment remain owned by the Logistics domain.
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Refund & Settlement
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Refund execution, settlement and reconciliation remain owned by the Finance domain.
          </p>

        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <strong className="mt-2 block text-2xl text-slate-950">
        {value}
      </strong>
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
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {formatLabel(value)}
    </span>
  );
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(
  value: number | string | null,
) {
  if (value === null || value === undefined) {
    return "—";
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function MarketplaceReturnsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          Loading Marketplace returns and disputes…
        </div>
      }
    >
      <MarketplaceReturnsContent />
    </Suspense>
  );
}
