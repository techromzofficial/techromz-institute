"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, RefreshCw, Send, CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import {
  fetchMarketplaceReturn,
  transitionMarketplaceReturn,
  respondMarketplaceReturn,
  type MarketplaceReturnDetailResponse,
} from "@/lib/api/marketplace";

type ReturnAction = "review" | "approve" | "reject" | "resolve" | "cancel";

export default function MarketplaceReturnDetailPage(_props: { params: Promise<{ returnId: string }> }) {
  const { returnId } = useParams<{ returnId: string }>();
  const [data, setData] = useState<MarketplaceReturnDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<ReturnAction | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  // Dispute seller response form
  const [responseText, setResponseText] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Resolve dialog state
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      setData(await fetchMarketplaceReturn(returnId, signal));
    } catch (reason) {
      if (signal?.aborted) return;
      setData(null);
      setError(message(reason, "Marketplace return or dispute case could not be loaded."));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [returnId]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load, requestVersion]);

  async function transition(action: ReturnAction) {
    if (action !== "review" && !window.confirm(`${formatLabel(action)} this case?`)) return;

    setMutationError("");
    setSuccessMessage("");
    setPendingAction(action);
    try {
      if (action === "resolve" && refundAmount) {
        await transitionMarketplaceReturn(returnId, action, { refund_amount: refundAmount });
      } else {
        await transitionMarketplaceReturn(returnId, action);
      }
      setSuccessMessage(`Case successfully transitioned to ${formatLabel(action)}.`);
      await load();
    } catch (reason) {
      setMutationError(message(reason, "The case transition could not be completed."));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSellerResponse(e: React.FormEvent) {
    e.preventDefault();
    if (!responseText.trim()) return;

    setMutationError("");
    setSuccessMessage("");
    setIsSubmittingResponse(true);
    try {
      const res = await respondMarketplaceReturn(returnId, responseText.trim());
      setSuccessMessage(res.message || "Seller response recorded successfully.");
      setResponseText("");
      await load();
    } catch (reason) {
      setMutationError(message(reason, "Could not submit seller response."));
    } finally {
      setIsSubmittingResponse(false);
    }
  }

  if (loading && !data) return <StatePanel>Loading return or dispute case…</StatePanel>;

  if (error && !data) {
    return (
      <div className="space-y-5">
        <BackLink />
        <StatePanel tone="error">
          <AlertTriangle className="mx-auto mb-3 h-6 w-6" />
          <h1 className="font-semibold">Return / Dispute unavailable</h1>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={() => setRequestVersion((value) => value + 1)}
            className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 font-semibold"
          >
            Try again
          </button>
        </StatePanel>
      </div>
    );
  }

  if (!data) return null;

  const returnCase = data.return_case;
  const actions: Array<[ReturnAction, boolean]> = [
    ["review", data.capabilities.review_case],
    ["approve", data.capabilities.approve_case],
    ["reject", data.capabilities.reject_case],
    ["resolve", data.capabilities.resolve_case],
    ["cancel", data.capabilities.cancel_case],
  ];
  const availableActions = actions.filter(([, allowed]) => allowed);

  return (
    <div className="space-y-6">
      <BackLink />
      <PageHeader
        crumbs={["Marketplace", "Returns & Disputes", `Case #${returnCase.id}`]}
        title={returnCase.subject}
        description={`${formatLabel(returnCase.type)} case · ${returnCase.reason_code ? formatLabel(returnCase.reason_code) : "No reason code"}`}
        actions={
          <button
            type="button"
            onClick={() => setRequestVersion((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        }
      />

      {mutationError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {mutationError}
        </div>
      )}

      {successMessage && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Case ID" value={`#${returnCase.id}`} />
        <InfoCard label="Type" value={formatLabel(returnCase.type)} />
        <InfoCard label="Status" value={formatLabel(returnCase.status)} />
        <InfoCard
          label="RMA Reference"
          value={returnCase.rma_reference || "Pending Approval"}
          highlight={Boolean(returnCase.rma_reference)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <div className="space-y-6">
          <Card title="Commercial Case">
            <dl className="grid gap-5 md:grid-cols-2">
              <Detail label="Case UUID" value={returnCase.uuid} />
              <Detail label="Reason" value={displayLabel(returnCase.reason_code)} />
              <Detail label="Requested" value={formatDateTime(returnCase.requested_at)} />
              <Detail label="Resolved" value={formatDateTime(returnCase.resolved_at)} />
              {returnCase.approved_refund_amount && (
                <Detail
                  label="Approved Refund"
                  value={formatMoney(returnCase.approved_refund_amount, returnCase.order?.currency || "LKR")}
                />
              )}
              {returnCase.refund_idempotency_key && (
                <Detail label="Refund Key" value={returnCase.refund_idempotency_key} />
              )}
            </dl>
            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {returnCase.description || "No case description has been recorded."}
              </p>
            </div>
          </Card>

          {/* Return Items (Physical Receipt & Inspection) */}
          <Card title="Return Items & Inspection">
            {returnCase.items && returnCase.items.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {returnCase.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {item.order_item?.product_name || `Item #${item.order_item_id}`}
                      </p>
                      {item.order_item?.sku && (
                        <p className="text-xs text-slate-500">SKU: {item.order_item.sku}</p>
                      )}
                      {item.reason && <p className="text-xs text-amber-700 mt-0.5">{item.reason}</p>}
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-medium text-slate-700">Requested: {item.requested_quantity}</p>
                      <p className="text-slate-500">
                        Received: {item.received_quantity ?? 0} · Inspected: {item.inspected_quantity ?? 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No physical return item entries recorded.</p>
            )}
          </Card>

          {/* Seller Dispute Response Section */}
          <Card title="Seller Dispute Response">
            {returnCase.seller_response_text ? (
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Seller Statement</span>
                  <span>{formatDateTime(returnCase.seller_response_at ?? null)}</span>
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{returnCase.seller_response_text}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mb-4">No seller response recorded yet.</p>
            )}

            {(data.capabilities.respond ?? data.capabilities.review_case) && (
              <form onSubmit={handleSellerResponse} className="mt-4 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Record / Update Seller Dispute Response
                </label>
                <textarea
                  rows={3}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Record seller's explanation, evidence, or inspection notes..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-[#741d35] focus:outline-none focus:ring-1 focus:ring-[#741d35]"
                />
                <button
                  type="submit"
                  disabled={isSubmittingResponse || !responseText.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSubmittingResponse ? "Submitting..." : "Save Seller Response"}
                </button>
              </form>
            )}
          </Card>

          <Card title="Related Order">
            {returnCase.order ? (
              <>
                <div className="mb-5 flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <Link href={`/admin/marketplace/orders/${returnCase.order.uuid || returnCase.order.id}`} className="font-semibold text-[#741d35] hover:underline">
                    {returnCase.order.order_number}
                  </Link>
                  <Badge value={returnCase.order.status} />
                </div>
                <dl className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <Detail label="Payment" value={displayLabel(returnCase.order.payment_status)} />
                  <Detail label="Fulfilment" value={displayLabel(returnCase.order.fulfillment_status)} />
                  <Detail label="Currency" value={returnCase.order.currency || "Unavailable"} />
                  <Detail label="Subtotal" value={formatMoney(returnCase.order.subtotal, returnCase.order.currency)} />
                  <Detail label="Tax" value={formatMoney(returnCase.order.tax, returnCase.order.currency)} />
                  <Detail label="Shipping" value={formatMoney(returnCase.order.shipping, returnCase.order.currency)} />
                  <Detail label="Discount" value={formatMoney(returnCase.order.discount, returnCase.order.currency)} />
                  <Detail label="Order Total" value={formatMoney(returnCase.order.total, returnCase.order.currency)} />
                </dl>
              </>
            ) : <p className="text-sm text-slate-500">Related order is unavailable.</p>}
          </Card>

          <Card title="Seller">
            {returnCase.supplier ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Link href={`/admin/marketplace/sellers/${returnCase.supplier.id}`} className="font-semibold text-[#741d35] hover:underline">
                  {returnCase.supplier.company_name}
                </Link>
                <div className="flex gap-2">
                  <Badge value={returnCase.supplier.status ?? null} />
                  <Badge value={returnCase.supplier.verification_status ?? null} />
                </div>
              </div>
            ) : <p className="text-sm text-slate-500">No seller is associated with this case.</p>}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Case Actions">
            {availableActions.length ? (
              <div className="grid gap-2">
                {data.capabilities.resolve_case && (
                  <div className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                    <label className="block text-xs font-medium text-emerald-950">
                      Approved Refund ({returnCase.order?.currency || "LKR"})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder={returnCase.order?.total || "0.00"}
                      className="mt-1 w-full rounded border border-emerald-300 bg-white px-2.5 py-1 text-xs"
                    />
                  </div>
                )}
                {availableActions.map(([action]) => (
                  <button
                    key={action}
                    type="button"
                    disabled={pendingAction !== null}
                    onClick={() => void transition(action)}
                    className="w-full rounded-lg bg-[#741d35] px-4 py-2.5 text-left text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {pendingAction === action ? "Updating…" : `${formatLabel(action)} Case`}
                  </button>
                ))}
              </div>
            ) : <p className="text-sm text-slate-500">No Marketplace workflow actions are available.</p>}
          </Card>
          <Card title="Reverse Logistics"><p className="text-sm leading-6 text-slate-600">{data.domain_boundaries.logistics}</p></Card>
          <Card title="Finance"><p className="text-sm leading-6 text-slate-600">{data.domain_boundaries.finance}</p></Card>
          <article className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-semibold text-amber-950">Marketplace Boundary</h2>
            <p className="mt-2 text-sm leading-6 text-amber-800">{data.domain_boundaries.marketplace}</p>
          </article>
        </aside>
      </section>
    </div>
  );
}

function BackLink() {
  return <Link href="/admin/marketplace/returns" className="inline-flex items-center gap-2 text-sm font-semibold text-[#741d35] hover:underline"><ArrowLeft className="h-4 w-4" />Back to Returns & Disputes</Link>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-4 font-semibold text-slate-950">{title}</h2>{children}</article>;
}

function InfoCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 font-semibold ${highlight ? "text-[#741d35]" : "text-slate-950"}`}>{value}</p>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-slate-800">{value}</dd></div>;
}

function Badge({ value }: { value: string | null }) {
  return value ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{formatLabel(value)}</span> : <span className="text-sm text-slate-400">Unavailable</span>;
}

function StatePanel({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "error" }) {
  return <div className={`rounded-xl border p-12 text-center text-sm shadow-sm ${tone === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-500"}`}>{children}</div>;
}

function formatLabel(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase()); }
function displayLabel(value: string | null) { return value ? formatLabel(value) : "Unavailable"; }
function formatDateTime(value: string | null) { return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Unavailable"; }
function formatMoney(value: string | null, currency: string | null) {
  if (value === null) return "Unavailable";
  const amount = Number(value);
  const formatted = Number.isNaN(amount) ? value : new Intl.NumberFormat("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return currency ? `${currency} ${formatted}` : formatted;
}
function message(reason: unknown, fallback: string) { return reason instanceof Error && reason.message ? reason.message : fallback; }
