"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  PauseCircle,
  RefreshCw,
  Search,
  Tag,
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
  createMarketplacePromotion,
  fetchMarketplacePromotions,
  type MarketplaceChannelProjection,
  type MarketplacePromotionParams,
  type MarketplacePromotionWritePayload,
  type MarketplacePromotionsResponse,
} from "@/lib/api/marketplace";

function MarketplacePromotionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] =
    useState<MarketplacePromotionsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createChannelId, setCreateChannelId] = useState("");
  const [createName, setCreateName] = useState("");
  const [createCode, setCreateCode] = useState("");
  const [createType, setCreateType] =
    useState<"percentage" | "fixed_amount">("percentage");
  const [createValue, setCreateValue] = useState("");
  const [createStartsAt, setCreateStartsAt] = useState("");
  const [createEndsAt, setCreateEndsAt] = useState("");
  const [createUsageLimit, setCreateUsageLimit] = useState("");
  const [createPerCustomerLimit, setCreatePerCustomerLimit] = useState("");
  const [createBudgetCap, setCreateBudgetCap] = useState("");
  const [createMinPurchaseAmount, setCreateMinPurchaseAmount] = useState("");
  const [createStackingRule, setCreateStackingRule] =
    useState<"exclusive" | "stackable">("exclusive");

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const type = searchParams.get("type") ?? "all";
  const channelId =
    searchParams.get("channel_id") ?? "all";

  const page = Number(searchParams.get("page") ?? "1");

  const [searchInput, setSearchInput] =
    useState(search);

  const requestParams = useMemo<MarketplacePromotionParams>(
    () => ({
      q: search || undefined,
      status: status !== "all" ? status : undefined,
      type:
        type === "percentage" || type === "fixed_amount"
          ? type
          : undefined,
      channel_id: channelId !== "all" ? Number(channelId) : undefined,
      page,
      per_page: 20,
    }),
    [search, status, type, channelId, page],
  );

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError("");

    fetchMarketplacePromotions(requestParams, controller.signal)
      .then(
        (response: MarketplacePromotionsResponse) => {
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
              "Marketplace promotions could not be loaded.",
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
      `/admin/marketplace/promotions${
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

    const payload: MarketplacePromotionWritePayload = {
      channel_id: Number(createChannelId),
      name: createName,
      code: createCode.trim() === "" ? null : createCode,
      type: createType,
      value: createValue,
      starts_at: createStartsAt === "" ? null : createStartsAt,
      ends_at: createEndsAt === "" ? null : createEndsAt,
      ...(createUsageLimit ? { usage_limit: Number(createUsageLimit) } : {}),
      ...(createPerCustomerLimit ? { per_customer_limit: Number(createPerCustomerLimit) } : {}),
      ...(createBudgetCap ? { budget_cap: Number(createBudgetCap) } : {}),
      ...(createMinPurchaseAmount ? { min_purchase_amount: Number(createMinPurchaseAmount) } : {}),
      ...(createStackingRule && createStackingRule !== "exclusive" ? { stacking_rule: createStackingRule } : {}),
    };

    setCreating(true);
    setCreateError("");

    try {
      const response = await createMarketplacePromotion(payload);
      router.push(
        "/admin/marketplace/promotions/"
          + (response.promotion.uuid || response.promotion.id),
      );
    } catch (caught) {
      setCreateError(
        caught instanceof Error
          ? caught.message
          : "Marketplace Promotion could not be created.",
      );
    } finally {
      setCreating(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        Loading Marketplace promotions…
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
              Marketplace Promotions unavailable
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
    data.promotions.flatMap((promotion) =>
      promotion.channel
        ? [[promotion.channel.id, promotion.channel.name] as const]
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
        crumbs={["Marketplace", "Promotions"]}
        title="Marketplace Promotions"
        description="Monitor tenant-owned Marketplace promotions and their governed lifecycle. Checkout pricing application remains a separate integration."
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

            {data.capabilities.create_promotion && data.options && (
              <button
                type="button"
                onClick={() => {
                  setCreateError("");
                  setShowCreate((current) => !current);
                }}
                className="rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white"
              >
                Create Promotion
              </button>
            )}

          </div>
        }
      />

      {showCreate && data.capabilities.create_promotion && data.options && (
        <CreatePromotionForm
          channels={data.options.channels}
          channelId={createChannelId}
          name={createName}
          code={createCode}
          type={createType}
          value={createValue}
          startsAt={createStartsAt}
          endsAt={createEndsAt}
          usageLimit={createUsageLimit}
          perCustomerLimit={createPerCustomerLimit}
          budgetCap={createBudgetCap}
          minPurchaseAmount={createMinPurchaseAmount}
          stackingRule={createStackingRule}
          disabled={creating}
          error={createError}
          onChannelId={setCreateChannelId}
          onName={setCreateName}
          onCode={setCreateCode}
          onType={setCreateType}
          onValue={setCreateValue}
          onStartsAt={setCreateStartsAt}
          onEndsAt={setCreateEndsAt}
          onUsageLimit={setCreateUsageLimit}
          onPerCustomerLimit={setCreatePerCustomerLimit}
          onBudgetCap={setCreateBudgetCap}
          onMinPurchaseAmount={setCreateMinPurchaseAmount}
          onStackingRule={setCreateStackingRule}
          onSubmit={submitCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Total Promotions"
          value={data.summary.total_promotions}
          icon={<Tag className="h-5 w-5" />}
        />

        <MetricCard
          label="Active"
          value={data.summary.active_promotions}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <MetricCard
          label="Scheduled"
          value={data.summary.scheduled_promotions}
          icon={<CalendarClock className="h-5 w-5" />}
        />

        <MetricCard
          label="Draft"
          value={data.summary.draft_promotions}
          icon={<FileText className="h-5 w-5" />}
        />

        <MetricCard
          label="Completed"
          value={data.summary.completed_promotions}
          icon={<Clock3 className="h-5 w-5" />}
        />
      </section>

      <MarketplaceDistributionCharts
        title="promotion"
        donutData={Object.entries(data.summary.status_counts).map(([name, value]) => ({ name, value }))}
        barData={Object.entries(data.summary.type_counts).map(([name, value]) => ({ name, value }))}
        totalLabel="Promotions"
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_200px_200px_220px]">
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
                placeholder="Search promotion name or code"
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
                {channelNames.get(observedChannelId) ?? "Channel #" + observedChannelId}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-950">
            Promotion Records
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Showing {data.pagination.from ?? 0}–
            {data.pagination.to ?? 0} of{" "}
            {data.pagination.total}
          </p>
        </div>

        {data.promotions.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="mx-auto h-8 w-8 text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-900">
              No Marketplace promotions
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No promotion records match the current tenant and filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Promotion
                  </th>
                  <th className="px-5 py-3">
                    Type
                  </th>
                  <th className="px-5 py-3">
                    Value
                  </th>
                  <th className="px-5 py-3">
                    Channel
                  </th>
                  <th className="px-5 py-3">
                    Status
                  </th>
                  <th className="px-5 py-3">
                    Starts
                  </th>
                  <th className="px-5 py-3">
                    Ends
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.promotions.map(
                  (promotion) => (
                    <tr
                      key={promotion.id}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={"/admin/marketplace/promotions/" + promotion.id}
                          className="font-semibold text-[#741d35] hover:underline"
                        >
                          {promotion.name}
                        </Link>

                        <div className="mt-1 text-xs text-slate-400">
                          {promotion.code || "No code"}
                        </div>

                        {(promotion.usage_limit != null || promotion.budget_cap != null) && (
                          <div className="mt-1.5 flex flex-wrap gap-1 text-[11px] text-slate-500">
                            {promotion.usage_limit != null && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                                Uses: {promotion.usage_count ?? 0}/{promotion.usage_limit}
                              </span>
                            )}
                            {promotion.budget_cap != null && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                                Cap: LKR {Number(promotion.budget_cap).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          value={promotion.type}
                        />
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-800">
                        {formatPromotionValue(
                          promotion.type,
                          promotion.value,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {promotion.channel ? (
                          <>
                            <div className="font-medium text-slate-800">
                              {promotion.channel.name}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              {promotion.channel.code}
                            </div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          value={promotion.status}
                        />
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDateTime(
                          promotion.starts_at,
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDateTime(
                          promotion.ends_at,
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
          <PauseCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

          <div>
            <h2 className="font-semibold text-amber-950">
              Marketplace Promotion Operations
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              Marketplace owns Promotion records and their governed lifecycle. Checkout pricing and application are separate integrations and are not represented as active functionality here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function CreatePromotionForm({
  channels,
  channelId,
  name,
  code,
  type,
  value,
  startsAt,
  endsAt,
  usageLimit,
  perCustomerLimit,
  budgetCap,
  minPurchaseAmount,
  stackingRule,
  disabled,
  error,
  onChannelId,
  onName,
  onCode,
  onType,
  onValue,
  onStartsAt,
  onEndsAt,
  onUsageLimit,
  onPerCustomerLimit,
  onBudgetCap,
  onMinPurchaseAmount,
  onStackingRule,
  onSubmit,
  onCancel,
}: {
  channels: MarketplaceChannelProjection[];
  channelId: string;
  name: string;
  code: string;
  type: "percentage" | "fixed_amount";
  value: string;
  startsAt: string;
  endsAt: string;
  usageLimit: string;
  perCustomerLimit: string;
  budgetCap: string;
  minPurchaseAmount: string;
  stackingRule: "exclusive" | "stackable";
  disabled: boolean;
  error: string;
  onChannelId: (value: string) => void;
  onName: (value: string) => void;
  onCode: (value: string) => void;
  onType: (value: "percentage" | "fixed_amount") => void;
  onValue: (value: string) => void;
  onStartsAt: (value: string) => void;
  onEndsAt: (value: string) => void;
  onUsageLimit: (value: string) => void;
  onPerCustomerLimit: (value: string) => void;
  onBudgetCap: (value: string) => void;
  onMinPurchaseAmount: (value: string) => void;
  onStackingRule: (value: "exclusive" | "stackable") => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-950">Create Promotion</h2>
      <p className="mt-1 text-sm text-slate-500">
        Creates the backend-defined initial state. Scheduling and activation remain separate actions.
      </p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">
          Channel
          <select
            required
            value={channelId}
            onChange={(event) => onChannelId(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="">Select Channel</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name} — {channel.code} ({formatStatus(channel.status ?? "unknown")})
              </option>
            ))}
          </select>
        </label>
        <CreateField label="Name" value={name} onChange={onName} />
        <CreateField label="Code" value={code} onChange={onCode} required={false} />
        <label className="text-sm font-medium text-slate-700">
          Type
          <select
            value={type}
            onChange={(event) => onType(event.target.value as "percentage" | "fixed_amount")}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed_amount">Fixed Amount</option>
          </select>
        </label>
        <CreateField label="Value" value={value} onChange={onValue} inputType="number" />
        <CreateField label="Starts at" value={startsAt} onChange={onStartsAt} inputType="datetime-local" required={false} />
        <CreateField label="Ends at" value={endsAt} onChange={onEndsAt} inputType="datetime-local" required={false} />
        <CreateField label="Global Usage Limit" value={usageLimit} onChange={onUsageLimit} inputType="number" required={false} />
        <CreateField label="Per-Customer Limit" value={perCustomerLimit} onChange={onPerCustomerLimit} inputType="number" required={false} />
        <CreateField label="Budget Cap" value={budgetCap} onChange={onBudgetCap} inputType="number" required={false} />
        <CreateField label="Min Purchase" value={minPurchaseAmount} onChange={onMinPurchaseAmount} inputType="number" required={false} />
        <label className="text-sm font-medium text-slate-700">
          Stacking Rule
          <select
            value={stackingRule}
            onChange={(event) => onStackingRule(event.target.value as "exclusive" | "stackable")}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="exclusive">Exclusive (Standard)</option>
            <option value="stackable">Stackable</option>
          </select>
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-700 md:col-span-2 xl:col-span-3">
            {error}
          </p>
        )}

        <div className="flex gap-2 md:col-span-2 xl:col-span-3">
          <button
            type="submit"
            disabled={disabled}
            className="rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {disabled ? "Creating…" : "Create Draft Promotion"}
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

function CreateField({
  label,
  value,
  onChange,
  inputType = "text",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputType?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <input
        type={inputType}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
      />
    </label>
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

function formatPromotionValue(
  type: string,
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  if (type === "percentage") {
    return `${value}%`;
  }

  return value;
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

export default function MarketplacePromotionsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          Loading Marketplace promotions…
        </div>
      }
    >
      <MarketplacePromotionsContent />
    </Suspense>
  );
}
