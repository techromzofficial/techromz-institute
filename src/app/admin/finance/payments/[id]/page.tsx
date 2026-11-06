"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  WalletCards,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import {
  DashboardGrid,
  KpiCard,
} from "@/components/admin/shared/KpiCard";
import { useAdminContext } from "@/contexts/AdminContext";
import { FINANCE_PERMISSIONS } from "@/features/finance/permissions/financePermissions";
import {
  financeApi,
  type FinancePaymentCapabilities,
  type FinancePaymentDetail,
  type FinancePaymentStatus,
} from "@/lib/api/finance";

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function formatMoney(
  amount: string,
  currency: string | null,
): string {
  const numeric = Number(amount);

  if (!Number.isFinite(numeric)) {
    return `${currency ?? ""} ${amount}`.trim();
  }

  if (!currency) {
    return numeric.toLocaleString();
  }

  try {
    return new Intl.NumberFormat(
      undefined,
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      },
    ).format(numeric);
  } catch {
    return `${currency} ${numeric.toLocaleString()}`;
  }
}

function titleCase(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function PaymentStatusBadge({
  status,
}: {
  status: FinancePaymentStatus;
}) {
  const base =
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold";

  if (status === "captured") {
    return (
      <span
        className={`${base} border-green-200 bg-green-50 text-green-700`}
      >
        <CheckCircle2 size={11} />
        Captured
      </span>
    );
  }

  if (
    status === "failed" ||
    status === "cancelled"
  ) {
    return (
      <span
        className={`${base} border-rose-200 bg-rose-50 text-rose-700`}
      >
        <AlertTriangle size={11} />
        {titleCase(status)}
      </span>
    );
  }

  if (
    status === "refunded" ||
    status === "partially_refunded"
  ) {
    return (
      <span
        className={`${base} border-blue-200 bg-blue-50 text-blue-700`}
      >
        <RotateCcw size={11} />
        {titleCase(status)}
      </span>
    );
  }

  if (
    status === "pending" ||
    status === "requires_action" ||
    status === "authorized"
  ) {
    return (
      <span
        className={`${base} border-amber-200 bg-amber-50 text-amber-700`}
      >
        <Clock3 size={11} />
        {titleCase(status)}
      </span>
    );
  }

  return (
    <span
      className={`${base} border-gray-200 bg-gray-50 text-gray-600`}
    >
      {titleCase(status)}
    </span>
  );
}

function TransactionStatusBadge({
  status,
}: {
  status: string | null;
}) {
  const normalized = String(
    status ?? "",
  ).toLowerCase();

  if (
    normalized === "success" ||
    normalized === "succeeded" ||
    normalized === "captured" ||
    normalized === "completed"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
        <CheckCircle2 size={11} />
        {titleCase(status)}
      </span>
    );
  }

  if (
    normalized === "failed" ||
    normalized === "declined"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
        <AlertTriangle size={11} />
        {titleCase(status)}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-600">
      {titleCase(status)}
    </span>
  );
}

export default function FinancePaymentDetailPage() {
  const params = useParams();

  const rawId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const paymentId = String(rawId ?? "");

  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canView = hasPermission(
    FINANCE_PERMISSIONS.view,
  );

  const [payment, setPayment] =
    useState<FinancePaymentDetail | null>(
      null,
    );

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);

  const [capabilities, setCapabilities] =
    useState<FinancePaymentCapabilities | null>(null);

  const [operationMessage, setOperationMessage] =
    useState<string | null>(null);

  const [operating, setOperating] =
    useState<"capture" | "cancel" | null>(null);

  const fetchPayment =
    useCallback(async () => {
      if (!canView || !paymentId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await financeApi.getPayment(
            paymentId,
          );

        setPayment(response.data);
        setCapabilities(response.capabilities);
      } catch (reason) {
        const requestError =
          reason as Error & {
            referenceId?: string | null;
          };

        console.error(
          "Failed to load Finance payment detail:",
          requestError,
        );

        setPayment(null);
        setCapabilities(null);

        setError(
          requestError.message ||
            "Failed to load payment detail.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      canView,
      paymentId,
    ]);

  useEffect(() => {
    void fetchPayment();
  }, [fetchPayment]);

  const runOperation = async (operation: "capture" | "cancel") => {
    if (!payment) return;

    setOperating(operation);
    setOperationMessage(null);
    const key = `admin-${operation}-${payment.uuid}-${crypto.randomUUID()}`;

    try {
      if (operation === "capture") {
        await financeApi.capturePayment(payment.id, key);
      } else {
        await financeApi.cancelPayment(payment.id, key);
      }
      setOperationMessage(`${titleCase(operation)} completed and confirmed by the provider.`);
      await fetchPayment();
    } catch (reason) {
      const requestError = reason as Error & { status?: number };
      setOperationMessage(
        requestError.status === 409
          ? "Reconciliation required: the provider outcome is unknown. Do not retry this operation."
          : requestError.message || `${titleCase(operation)} could not be completed.`,
      );
      await fetchPayment();
    } finally {
      setOperating(null);
    }
  };

  const contextItems = [
    {
      label: "Tenant",
      value: tenant.name,
    },
    {
      label: "Ecosystem",
      value: ecosystem.name,
    },
    {
      label: "Business Unit",
      value:
        businessUnit?.name ??
        "All permitted units",
    },
    {
      label: "Channel",
      value:
        channel?.name ??
        "All permitted channels",
    },
    {
      label: "Sector Pack",
      value:
        sectorPack?.name ??
        "Not assigned",
    },
  ];

  const refundedAmount = useMemo(
    () =>
      payment?.refunds.reduce(
        (sum, refund) =>
          sum +
          (Number(refund.amount) || 0),
        0,
      ) ?? 0,
    [payment],
  );

  return (
    <PermissionGuard
      permission={FINANCE_PERMISSIONS.view}
      fallback={
        <div className="p-6" role="alert">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-bold text-gray-900">
              Finance access required
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              You do not have permission to
              view Finance payment details for
              the current tenant.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen w-full bg-[#faf8f8] text-gray-900">
        <main className="px-6 py-4 pb-12">
          <header className="mb-4 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <Link
                href="/admin/finance/payments"
                className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft size={14} />
                Back to Payments
              </Link>

              <div className="mb-1 text-[11px] font-medium text-gray-500">
                Finance / Payments /
                Payment Detail
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold leading-tight text-gray-900">
                  {payment?.payment_number ??
                    "Payment Detail"}
                </h1>

                {payment && (
                  <PaymentStatusBadge
                    status={payment.status}
                  />
                )}
              </div>

              <p className="mt-1 max-w-4xl text-xs text-gray-500">
                Review authoritative payment,
                order, method, transaction and
                refund information for this
                tenant-scoped payment record.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {payment && capabilities?.capture && (
                <button type="button" disabled={operating !== null} onClick={() => void runOperation("capture")} className="rounded bg-[#7a0023] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                  {operating === "capture" ? "Capturing..." : "Capture payment"}
                </button>
              )}
              {payment && capabilities?.void && (
                <button type="button" disabled={operating !== null} onClick={() => void runOperation("cancel")} className="rounded border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 disabled:opacity-50">
                  {operating === "cancel" ? "Cancelling..." : "Cancel authorization"}
                </button>
              )}
              <button
                type="button"
                onClick={() => void fetchPayment()}
                disabled={loading}
                className="flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-60"
              >
              <RefreshCw
                size={13}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
              </button>
            </div>
          </header>

          <ContextScopeBar
            items={contextItems}
          />

          {operationMessage && (
            <div role="status" className={`mt-4 rounded-md border p-3 text-xs ${operationMessage.startsWith("Reconciliation") ? "border-amber-300 bg-amber-50 text-amber-800" : "border-gray-200 bg-white text-gray-700"}`}>
              {operationMessage}
            </div>
          )}

          {error && (
            <div
              className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
              role="alert"
            >
              <div className="flex items-start gap-2">
                <ShieldAlert
                  size={16}
                  className="mt-0.5 shrink-0"
                />

                <div>
                  <div className="font-bold">
                    Payment detail unavailable
                  </div>

                  <div className="mt-1 text-xs">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading && !payment && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              Loading payment detail...
            </div>
          )}

          {!loading &&
            !error &&
            !payment && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white p-10 text-center">
                <CreditCard
                  size={30}
                  className="mx-auto mb-2 text-gray-300"
                />

                <div className="font-semibold text-gray-700">
                  Payment not found
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  This payment does not exist
                  in the current tenant context.
                </div>
              </div>
            )}

          {payment && (
            <>
              <div className="mt-4">
                <DashboardGrid>
                  <KpiCard
                    title="Payment Amount"
                    value={formatMoney(
                      payment.amount,
                      payment.currency,
                    )}
                    icon={WalletCards}
                  />

                  <KpiCard
                    title="Payment Fee"
                    value={formatMoney(
                      payment.fee_amount,
                      payment.currency,
                    )}
                    icon={CreditCard}
                  />

                  <KpiCard
                    title="Transactions"
                    value={
                      payment.transactions
                        .length
                    }
                    icon={CheckCircle2}
                  />

                  <KpiCard
                    title="Refunds"
                    value={
                      payment.refunds.length
                    }
                    icon={RotateCcw}
                  />

                  <KpiCard
                    title="Refunded Amount"
                    value={formatMoney(
                      refundedAmount.toFixed(2),
                      payment.currency,
                    )}
                    icon={RotateCcw}
                  />
                </DashboardGrid>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm xl:col-span-2">
                  <div className="mb-4">
                    <h2 className="text-sm font-bold text-gray-900">
                      Payment Identity
                    </h2>

                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Core payment and order
                      references from the
                      payment domain.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailItem
                      label="Payment Number"
                      value={
                        payment.payment_number
                      }
                    />

                    <DetailItem
                      label="Payment UUID"
                      value={payment.uuid}
                    />

                    <DetailItem
                      label="Invoice Reference"
                      value={
                        payment.invoice_id
                          ? String(
                              payment.invoice_id,
                            )
                          : "—"
                      }
                    />

                    <DetailItem
                      label="Order Number"
                      value={
                        payment.order
                          ?.order_number ??
                        "—"
                      }
                    />

                    <DetailItem
                      label="Customer"
                      value={
                        payment.customer
                          ?.name ??
                        "—"
                      }
                    />

                    <DetailItem
                      label="Customer Email"
                      value={
                        payment.customer
                          ?.email ??
                        "—"
                      }
                    />

                    <DetailItem
                      label="Currency"
                      value={
                        payment.currency ??
                        "—"
                      }
                    />

                    <DetailItem
                      label="Canonical Status"
                      value={titleCase(
                        payment.status,
                      )}
                    />

                    <DetailItem
                      label="Secondary Status"
                      value={titleCase(
                        payment.payment_status,
                      )}
                    />
                  </div>
                </section>

                <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-sm font-bold text-gray-900">
                      Method &amp; Provider
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <DetailItem
                      label="Payment Method"
                      value={
                        payment
                          .payment_method
                          ?.name ?? "—"
                      }
                    />

                    <DetailItem
                      label="Method Type"
                      value={titleCase(
                        payment
                          .payment_method
                          ?.method_type,
                      )}
                    />

                    <DetailItem
                      label="Provider"
                      value={
                        payment.provider
                          .identifier ??
                        "—"
                      }
                    />

                    <DetailItem
                      label="Provider Reference"
                      value={
                        payment.provider
                          .reference ??
                        "—"
                      }
                    />

                    <DetailItem
                      label="Attempt Status"
                      value={titleCase(
                        payment.attempt
                          ?.status,
                      )}
                    />
                  </div>
                </section>
              </div>

              <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-gray-900">
                    Payment Timestamps
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <DetailItem
                    label="Created"
                    value={formatDate(
                      payment.created_at,
                    )}
                  />

                  <DetailItem
                    label="Updated"
                    value={formatDate(
                      payment.updated_at,
                    )}
                  />

                  <DetailItem
                    label="Authorized"
                    value={formatDate(
                      payment.authorized_at,
                    )}
                  />

                  <DetailItem
                    label="Paid"
                    value={formatDate(
                      payment.paid_at,
                    )}
                  />

                  <DetailItem
                    label="Failed"
                    value={formatDate(
                      payment.failed_at,
                    )}
                  />
                </div>
              </section>

              <section className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h2 className="text-sm font-bold text-gray-900">Administrative Operation Evidence</h2>
                  <p className="mt-0.5 text-[11px] text-gray-500">Provider dispatch claims are immutable. Unknown outcomes require reconciliation and cannot be retried here.</p>
                </div>
                {payment.operations.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-gray-500">No administrative capture or cancellation operation is recorded for this payment.</div>
                ) : payment.operations.map((operation) => (
                  <div key={operation.id} className={`m-4 rounded-md border p-4 ${operation.status === "outcome_unknown" ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-gray-50"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold text-gray-900">{titleCase(operation.operation)} · {titleCase(operation.status)}</div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${operation.status === "outcome_unknown" ? "bg-amber-200 text-amber-900" : operation.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {operation.status === "outcome_unknown" ? "Reconciliation required" : titleCase(operation.reconciliation_state)}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <DetailItem label="Actor" value={operation.actor?.name ?? operation.actor?.email ?? "Unavailable"} />
                      <DetailItem label="Requested" value={formatDate(operation.created_at)} />
                      <DetailItem label="Completed" value={formatDate(operation.completed_at)} />
                      <DetailItem label="Provider result" value={operation.provider_result_reference ?? "Not confirmed"} />
                      <DetailItem label="Provider" value={operation.provider_identifier} />
                      <DetailItem label="Transaction evidence" value={operation.payment_transaction_id ? String(operation.payment_transaction_id) : "None"} />
                      <DetailItem label="Failure class" value={operation.failure_class ?? "—"} />
                      <DetailItem label="Operation UUID" value={operation.uuid} />
                    </div>
                  </div>
                ))}
              </section>

              <section className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h2 className="text-sm font-bold text-gray-900">
                    Transaction History
                  </h2>

                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Append-only transaction
                    records associated with this
                    payment.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-2.5">
                          Reference
                        </th>
                        <th className="px-4 py-2.5">
                          Type
                        </th>
                        <th className="px-4 py-2.5">
                          Amount
                        </th>
                        <th className="px-4 py-2.5">
                          Status
                        </th>
                        <th className="px-4 py-2.5">
                          Gateway Status
                        </th>
                        <th className="px-4 py-2.5">
                          Provider
                        </th>
                        <th className="px-4 py-2.5">
                          Occurred
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                      {payment.transactions
                        .length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-8 text-center text-xs text-gray-500"
                          >
                            No transaction
                            records are associated
                            with this payment.
                          </td>
                        </tr>
                      )}

                      {payment.transactions.map(
                        (transaction) => (
                          <tr
                            key={
                              transaction.id
                            }
                          >
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">
                                {transaction.transaction_reference ??
                                  "—"}
                              </div>

                              <div className="mt-0.5 text-[10px] text-gray-500">
                                {transaction.event_reference ??
                                  "No event reference"}
                              </div>
                            </td>

                            <td className="px-4 py-3 text-gray-700">
                              {titleCase(
                                transaction.transaction_type,
                              )}
                            </td>

                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {formatMoney(
                                transaction.amount,
                                transaction.currency,
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <TransactionStatusBadge
                                status={
                                  transaction.status
                                }
                              />
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                              {titleCase(
                                transaction.gateway_status,
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-700">
                                {transaction
                                  .provider
                                  .identifier ??
                                  "—"}
                              </div>

                              <div className="mt-0.5 max-w-[180px] truncate text-[10px] text-gray-500">
                                {transaction
                                  .provider
                                  .reference ??
                                  "No reference"}
                              </div>
                            </td>

                            <td className="px-4 py-3 text-[11px] text-gray-600">
                              {formatDate(
                                transaction.occurred_at ??
                                  transaction.created_at,
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h2 className="text-sm font-bold text-gray-900">
                    Refund History
                  </h2>

                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Refund records linked to
                    this payment. Refund
                    operations remain disabled
                    on this read-only
                    surface.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-2.5">
                          Refund
                        </th>
                        <th className="px-4 py-2.5">
                          Amount
                        </th>
                        <th className="px-4 py-2.5">
                          Status
                        </th>
                        <th className="px-4 py-2.5">
                          Reason
                        </th>
                        <th className="px-4 py-2.5">
                          Provider
                        </th>
                        <th className="px-4 py-2.5">
                          Processed
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                      {payment.refunds.length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-xs text-gray-500"
                          >
                            No refunds are
                            associated with this
                            payment.
                          </td>
                        </tr>
                      )}

                      {payment.refunds.map(
                        (refund) => (
                          <tr key={refund.id}>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">
                                {refund.refund_number ??
                                  "—"}
                              </div>
                            </td>

                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {formatMoney(
                                refund.amount,
                                refund.currency,
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <TransactionStatusBadge
                                status={
                                  refund.status
                                }
                              />
                            </td>

                            <td className="max-w-[260px] px-4 py-3 text-gray-600">
                              {refund.reason ??
                                "—"}
                            </td>

                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-700">
                                {refund.provider
                                  .identifier ??
                                  "—"}
                              </div>

                              <div className="mt-0.5 max-w-[180px] truncate text-[10px] text-gray-500">
                                {refund.provider
                                  .refund_reference ??
                                  "No reference"}
                              </div>
                            </td>

                            <td className="px-4 py-3 text-[11px] text-gray-600">
                              {formatDate(
                                refund.processed_at ??
                                  refund.created_at,
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </PermissionGuard>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </div>

      <div className="mt-1 break-words text-xs font-semibold text-gray-800">
        {value}
      </div>
    </div>
  );
}
