"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Award,
  Ban,
  Boxes,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  PackageSearch,
  Phone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  TrendingDown,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  fetchMarketplaceSeller,
  fetchMarketplaceSellerPerformance,
  transitionMarketplaceSeller,
  type MarketplaceSellerAction,
  type MarketplaceSellerDetailResponse,
  type SellerPerformanceData,
} from "@/lib/api/marketplace";

export default function MarketplaceSellerDetailPage() {
  const params = useParams<{ sellerId: string }>();
  const sellerId = params.sellerId;

  const [data, setData] = useState<MarketplaceSellerDetailResponse | null>(null);
  const [performance, setPerformance] = useState<SellerPerformanceData["performance"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  // Transition modal state
  const [activeModal, setActiveModal] = useState<{
    action: MarketplaceSellerAction;
    title: string;
    description: string;
    requiresReason: boolean;
  } | null>(null);
  const [reasonInput, setReasonInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    Promise.all([
      fetchMarketplaceSeller(sellerId, controller.signal),
      fetchMarketplaceSellerPerformance(sellerId, controller.signal).catch(() => null),
    ])
      .then(([sellerRes, perfRes]) => {
        setData(sellerRes);
        if (perfRes?.performance) {
          setPerformance(perfRes.performance);
        }
      })
      .catch((reason: Error) => {
        if (controller.signal.aborted) return;
        setData(null);
        setError(reason.message || "Marketplace seller detail could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [sellerId, requestVersion]);

  async function handleExecuteTransition(e: React.FormEvent) {
    e.preventDefault();
    if (!activeModal) return;

    if (activeModal.requiresReason && !reasonInput.trim()) {
      setActionError("A valid justification reason is required for this action.");
      return;
    }

    setSubmittingAction(true);
    setActionError("");

    try {
      await transitionMarketplaceSeller(sellerId, {
        action: activeModal.action,
        reason: reasonInput.trim() || undefined,
        notes: notesInput.trim() || undefined,
      });

      setActionSuccess(`Seller successfully updated with action: ${activeModal.action}`);
      setActiveModal(null);
      setReasonInput("");
      setNotesInput("");
      setRequestVersion((v) => v + 1);
    } catch (err: any) {
      setActionError(err.message || "Action failed to execute on seller.");
    } finally {
      setSubmittingAction(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        Loading Marketplace seller…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h1 className="font-semibold">Marketplace seller unavailable</h1>
            <p className="mt-1 text-sm">{error}</p>
            <div className="mt-4 flex gap-2">
              <Link
                href="/admin/marketplace/sellers"
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold"
              >
                Back to Sellers
              </Link>
              <button
                type="button"
                onClick={() => setRequestVersion((value) => value + 1)}
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

  if (!data) return null;

  const { seller, capabilities: caps } = data;
  const sellerStatus = seller.status ?? "pending";
  const verificationStatus = seller.verification_status ?? "pending";

  return (
    <div className="space-y-6">
      {actionSuccess && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess("")}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Quick Lifecycle Action Buttons */}
      <header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/marketplace/sellers"
            className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label="Back to Seller Management"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#741d35]">
              Marketplace · Seller Lifecycle
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-950">
                {seller.company_name}
              </h1>

              <StatusBadge value={sellerStatus} />
              <StatusBadge value={`compliance: ${verificationStatus}`} />

              {seller.is_featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <Award className="h-3.5 w-3.5" />
                  Featured
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Authoritative projection with workflow lifecycle transitions and real-time performance governance.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {sellerStatus === "pending" && caps.verify_seller && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveModal({
                    action: "approve",
                    title: "Approve Seller",
                    description:
                      verificationStatus === "verified"
                        ? "Verify and activate seller selling authority for this tenant."
                        : "WARNING: Compliance status is not verified. Seller approval requires verified standing.",
                    requiresReason: false,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Seller
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveModal({
                    action: "reject",
                    title: "Reject Seller Application",
                    description: "Reject onboarding application. State specific missing documentation or compliance blockers.",
                    requiresReason: true,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            </>
          )}

          {sellerStatus === "active" && caps.suspend_seller && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveModal({
                    action: "suspend",
                    title: "Suspend Seller",
                    description:
                      "Suspending this seller immediately halts new orders, auto-pauses all published listings, and requires a recorded audit reason.",
                    requiresReason: true,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
              >
                <Ban className="h-4 w-4" />
                Suspend Seller
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveModal({
                    action: "offboard",
                    title: "Offboard & Close Seller",
                    description:
                      "Offboarding permanently closes seller account. All open customer orders, active returns, and outstanding payables must be completed.",
                    requiresReason: false,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                <ShieldAlert className="h-4 w-4" />
                Offboard Seller
              </button>
            </>
          )}

          {sellerStatus === "suspended" && caps.suspend_seller && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveModal({
                    action: "reactivate",
                    title: "Reactivate Seller",
                    description: "Rechecks compliance standing and restores seller active selling authority.",
                    requiresReason: false,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Reactivate
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveModal({
                    action: "offboard",
                    title: "Offboard & Close Seller",
                    description: "Close out seller account after verifying zero open orders or return disputes.",
                    requiresReason: false,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                <ShieldAlert className="h-4 w-4" />
                Offboard
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setRequestVersion((v) => v + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </header>

      {/* Performance Alerts Banner (MKT-S07) */}
      {performance && performance.alerts && performance.alerts.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 shrink-0" />
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-amber-900">
                Operational Performance Warnings ({performance.alerts.length})
              </h2>
              {performance.alerts.map((alert, idx) => (
                <p key={idx} className="text-xs font-medium text-amber-800">
                  • {alert.message}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<PackageSearch className="h-5 w-5" />}
          label="Catalog Products"
          value={seller.products_count}
        />
        <MetricCard
          icon={<ShoppingCart className="h-5 w-5" />}
          label="Orders Total"
          value={seller.orders_count}
        />
        <MetricCard
          icon={<Star className="h-5 w-5" />}
          label="Rating"
          value={seller.rating ? `${seller.rating} (${seller.reviews_count})` : "—"}
        />
        <MetricCard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Certificates"
          value={seller.certificates_count}
        />
      </section>

      {/* Performance & Quality Metrics Card (MKT-S07) */}
      {performance && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-semibold text-slate-950">
                Seller Performance Dashboard (MKT-S07)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time operational SLA metrics calculated against tenant order history.
              </p>
            </div>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                performance.cancellation_rate > 5.0
                  ? "bg-rose-50 text-rose-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              Cancellation Rate: {performance.cancellation_rate}%
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase">Fulfilled Orders</span>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {performance.fulfilled_orders}{" "}
                <span className="text-xs font-normal text-slate-500">/ {performance.total_orders}</span>
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase">Returns & Disputes</span>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {performance.returns_count}{" "}
                <span className="text-xs font-normal text-slate-500">({performance.return_rate}%)</span>
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase">Policy Violations</span>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {performance.violations_count}{" "}
                <span className="text-xs font-normal text-rose-600">
                  ({performance.critical_violations_count} critical)
                </span>
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase">Dispatch Delays (&gt;48h)</span>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {performance.dispatch_delays_count}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Details and Profile Grid */}
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">Seller Profile</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Detail label="Company" value={seller.company_name} icon={<Store className="h-4 w-4" />} />
            <Detail label="Business Type" value={seller.business_type} icon={<Boxes className="h-4 w-4" />} />
            <Detail label="Slug" value={seller.slug} icon={<Store className="h-4 w-4" />} />
            <Detail label="Website" value={seller.website} icon={<Store className="h-4 w-4" />} />
            <Detail label="Email" value={seller.email} icon={<Mail className="h-4 w-4" />} />
            <Detail label="Phone" value={seller.phone} icon={<Phone className="h-4 w-4" />} />
            <Detail
              label="Location"
              value={[seller.city, seller.country].filter(Boolean).join(", ") || null}
              icon={<MapPin className="h-4 w-4" />}
            />
            <Detail label="Address" value={seller.address} icon={<MapPin className="h-4 w-4" />} />
            <Detail label="Created" value={formatDateTime(seller.created_at)} icon={<Store className="h-4 w-4" />} />
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Compliance &amp; Verification</h2>
            <div className="mt-4 space-y-3">
              <StatusRow label="Selling Status" value={seller.status} />
              <StatusRow label="Verification Status" value={seller.verification_status} />
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">Ecosystem ID</span>
                <span className="text-xs font-mono text-slate-700">#{seller.id}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">Recent Products</h2>
            {data.recent_products.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No products published by this seller yet.</p>
            ) : (
              <div className="mt-3 divide-y divide-slate-100">
                {data.recent_products.slice(0, 5).map((prod) => (
                  <div key={prod.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-slate-800">{prod.name}</p>
                      <p className="text-slate-400 font-mono">{prod.sku ?? "No SKU"}</p>
                    </div>
                    <div className="text-right">
                      {prod.price != null && (
                        <p className="font-medium text-slate-800">{prod.price}</p>
                      )}
                      <StatusBadge value={prod.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Recent Orders */}
        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">Recent Orders</h2>
          {data.recent_orders.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No orders placed with this seller yet.</p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {data.recent_orders.slice(0, 5).map((order) => (
                <div key={order.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <a
                      href={`/admin/marketplace/orders/${order.uuid}`}
                      className="font-medium text-[#741d35] hover:underline"
                    >
                      {order.order_number}
                    </a>
                    <p className="text-slate-400">{formatDateTime(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-800">
                      {order.currency != null ? `${order.currency} ${order.total}` : order.total}
                    </p>
                    <StatusBadge value={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>

      {/* Transition Action Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-950">{activeModal.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{activeModal.description}</p>

            {actionError && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {actionError}
              </div>
            )}

            <form onSubmit={handleExecuteTransition} className="mt-4 space-y-4">
              {activeModal.requiresReason && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Justification Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    placeholder="Provide specific justification or policy grounds..."
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-[#741d35]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Internal Administrative Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Ticket reference or audit note"
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-[#741d35]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => setActiveModal(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5b1629] disabled:opacity-50"
                >
                  {submittingAction ? "Processing…" : "Confirm Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="rounded-lg bg-[#741d35]/10 p-2.5 text-[#741d35]">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">
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
      <span className="text-sm text-slate-500">{label}</span>
      <StatusBadge value={value} />
    </div>
  );
}

function StatusBadge({
  value,
}: {
  value: string | null;
}) {
  if (!value) return <span className="text-slate-400">—</span>;

  let color = "bg-slate-100 text-slate-700";
  if (value.includes("active") || value.includes("verified")) color = "bg-emerald-50 text-emerald-700";
  else if (value.includes("suspended") || value.includes("pending")) color = "bg-amber-50 text-amber-700";
  else if (value.includes("rejected") || value.includes("closed")) color = "bg-rose-50 text-rose-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>
      {formatStatus(value)}
    </span>
  );
}

function formatStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDateTime(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
