"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { jsPDF } from "jspdf";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Printer,
  RefreshCw,
  Scale,
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
  type FinanceSettlementDetail,
  type FinanceSettlementCapabilities,
  type FinanceSettlementLine,
} from "@/lib/api/finance";

function formatMoney(
  amount: string | null,
  currency: string | null,
): string {
  if (amount === null) {
    return "—";
  }

  const numeric = Number(amount);

  if (!Number.isFinite(numeric)) {
    return `${currency ?? ""} ${amount}`.trim();
  }

  if (!currency) {
    return numeric.toLocaleString();
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `${currency} ${numeric.toLocaleString()}`;
  }
}

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

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

function SettlementStatusBadge({
  status,
}: {
  status: string | null;
}) {
  const normalized = String(
    status ?? "",
  ).toLowerCase();

  if (normalized === "finalized") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
        <CheckCircle2 size={11} />
        Finalized
      </span>
    );
  }

  if (normalized === "imported") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
        <WalletCards size={11} />
        Imported
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-700">
      {titleCase(status)}
    </span>
  );
}

function ReconciliationBadge({
  status,
}: {
  status: string | null;
}) {
  const normalized = String(
    status ?? "",
  ).toLowerCase();

  if (normalized === "matched") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
        <CheckCircle2 size={11} />
        Matched
      </span>
    );
  }

  if (normalized === "processing") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
        <Scale size={11} />
        Processing
      </span>
    );
  }

  if (
    normalized === "discrepancy" ||
    normalized === "amount_mismatch" ||
    normalized === "currency_mismatch" ||
    normalized ===
      "provider_reference_mismatch" ||
    normalized ===
      "missing_internal_record" ||
    normalized === "tenant_conflict"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
        <AlertTriangle size={11} />
        {titleCase(status)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-700">
      {titleCase(status)}
    </span>
  );
}

export default function FinanceSettlementDetailPage() {
  const params = useParams();

  const rawId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const settlementId = String(
    rawId ?? "",
  );

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

  const [record, setRecord] =
    useState<FinanceSettlementDetail | null>(
      null,
    );

  const [loading, setLoading] =
    useState(canView);

  const [error, setError] =
    useState<string | null>(null);
  const [capabilities, setCapabilities] =
    useState<FinanceSettlementCapabilities | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  const fetchSettlement =
    useCallback(async () => {
      if (!canView || !settlementId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await financeApi.getSettlement(
            settlementId,
          );

        setRecord(response.data);
        setCapabilities(response.capabilities);
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to load settlement detail:",
          requestError,
        );

        setRecord(null);
        setCapabilities(null);

        setError(
          requestError.message ||
            "Failed to load settlement detail.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      canView,
      settlementId,
    ]);

  useEffect(() => {
    void fetchSettlement();
  }, [fetchSettlement]);

  const finalizeSettlement = async () => {
    if (!record || !capabilities?.finalize) return;
    setFinalizing(true);
    setError(null);
    try {
      await financeApi.finalizeSettlement(record.id);
      await fetchSettlement();
    } catch (reason) {
      setError((reason as Error).message || "Settlement finalization failed.");
    } finally {
      setFinalizing(false);
    }
  };

  const printSettlement = () => {
    window.print();
  };

  const downloadSettlementPdf = () => {
    if (!record) {
      return;
    }

    const pdf = new jsPDF();
    let y = 22;

    const addLine = (
      label: string,
      value: string,
    ) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFont("helvetica", "bold");
      pdf.text(`${label}:`, 20, y);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(value, 125);
      pdf.text(lines, 65, y);
      y += Math.max(8, lines.length * 5);
    };

    pdf.setFontSize(18);
    pdf.text("Settlement Detail", 20, y);
    y += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(90, 90, 90);
    pdf.text(record.provider_settlement_reference ?? "Settlement", 20, y);
    y += 6;
    pdf.text(record.uuid, 20, y);
    y += 12;
    pdf.setTextColor(20, 20, 20);
    pdf.setFontSize(11);

    [
      ["Provider", record.provider_identifier ?? "—"],
      ["Period", `${formatDate(record.period_start)} - ${formatDate(record.period_end)}`],
      ["Currency", record.currency ?? "—"],
      ["Status", titleCase(record.status)],
      ["Reconciliation", titleCase(record.reconciliation_status)],
      ["Gross", formatMoney(record.gross_amount, record.currency)],
      ["Fees", formatMoney(record.fee_amount, record.currency)],
      ["Refunds", formatMoney(record.refund_amount, record.currency)],
      ["Net", formatMoney(record.net_amount, record.currency)],
    ].forEach(([label, value]) => addLine(label, value));

    y += 5;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Reconciliation Lines", 20, y);
    y += 9;
    pdf.setFontSize(9);

    record.lines.forEach((line) => {
      const evidence =
        line.transaction?.transaction_reference ??
        line.refund?.refund_number ??
        line.order?.order_number ??
        "No internal reference";

      addLine(
        line.provider_line_reference ?? `Line #${line.id}`,
        `${evidence}; Supplier: ${line.supplier?.company_name ?? "—"}; Expected: ${formatMoney(line.expected_amount, line.currency)}; Reported: ${formatMoney(line.reported_amount, line.currency)}; Difference: ${formatMoney(line.reconciliation_difference, line.currency)}; Status: ${titleCase(line.reconciliation_status)}`,
      );
    });

    pdf.save(`settlement-${record.provider_settlement_reference ?? record.id}.pdf`);
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

  const matchedLines = useMemo(
    () =>
      record?.lines.filter(
        (line) =>
          line.reconciliation_status ===
          "matched",
      ).length ?? 0,
    [record],
  );

  const discrepancyLines = useMemo(
    () =>
      record?.lines.filter(
        (line) =>
          line.reconciliation_status !==
          "matched",
      ).length ?? 0,
    [record],
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
              view settlement detail for the
              current tenant.
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
                href="/admin/finance/settlements-payouts"
                className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft size={14} />
                Back to Settlements
              </Link>

              <div className="mb-1 text-[11px] font-medium text-gray-500">
                Finance / Settlements / Detail
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold leading-tight text-gray-900">
                  {record?.provider_settlement_reference ??
                    "Settlement Detail"}
                </h1>

                {record && (
                  <>
                    <SettlementStatusBadge
                      status={record.status}
                    />

                    <ReconciliationBadge
                      status={
                        record.reconciliation_status
                      }
                    />
                  </>
                )}
              </div>

              <p className="mt-1 max-w-4xl text-xs text-gray-500">
                Review the authoritative
                settlement batch and its
                reconciliation evidence.
                Settlement payout scheduling,
                approval and release are not
                exposed by this Admin screen.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={printSettlement}
                disabled={!record}
                title="Print settlement detail"
                className="flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-60"
              >
                <Printer size={13} />
                Print
              </button>

              <button
                type="button"
                onClick={downloadSettlementPdf}
                disabled={!record}
                title="Download settlement detail PDF"
                className="flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-60"
              >
                <Download size={13} />
                PDF
              </button>

              <button
                type="button"
                onClick={() =>
                  void fetchSettlement()
                }
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

          {error && (
            <div
              className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
              role="alert"
            >
              <div className="font-bold">
                Settlement unavailable
              </div>

              <div className="mt-1 text-xs">
                {error}
              </div>
            </div>
          )}

          {loading && !record && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              Loading settlement detail...
            </div>
          )}

          {!loading &&
            !error &&
            !record && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white p-10 text-center">
                <FileText
                  size={30}
                  className="mx-auto mb-2 text-gray-300"
                />

                <div className="font-semibold text-gray-700">
                  Settlement not found
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  This settlement does not exist
                  in the current tenant context.
                </div>
              </div>
            )}

          {record && (
            <>
              <div className="mt-4">
                <DashboardGrid>
                  <KpiCard
                    title="Gross Amount"
                    value={formatMoney(
                      record.gross_amount,
                      record.currency,
                    )}
                    icon={WalletCards}
                  />

                  <KpiCard
                    title="Net Amount"
                    value={formatMoney(
                      record.net_amount,
                      record.currency,
                    )}
                    icon={WalletCards}
                  />

                  <KpiCard
                    title="Matched Lines"
                    value={String(matchedLines)}
                    icon={CheckCircle2}
                  />

                  <KpiCard
                    title="Discrepancies"
                    value={String(
                      discrepancyLines,
                    )}
                    icon={AlertTriangle}
                  />
                </DashboardGrid>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm xl:col-span-2">
                  <div className="mb-4">
                    <h2 className="text-sm font-bold text-gray-900">
                      Settlement Identity
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailItem
                      label="Reference"
                      value={
                        record.provider_settlement_reference ??
                        "—"
                      }
                    />

                    <DetailItem
                      label="Provider"
                      value={
                        record.provider_identifier ??
                        "—"
                      }
                    />

                    <DetailItem
                      label="UUID"
                      value={record.uuid}
                    />

                    <DetailItem
                      label="Period Start"
                      value={formatDate(
                        record.period_start,
                      )}
                    />

                    <DetailItem
                      label="Period End"
                      value={formatDate(
                        record.period_end,
                      )}
                    />

                    <DetailItem
                      label="Currency"
                      value={
                        record.currency ??
                        "—"
                      }
                    />

                    <DetailItem
                      label="Status"
                      value={
                        <SettlementStatusBadge
                          status={record.status}
                        />
                      }
                    />

                    <DetailItem
                      label="Reconciliation"
                      value={
                        <ReconciliationBadge
                          status={
                            record.reconciliation_status
                          }
                        />
                      }
                    />

                    <DetailItem
                      label="Finalized At"
                      value={formatDateTime(
                        record.finalized_at,
                      )}
                    />
                  </div>
                </section>

                <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-sm font-bold text-gray-900">
                      Financial Totals
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <DetailItem
                      label="Gross"
                      value={formatMoney(
                        record.gross_amount,
                        record.currency,
                      )}
                    />

                    <DetailItem
                      label="Fees"
                      value={formatMoney(
                        record.fee_amount,
                        record.currency,
                      )}
                    />

                    <DetailItem
                      label="Refunds"
                      value={formatMoney(
                        record.refund_amount,
                        record.currency,
                      )}
                    />

                    <DetailItem
                      label="Net"
                      value={formatMoney(
                        record.net_amount,
                        record.currency,
                      )}
                    />
                  </div>
                </section>
              </div>

              <section className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-4">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">
                        Reconciliation Lines
                      </h2>

                      <p className="mt-0.5 text-[11px] text-gray-500">
                        Each row represents
                        provider settlement
                        evidence reconciled
                        against an internal
                        transaction or refund.
                      </p>
                    </div>

                    <div className="flex gap-2 text-[10px] font-semibold">
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-gray-600">
                        {record.line_count} Lines
                      </span>

                      <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700">
                        {
                          record.discrepancy_count
                        }{" "}
                        Issues
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <TableHead>
                          Line
                        </TableHead>
                        <TableHead>
                          Supplier
                        </TableHead>
                        <TableHead>
                          Internal Evidence
                        </TableHead>
                        <TableHead align="right">
                          Expected
                        </TableHead>
                        <TableHead align="right">
                          Reported
                        </TableHead>
                        <TableHead align="right">
                          Difference
                        </TableHead>
                        <TableHead>
                          Reconciliation
                        </TableHead>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                      {record.lines.length ===
                        0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-10 text-center text-sm text-gray-500"
                          >
                            No settlement lines
                            are attached to this
                            settlement.
                          </td>
                        </tr>
                      )}

                      {record.lines.map(
                        (line) => (
                          <SettlementLineRow
                            key={line.id}
                            line={line}
                          />
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                {record.lines.map(
                  (line) => (
                    <SettlementEvidenceCard
                      key={line.id}
                      line={line}
                    />
                  ),
                )}
              </div>

              <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900">Immutable audit evidence</h2>
                {record.audits.length === 0 ? (
                  <p className="mt-2 text-xs text-gray-500">No settlement audit evidence is available.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {record.audits.map((audit) => (
                      <div key={audit.id} className="rounded-md border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600">
                        <span className="font-semibold text-gray-900">{titleCase(audit.action)}</span>
                        {" · Actor "}{audit.actor_id ?? "system/unavailable"}{" · "}{formatDateTime(audit.occurred_at)}
                        {(audit.previous_status || audit.new_status) && <span>{" · "}{titleCase(audit.previous_status)}{" → "}{titleCase(audit.new_status)}</span>}
                        {audit.classification && <span>{" · "}{titleCase(audit.classification)}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <Scale
                    size={18}
                    className="mt-0.5 text-gray-400"
                  />

                  <div className="flex-1">
                    <h2 className="text-sm font-bold text-gray-900">
                      Settlement Controls
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Finalization is available only for fully matched evidence with no discrepancies and does not execute a payout or transfer money. Unresolved evidence must remain reconciliation-required.
                    </p>
                    {capabilities?.finalize && (
                      <button
                        type="button"
                        onClick={() => void finalizeSettlement()}
                        disabled={finalizing}
                        className="mt-3 rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {finalizing ? "Finalizing..." : "Finalize reconciled settlement"}
                      </button>
                    )}
                    {!capabilities?.finalize && record.status !== "finalized" && (
                      <p className="mt-2 text-xs font-medium text-amber-700">
                        Finalization is unavailable until all reconciliation evidence is matched and your role permits the action.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </PermissionGuard>
  );
}

function SettlementLineRow({
  line,
}: {
  line: FinanceSettlementLine;
}) {
  const evidence =
    line.transaction?.transaction_reference ??
    line.refund?.refund_number ??
    line.order?.order_number ??
    "No internal reference";

  return (
    <tr className="hover:bg-gray-50">
      <TableCell>
        <div className="font-semibold text-gray-900">
          {line.provider_line_reference ??
            `Line #${line.id}`}
        </div>

        <div className="mt-0.5 text-[10px] text-gray-400">
          {line.uuid}
        </div>
      </TableCell>

      <TableCell>
        <div className="font-semibold">
          {line.supplier?.company_name ??
            "—"}
        </div>

        <div className="mt-0.5 text-[10px] text-gray-400">
          {line.supplier?.email ??
            ""}
        </div>
      </TableCell>

      <TableCell>
        <div className="font-semibold">
          {evidence}
        </div>

        <div className="mt-0.5 text-[10px] text-gray-400">
          {line.transaction
            ? "Payment transaction"
            : line.refund
              ? "Payment refund"
              : line.order
                ? "Order"
                : "No linked evidence"}
        </div>
      </TableCell>

      <TableCell align="right">
        {formatMoney(
          line.expected_amount,
          line.currency,
        )}
      </TableCell>

      <TableCell align="right">
        {formatMoney(
          line.reported_amount,
          line.currency,
        )}
      </TableCell>

      <TableCell align="right">
        <span
          className={
            Number(
              line.reconciliation_difference,
            ) !== 0
              ? "font-bold text-rose-700"
              : "font-semibold text-gray-700"
          }
        >
          {formatMoney(
            line.reconciliation_difference,
            line.currency,
          )}
        </span>
      </TableCell>

      <TableCell>
        <ReconciliationBadge
          status={
            line.reconciliation_status
          }
        />
      </TableCell>
    </tr>
  );
}

function SettlementEvidenceCard({
  line,
}: {
  line: FinanceSettlementLine;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-gray-900">
            {line.provider_line_reference ??
              `Settlement Line #${line.id}`}
          </h2>

          <p className="mt-0.5 text-[11px] text-gray-500">
            Internal reconciliation evidence
          </p>
        </div>

        <ReconciliationBadge
          status={
            line.reconciliation_status
          }
        />
      </div>

      {line.reconciliation_reason && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <div className="font-bold">
            Reconciliation reason
          </div>

          <div className="mt-1">
            {
              line.reconciliation_reason
            }
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailItem
          label="Supplier"
          value={
            line.supplier?.company_name ??
            "—"
          }
        />

        <DetailItem
          label="Supplier Status"
          value={titleCase(
            line.supplier?.status,
          )}
        />

        <DetailItem
          label="Gross"
          value={formatMoney(
            line.gross_amount,
            line.currency,
          )}
        />

        <DetailItem
          label="Fee"
          value={formatMoney(
            line.fee_amount,
            line.currency,
          )}
        />

        <DetailItem
          label="Net"
          value={formatMoney(
            line.net_amount,
            line.currency,
          )}
        />

        <DetailItem
          label="Created"
          value={formatDateTime(
            line.created_at,
          )}
        />
      </div>

      {line.transaction && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Linked Transaction
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem
              label="Reference"
              value={
                line.transaction
                  .transaction_reference ??
                "—"
              }
            />

            <DetailItem
              label="Type"
              value={titleCase(
                line.transaction
                  .transaction_type,
              )}
            />

            <DetailItem
              label="Amount"
              value={formatMoney(
                line.transaction.amount,
                line.transaction.currency,
              )}
            />

            <DetailItem
              label="Status"
              value={titleCase(
                line.transaction.status,
              )}
            />

            <DetailItem
              label="Gateway Status"
              value={titleCase(
                line.transaction
                  .gateway_status,
              )}
            />

            <DetailItem
              label="Provider"
              value={
                line.transaction
                  .provider_identifier ??
                "—"
              }
            />

            <DetailItem
              label="Provider Reference"
              value={
                line.transaction
                  .provider_reference ??
                "—"
              }
            />

            <DetailItem
              label="Occurred"
              value={formatDateTime(
                line.transaction
                  .occurred_at,
              )}
            />
          </div>
        </div>
      )}

      {line.refund && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Linked Refund
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem
              label="Refund Number"
              value={
                line.refund
                  .refund_number ??
                "—"
              }
            />

            <DetailItem
              label="Amount"
              value={formatMoney(
                line.refund.amount,
                line.refund.currency,
              )}
            />

            <DetailItem
              label="Status"
              value={titleCase(
                line.refund.status,
              )}
            />

            <DetailItem
              label="Reason"
              value={
                line.refund.reason ??
                "—"
              }
            />

            <DetailItem
              label="Provider"
              value={
                line.refund
                  .provider_identifier ??
                "—"
              }
            />

            <DetailItem
              label="Provider Refund Reference"
              value={
                line.refund
                  .provider_refund_reference ??
                "—"
              }
            />

            <DetailItem
              label="Processed"
              value={formatDateTime(
                line.refund
                  .processed_at,
              )}
            />
          </div>
        </div>
      )}

      {line.order && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Linked Order
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem
              label="Order Number"
              value={
                line.order.order_number
              }
            />

            <DetailItem
              label="Order Total"
              value={formatMoney(
                line.order.total_amount,
                line.order.currency,
              )}
            />

            <DetailItem
              label="Order Status"
              value={titleCase(
                line.order.status,
              )}
            />

            <DetailItem
              label="Payment Status"
              value={titleCase(
                line.order
                  .payment_status,
              )}
            />

            <DetailItem
              label="Customer"
              value={
                line.order.customer
                  ?.name ??
                "—"
              }
            />

            <DetailItem
              label="Customer Email"
              value={
                line.order.customer
                  ?.email ??
                "—"
              }
            />
          </div>
        </div>
      )}
    </section>
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

function TableHead({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`whitespace-nowrap px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-gray-500 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`whitespace-nowrap px-4 py-3 text-xs text-gray-700 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </td>
  );
}
