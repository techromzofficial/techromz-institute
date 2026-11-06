"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  PauseCircle,
  RefreshCw,
  Search,
  ShoppingBag,
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
  bulkTransitionMarketplaceListings,
  createMarketplaceListing,
  fetchMarketplaceListings,
  type MarketplaceListingCreatePayload,
  type MarketplaceListingsResponse,
} from "@/lib/api/marketplace";

function MarketplaceListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] =
    useState<MarketplaceListingsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [productId, setProductId] = useState("");
  const [createChannelId, setCreateChannelId] = useState("");
  const [overridePrice, setOverridePrice] = useState("");

  // Bulk operation state (MKT-L06)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ message: string; isError?: boolean } | null>(null);
  const [bulkReasonModal, setBulkReasonModal] = useState<"pause" | "archive" | null>(null);
  const [bulkReason, setBulkReason] = useState("");

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const channelId =
    searchParams.get("channel_id") ?? "all";

  const page = Number(searchParams.get("page") ?? "1");

  const [searchInput, setSearchInput] =
    useState(search);

  const requestParams = useMemo(
    () => ({
        q: search || undefined,
        status:
          status !== "all" ? status : undefined,
        channel_id:
          channelId !== "all"
            ? Number(channelId)
            : undefined,
        page,
        per_page: 20,
      }),
    [search, status, channelId, page],
  );

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError("");

    fetchMarketplaceListings(requestParams, controller.signal)
      .then(
        (response: MarketplaceListingsResponse) => {
          if (!cancelled) {
            setData(response);
          }
        },
      )
      .catch((reason: Error) => {
        if (!cancelled) {
          setData(null);
          setError(
            reason.message ||
              "Marketplace listings could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
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
      `/admin/marketplace/listings${
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

  async function submitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError("");

    const payload: MarketplaceListingCreatePayload = {
      product_id: Number(productId),
      channel_id: Number(createChannelId),
    };

    if (overridePrice.trim() !== "") {
      payload.override_price = overridePrice.trim();
    }

    setCreating(true);

    try {
      const response = await createMarketplaceListing(payload);
      router.push(
        "/admin/marketplace/listings/"
          + (response.listing.uuid || response.listing.id),
      );
    } catch (reason) {
      setCreateError(
        reason instanceof Error
          ? reason.message
          : "Marketplace listing could not be created.",
      );
    } finally {
      setCreating(false);
    }
  }

  function toggleSelectListing(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (!data) return;
    if (selectedIds.length === data.listings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.listings.map((l) => l.id));
    }
  }

  async function handleExecuteBulk(action: "pause" | "archive") {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    setBulkResult(null);

    try {
      const res = await bulkTransitionMarketplaceListings({
        listing_ids: selectedIds,
        action,
        reason: bulkReason.trim() || undefined,
      });

      setBulkResult({
        message: `Bulk ${action} completed: ${res.summary.succeeded} succeeded, ${res.summary.failed} failed.`,
        isError: res.summary.failed > 0,
      });
      setSelectedIds([]);
      setBulkReasonModal(null);
      setBulkReason("");
      setRequestVersion((v) => v + 1);
    } catch (err: any) {
      setBulkResult({
        message: err.message || `Bulk ${action} failed.`,
        isError: true,
      });
    } finally {
      setBulkLoading(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        Loading Marketplace listings…
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
              Marketplace Listings unavailable
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

  const channelNames = new Map(
    data.listings.flatMap((listing) =>
      listing.channel
        ? [[listing.channel.id, listing.channel.name] as const]
        : [],
    ),
  );

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
        crumbs={["Marketplace", "Listings"]}
        title="Marketplace Listings"
        description="Monitor Product publication across Marketplace channels while Catalogue remains authoritative for Product data and Channel administration remains authoritative for channel configuration."
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

            {data.capabilities.create_listing && data.options && (
              <button
                type="button"
                onClick={() => setShowCreate((value) => !value)}
                className="rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white"
              >
                Create Listing
              </button>
            )}

          </div>
        }
      />

      {showCreate && data.capabilities.create_listing && data.options && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">Create Listing</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create a draft Marketplace relationship. Publication remains a separate governed action.
          </p>

          <form onSubmit={submitCreate} className="mt-4 grid gap-4 lg:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">
              Product
              <select
                required
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                <option value="">Select Product</option>
                {data.options.products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                    {product.sku ? " · " + product.sku : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Channel
              <select
                required
                value={createChannelId}
                onChange={(event) => setCreateChannelId(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                <option value="">Select Channel</option>
                {data.options.channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name} · {channel.code}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Marketplace override price
              <input
                type="number"
                min="0"
                step="0.01"
                value={overridePrice}
                onChange={(event) => setOverridePrice(event.target.value)}
                placeholder="No override"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>

            {createError && (
              <p role="alert" className="text-sm text-red-700 lg:col-span-3">
                {createError}
              </p>
            )}

            <div className="flex gap-2 lg:col-span-3">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {creating ? "Creating…" : "Create Draft Listing"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Total Listings"
          value={data.summary.total_listings}
          icon={<ShoppingBag className="h-5 w-5" />}
        />

        <MetricCard
          label="Published"
          value={data.summary.published_listings}
          icon={<FileText className="h-5 w-5" />}
        />

        <MetricCard
          label="Draft"
          value={data.summary.draft_listings}
          icon={<FileText className="h-5 w-5" />}
        />

        <MetricCard
          label="Paused"
          value={data.summary.paused_listings}
          icon={<PauseCircle className="h-5 w-5" />}
        />

        <MetricCard
          label="Archived"
          value={data.summary.archived_listings}
          icon={<Archive className="h-5 w-5" />}
        />
      </section>

      <MarketplaceDistributionCharts
        title="listing"
        donutData={Object.entries(data.summary.status_counts).map(([name, value]) => ({ name, value }))}
        barData={Object.entries(data.summary.channel_counts).map(([name, value]) => ({ name, value }))}
        totalLabel="Listings"
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_220px_240px]">
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
                placeholder="Search product name or SKU"
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
              All Listing Statuses
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
            value={channelId}
            onChange={(event) =>
              updateFilters({
                channel_id: event.target.value,
                page: 1,
              })
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">
              All Channels
            </option>

            {data.filters.observed_channel_ids.map((observedChannelId) => (
              <option
                key={observedChannelId}
                value={observedChannelId}
              >
                {channelNames.get(observedChannelId) ?? `Channel #${observedChannelId}`}
              </option>
            ))}
          </select>
        </div>
      </section>

      {bulkResult && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-sm ${
            bulkResult.isError
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {bulkResult.isError ? (
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
            <span>{bulkResult.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setBulkResult(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Bulk Action Bar (MKT-L06) */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-5 py-3 text-white">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-bold">
                {selectedIds.length}
              </span>
              <span>listing(s) selected for bulk action</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => setBulkReasonModal("pause")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-sm hover:bg-amber-400 disabled:opacity-50"
              >
                <PauseCircle className="h-4 w-4" />
                Bulk Pause
              </button>

              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => setBulkReasonModal("archive")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 disabled:opacity-50"
              >
                <Archive className="h-4 w-4" />
                Bulk Archive
              </button>

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2 py-1 text-xs text-slate-300 hover:text-white"
              >
                Deselect
              </button>
            </div>
          </div>
        )}

        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-950">
            Product Listings
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Showing {data.pagination.from ?? 0}–
            {data.pagination.to ?? 0} of{" "}
            {data.pagination.total}
          </p>
        </div>

        {data.listings.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-900">
              No Marketplace listings
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No listing records match the current tenant and filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        data.listings.length > 0 &&
                        selectedIds.length === data.listings.length
                      }
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-slate-300 text-[#741d35] focus:ring-[#741d35]"
                      aria-label="Select all listings"
                    />
                  </th>

                  <th className="px-5 py-3">
                    Product
                  </th>

                  <th className="px-5 py-3">
                    Seller
                  </th>

                  <th className="px-5 py-3">
                    Channel
                  </th>

                  <th className="px-5 py-3">
                    Listing Status
                  </th>

                  <th className="px-5 py-3">
                    Catalogue Price
                  </th>

                  <th className="px-5 py-3">
                    Override Price
                  </th>

                  <th className="px-5 py-3">
                    Published
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.listings.map(
                  (listing) => (
                    <tr
                      key={listing.id}
                      className={`hover:bg-slate-50/70 ${
                        selectedIds.includes(listing.id) ? "bg-slate-50" : ""
                      }`}
                    >
                      <td className="w-10 px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(listing.id)}
                          onChange={() => toggleSelectListing(listing.id)}
                          className="h-4 w-4 rounded border-slate-300 text-[#741d35] focus:ring-[#741d35]"
                          aria-label={`Select listing #${listing.id}`}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/marketplace/listings/${listing.id}`}
                          className="font-semibold text-[#741d35] hover:underline"
                        >
                          {listing.product?.name ??
                            `Listing #${listing.id}`}
                        </Link>

                        <div className="mt-1 text-xs text-slate-400">
                          {listing.product?.sku ||
                            "No SKU"}
                        </div>

                        {listing.product?.status && (
                          <div className="mt-1 text-xs text-slate-500">
                            Catalogue:{" "}
                            {formatStatus(
                              listing.product.status,
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {listing.product?.supplier ? (
                          <>
                            <Link
                              href={`/admin/marketplace/sellers/${listing.product.supplier.id}`}
                              className="font-medium text-slate-900 hover:text-[#741d35]"
                            >
                              {
                                listing.product
                                  .supplier.company_name
                              }
                            </Link>

                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span className="text-xs text-slate-400">
                                {formatStatus(
                                  listing.product
                                    .supplier
                                    .verification_status ??
                                    "unknown",
                                )}
                              </span>

                              {listing.product.supplier.status &&
                                listing.product.supplier.status !== "active" && (
                                  <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                    Seller {listing.product.supplier.status}
                                  </span>
                                )}
                            </div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {listing.channel ? (
                          <>
                            <div className="font-medium text-slate-800">
                              {listing.channel.name}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              {listing.channel.code}
                            </div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          value={listing.status}
                        />
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-800">
                        {listing.product?.price ??
                          "—"}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-800">
                        {listing.override_price ??
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(
                          listing.published_at,
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

      {/* Bulk Reason Modal (MKT-L06) */}
      {bulkReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-base font-semibold text-slate-950">
              {bulkReasonModal === "pause" ? "Bulk Pause Listings" : "Bulk Archive Listings"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {bulkReasonModal === "pause"
                ? `Pause ${selectedIds.length} selected listing(s). Paused listings will not be visible to buyers.`
                : `Archive ${selectedIds.length} selected listing(s). Archived listings are permanently removed from active channels.`}
            </p>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Reason
              <textarea
                rows={3}
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                placeholder="Provide a reason for this bulk operation (optional)"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#741d35] focus:ring-1 focus:ring-[#741d35]"
              />
            </label>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => { setBulkReasonModal(null); setBulkReason(""); }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => handleExecuteBulk(bulkReasonModal)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                  bulkReasonModal === "pause" ? "bg-amber-500 hover:bg-amber-400" : "bg-rose-600 hover:bg-rose-500"
                }`}
              >
                {bulkLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : bulkReasonModal === "pause" ? (
                  <PauseCircle className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                {bulkLoading
                  ? "Processing…"
                  : bulkReasonModal === "pause"
                  ? "Confirm Pause"
                  : "Confirm Archive"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
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

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function MarketplaceListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          Loading Marketplace listings…
        </div>
      }
    >
      <MarketplaceListingsContent />
    </Suspense>
  );
}
