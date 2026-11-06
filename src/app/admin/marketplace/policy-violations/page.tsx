"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  RefreshCw,
  Search,
  ShieldAlert,
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
  fetchMarketplacePolicyViolations,
  type MarketplacePolicyViolationsResponse,
} from "@/lib/api/marketplace";

function MarketplacePolicyViolationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] =
    useState<MarketplacePolicyViolationsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const severity =
    searchParams.get("severity") ?? "all";
  const page = Number(searchParams.get("page") ?? "1");

  const [searchInput, setSearchInput] =
    useState(search);

  const requestParams = useMemo(
    () => ({
      q: search || undefined,
      status: status !== "all" ? status : undefined,
      severity: severity !== "all" ? severity : undefined,
      page,
      per_page: 20,
    }),
    [search, status, severity, page],
  );

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    fetchMarketplacePolicyViolations(requestParams, controller.signal)
      .then((response) => {
        setData(response);
      })
      .catch((reason: Error) => {
        if (controller.signal.aborted) {
          return;
        }

        setData(null);
        setError(
          reason.message ||
            "Marketplace policy violations could not be loaded.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [requestParams, requestVersion]);

  function updateFilters(
    values: Record<
      string,
      string | number | null
    >,
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
      `/admin/marketplace/policy-violations${
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
        Loading Marketplace policy violations…
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
              Marketplace Policy Violations unavailable
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
          "Policy Violations",
        ]}
        title="Policy Violations"
        description="Monitor Marketplace governance records without directly mutating Supplier verification, Catalogue Product state, or Channel configuration."
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
          label="Total"
          value={data.summary.total_violations}
        />

        <MetricCard
          label="Open"
          value={data.summary.open_violations}
        />

        <MetricCard
          label="Under Review"
          value={
            data.summary.under_review_violations
          }
        />

        <MetricCard
          label="Resolved"
          value={data.summary.resolved_violations}
        />

        <MetricCard
          label="Critical"
          value={data.summary.critical_violations}
        />
      </section>

      <MarketplaceDistributionCharts
        title="policy violation"
        donutData={Object.entries(data.summary.status_counts).map(([name, value]) => ({ name, value }))}
        barData={Object.entries(data.summary.severity_counts).map(([name, value]) => ({ name, value }))}
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
                  setSearchInput(
                    event.target.value,
                  )
                }
                placeholder="Search policy code, title or description"
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
              All Statuses
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
            value={severity}
            onChange={(event) =>
              updateFilters({
                severity: event.target.value,
                page: 1,
              })
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">
              All Severities
            </option>

            {data.filters.severities.map(
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

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-950">
            Governance Records
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Showing {data.pagination.from ?? 0}–
            {data.pagination.to ?? 0} of{" "}
            {data.pagination.total}
          </p>
        </div>

        {data.violations.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert className="mx-auto h-8 w-8 text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-900">
              No policy violations
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No Marketplace policy violation records match the current tenant and filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Violation
                  </th>
                  <th className="px-5 py-3">
                    Severity
                  </th>
                  <th className="px-5 py-3">
                    Status
                  </th>
                  <th className="px-5 py-3">
                    Seller
                  </th>
                  <th className="px-5 py-3">
                    Product
                  </th>
                  <th className="px-5 py-3">
                    Channel
                  </th>
                  <th className="px-5 py-3">
                    Detected
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.violations.map(
                  (violation) => (
                    <tr
                      key={violation.id}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/marketplace/policy-violations/${violation.uuid || violation.id}`}
                          className="font-semibold text-[#741d35] hover:underline"
                        >
                          {violation.title}
                        </Link>

                        <div className="mt-1 text-xs text-slate-400">{violation.policy_code}</div>

                        {violation.description && (
                          <div className="mt-1 max-w-md truncate text-xs text-slate-500">
                            {violation.description}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          value={violation.severity}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          value={violation.status}
                        />
                      </td>

                      <td className="px-5 py-4">
                        {violation.supplier ? (
                          <Link
                            href={`/admin/marketplace/sellers/${violation.supplier.id}`}
                            className="font-medium text-[#741d35] hover:underline"
                          >
                            {
                              violation.supplier
                                .company_name
                            }
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {violation.product ? (
                          <>
                            <div className="font-medium text-slate-800">
                              {violation.product.name}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              {violation.product.sku ||
                                "No SKU"}
                            </div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {violation.channel ? (
                          <>
                            <div className="font-medium text-slate-800">
                              {violation.channel.name}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              {violation.channel.code}
                            </div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDateTime(
                          violation.detected_at,
                        )}
                      </td>
                    </tr>
                  ),
                )}
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

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

          <div>
            <h2 className="font-semibold text-amber-950">
              Marketplace Governance Boundary
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              Marketplace Policy Violations records governance cases and their review and closure lifecycle. Supplier verification, Catalogue Product state, and Channel administration remain owned by their respective domains.
            </p>
          </div>
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

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function MarketplacePolicyViolationsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          Loading Marketplace policy violations…
        </div>
      }
    >
      <MarketplacePolicyViolationsContent />
    </Suspense>
  );
}
