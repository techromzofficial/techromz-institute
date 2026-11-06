"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  PauseCircle,
  RefreshCw,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  fetchMarketplacePromotion,
  transitionMarketplacePromotion,
  updateMarketplacePromotion,
  type MarketplacePromotionAction,
  type MarketplacePromotionCapabilities,
  type MarketplacePromotionDetailResponse,
  type MarketplacePromotionWritePayload,
} from "@/lib/api/marketplace";

export default function MarketplacePromotionDetailPage() {
  const params = useParams<{ promotionId: string }>();
  const promotionId = params.promotionId;

  const [data, setData] =
    useState<MarketplacePromotionDetailResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [mutating, setMutating] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed_amount">("percentage");
  const [value, setValue] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [perCustomerLimit, setPerCustomerLimit] = useState("");
  const [budgetCap, setBudgetCap] = useState("");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState("");
  const [stackingRule, setStackingRule] = useState<"exclusive" | "stackable">("exclusive");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError("");

    fetchMarketplacePromotion(promotionId, controller.signal)
      .then((response) => {
        if (!cancelled) {
          setData(response);
        }
      })
      .catch((reason: Error) => {
        if (!cancelled) {
          setData(null);
          setError(
            reason.message ||
              "Marketplace promotion detail could not be loaded.",
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
  }, [promotionId, requestVersion]);

  if (loading && !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        Loading Marketplace promotion…
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
              Marketplace promotion unavailable
            </h1>

            <p className="mt-1 text-sm">
              {error}
            </p>

            <div className="mt-4 flex gap-2">
              <Link
                href="/admin/marketplace/promotions"
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold"
              >
                Back to Promotions
              </Link>

              <button
                type="button"
                onClick={() =>
                  setRequestVersion(
                    (value) => value + 1,
                  )
                }
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { promotion, channel } = data;

  function refresh() {
    setRequestVersion((current) => current + 1);
  }

  function beginEdit() {
    setName(promotion.name);
    setCode(promotion.code ?? "");
    setType(promotion.type);
    setValue(promotion.value ?? "");
    setStartsAt(toDateTimeLocal(promotion.starts_at));
    setEndsAt(toDateTimeLocal(promotion.ends_at));
    setUsageLimit(promotion.usage_limit ? String(promotion.usage_limit) : "");
    setPerCustomerLimit(promotion.per_customer_limit ? String(promotion.per_customer_limit) : "");
    setBudgetCap(promotion.budget_cap ? String(promotion.budget_cap) : "");
    setMinPurchaseAmount(promotion.min_purchase_amount ? String(promotion.min_purchase_amount) : "");
    setStackingRule(promotion.stacking_rule === "stackable" ? "stackable" : "exclusive");
    setMutationError("");
    setShowEdit(true);
  }

  async function submitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!channel) return;

    const payload: MarketplacePromotionWritePayload = {
      channel_id: channel.id,
      name,
      code: code.trim() === "" ? null : code,
      type,
      value,
      starts_at: startsAt === "" ? null : startsAt,
      ends_at: endsAt === "" ? null : endsAt,
      ...(usageLimit ? { usage_limit: Number(usageLimit) } : {}),
      ...(perCustomerLimit ? { per_customer_limit: Number(perCustomerLimit) } : {}),
      ...(budgetCap ? { budget_cap: Number(budgetCap) } : {}),
      ...(minPurchaseAmount ? { min_purchase_amount: Number(minPurchaseAmount) } : {}),
      ...(stackingRule && stackingRule !== "exclusive" ? { stacking_rule: stackingRule } : {}),
    };

    setMutating(true);
    setMutationError("");

    try {
      await updateMarketplacePromotion(promotionId, payload);
      setShowEdit(false);
      refresh();
    } catch (caught) {
      setMutationError(
        caught instanceof Error
          ? caught.message
          : "Marketplace Promotion could not be updated.",
      );
    } finally {
      setMutating(false);
    }
  }

  async function transition(action: MarketplacePromotionAction) {
    if (
      ["complete", "archive"].includes(action)
      && !window.confirm("Continue with this Marketplace Promotion action?")
    ) {
      return;
    }

    setMutating(true);
    setMutationError("");

    try {
      await transitionMarketplacePromotion(promotionId, action);
      refresh();
    } catch (caught) {
      setMutationError(
        caught instanceof Error
          ? caught.message
          : "Marketplace Promotion action failed.",
      );
    } finally {
      setMutating(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/marketplace/promotions"
            className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label="Back to Marketplace Promotions"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#741d35]">
              Marketplace · Promotion Detail
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-950">
              {promotion.name}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Tenant-scoped Marketplace promotion record for the selected channel.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              refresh()
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          {data.capabilities.edit_promotion && (
            <button
              type="button"
              onClick={beginEdit}
              className="rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white"
            >
              Edit Promotion
            </button>
          )}
        </div>
      </header>

      {showEdit && data.capabilities.edit_promotion && (
        <PromotionEditForm
          name={name}
          code={code}
          type={type}
          value={value}
          startsAt={startsAt}
          endsAt={endsAt}
          usageLimit={usageLimit}
          perCustomerLimit={perCustomerLimit}
          budgetCap={budgetCap}
          minPurchaseAmount={minPurchaseAmount}
          stackingRule={stackingRule}
          disabled={mutating}
          onName={setName}
          onCode={setCode}
          onType={setType}
          onValue={setValue}
          onStartsAt={setStartsAt}
          onEndsAt={setEndsAt}
          onUsageLimit={setUsageLimit}
          onPerCustomerLimit={setPerCustomerLimit}
          onBudgetCap={setBudgetCap}
          onMinPurchaseAmount={setMinPurchaseAmount}
          onStackingRule={setStackingRule}
          onSubmit={submitEdit}
          onCancel={() => setShowEdit(false)}
        />
      )}

      <PromotionActions
        promotionStatus={promotion.status}
        capabilities={data.capabilities}
        disabled={mutating}
        onAction={transition}
      />

      {mutationError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {mutationError}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Status"
          value={formatStatus(promotion.status)}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <MetricCard
          label="Type"
          value={formatStatus(promotion.type)}
          icon={<Tag className="h-5 w-5" />}
        />

        <MetricCard
          label="Value"
          value={formatPromotionValue(
            promotion.type,
            promotion.value,
          )}
          icon={<Tag className="h-5 w-5" />}
        />

        <MetricCard
          label="Channel"
          value={channel?.name ?? "—"}
          icon={<CalendarClock className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Promotion Information
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Detail
              label="Promotion Name"
              value={promotion.name}
            />

            <Detail
              label="Code"
              value={promotion.code}
            />

            <Detail
              label="Type"
              value={formatStatus(promotion.type)}
            />

            <Detail
              label="Value"
              value={formatPromotionValue(
                promotion.type,
                promotion.value,
              )}
            />

            <Detail
              label="Status"
              value={formatStatus(promotion.status)}
            />

            <Detail
              label="Promotion ID"
              value={String(promotion.id)}
            />
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">Lifecycle Authority</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Status changes occur only through explicit governed Marketplace transitions. Dates do not automatically change lifecycle state.
          </p>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-950">Usage Limits & Budget Caps</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <Detail
            label="Global Usage"
            value={`${promotion.usage_count ?? 0} / ${promotion.usage_limit ? promotion.usage_limit.toLocaleString() : 'Unlimited'}`}
          />
          <Detail
            label="Per-Customer Limit"
            value={promotion.per_customer_limit ? `${promotion.per_customer_limit} per customer` : 'Unlimited'}
          />
          <Detail
            label="Budget Cap"
            value={promotion.budget_cap ? `LKR ${Number(promotion.budget_cap).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'No Cap'}
          />
          <Detail
            label="Budget Utilized"
            value={`LKR ${Number(promotion.budget_used ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          />
          <Detail
            label="Min Purchase Requirement"
            value={promotion.min_purchase_amount ? `LKR ${Number(promotion.min_purchase_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'None'}
          />
          <Detail
            label="Stacking Rule"
            value={promotion.stacking_rule === 'stackable' ? 'Stackable' : 'Exclusive (Standard)'}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Schedule
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TimelineItem
              label="Starts"
              value={promotion.starts_at}
              icon={<CalendarClock className="h-4 w-4" />}
            />

            <TimelineItem
              label="Ends"
              value={promotion.ends_at}
              icon={<Clock3 className="h-4 w-4" />}
            />

            <TimelineItem
              label="Created"
              value={promotion.created_at}
              icon={<CalendarClock className="h-4 w-4" />}
            />

            <TimelineItem
              label="Updated"
              value={promotion.updated_at ?? null}
              icon={<RefreshCw className="h-4 w-4" />}
            />
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Channel
          </h2>

          {channel ? (
            <div className="mt-5 space-y-4">
              <Detail
                label="Name"
                value={channel.name}
              />

              <Detail
                label="Code"
                value={channel.code}
              />

              <Detail
                label="Type"
                value={
                  channel.type
                    ? formatStatus(channel.type)
                    : null
                }
              />

              <Detail
                label="Status"
                value={
                  channel.status
                    ? formatStatus(channel.status)
                    : null
                }
              />

              <p className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                Raw Channel configuration is intentionally not exposed through Marketplace Promotion Detail.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Channel information is unavailable.
            </p>
          )}
        </article>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <PauseCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />

          <div>
            <h2 className="font-semibold text-amber-950">
              Marketplace Promotion Authority
            </h2>

            <p className="mt-2 text-sm leading-6 text-amber-800">
              Marketplace owns this Promotion record and governed lifecycle. Checkout pricing and application are separate integrations. Channel administration remains authoritative for Channel configuration.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function PromotionEditForm({
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
    <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-950">Edit Promotion</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Name" value={name} onChange={onName} />
        <Field label="Code" value={code} onChange={onCode} required={false} />
        <label className="text-sm font-medium text-slate-700">
          Type
          <select
            value={type}
            onChange={(event) => onType(event.target.value as "percentage" | "fixed_amount")}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
          </select>
        </label>
        <Field label="Value" value={value} onChange={onValue} inputType="number" />
        <Field label="Starts at" value={startsAt} onChange={onStartsAt} inputType="datetime-local" required={false} />
        <Field label="Ends at" value={endsAt} onChange={onEndsAt} inputType="datetime-local" required={false} />
        <Field label="Global Usage Limit" value={usageLimit} onChange={onUsageLimit} inputType="number" required={false} />
        <Field label="Per-Customer Limit" value={perCustomerLimit} onChange={onPerCustomerLimit} inputType="number" required={false} />
        <Field label="Budget Cap (LKR)" value={budgetCap} onChange={onBudgetCap} inputType="number" required={false} />
        <Field label="Min Purchase Amount (LKR)" value={minPurchaseAmount} onChange={onMinPurchaseAmount} inputType="number" required={false} />
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
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Save Promotion
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
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

function PromotionActions({
  promotionStatus,
  capabilities,
  disabled,
  onAction,
}: {
  promotionStatus: string;
  capabilities: MarketplacePromotionCapabilities;
  disabled: boolean;
  onAction: (action: MarketplacePromotionAction) => void;
}) {
  const actions: Array<{ action: MarketplacePromotionAction; label: string }> = [];
  if (capabilities.schedule_promotion) actions.push({ action: "schedule", label: "Schedule" });
  if (capabilities.activate_promotion) {
    actions.push({
      action: promotionStatus === "paused" ? "resume" : "activate",
      label: promotionStatus === "paused" ? "Resume" : "Activate",
    });
  }
  if (capabilities.pause_promotion) actions.push({ action: "pause", label: "Pause" });
  if (capabilities.complete_promotion) actions.push({ action: "complete", label: "Complete" });
  if (capabilities.archive_promotion) actions.push({ action: "archive", label: "Archive" });

  if (actions.length === 0) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-950">Promotion Workflow</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map(({ action, label }) => (
          <button
            key={action}
            type="button"
            disabled={disabled}
            onClick={() => onAction(action)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <strong className="mt-2 block text-lg text-slate-950">
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

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-slate-900">
        {value || "—"}
      </p>
    </div>
  );
}

function TimelineItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-600">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-slate-900">
        {formatDateTime(value)}
      </p>
    </div>
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

  return type === "percentage"
    ? `${value}%`
    : value;
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

function toDateTimeLocal(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}
