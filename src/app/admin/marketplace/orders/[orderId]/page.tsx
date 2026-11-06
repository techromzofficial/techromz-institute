"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Box,
  CheckCircle2,
  Clock3,
  PackageCheck,
  RefreshCw,
  Store,
  Truck,
  User,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  cancelMarketplaceOrder,
  fetchMarketplaceOrder,
  type MarketplaceOrderDetailResponse,
} from "@/lib/api/marketplace";

type MarketplaceOrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default function MarketplaceOrderDetailPage(
  _props: MarketplaceOrderDetailPageProps,
) {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;

  const [data, setData] =
    useState<MarketplaceOrderDetailResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrder() {
      setLoading(true);
      setError("");

      try {
        const response = await fetchMarketplaceOrder(orderId, controller.signal);

        if (!controller.signal.aborted) {
          setData(response);
        }
      } catch (reason) {
        if (!controller.signal.aborted) {
          const message =
            reason instanceof Error
              ? reason.message
              : "Marketplace order detail could not be loaded.";

          setData(null);
          setError(message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      controller.abort();
    };
  }, [orderId, requestVersion]);

  if (loading && !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        Loading Marketplace order…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/marketplace/orders"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
          aria-label="Back to Marketplace Orders"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <h1 className="font-semibold">
                Marketplace order unavailable
              </h1>

              <p className="mt-1 text-sm">{error}</p>

              <button
                type="button"
                onClick={() =>
                  setRequestVersion((value) => value + 1)
                }
                className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold"
              >
                Try again
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

  const { order } = data;

  return (
    <div className="space-y-6">
      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/marketplace/orders"
            className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label="Back to Marketplace Orders"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#741d35]">
              Marketplace · Order Detail
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-950">
                {order.order_reference}
              </h1>

              <StatusBadge value={order.status} />

              {order.sla_status === "breached" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  SLA Breached
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Authoritative tenant-scoped Commerce order detail.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.capabilities?.cancel_order && (
            <button
              type="button"
              onClick={() => {
                setCancelReason("");
                setActionError("");
                setCancelModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            >
              <Ban className="h-4 w-4" />
              Cancel Order
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setRequestVersion((value) => value + 1)
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<WalletCards className="h-5 w-5" />}
          label="Order Total"
          value={money(order.amounts.currency, order.amounts.total)}
          detail="Persisted Commerce value"
        />

        <MetricCard
          icon={<PackageCheck className="h-5 w-5" />}
          label="Payment Status"
          value={formatNullable(order.payment_status)}
          detail={formatNullable(order.payment_method)}
        />

        <MetricCard
          icon={<Box className="h-5 w-5" />}
          label="Fulfilment"
          value={formatNullable(order.fulfillment_status)}
          detail={`Approval: ${formatNullable(order.approval_status)}`}
        />

        <MetricCard
          icon={<Truck className="h-5 w-5" />}
          label="Shipments"
          value={String(data.shipments.length)}
          detail={
            order.sla_status === "breached"
              ? "SLA breach detected"
              : order.expected_delivery_date
              ? `Expected ${formatDate(order.expected_delivery_date)}`
              : "No expected delivery date"
          }
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-5">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-950">
                Order Items
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Products recorded on this order
              </p>
            </div>

            {data.items.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No order items are available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Quantity</th>
                      <th className="px-5 py-3 text-right">
                        Unit Price
                      </th>
                      <th className="px-5 py-3 text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {data.items.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4 font-medium text-slate-900">
                          <div>{item.product_name}</div>
                          {(item.sku || item.variant_label || item.policy_snapshot_id) && (
                            <div className="mt-1 flex flex-wrap gap-2 text-xs font-normal text-slate-500">
                              {item.sku && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">
                                  SKU: {item.sku}
                                </span>
                              )}
                              {item.variant_label && (
                                <span>{item.variant_label}</span>
                              )}
                              {item.policy_snapshot_id && (
                                <span className="text-slate-400">
                                  Policy: {item.policy_snapshot_id}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 text-slate-700">
                          {item.quantity}
                        </td>

                        <td className="px-5 py-4 text-right text-slate-700">
                          {money(
                            order.amounts.currency,
                            item.unit_price,
                          )}
                        </td>

                        <td className="px-5 py-4 text-right font-semibold text-slate-950">
                          {money(
                            order.amounts.currency,
                            item.amount,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-950">
                Shipment Activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Read-only Logistics references linked to this order
              </p>
            </div>

            {data.shipments.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No shipment records are linked to this order.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.shipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">
                        {shipment.shipment_number}
                      </span>

                      <p className="mt-1 text-xs text-slate-500">
                        {shipment.carrier ?? "No carrier"} ·{" "}
                        {shipment.tracking_number ?? "No tracking number"}
                      </p>
                    </div>

                    <div className="text-right">
                      <StatusBadge value={shipment.status} />

                      {shipment.estimated_delivery_date && (
                        <p className="mt-1 text-xs text-slate-500">
                          ETA{" "}
                          {formatDate(
                            shipment.estimated_delivery_date,
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">
              Financial Breakdown
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <AmountRow
                label="Subtotal"
                value={money(
                  order.amounts.currency,
                  order.amounts.subtotal,
                )}
              />

              <AmountRow
                label="Tax"
                value={money(
                  order.amounts.currency,
                  order.amounts.tax,
                )}
              />

              <AmountRow
                label="Shipping"
                value={money(
                  order.amounts.currency,
                  order.amounts.shipping,
                )}
              />

              <AmountRow
                label="Discount"
                value={money(
                  order.amounts.currency,
                  order.amounts.discount,
                )}
              />

              <AmountRow
                label="Platform Fee"
                value={money(
                  order.amounts.currency,
                  order.amounts.platform_fee,
                )}
              />

              <AmountRow
                label="Total"
                value={money(
                  order.amounts.currency,
                  order.amounts.total,
                )}
                strong
              />
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#741d35]" />

              <h2 className="font-semibold text-slate-950">
                Customer
              </h2>
            </div>

            <dl className="mt-4 space-y-3">
              <DetailRow
                label="Name"
                value={order.customer?.name ?? "—"}
              />

              <DetailRow
                label="Email"
                value={order.customer?.email ?? "—"}
              />
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-[#741d35]" />

              <h2 className="font-semibold text-slate-950">
                Seller
              </h2>
            </div>

            <dl className="mt-4 space-y-3">
              <DetailRow
                label="Company"
                value={order.supplier?.company_name ?? "—"}
              />

              <DetailRow
                label="Email"
                value={order.supplier?.email ?? "—"}
              />

              <DetailRow
                label="Phone"
                value={order.supplier?.phone ?? "—"}
              />

              <DetailRow
                label="Status"
                value={formatNullable(
                  order.supplier?.status ?? null,
                )}
              />

              <DetailRow
                label="Verification"
                value={formatNullable(
                  order.supplier?.verification_status ?? null,
                )}
              />
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-[#741d35]" />

              <h2 className="font-semibold text-slate-950">
                Order Lifecycle
              </h2>
            </div>

            {data.status_history.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No status history has been recorded.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {data.status_history.map((history, index) => (
                  <div
                    key={`${history.status}-${history.created_at}-${index}`}
                    className="border-l-2 border-slate-200 pl-4"
                  >
                    <StatusBadge value={history.status} />

                    <p className="mt-1 text-xs text-slate-500">
                      {history.created_at
                        ? formatDateTime(history.created_at)
                        : "Timestamp unavailable"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-950">
              Order Information
            </h2>

            <dl className="mt-4 space-y-3">
              <DetailRow
                label="Source"
                value={formatNullable(order.order_source)}
              />

              <DetailRow
                label="Payment Terms"
                value={order.payment_terms ?? "—"}
              />

              <DetailRow
                label="Shipping Terms"
                value={order.shipping_terms ?? "—"}
              />

              <DetailRow
                label="Delivery Terms"
                value={order.delivery_terms ?? "—"}
              />

              <DetailRow
                label="Created"
                value={
                  order.created_at
                    ? formatDateTime(order.created_at)
                    : "—"
                }
              />
            </dl>
          </section>

        </aside>
      </div>

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-slate-950">Cancel Order</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-sm text-slate-600">
                Are you sure you want to cancel order{" "}
                <span className="font-semibold text-slate-900">
                  {order.order_reference}
                </span>
                ? This will release reserved inventory and void or refund pending payments.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter the authoritative reason for cancelling this order..."
                  className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-[#741d35] focus:outline-none focus:ring-1 focus:ring-[#741d35]"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setCancelModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={cancelling || !cancelReason.trim()}
                  onClick={async () => {
                    if (!cancelReason.trim()) return;
                    setCancelling(true);
                    setActionError("");
                    try {
                      await cancelMarketplaceOrder(order.id, {
                        reason: cancelReason.trim(),
                      });
                      setActionSuccess("Order has been cancelled successfully.");
                      setCancelModalOpen(false);
                      setRequestVersion((v) => v + 1);
                    } catch (e) {
                      setActionError(
                        e instanceof Error
                          ? e.message
                          : "Failed to cancel order.",
                      );
                    } finally {
                      setCancelling(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelling ? "Cancelling…" : "Confirm Cancellation"}
                </button>
              </div>
            </div>
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
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <strong className="mt-2 block text-xl text-slate-950">
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

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-xs text-slate-500">
        {label}
      </dt>

      <dd className="text-right text-sm font-medium text-slate-800">
        {value}
      </dd>
    </div>
  );
}

function AmountRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 ${
          strong
            ? "text-lg font-bold text-slate-950"
            : "font-semibold text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
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
      {formatNullable(value)}
    </span>
  );
}

function money(
  currency: string | null,
  amount: string | null,
): string {
  if (!currency || amount === null) {
    return "—";
  }

  return `${currency} ${amount}`;
}

function formatNullable(value: string | null): string {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDate(value: string): string {
  return new Date(
    `${value}T00:00:00`,
  ).toLocaleDateString();
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}
