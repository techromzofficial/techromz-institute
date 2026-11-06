"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
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
  changeMarketplaceChannelStatus,
  createMarketplaceChannel,
  fetchMarketplaceChannels,
  updateMarketplaceChannel,
  type MarketplaceChannel,
  type MarketplaceChannelParams,
  type MarketplaceChannelsResponse,
} from "@/lib/api/marketplace";

type ApiProblem = Error & { status?: number };

function MarketplaceChannelsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] =
    useState<MarketplaceChannelsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<MarketplaceChannel | null>(null);
  const [mutationError, setMutationError] = useState("");
  const [mutating, setMutating] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [channelType, setChannelType] = useState("");

  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "all";
  const requestedStatus = searchParams.get("status");
  const status: "all" | "active" | "inactive" =
    requestedStatus === "active" || requestedStatus === "inactive"
      ? requestedStatus
      : "all";
  const page = Number(searchParams.get("page") ?? "1");

  const [searchInput, setSearchInput] =
    useState(search);

  const requestParams = useMemo<MarketplaceChannelParams>(
    () => ({
      q: search || undefined,
      type: type !== "all" ? type : undefined,
      status: status !== "all" ? status : undefined,
      page,
      per_page: 20,
    }),
    [search, type, status, page],
  );

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError("");

    fetchMarketplaceChannels(requestParams, controller.signal)
      .then((response: MarketplaceChannelsResponse) => {
        if (!cancelled) {
          setData(response);
        }
      })
      .catch((reason: Error) => {
        if (!cancelled) {
          setData(null);
          setError(
            reason.message ||
              "Marketplace channels could not be loaded.",
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
      `/admin/marketplace/channels${
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

  function refresh() {
    setRequestVersion((value) => value + 1);
  }

  async function submitCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMutating(true);
    setMutationError("");

    try {
      await createMarketplaceChannel({ code, name, type: channelType });
      setShowCreate(false);
      setCode("");
      setName("");
      setChannelType("");
      refresh();
    } catch (caught) {
      setMutationError(
        caught instanceof Error
          ? caught.message
          : "Marketplace channel could not be created.",
      );
    } finally {
      setMutating(false);
    }
  }

  async function submitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    setMutating(true);
    setMutationError("");

    try {
      await updateMarketplaceChannel(editing.id, {
        name,
        type: channelType,
      });
      setEditing(null);
      refresh();
    } catch (caught) {
      setMutationError(
        caught instanceof Error
          ? caught.message
          : "Marketplace channel could not be updated.",
      );
    } finally {
      setMutating(false);
    }
  }

  async function changeStatus(channel: MarketplaceChannel) {
    const nextStatus = channel.status === "active" ? "inactive" : "active";

    if (
      nextStatus === "inactive"
      && !window.confirm("Deactivate this Marketplace Channel?")
    ) {
      return;
    }

    setMutating(true);
    setMutationError("");

    try {
      await changeMarketplaceChannelStatus(channel.id, nextStatus);
      refresh();
    } catch (caught) {
      const problem = caught as ApiProblem;
      setMutationError(
        problem.message || "Marketplace Channel status could not be changed.",
      );
      refresh();
    } finally {
      setMutating(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        Loading Marketplace channels…
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
              Marketplace Channels unavailable
            </h1>

            <p className="mt-1 text-sm">
              {error}
            </p>

            <button
              type="button"
              onClick={refresh}
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
          "Channels",
        ]}
        title="Marketplace Channels"
        description="Monitor tenant-owned sales channels through a safe Marketplace operational projection."
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

            {data.capabilities.create_channel && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setCode("");
                  setName("");
                  setChannelType("");
                  setShowCreate((value) => !value);
                  setMutationError("");
                }}
                className="rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white"
              >
                Create Channel
              </button>
            )}
          </div>
        }
      />

      {(showCreate || editing) && (
        <ChannelForm
          mode={editing ? "edit" : "create"}
          code={editing?.code ?? code}
          name={name}
          type={channelType}
          disabled={mutating}
          onCodeChange={setCode}
          onNameChange={setName}
          onTypeChange={setChannelType}
          onSubmit={editing ? submitEdit : submitCreate}
          onCancel={() => {
            setEditing(null);
            setShowCreate(false);
            setMutationError("");
          }}
        />
      )}

      {mutationError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {mutationError}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Total Channels"
          value={data.summary.total_channels}
        />

        <MetricCard
          label="Active"
          value={data.summary.active_channels}
        />

        <MetricCard
          label="Inactive"
          value={data.summary.inactive_channels}
        />

        <MetricCard
          label="Published Listings"
          value={data.summary.published_listings}
        />

        <MetricCard
          label="Active Promotions"
          value={data.summary.active_promotions}
        />
      </section>

      <MarketplaceDistributionCharts
        title="channel"
        donutData={data.channels.map((channel) => ({ name: channel.name, value: channel.marketplace.orders_total }))}
        barData={data.channels.map((channel) => ({ name: channel.name, value: channel.marketplace.published_listings }))}
        totalLabel="Channels"
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
                placeholder="Search channel name, code or type"
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
              All Types
            </option>

            {data.filters.types.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {formatLabel(item)}
                </option>
              ),
            )}
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

            {data.filters.statuses.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {formatLabel(item)}
                </option>
              ),
            )}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-950">
            Channel Directory
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Showing {data.pagination.from ?? 0}–
            {data.pagination.to ?? 0} of{" "}
            {data.pagination.total}
          </p>
        </div>

        {data.channels.length === 0 ? (
          <div className="p-12 text-center">
            <Store className="mx-auto h-8 w-8 text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-900">
              No channels
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No Marketplace channels match the current tenant and filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Channel
                  </th>

                  <th className="px-5 py-3">
                    Type
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3">
                    Listings
                  </th>

                  <th className="px-5 py-3">
                    Promotions
                  </th>

                  <th className="px-5 py-3">
                    Orders
                  </th>

                  <th className="px-5 py-3">
                    Updated
                  </th>

                  {(data.capabilities.edit_channel || data.capabilities.change_status) && (
                    <th className="px-5 py-3">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.channels.map((channel) => (
                  <tr
                    key={channel.id}
                    className="hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {channel.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        {channel.code}
                      </div>

                      <div className="mt-1 text-[11px] text-slate-400">
                        ID #{channel.id}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        value={channel.type}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        value={channel.status}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {
                          channel.marketplace
                            .published_listings
                        }
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {
                          channel.marketplace
                            .listings_total
                        }{" "}
                        total
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {
                          channel.marketplace
                            .active_promotions
                        }
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {
                          channel.marketplace
                            .promotions_total
                        }{" "}
                        total
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {
                        channel.marketplace
                          .orders_total
                      }
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDateTime(
                        channel.updated_at,
                      )}
                    </td>

                    {(data.capabilities.edit_channel || data.capabilities.change_status) && (
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {data.capabilities.edit_channel && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowCreate(false);
                                setEditing(channel);
                                setName(channel.name);
                                setChannelType(channel.type ?? "");
                                setMutationError("");
                              }}
                              className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                            >
                              Edit
                            </button>
                          )}
                          {data.capabilities.change_status && (
                            <button
                              type="button"
                              disabled={mutating}
                              onClick={() => changeStatus(channel)}
                              className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                            >
                              {channel.status === "active" ? "Deactivate" : "Activate"}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

          <div>
            <h2 className="font-semibold text-amber-950">
              Channel Authority Boundary
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              Marketplace Channels administer tenant-owned sales Channel identity and operational status through governed Marketplace actions. Raw Channel configuration remains outside this screen.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ChannelForm({
  mode,
  code,
  name,
  type,
  disabled,
  onCodeChange,
  onNameChange,
  onTypeChange,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  code: string;
  name: string;
  type: string;
  disabled: boolean;
  onCodeChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-950">
        {mode === "create" ? "Create Channel" : "Edit Channel"}
      </h2>
      <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">
          Code
          <input
            required
            disabled={mode === "edit"}
            value={code}
            onChange={(event) => onCodeChange(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Name
          <input
            required
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Type
          <input
            required
            value={type}
            onChange={(event) => onTypeChange(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <div className="flex gap-2 md:col-span-3">
          <button
            type="submit"
            disabled={disabled}
            className="rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {mode === "create" ? "Create Channel" : "Save Channel"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
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

export default function MarketplaceChannelsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          Loading Marketplace channels…
        </div>
      }
    >
      <MarketplaceChannelsContent />
    </Suspense>
  );
}
