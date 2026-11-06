"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import toast, {
  Toaster,
} from "react-hot-toast";
import { jsPDF } from "jspdf";
import {
  ArrowLeft,
  ArrowUpRight,
  Ban,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Plus,
  ReceiptText,
  Search,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  financeApi,
  type FinanceInvoiceDetail,
  type FinanceInvoicePaymentStatus,
  type FinanceInvoiceRow,
  type FinanceInvoiceStatus,
  type FinanceInvoicesResponse,
  type FinanceInvoiceFinancialNote,
  type FinanceInvoiceFinancialNoteType,
} from "@/lib/api/finance";

type ActiveFilter =
  | "all"
  | "draft"
  | "issued"
  | "cancelled"
  | "unpaid"
  | "partially_paid"
  | "paid";

const statusLabels: Record<
  FinanceInvoiceStatus,
  string
> = {
  draft: "Draft",
  issued: "Issued",
  cancelled: "Cancelled",
};

const paymentStatusLabels: Record<
  FinanceInvoicePaymentStatus,
  string
> = {
  unpaid: "Unpaid",
  partially_paid: "Partially Paid",
  paid: "Paid",
};

function money(
  currency: string | null | undefined,
  amount: string | number | null | undefined,
): string {
  const value = Number(amount ?? 0);

  return `${currency ?? "—"} ${value.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString();
}

function documentStatusClass(
  status: FinanceInvoiceStatus,
): string {
  switch (status) {
    case "issued":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function paymentStatusClass(
  status: FinanceInvoicePaymentStatus,
): string {
  switch (status) {
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "partially_paid":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-red-200 bg-red-50 text-red-700";
  }
}

export default function InvoicesNotesPage() {
  const [data, setData] =
    useState<FinanceInvoicesResponse | null>(
      null,
    );

  const [selected, setSelected] =
    useState<FinanceInvoiceDetail | null>(
      null,
    );

  const [search, setSearch] =
    useState("");

  const [currency, setCurrency] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState<ActiveFilter>("all");

  const [page, setPage] = useState(1);
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedCurrency, setAppliedCurrency] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [showCancel, setShowCancel] =
    useState(false);

  const [cancelReason, setCancelReason] =
    useState("");

  const [showGenerate, setShowGenerate] =
    useState(false);

  const [orderId, setOrderId] =
    useState("");

  const [showFinancialNote, setShowFinancialNote] =
  useState(false);

  const [financialNoteType, setFinancialNoteType] =
    useState<FinanceInvoiceFinancialNoteType>(
      "credit",
    );

  const [financialNoteAmount, setFinancialNoteAmount] =
    useState("");

  const [financialNoteReason, setFinancialNoteReason] =
    useState("");

  const [financialNoteActionId, setFinancialNoteActionId] =
    useState<number | null>(null);

  const [financialNoteCancelId, setFinancialNoteCancelId] =
    useState<number | null>(null);

  const [financialNoteCancelReason, setFinancialNoteCancelReason] =
    useState("");

  const filters = useMemo(() => {
    let status:
      | FinanceInvoiceStatus
      | undefined;

    let paymentStatus:
      | FinanceInvoicePaymentStatus
      | undefined;

    if (
      activeFilter === "draft" ||
      activeFilter === "issued" ||
      activeFilter === "cancelled"
    ) {
      status = activeFilter;
    }

    if (
      activeFilter === "unpaid" ||
      activeFilter ===
        "partially_paid" ||
      activeFilter === "paid"
    ) {
      paymentStatus =
        activeFilter;
    }

    return {
      status,
      paymentStatus,
    };
  }, [activeFilter]);

  const applySearch = () => {
    const nextSearch = search.trim();
    const nextCurrency = currency.trim().toUpperCase();
    if (page === 1 && appliedSearch === nextSearch && appliedCurrency === nextCurrency) {
      void loadList();
      return;
    }
    setPage(1);
    setAppliedSearch(nextSearch);
    setAppliedCurrency(nextCurrency);
  };

  const loadList = async () => {
    try {
      setLoading(true);

      const response =
        await financeApi.getInvoices({
          search:
            appliedSearch ||
            undefined,

          status:
            filters.status,

          payment_status:
            filters.paymentStatus,

          currency:
            appliedCurrency || undefined,

          page,
          per_page: 50,
        });

      setData(response);

      if (
        selected &&
        !response.data.some(
          (row) =>
            row.id === selected.id,
        )
      ) {
        setSelected(null);
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to load invoices.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, page, appliedSearch, appliedCurrency]);

  const loadDetail = async (
    row: FinanceInvoiceRow,
  ) => {
    try {
      setDetailLoading(true);

      const response =
        await financeApi.getInvoice(
          row.id,
        );

      setSelected(
        response.data,
      );

      setShowCancel(false);
      setCancelReason("");
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to load invoice details.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshSelected = async (
    id: number,
  ) => {
    const response =
      await financeApi.getInvoice(
        id,
      );

    setSelected(
      response.data,
    );

    await loadList();
  };

  const issueInvoice = async () => {
    if (!selected) {
      return;
    }

    try {
      setActionLoading(true);

      await financeApi.issueInvoice(
        selected.id,
        {
          reason:
            "Issued from Finance Invoice administration.",
        },
      );

      toast.success(
        "Invoice issued.",
      );

      await refreshSelected(
        selected.id,
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to issue invoice.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const cancelInvoice = async () => {
    if (!selected) {
      return;
    }

    if (
      cancelReason.trim() === ""
    ) {
      toast.error(
        "Cancellation reason is required.",
      );

      return;
    }

    try {
      setActionLoading(true);

      await financeApi.cancelInvoice(
        selected.id,
        cancelReason.trim(),
      );

      toast.success(
        "Invoice cancelled.",
      );

      setShowCancel(false);
      setCancelReason("");

      await refreshSelected(
        selected.id,
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to cancel invoice.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const generateInvoice = async () => {
    const orderReference = orderId.trim();

    if (!orderReference) {
      toast.error(
        "Enter a valid order ID or order number.",
      );

      return;
    }

    try {
      setActionLoading(true);

      const response =
        await financeApi.createInvoiceFromOrder(
          orderReference,
        );

      toast.success(
        "Invoice generated from order.",
      );

      setSelected(
        response.data,
      );

      setShowGenerate(false);
      setOrderId("");

      await loadList();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to generate invoice from this order.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openFinancialNoteModal = (
  type: FinanceInvoiceFinancialNoteType,
  ) => {
    setFinancialNoteType(type);
    setFinancialNoteAmount("");
    setFinancialNoteReason("");
    setShowFinancialNote(true);
  };

  const createFinancialNote = async () => {
    if (!selected) {
      return;
    }

    const amount =
      financialNoteAmount.trim();

    const reason =
      financialNoteReason.trim();

    if (
      !/^\d+(?:\.\d{1,2})?$/.test(
        amount,
      ) ||
      Number(amount) <= 0
    ) {
      toast.error(
        "Enter a valid amount greater than zero.",
      );

      return;
    }

    if (reason === "") {
      toast.error(
        "Reason is required.",
      );

      return;
    }

    try {
      setActionLoading(true);

      if (
        financialNoteType === "credit"
      ) {
        await financeApi.createInvoiceCreditNote(
          selected.id,
          {
            amount,
            reason,
          },
        );

        toast.success(
          "Credit note created.",
        );
      } else {
        await financeApi.createInvoiceDebitNote(
          selected.id,
          {
            amount,
            reason,
          },
        );

        toast.success(
          "Debit note created.",
        );
      }

      setShowFinancialNote(false);
      setFinancialNoteAmount("");
      setFinancialNoteReason("");

      await refreshSelected(
        selected.id,
      );
    } catch (error) {
      console.error(error);

      toast.error(
        financialNoteType === "credit"
          ? "Unable to create credit note."
          : "Unable to create debit note.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const issueFinancialNote = async (
    note: FinanceInvoiceFinancialNote,
  ) => {
    if (!selected) {
      return;
    }

    try {
      setFinancialNoteActionId(
        note.id,
      );

      await financeApi.issueInvoiceFinancialNote(
        note.id,
        {
          reason:
            "Issued from Finance Invoice administration.",
        },
      );

      toast.success(
        `${note.type === "credit" ? "Credit" : "Debit"} note issued.`,
      );

      await refreshSelected(
        selected.id,
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to issue financial note.",
      );
    } finally {
      setFinancialNoteActionId(
        null,
      );
    }
  };

  const cancelFinancialNote = async (
    noteId: number,
  ) => {
    if (!selected) {
      return;
    }

    const reason =
      financialNoteCancelReason.trim();

    if (reason === "") {
      toast.error(
        "Cancellation reason is required.",
      );

      return;
    }

    try {
      setFinancialNoteActionId(
        noteId,
      );

      await financeApi.cancelInvoiceFinancialNote(
        noteId,
        reason,
      );

      toast.success(
        "Financial note cancelled.",
      );

      setFinancialNoteCancelId(
        null,
      );

      setFinancialNoteCancelReason(
        "",
      );

      await refreshSelected(
        selected.id,
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to cancel financial note.",
      );
    } finally {
      setFinancialNoteActionId(
        null,
      );
    }
  };

  const downloadInvoicePdf = (
    event: React.MouseEvent<HTMLButtonElement>,
    row: FinanceInvoiceRow,
  ) => {
    event.stopPropagation();

    const pdf = new jsPDF();
    const details = [
      ["Invoice", row.invoice_number],
      ["UUID", row.uuid],
      ["Order", row.order?.order_number ?? "—"],
      ["Supplier", row.supplier?.name ?? "—"],
      ["Invoice date", formatDate(row.invoice_date)],
      ["Due date", formatDate(row.due_date)],
      ["Document status", statusLabels[row.status]],
      ["Payment status", paymentStatusLabels[row.payment_status]],
      ["Subtotal", money(row.currency, row.subtotal)],
      ["Tax", money(row.currency, row.tax_amount)],
      ["Shipping", money(row.currency, row.shipping_amount)],
      ["Discount", money(row.currency, row.discount_amount)],
      ["Total", money(row.currency, row.total_amount)],
      ["Paid", money(row.currency, row.amount_paid)],
      ["Outstanding", money(row.currency, row.balance_due)],
    ];
    let y = 24;

    pdf.setFontSize(18);
    pdf.text("Invoice", 20, y);
    y += 9;
    pdf.setFontSize(10);
    pdf.setTextColor(90, 90, 90);
    pdf.text(row.invoice_number, 20, y);
    y += 12;
    pdf.setTextColor(20, 20, 20);
    pdf.setFontSize(11);

    details.forEach(([label, value]) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFont("helvetica", "bold");
      pdf.text(`${label}:`, 20, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(String(value), 65, y);
      y += 8;
    });

    pdf.setFontSize(9);
    pdf.setTextColor(110, 110, 110);
    pdf.text(
      "Generated from the tenant-scoped Finance Invoices & Notes records.",
      20,
      Math.min(y + 8, 285),
    );
    pdf.save(`invoice-${row.invoice_number}.pdf`);
    toast.success("Invoice PDF downloaded.");
  };

  const currencies =
    data?.summary
      .amounts_by_currency ?? [];

  const headlineAmounts =
    currencies.length === 0
      ? "No invoice amounts"
      : currencies
          .map(
            (item) =>
              `${money(
                item.currency,
                item.amount_paid,
              )} paid / ${money(
                item.currency,
                item.total_amount,
              )}`,
          )
          .join(" • ");

  const summaryCards = [
    {
      title: "Total Invoices",
      value:
        data?.summary.total ?? 0,
      icon: FileText,
    },
    {
      title: "Draft",
      value:
        data?.summary.draft ?? 0,
      icon: Clock3,
    },
    {
      title: "Issued",
      value:
        data?.summary.issued ?? 0,
      icon: ReceiptText,
    },
    {
      title: "Unpaid",
      value:
        data?.summary.unpaid ?? 0,
      icon: WalletCards,
    },
    {
      title: "Partially Paid",
      value:
        data?.summary
          .partially_paid ?? 0,
      icon: Clock3,
    },
    {
      title: "Paid",
      value:
        data?.summary.paid ?? 0,
      icon: CheckCircle2,
    },
  ];

  const filterTabs: {
    key: ActiveFilter;
    label: string;
  }[] = [
    {
      key: "all",
      label: "All Invoices",
    },
    {
      key: "draft",
      label: "Draft",
    },
    {
      key: "issued",
      label: "Issued",
    },
    {
      key: "cancelled",
      label: "Cancelled",
    },
    {
      key: "unpaid",
      label: "Unpaid",
    },
    {
      key: "partially_paid",
      label: "Partially Paid",
    },
    {
      key: "paid",
      label: "Paid",
    },
  ];

  const invoiceTrends = useMemo(() => {
    const rows = data?.data ?? [];
    if (rows.length === 0) {
      return [];
    }
    const buckets: Record<string, { name: string; total: number; paid: number; outstanding: number }> = {};
    rows.slice(0, 8).forEach((inv, idx) => {
      const key = inv.invoice_number ? `#${inv.invoice_number.slice(-5)}` : `Inv ${idx + 1}`;
      const total = Number(inv.total_amount) || 0;
      const paid = Number(inv.amount_paid) || 0;
      buckets[key] = {
        name: key,
        total,
        paid,
        outstanding: Math.max(0, total - paid),
      };
    });
    return Object.values(buckets);
  }, [data]);

  const paymentStatusBreakdown = useMemo(() => {
    const summary = data?.summary;
    if (!summary) return [];
    const list = [
      { name: "Paid", value: summary.paid || 0, color: "#10b981" },
      { name: "Partially Paid", value: summary.partially_paid || 0, color: "#f59e0b" },
      { name: "Unpaid", value: summary.unpaid || 0, color: "#64748b" },
      { name: "Draft", value: summary.draft || 0, color: "#94a3b8" },
      { name: "Issued", value: summary.issued || 0, color: "#3b82f6" },
    ].filter((i) => i.value > 0);
    if (list.length === 0) {
      return [];
    }
    return list;
  }, [data]);

  return (
    <>
      <Toaster />

      <div className="min-h-screen bg-[#f8f9fb]">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-[1720px] px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link
                  href="/admin/finance"
                  className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Finance
                </Link>

                <h1 className="text-2xl font-semibold text-gray-950">
                  Invoices & Notes
                </h1>

                <p className="mt-1 max-w-3xl text-sm text-gray-500">
                  Tenant-scoped invoice
                  evidence, payment
                  synchronization and
                  controlled document
                  lifecycle.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {data?.capabilities
                  .create_from_order && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowGenerate(
                        !showGenerate,
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
                  >
                    <Plus className="h-4 w-4" />
                    Generate Invoice
                  </button>
                )}

                <div className="rounded-xl border bg-gray-50 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Invoice Value
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {headlineAmounts}
                  </p>
                </div>
              </div>
            </div>

            {showGenerate && (
              <div className="mt-4 max-w-xl rounded-xl border bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  Generate Invoice from Order
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Enter the numeric order ID or order number.
                  Tenant, supplier,
                  currency and totals are
                  resolved by the backend.
                </p>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={orderId}
                    onChange={(event) =>
                      setOrderId(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Order ID"
                    className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-sm"
                  />

                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      void generateInvoice()
                    }
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Generate
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowGenerate(
                        false,
                      );
                      setOrderId("");
                    }}
                    className="rounded-lg border bg-white px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <main className="mx-auto flex max-w-[1720px] flex-col gap-5 p-6">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {summaryCards.map(
              ({
                title,
                value,
                icon: Icon,
              }) => (
                <div
                  key={title}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {title}
                    </p>

                    <Icon className="h-4 w-4 text-gray-400" />
                  </div>

                  <p className="mt-3 text-2xl font-semibold text-gray-950">
                    {value}
                  </p>
                </div>
              ),
            )}
          </section>

          {/* Visual Recharts Analytics Section */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-950">Invoice Volume &amp; Collections Aging</h3>
                  <p className="text-xs text-gray-500">Total billed value vs collected payments</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 font-medium text-[#7a0023]"><span className="h-2.5 w-2.5 rounded-sm bg-[#7a0023]"></span>Total Billed</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[#10b981]"><span className="h-2.5 w-2.5 rounded-sm bg-[#10b981]"></span>Amount Paid</span>
                </div>
              </div>
              <div className="h-56 w-full">
                {invoiceTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={invoiceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7a0023" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#7a0023" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="total" stroke="#7a0023" fillOpacity={1} fill="url(#colorTotal)" />
                      <Area type="monotone" dataKey="paid" stroke="#10b981" fillOpacity={1} fill="url(#colorPaid)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">
                    No invoice trend evidence available for selected period
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-950">Settlement Status Breakdown</h3>
                <p className="text-xs text-gray-500">Distribution of active invoice statuses</p>
              </div>
              <div className="h-56 w-full">
                {paymentStatusBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {paymentStatusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-500">
                    No status distribution evidence available
                  </div>
                )}
              </div>
            </div>
          </div>

          {currencies.length > 0 && (
            <section className="rounded-xl border bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Currency Summary
              </h2>

              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {currencies.map(
                  (item) => (
                    <div
                      key={item.currency}
                      className="rounded-lg border bg-gray-50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {
                            item.currency
                          }
                        </span>

                        <span className="text-xs text-gray-500">
                          {
                            item.invoice_count
                          }{" "}
                          invoices
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-xs">
                        <SummaryLine
                          label="Invoice Value"
                          value={money(
                            item.currency,
                            item.total_amount,
                          )}
                        />

                        <SummaryLine
                          label="Paid"
                          value={money(
                            item.currency,
                            item.amount_paid,
                          )}
                        />

                        <SummaryLine
                          label="Outstanding"
                          value={money(
                            item.currency,
                            item.balance_due,
                          )}
                          strong
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

          <section className="rounded-xl border bg-white">
            <div className="border-b p-4">
              <div className="flex flex-wrap gap-2">
                {filterTabs.map(
                  (tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setPage(1);
                        setActiveFilter(tab.key);
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                        activeFilter ===
                        tab.key
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-b p-4">
              <div className="relative min-w-[260px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      applySearch();
                    }
                  }}
                  placeholder="Search invoice number, order, supplier or UUID"
                  className="w-full rounded-lg border px-9 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>

              <input
                value={currency}
                maxLength={3}
                onChange={(event) =>
                  setCurrency(
                    event.target.value
                      .toUpperCase(),
                  )
                }
                placeholder="Currency"
                className="w-28 rounded-lg border px-3 py-2 text-sm uppercase"
              />

              <button
                type="button"
                onClick={applySearch}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
              >
                Search
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">
                      Invoice
                    </th>
                    <th className="px-4 py-3">
                      Order
                    </th>
                    <th className="px-4 py-3">
                      Supplier
                    </th>
                    <th className="px-4 py-3">
                      Document
                    </th>
                    <th className="px-4 py-3">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-right">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right">
                      Paid
                    </th>
                    <th className="px-4 py-3 text-right">
                      Outstanding
                    </th>
                    <th className="px-4 py-3">
                      History
                    </th>
                    <th className="px-4 py-3 text-right">
                      Download
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-12 text-center text-gray-500"
                      >
                        Loading invoices…
                      </td>
                    </tr>
                  ) : (
                    data?.data.map(
                      (row) => (
                        <tr
                          key={row.id}
                          onClick={() =>
                            void loadDetail(
                              row,
                            )
                          }
                          className={`cursor-pointer border-t hover:bg-gray-50 ${
                            selected?.id ===
                            row.id
                              ? "bg-gray-50"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-950">
                              {
                                row.invoice_number
                              }
                            </p>

                            <p className="text-xs text-gray-400">
                              #
                              {row.id}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            {row.order
                              ?.order_number ??
                              "—"}
                          </td>

                          <td className="px-4 py-3">
                            {row.supplier
                              ?.name ??
                              "—"}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${documentStatusClass(
                                row.status,
                              )}`}
                            >
                              {
                                statusLabels[
                                  row.status
                                ]
                              }
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${paymentStatusClass(
                                row.payment_status,
                              )}`}
                            >
                              {
                                paymentStatusLabels[
                                  row
                                    .payment_status
                                ]
                              }
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            {money(
                              row.currency,
                              row.total_amount,
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {money(
                              row.currency,
                              row.amount_paid,
                            )}
                          </td>

                          <td className="px-4 py-3 text-right font-semibold text-gray-950">
                            {money(
                              row.currency,
                              row.balance_due,
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {row.history_count ??
                              0}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              title="Download invoice PDF"
                              aria-label={`Download PDF for invoice ${row.invoice_number}`}
                              onClick={(event) =>
                                downloadInvoicePdf(event, row)
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ),
                    )
                  )}

                  {!loading &&
                    (data?.data.length ??
                      0) === 0 && (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-4 py-12 text-center text-gray-500"
                        >
                          No invoices found.
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
            {data && data.last_page > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm">
                <span className="text-slate-500">Page {data.current_page} of {data.last_page} ({data.total} total items)</span>
                <div className="flex gap-2">
                  <button type="button" disabled={loading || data.current_page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40">Previous</button>
                  <button type="button" disabled={loading || data.current_page >= data.last_page} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
            <div className="space-y-5">
              <div className="rounded-xl border bg-white p-5">
                <h2 className="text-base font-semibold text-gray-950">
                  Invoice Evidence
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Invoice totals and payment
                  state are derived from
                  tenant-scoped order and
                  payment evidence.
                </p>

                {detailLoading ? (
                  <div className="mt-6 h-48 animate-pulse rounded-lg bg-gray-100" />
                ) : !selected ? (
                  <div className="mt-6 rounded-lg border border-dashed p-10 text-center text-sm text-gray-500">
                    Select an invoice to view
                    its financial evidence.
                  </div>
                ) : (
                  <div className="mt-5 space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <EvidenceCard
                        label="Invoice Total"
                        value={money(
                          selected.currency,
                          selected.total_amount,
                        )}
                      />

                      <EvidenceCard
                        label="Paid"
                        value={money(
                          selected.currency,
                          selected.amount_paid,
                        )}
                      />

                      <EvidenceCard
                        label="Outstanding"
                        value={money(
                          selected.currency,
                          selected.balance_due,
                        )}
                      />

                      <EvidenceCard
                        label="Payment Status"
                        value={
                          paymentStatusLabels[
                            selected
                              .payment_status
                          ]
                        }
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <DetailBlock
                        title="Document"
                        rows={[
                          [
                            "Invoice",
                            selected
                              .invoice_number,
                          ],
                          [
                            "Status",
                            statusLabels[
                              selected
                                .status
                            ],
                          ],
                          [
                            "Invoice Date",
                            formatDate(
                              selected
                                .invoice_date,
                            ),
                          ],
                          [
                            "Due Date",
                            formatDate(
                              selected
                                .due_date,
                            ),
                          ],
                        ]}
                      />

                      <DetailBlock
                        title="Order & Ownership"
                        rows={[
                          [
                            "Order",
                            selected.order
                              ?.order_number ??
                              "—",
                          ],
                          [
                            "Supplier",
                            selected
                              .supplier
                              ?.name ??
                              "—",
                          ],
                          [
                            "Buyer",
                            selected.buyer
                              ?.name ??
                              "—",
                          ],
                          [
                            "Currency",
                            selected
                              .currency,
                          ],
                        ]}
                      />

                      <DetailBlock
                        title="Invoice Calculation"
                        rows={[
                          [
                            "Subtotal",
                            money(
                              selected
                                .currency,
                              selected
                                .subtotal,
                            ),
                          ],
                          [
                            "Tax",
                            money(
                              selected
                                .currency,
                              selected
                                .tax_amount,
                            ),
                          ],
                          [
                            "Shipping",
                            money(
                              selected
                                .currency,
                              selected
                                .shipping_amount,
                            ),
                          ],
                          [
                            "Discount",
                            money(
                              selected
                                .currency,
                              selected
                                .discount_amount,
                            ),
                          ],
                        ]}
                      />

                      <DetailBlock
                        title="Lifecycle"
                        rows={[
                          [
                            "Created",
                            formatDate(
                              selected
                                .created_at,
                            ),
                          ],
                          [
                            "Issued / Sent",
                            formatDate(
                              selected
                                .sent_at,
                            ),
                          ],
                          [
                            "Paid",
                            formatDate(
                              selected
                                .paid_at,
                            ),
                          ],
                          [
                            "Updated",
                            formatDate(
                              selected
                                .updated_at,
                            ),
                          ],
                        ]}
                      />
                    </div>
                  </div>
                )}
              </div>

              {selected && (
                <>
                  <div className="rounded-xl border bg-white p-5">
                    <h2 className="text-base font-semibold text-gray-950">
                      Invoice Items
                    </h2>

                    {selected.items.length ===
                    0 ? (
                      <p className="mt-4 text-sm text-gray-500">
                        No invoice items.
                      </p>
                    ) : (
                      <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                              <th className="px-3 py-2">
                                Item
                              </th>
                              <th className="px-3 py-2">
                                SKU
                              </th>
                              <th className="px-3 py-2">
                                Qty
                              </th>
                              <th className="px-3 py-2 text-right">
                                Unit Price
                              </th>
                              <th className="px-3 py-2 text-right">
                                Total
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {selected.items.map(
                              (item) => (
                                <tr
                                  key={
                                    item.id
                                  }
                                  className="border-t"
                                >
                                  <td className="px-3 py-3">
                                    {item
                                      .order_item
                                      ?.product_name ??
                                      item.description ??
                                      "—"}
                                  </td>

                                  <td className="px-3 py-3">
                                    {item
                                      .order_item
                                      ?.sku ??
                                      "—"}
                                  </td>

                                  <td className="px-3 py-3">
                                    {
                                      item.quantity
                                    }{" "}
                                    {item.unit ??
                                      ""}
                                  </td>

                                  <td className="px-3 py-3 text-right">
                                    {money(
                                      item.currency,
                                      item.unit_price,
                                    )}
                                  </td>

                                  <td className="px-3 py-3 text-right font-medium">
                                    {money(
                                      item.currency,
                                      item.total_amount,
                                    )}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border bg-white p-5">
                    <h2 className="text-base font-semibold text-gray-950">
                      Payment Evidence
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Read-only payment
                      evidence used to
                      synchronize the invoice.
                    </p>

                    {selected.payments
                      .length === 0 ? (
                      <p className="mt-4 text-sm text-gray-500">
                        No linked payment
                        evidence.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {selected.payments.map(
                          (payment) => (
                            <div
                              key={
                                payment.id
                              }
                              className="grid gap-3 rounded-lg border bg-gray-50 p-3 text-sm md:grid-cols-4"
                            >
                              <div>
                                <p className="text-xs text-gray-500">
                                  Payment
                                </p>
                                <p className="font-medium">
                                  {
                                    payment.payment_number
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500">
                                  Amount
                                </p>
                                <p className="font-medium">
                                  {money(
                                    payment.currency,
                                    payment.amount,
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500">
                                  Status
                                </p>
                                <p className="font-medium">
                                  {
                                    payment.status
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500">
                                  Paid
                                </p>
                                <p className="font-medium">
                                  {formatDate(
                                    payment.paid_at,
                                  )}
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <aside className="space-y-5">
              <div className="rounded-xl border bg-white p-5">
                <h2 className="text-base font-semibold text-gray-950">
                  Invoice Workflow
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Actions are controlled by
                  backend capabilities.
                </p>

                {!selected ? (
                  <p className="mt-5 text-sm text-gray-500">
                    Select an invoice.
                  </p>
                ) : (
                  <div className="mt-5 space-y-3">
                    {selected.capabilities
                      .issue && (
                      <WorkflowButton
                        label="Issue Invoice"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          void issueInvoice()
                        }
                      />
                    )}

                    {selected.capabilities
                      .cancel && (
                      <>
                        {!showCancel ? (
                          <button
                            type="button"
                            disabled={
                              actionLoading
                            }
                            onClick={() =>
                              setShowCancel(
                                true,
                              )
                            }
                            className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Cancel Invoice
                          </button>
                        ) : (
                          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <label className="text-xs font-medium text-red-800">
                              Cancellation
                              reason
                            </label>

                            <textarea
                              value={
                                cancelReason
                              }
                              onChange={(
                                event,
                              ) =>
                                setCancelReason(
                                  event.target
                                    .value,
                                )
                              }
                              rows={3}
                              className="mt-2 w-full rounded-md border border-red-200 bg-white p-2 text-sm"
                            />

                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  void cancelInvoice()
                                }
                                className="rounded-md bg-red-700 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                              >
                                Confirm
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setShowCancel(
                                    false,
                                  );
                                  setCancelReason(
                                    "",
                                  );
                                }}
                                className="rounded-md border bg-white px-3 py-2 text-xs"
                              >
                                Back
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {!selected.capabilities
                      .issue &&
                      !selected.capabilities
                        .cancel && (
                        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                          No document workflow
                          actions are currently
                          available.
                        </div>
                      )}

                    <div className="border-t pt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Payment Operations
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        Payment state is
                        synchronized from
                        authoritative Payment
                        and Refund evidence.
                        Manual mark-paid is
                        not available.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-gray-950">
                      Credit & Debit Notes
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Governed accounting documents linked to this invoice.
                      Payment status continues to come only from Payment and Refund evidence.
                    </p>
                  </div>

                  {selected && (
                    <div className="flex gap-2">
                      {selected.capabilities
                        .credit_note && (
                        <button
                          type="button"
                          onClick={() =>
                            openFinancialNoteModal(
                              "credit",
                            )
                          }
                          className="rounded-lg border bg-white px-3 py-2 text-xs font-medium text-gray-900 hover:bg-gray-50"
                        >
                          Create Credit Note
                        </button>
                      )}

                      {selected.capabilities
                        .debit_note && (
                        <button
                          type="button"
                          onClick={() =>
                            openFinancialNoteModal(
                              "debit",
                            )
                          }
                          className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-black"
                        >
                          Create Debit Note
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {!selected ? (
                  <p className="mt-4 text-sm text-gray-500">
                    Select an invoice to view financial notes.
                  </p>
                ) : selected.financial_notes.length ===
                  0 ? (
                  <div className="mt-4 rounded-lg border border-dashed p-4 text-sm text-gray-500">
                    No Credit Notes or Debit Notes have been created for this invoice.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {selected.financial_notes.map(
                      (note) => (
                        <div
                          key={note.id}
                          className="rounded-lg border p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-gray-950">
                                  {note.note_number}
                                </span>

                                <span className="rounded-full border px-2 py-0.5 text-xs font-medium capitalize text-gray-700">
                                  {note.type}
                                </span>

                                <span className="rounded-full border px-2 py-0.5 text-xs font-medium capitalize text-gray-700">
                                  {note.status}
                                </span>
                              </div>

                              <p className="mt-2 text-sm font-semibold text-gray-950">
                                {money(
                                  note.currency,
                                  note.amount,
                                )}
                              </p>

                              <p className="mt-1 text-xs text-gray-600">
                                {note.reason}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {note.capabilities
                                .issue && (
                                <button
                                  type="button"
                                  disabled={
                                    financialNoteActionId ===
                                    note.id
                                  }
                                  onClick={() =>
                                    void issueFinancialNote(
                                      note,
                                    )
                                  }
                                  className="rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                                >
                                  Issue
                                </button>
                              )}

                              {note.capabilities
                                .cancel && (
                                <button
                                  type="button"
                                  disabled={
                                    financialNoteActionId ===
                                    note.id
                                  }
                                  onClick={() => {
                                    setFinancialNoteCancelId(
                                      note.id,
                                    );

                                    setFinancialNoteCancelReason(
                                      "",
                                    );
                                  }}
                                  className="rounded-md border bg-white px-3 py-2 text-xs font-medium text-gray-900 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className="rounded-md bg-gray-50 p-2 text-xs text-gray-600">
                              Issued:{" "}
                              {formatDate(
                                note.issued_at,
                              )}
                            </div>

                            <div className="rounded-md bg-gray-50 p-2 text-xs text-gray-600">
                              Cancelled:{" "}
                              {formatDate(
                                note.cancelled_at,
                              )}
                            </div>
                          </div>

                          {financialNoteCancelId ===
                            note.id && (
                            <div className="mt-3 rounded-lg border bg-gray-50 p-3">
                              <label className="text-xs font-medium text-gray-700">
                                Cancellation reason
                              </label>

                              <textarea
                                value={
                                  financialNoteCancelReason
                                }
                                onChange={(event) =>
                                  setFinancialNoteCancelReason(
                                    event.target.value,
                                  )
                                }
                                rows={3}
                                maxLength={500}
                                className="mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none"
                              />

                              <div className="mt-2 flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFinancialNoteCancelId(
                                      null,
                                    );

                                    setFinancialNoteCancelReason(
                                      "",
                                    );
                                  }}
                                  className="rounded-md border bg-white px-3 py-2 text-xs"
                                >
                                  Back
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    financialNoteActionId ===
                                    note.id
                                  }
                                  onClick={() =>
                                    void cancelFinancialNote(
                                      note.id,
                                    )
                                  }
                                  className="rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                                >
                                  Confirm Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 border-t pt-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                              Financial Note History
                            </p>

                            {note.histories.length ===
                              0 ? (
                              <p className="mt-2 text-xs text-gray-500">
                                No financial note history.
                              </p>
                            ) : (
                              <div className="mt-2 space-y-2">
                                {note.histories.map(
                                  (history) => (
                                    <div
                                      key={history.id}
                                      className="border-l-2 border-gray-200 pl-3"
                                    >
                                      <p className="text-xs font-medium text-gray-900">
                                        {
                                          history.event_type
                                        }
                                      </p>

                                      <p className="mt-1 text-xs text-gray-500">
                                        {history.previous_status ??
                                          "Created"}{" "}
                                        →{" "}
                                        {
                                          history.new_status
                                        }
                                      </p>

                                      {history.reason && (
                                        <p className="mt-1 text-xs text-gray-600">
                                          {
                                            history.reason
                                          }
                                        </p>
                                      )}

                                      <p className="mt-1 text-xs text-gray-400">
                                        {formatDate(
                                          history.occurred_at,
                                        )}
                                        {history.actor
                                          ?.name
                                          ? ` • ${history.actor.name}`
                                          : " • System"}
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                  Credit and Debit Notes are accounting documents only.
                  They do not manually change invoice payment status,
                  amount paid, or Payment records.
                </div>
              </div>

              <div className="rounded-xl border bg-white p-5">
                <h2 className="text-base font-semibold text-gray-950">
                  Invoice History
                </h2>

                {!selected ||
                selected.histories.length ===
                  0 ? (
                  <p className="mt-4 text-sm text-gray-500">
                    No history available.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {selected.histories.map(
                      (history) => (
                        <div
                          key={history.id}
                          className="border-l-2 border-gray-200 pl-3"
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {
                              history.event_type
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Document:{" "}
                            {history
                              .previous_status
                              ? statusLabels[
                                  history
                                    .previous_status
                                ]
                              : "Created"}{" "}
                            →{" "}
                            {
                              statusLabels[
                                history
                                  .new_status
                              ]
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Payment:{" "}
                            {history
                              .previous_payment_status
                              ? paymentStatusLabels[
                                  history
                                    .previous_payment_status
                                ]
                              : "Initial"}{" "}
                            →{" "}
                            {
                              paymentStatusLabels[
                                history
                                  .new_payment_status
                              ]
                            }
                          </p>

                          {history.reason && (
                            <p className="mt-2 text-xs text-gray-600">
                              {
                                history.reason
                              }
                            </p>
                          )}

                          <p className="mt-2 text-xs text-gray-400">
                            {formatDate(
                              history
                                .occurred_at,
                            )}
                            {history.actor
                              ?.name
                              ? ` • ${history.actor.name}`
                              : " • System"}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </aside>
          </section>
        </main>
      </div>
      {showFinancialNote &&
        selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">
                    Create{" "}
                    {financialNoteType ===
                    "credit"
                      ? "Credit Note"
                      : "Debit Note"}
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Invoice{" "}
                    {
                      selected.invoice_number
                    }{" "}
                    • {selected.currency}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowFinancialNote(
                      false,
                    )
                  }
                  className="rounded-md border px-3 py-1.5 text-xs"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Amount
                  </label>

                  <input
                    value={
                      financialNoteAmount
                    }
                    onChange={(event) =>
                      setFinancialNoteAmount(
                        event.target.value,
                      )
                    }
                    inputMode="decimal"
                    placeholder="0.00"
                    className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Reason
                  </label>

                  <textarea
                    value={
                      financialNoteReason
                    }
                    onChange={(event) =>
                      setFinancialNoteReason(
                        event.target.value,
                      )
                    }
                    rows={4}
                    maxLength={500}
                    className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  />
                </div>

                {financialNoteType ===
                  "credit" && (
                  <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                    Credit Notes reduce accounting document value.
                    The backend prevents aggregate issued credits
                    from exceeding the invoice total.
                  </div>
                )}

                {financialNoteType ===
                  "debit" && (
                  <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                    Debit Notes increase accounting document value.
                    They do not create or simulate payment evidence.
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      setShowFinancialNote(
                        false,
                      )
                    }
                    className="rounded-lg border bg-white px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      void createFinancialNote()
                    }
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Creating..."
                      : `Create ${
                          financialNoteType ===
                          "credit"
                            ? "Credit Note"
                            : "Debit Note"
                        }`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}

function EvidenceCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-gray-50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-gray-950">
        {value}
      </p>
    </div>
  );
}

function DetailBlock({
  title,
  rows,
}: {
  title: string;
  rows: Array<
    [string, string]
  >;
}) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-semibold text-gray-900">
        {title}
      </h3>

      <div className="mt-3 space-y-2">
        {rows.map(
          ([label, value]) => (
            <div
              key={label}
              className="flex items-start justify-between gap-4 text-sm"
            >
              <span className="text-gray-500">
                {label}
              </span>

              <span className="text-right font-medium text-gray-900">
                {value}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500">
        {label}
      </span>

      <span
        className={
          strong
            ? "font-semibold text-gray-950"
            : "font-medium text-gray-900"
        }
      >
        {value}
      </span>
    </div>
  );
}

function WorkflowButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}
