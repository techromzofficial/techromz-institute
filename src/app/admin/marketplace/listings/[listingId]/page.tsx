"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Archive,
  FileText,
  PauseCircle,
  RefreshCw,
  ShoppingBag,
  Store,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  fetchMarketplaceListing,
  transitionMarketplaceListing,
  updateMarketplaceListing,
  type MarketplaceListingAction,
  type MarketplaceListingCapabilities,
  type MarketplaceListingDetailResponse,
  type MarketplaceListingTransitionPayload,
  type MarketplaceListingUpdatePayload,
} from "@/lib/api/marketplace";

type ApiProblem = Error & { status?: number };

export default function MarketplaceListingDetailPage() {
  const params = useParams<{ listingId: string }>();
  const listingId = params.listingId;

  const [data, setData] =
    useState<MarketplaceListingDetailResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [overridePrice, setOverridePrice] = useState("");
  const [reason, setReason] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError("");

    fetchMarketplaceListing(listingId, controller.signal)
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
              "Marketplace listing detail could not be loaded.",
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
  }, [listingId, requestVersion]);

  if (loading && !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        Loading Marketplace listing…
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
              Marketplace listing unavailable
            </h1>

            <p className="mt-1 text-sm">
              {error}
            </p>

            <div className="mt-4 flex gap-2">
              <Link
                href="/admin/marketplace/listings"
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold"
              >
                Back to Listings
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

  const { listing, product, channel } = data;

  async function submitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: MarketplaceListingUpdatePayload = {
      expected_version: listing.version,
      override_price: overridePrice.trim() === "" ? null : overridePrice.trim(),
    };

    setMutating(true);
    setMutationError("");

    try {
      await updateMarketplaceListing(listingId, payload);
      setShowEdit(false);
      setRequestVersion((value) => value + 1);
    } catch (caught) {
      const problem = caught as ApiProblem;
      setMutationError(
        problem.status === 409
          ? "This Listing changed after you loaded it. Refresh before trying again."
          : problem.message || "Marketplace listing could not be updated.",
      );
    } finally {
      setMutating(false);
    }
  }

  async function transition(action: MarketplaceListingAction) {
    if (
      ["reject", "suspend", "archive"].includes(action)
      && !window.confirm("Continue with this Marketplace Listing action?")
    ) {
      return;
    }

    const requiresReason = ["request_changes", "reject", "suspend"].includes(action);

    if (requiresReason && reason.trim() === "") {
      setMutationError("A reason is required for this action.");
      return;
    }

    const payload: MarketplaceListingTransitionPayload = {
      action,
      expected_version: listing.version,
    };

    if (reason.trim() !== "") {
      payload.reason = reason.trim();
    }

    setMutating(true);
    setMutationError("");

    try {
      await transitionMarketplaceListing(listingId, payload);
      setReason("");
      setRequestVersion((value) => value + 1);
    } catch (caught) {
      const problem = caught as ApiProblem;
      setMutationError(
        problem.status === 409
          ? "This Listing changed after you loaded it. Refresh before trying again."
          : problem.message || "Marketplace listing action failed.",
      );
      setRequestVersion((value) => value + 1);
    } finally {
      setMutating(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/marketplace/listings"
            className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label="Back to Marketplace Listings"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#741d35]">
              Marketplace · Listing Detail
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-950">
              {product?.name ?? `Listing #${listing.id}`}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Marketplace publication state for an authoritative Catalogue Product and Channel.
            </p>
          </div>
        </div>

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

          {data.capabilities.edit_listing && (
            <button
              type="button"
              onClick={() => {
                setOverridePrice(listing.override_price ?? "");
                setShowEdit((value) => !value);
              }}
              className="rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white"
            >
              Edit Listing
            </button>
          )}

        </div>
      </header>

      {showEdit && data.capabilities.edit_listing && (
        <form
          onSubmit={submitEdit}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold text-slate-950">Edit Listing</h2>
          <label className="mt-4 block max-w-sm text-sm font-medium text-slate-700">
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
          <p className="mt-2 text-xs text-slate-500">
            Leave blank to remove the Marketplace override. Catalogue price remains unchanged.
          </p>
          <button
            type="submit"
            disabled={mutating}
            className="mt-4 rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Save Listing
          </button>
        </form>
      )}

      <WorkflowActions
        capabilities={data.capabilities}
        disabled={mutating}
        reason={reason}
        onReasonChange={setReason}
        onAction={transition}
      />

      {mutationError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {mutationError}
          <button
            type="button"
            onClick={() => setRequestVersion((value) => value + 1)}
            className="ml-3 font-semibold underline"
          >
            Refresh Listing
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Listing Status"
          value={formatStatus(listing.status)}
          icon={<ShoppingBag className="h-5 w-5" />}
        />

        <MetricCard
          label="Catalogue Status"
          value={
            product?.status
              ? formatStatus(product.status)
              : "—"
          }
          icon={<FileText className="h-5 w-5" />}
        />

        <MetricCard
          label="Channel"
          value={channel?.name ?? "—"}
          icon={<Store className="h-5 w-5" />}
        />

        <MetricCard
          label="Override Price"
          value={listing.override_price ?? "—"}
          icon={<Tag className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Product Projection
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Detail
              label="Product"
              value={product?.name}
            />

            <Detail
              label="SKU"
              value={product?.sku}
            />

            <Detail
              label="Catalogue Status"
              value={
                product?.status
                  ? formatStatus(product.status)
                  : null
              }
            />

            <Detail
              label="Catalogue Price"
              value={product?.price}
            />

            <Detail
              label="Currency ID"
              value={
                product?.currency_id !== null &&
                product?.currency_id !== undefined
                  ? String(product.currency_id)
                  : null
              }
            />

            <Detail
              label="Product ID"
              value={
                product?.id
                  ? String(product.id)
                  : null
              }
            />
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Listing State
          </h2>

          <div className="mt-5 space-y-4">
            <StatusRow
              label="Status"
              value={listing.status}
            />

            <StatusRow
              label="Version"
              value={String(listing.version)}
            />

            <StatusRow
              label="Eligibility"
              value={listing.eligibility_status ?? "not evaluated"}
            />

            <Detail
              label="Eligibility evaluated"
              value={formatDateTime(listing.eligibility_evaluated_at)}
            />
          </div>

          {listing.eligibility_blockers?.length ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-950">Eligibility blockers</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                {listing.eligibility_blockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            </div>
          ) : listing.eligibility_status === null ? (
            <p className="mt-5 text-sm text-slate-500">
              Eligibility has not been evaluated.
            </p>
          ) : null}
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">
            Seller
          </h2>

          {product?.supplier ? (
            <div className="mt-5 space-y-4">
              <div>
                <Link
                  href={`/admin/marketplace/sellers/${product.supplier.id}`}
                  className="font-semibold text-[#741d35] hover:underline"
                >
                  {product.supplier.company_name}
                </Link>
              </div>

              <Detail
                label="Verification"
                value={
                  product.supplier.verification_status
                    ? formatStatus(
                        product.supplier.verification_status,
                      )
                    : null
                }
              />

              <Detail
                label="Supplier Status"
                value={
                  product.supplier.status
                    ? formatStatus(
                        product.supplier.status,
                      )
                    : null
                }
              />

              <Detail
                label="Email"
                value={product.supplier.email}
              />

              <Detail
                label="Phone"
                value={product.supplier.phone}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No Supplier is associated with this Product.
            </p>
          )}
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
                Raw Channel configuration is intentionally not exposed through Marketplace Listing Detail.
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Channel information is unavailable.
            </p>
          )}
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-950">
          Publication Timeline
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <TimelineItem
            label="Created"
            value={listing.created_at}
            icon={<FileText className="h-4 w-4" />}
          />

          <TimelineItem
            label="Updated"
            value={listing.updated_at}
            icon={<RefreshCw className="h-4 w-4" />}
          />

          <TimelineItem
            label="Published"
            value={listing.published_at}
            icon={<ShoppingBag className="h-4 w-4" />}
          />

          <TimelineItem
            label="Paused"
            value={listing.paused_at}
            icon={<PauseCircle className="h-4 w-4" />}
          />

          <TimelineItem
            label="Archived"
            value={listing.archived_at}
            icon={<Archive className="h-4 w-4" />}
          />
        </div>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-semibold text-amber-950">
          Marketplace Listing Authority
        </h2>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          Marketplace owns only publication state and an optional price override. Catalogue remains authoritative for Product data, Supplier remains authoritative for seller identity, and Channel administration remains authoritative for channel configuration.
        </p>
      </section>
    </div>
  );
}

const workflowActions: Array<{
  action: MarketplaceListingAction;
  capability: keyof MarketplaceListingCapabilities;
  label: string;
}> = [
  { action: "submit", capability: "submit_listing", label: "Submit for Review" },
  { action: "approve", capability: "approve_listing", label: "Approve" },
  { action: "request_changes", capability: "request_changes", label: "Request Changes" },
  { action: "reject", capability: "reject_listing", label: "Reject" },
  { action: "publish", capability: "publish_listing", label: "Publish" },
  { action: "unpublish", capability: "unpublish_listing", label: "Unpublish" },
  { action: "suspend", capability: "suspend_listing", label: "Suspend" },
  { action: "reinstate", capability: "reinstate_listing", label: "Reinstate" },
  { action: "archive", capability: "archive_listing", label: "Archive" },
];

function WorkflowActions({
  capabilities,
  disabled,
  reason,
  onReasonChange,
  onAction,
}: {
  capabilities: MarketplaceListingCapabilities;
  disabled: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onAction: (action: MarketplaceListingAction) => void;
}) {
  const visibleActions = workflowActions.filter(
    ({ capability }) => capabilities[capability] === true,
  );

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-950">Listing Workflow</h2>
      <label className="mt-4 block max-w-xl text-sm font-medium text-slate-700">
        Reason
        <textarea
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Required for request changes, reject, and suspend"
          className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        {visibleActions.map(({ action, label }) => (
          <button
            key={action}
            type="button"
            disabled={disabled}
            onClick={() => onAction(action)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-50"
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

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <StatusBadge value={value} />
    </div>
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

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
