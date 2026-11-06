"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Store,
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
  fetchMarketplaceSellers,
  type MarketplaceSellerParams,
  type MarketplaceSellersResponse,
} from "@/lib/api/marketplace";

function MarketplaceSellersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] =
    useState<MarketplaceSellersResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";

  const verificationStatus =
    searchParams.get("verification_status") ?? "all";

  const page = Number(searchParams.get("page") ?? "1");

  const [searchInput, setSearchInput] =
    useState(search);

  const requestParams = useMemo<MarketplaceSellerParams>(
    () => ({
      q: search || undefined,
      status: status !== "all" ? status : undefined,
      verification_status:
        verificationStatus === "pending" || verificationStatus === "verified" || verificationStatus === "rejected"
          ? verificationStatus
          : undefined,
      page,
      per_page: 20,
    }),
    [
      search,
      status,
      verificationStatus,
      page,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    fetchMarketplaceSellers(requestParams, controller.signal)
      .then((response) => setData(response))
      .catch((reason: Error) => {
        if (controller.signal.aborted) return;
        setData(null);
        setError(reason.message || "Marketplace sellers could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
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
      `/admin/marketplace/sellers${
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
        Loading Marketplace sellers…
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
              Marketplace Sellers unavailable
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

  const verifiedCount =
    data.summary.verification_counts.verified ??
    0;

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
        crumbs={["Marketplace", "Seller Management"]}
        title="Seller Management"
        description="Monitor Marketplace sellers using the authoritative tenant-scoped Supplier domain. Seller identity, verification and supplier records remain owned by Supplier administration."
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Store className="h-5 w-5" />}
          label="Total Sellers"
          value={data.summary.total_sellers}
          detail="Tenant Supplier records"
        />

        <MetricCard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Active Sellers"
          value={data.summary.active_sellers}
          detail="Supplier status = active"
        />

        <MetricCard
          icon={<Award className="h-5 w-5" />}
          label="Verified Sellers"
          value={verifiedCount}
          detail="Observed verification state"
        />

        <MetricCard
          icon={<Star className="h-5 w-5" />}
          label="Featured Sellers"
          value={data.summary.featured_sellers}
          detail="Featured Supplier records"
        />
      </section>

      <MarketplaceDistributionCharts
        title="seller"
        donutData={Object.entries(data.summary.status_counts).map(([name, value]) => ({ name, value }))}
        barData={Object.entries(data.summary.verification_counts).map(([name, value]) => ({ name, value }))}
        totalLabel="Sellers"
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_220px_240px]">
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
                placeholder="Search seller, email, city or country"
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
              All Seller Statuses
            </option>

            {data.filters.observed_statuses.map(
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
            value={verificationStatus}
            onChange={(event) =>
              updateFilters({
                verification_status:
                  event.target.value,
                page: 1,
              })
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">
              All Verification States
            </option>

            {data.filters.observed_verification_statuses.map(
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
            Marketplace Sellers
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Showing {data.pagination.from ?? 0}–
            {data.pagination.to ?? 0} of{" "}
            {data.pagination.total}
          </p>
        </div>

        {data.sellers.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No sellers match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Seller
                  </th>
                  <th className="px-5 py-3">
                    Location
                  </th>
                  <th className="px-5 py-3">
                    Verification
                  </th>
                  <th className="px-5 py-3">
                    Status
                  </th>
                  <th className="px-5 py-3">
                    Products
                  </th>
                  <th className="px-5 py-3">
                    Orders
                  </th>
                  <th className="px-5 py-3">
                    Rating
                  </th>
                  <th className="px-5 py-3">
                    Certificates
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.sellers.map((seller) => (
                  <tr
                    key={seller.id}
                    className="hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/marketplace/sellers/${seller.id}`}
                        className="font-semibold text-[#741d35] hover:underline"
                      >
                        {seller.company_name}
                      </Link>

                      {seller.email && (
                        <div className="mt-1 text-xs text-slate-400">
                          {seller.email}
                        </div>
                      )}

                      {seller.business_type && (
                        <div className="mt-1 text-xs text-slate-500">
                          {seller.business_type}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {[
                        seller.city,
                        seller.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        value={
                          seller.verification_status
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        value={seller.status}
                      />
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-800">
                      {seller.products_count}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-800">
                      {seller.orders_count}
                    </td>

                    <td className="px-5 py-4">
                      {seller.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />

                          <span className="font-medium text-slate-800">
                            {seller.rating}
                          </span>

                          <span className="text-xs text-slate-400">
                            ({seller.reviews_count})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-800">
                      {seller.certificates_count}
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

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-semibold text-amber-950">
          Marketplace Seller Operations
        </h2>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          Seller creation, profile editing,
          verification, suspension and featured
          status remain controlled by the
          authoritative Supplier domain. Marketplace
          currently provides a read-only Seller
          projection.
        </p>
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

export default function MarketplaceSellersPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          Loading Marketplace sellers…
        </div>
      }
    >
      <MarketplaceSellersContent />
    </Suspense>
  );
}
