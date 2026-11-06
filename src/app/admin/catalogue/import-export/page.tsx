"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileDown,
  FileSpreadsheet,
  FileUp,
  History,
  RefreshCcw,
  ShieldCheck,
  Upload,
  XCircle,
} from "lucide-react";
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  EmptyState,
  LoadingSkeleton,
} from "@/components/admin/common/States";

import {
  EnterpriseDataTable,
  type Column,
} from "@/components/admin/common/EnterpriseDataTable";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { useAdminContext } from "@/contexts/AdminContext";

import {
  importExportApi,
  saveCsv,
  type ImportError,
  type ImportAnalytics,
  type ImportJob,
} from "@/features/admin/catalogue/api/importExportApi";

import {
  CatalogueError,
  formatDate,
  type LiveApiError,
} from "@/features/admin/catalogue/components/LiveCatalogueState";

const IMPORT_PERMISSION =
  "catalogue.import";

const EXPORT_PERMISSION =
  "catalogue.export";

const positivePage = (
  value: string | null
) =>
  Math.max(
    1,
    Number(value) || 1
  );

const fieldClass =
  "w-full min-h-10 rounded border border-gray-300 bg-white px-3 text-[11.5px] text-gray-800 outline-none transition-colors focus:border-[#741d35] focus:ring-2 focus:ring-[#741d35]/10";

export default function CatalogueImportExportPage() {
  const { hasPermission } =
    useAdminContext();

  const canImport = hasPermission(
    IMPORT_PERMISSION
  );

  const pathname =
    usePathname();

  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const queryKey =
    searchParams.toString();

  const historyPage =
    positivePage(
      searchParams.get("page")
    );

  const selectedImport =
    searchParams.get("import");

  const errorsPage =
    positivePage(
      searchParams.get(
        "errors_page"
      )
    );

  const [history, setHistory] =
    useState<ImportJob[]>([]);
  const [analytics, setAnalytics] = useState<ImportAnalytics>({status_distribution:[],trend:[]});

  const [
    historyLastPage,
    setHistoryLastPage,
  ] = useState(1);

  const [job, setJob] =
    useState<ImportJob | null>(
      null
    );

  const [file, setFile] =
    useState<File | null>(null);

  const [
    loadingHistory,
    setLoadingHistory,
  ] = useState(canImport);

  const [
    loadingDetail,
    setLoadingDetail,
  ] = useState(false);

  const [working, setWorking] =
    useState(false);

  const [
    downloadingTemplate,
    setDownloadingTemplate,
  ] = useState(false);

  const [
    exporting,
    setExporting,
  ] = useState(false);

  const [error, setError] =
    useState<LiveApiError | null>(
      null
    );

  const [
    exportFilters,
    setExportFilters,
  ] = useState({
    search: "",
    status: "",
    category: "",
  });

  const href = useCallback(
    (
      changes: Record<
        string,
        string | number | null
      >
    ) => {
      const next =
        new URLSearchParams(
          queryKey
        );

      Object.entries(
        changes
      ).forEach(
        ([key, value]) => {
          if (value === null) {
            next.delete(key);
          } else {
            next.set(
              key,
              String(value)
            );
          }
        }
      );

      const query =
        next.toString();

      return `${pathname}${
        query
          ? `?${query}`
          : ""
      }`;
    },
    [pathname, queryKey]
  );

  const loadHistory =
    useCallback(async () => {
      if (!canImport) {
        return;
      }

      setLoadingHistory(true);

      try {
        const response =
          await importExportApi.history(
            historyPage
          );

        setHistory(
          response.data
        );
        setAnalytics(response.analytics);

        setHistoryLastPage(
          Math.max(
            1,
            response.last_page
          )
        );

        setError(null);
      } catch (caught) {
        setError(
          caught as LiveApiError
        );
      } finally {
        setLoadingHistory(
          false
        );
      }
    }, [
      canImport,
      historyPage,
    ]);

  const loadDetail =
    useCallback(
      async (
        id: string,
        page = errorsPage
      ) => {
        if (!canImport) {
          return;
        }

        setLoadingDetail(true);

        try {
          setJob(
            await importExportApi.detail(
              id,
              page
            )
          );

          setError(null);
        } catch (caught) {
          setError(
            caught as LiveApiError
          );
        } finally {
          setLoadingDetail(
            false
          );
        }
      },
      [
        canImport,
        errorsPage,
      ]
    );

  useEffect(() => {
    if (!canImport) {
      setLoadingHistory(false);
      return;
    }

    void loadHistory();
  }, [
    canImport,
    loadHistory,
  ]);

  useEffect(() => {
    if (
      !canImport ||
      !selectedImport
    ) {
      return;
    }

    void loadDetail(
      selectedImport,
      errorsPage
    );
  }, [
    canImport,
    selectedImport,
    errorsPage,
    loadDetail,
  ]);

  async function validate(
    event: FormEvent
  ) {
    event.preventDefault();

    if (
      !canImport ||
      !file
    ) {
      return;
    }

    setWorking(true);
    setError(null);

    try {
      const uploadId =
        await importExportApi.upload(
          file
        );

      const validated =
        await importExportApi.validate(
          uploadId
        );

      const detail =
        await importExportApi.detail(
          validated.id,
          1
        );

      setJob(detail);

      router.replace(
        href({
          import: detail.id,
          errors_page: null,
        })
      );

      await loadHistory();
    } catch (caught) {
      setError(
        caught as LiveApiError
      );
    } finally {
      setWorking(false);
    }
  }

  async function apply() {
    if (
      !canImport ||
      !job
    ) {
      return;
    }

    setWorking(true);
    setError(null);

    try {
      const applied =
        await importExportApi.apply(
          job
        );

      const detail =
        await importExportApi.detail(
          applied.id,
          errorsPage
        );

      setJob(detail);

      router.replace(
        href({
          import: detail.id,
        })
      );

      await loadHistory();
    } catch (caught) {
      setError(
        caught as LiveApiError
      );
    } finally {
      setWorking(false);
    }
  }

  async function downloadTemplate() {
    setDownloadingTemplate(true);
    setError(null);

    try {
      const blob =
        await importExportApi.template();

      saveCsv(
        blob,
        "catalogue-products-template-v1.csv"
      );
    } catch (caught) {
      setError(
        caught as LiveApiError
      );
    } finally {
      setDownloadingTemplate(
        false
      );
    }
  }

  async function exportProducts() {
    setExporting(true);
    setError(null);

    try {
      const blob =
        await importExportApi.export(
          exportFilters
        );

      saveCsv(
        blob,
        "catalogue-products.csv"
      );
    } catch (caught) {
      setError(
        caught as LiveApiError
      );
    } finally {
      setExporting(false);
    }
  }

  const historyColumns =
    useMemo<
      Column<ImportJob>[]
    >(
      () => [
        {
          header: "File",
          cell: (row) => (
            <div>
              <strong className="block text-[11.5px] font-bold text-gray-900">
                {row.file?.name ??
                  "Unavailable"}
              </strong>

              <span className="block mt-0.5 text-[9.5px] text-gray-400">
                Import {row.id}
              </span>
            </div>
          ),
        },
        {
          header: "Status",
          cell: (row) => (
            <StatusBadge
              status={
                row.status
              }
            />
          ),
        },
        {
          header: "Rows",
          cell: (row) =>
            `${row.counts.valid_rows}/${row.counts.total_rows} valid`,
        },
        {
          header: "Applied",
          cell: (row) =>
            `${row.counts.applied_rows} applied · ${row.counts.failed_rows} failed`,
        },
        {
          header: "Created",
          cell: (row) =>
            formatDate(
              row.created_at
            ),
        },
      ],
      []
    );

  const errorColumns =
    useMemo<
      Column<ImportError>[]
    >(
      () => [
        {
          header: "Row",
          cell: (row) =>
            String(
              row.row_number
            ),
        },
        {
          header: "Field",
          cell: (row) =>
            row.error_field ??
            "row",
        },
        {
          header: "Code",
          cell: (row) =>
            row.error_code,
        },
        {
          header: "Message",
          cell: (row) =>
            row.error_message,
        },
      ],
      []
    );

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">
            Catalogue
            <span className="mx-2 text-gray-300">
              /
            </span>
            Import / Export
          </div>

          <h1 className="mt-2 text-xl font-bold tracking-tight text-gray-900">
            Catalogue Import / Export
          </h1>

          <p className="mt-1 text-[11px] text-gray-500">
            Validate Upload-backed Product
            CSV files before explicitly
            applying tenant Catalogue
            updates.
          </p>
        </div>

        <PermissionGuard
          permission={
            IMPORT_PERMISSION
          }
        >
          <button
            type="button"
            disabled={
              downloadingTemplate
            }
            onClick={() => {
              void downloadTemplate();
            }}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded border border-gray-300 bg-white px-3.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Download
              size={14}
            />

            {downloadingTemplate
              ? "Downloading..."
              : "Download CSV Template"}
          </button>
        </PermissionGuard>
      </div>

      {error && (
        <CatalogueError
          error={error}
        />
      )}

      {canImport && !loadingHistory && <ImportAnalyticsPanel analytics={analytics} />}

      {/* IMPORT WORKSPACE */}
      <PermissionGuard
        permission={
          IMPORT_PERMISSION
        }
      >
        <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
          <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#741d35]/15 bg-[#741d35]/5 text-[#741d35]">
              <FileUp
                size={15}
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Import Product Catalogue
              </h2>

              <p className="mt-0.5 text-[10.5px] text-gray-500">
                Upload a Product CSV,
                validate it as a dry-run,
                then explicitly apply
                eligible updates.
              </p>
            </div>
          </div>

          <div className="p-5">
            <div className="rounded border border-amber-200 bg-amber-50/60 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={14}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                  <p className="text-[10.5px] font-bold text-amber-800">
                    CSV v1 import rules
                  </p>

                  <p className="mt-1 text-[10px] leading-relaxed text-amber-700">
                    Existing Products are
                    matched using the
                    tenant-local SKU. Blank
                    cells make no change.
                    Use{" "}
                    <code className="rounded bg-white/70 px-1 py-0.5 font-mono">
                      __CLEAR__
                    </code>{" "}
                    for an explicit clear.
                    Product creation is not
                    supported until a trusted
                    Supplier-selection
                    contract exists.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={validate}
              className="mt-4"
            >
              <label className="block">
                <span className="block mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                  Product CSV
                  <span className="ml-0.5 text-rose-600">
                    *
                  </span>
                </span>

                <input
                  aria-label="Product CSV"
                  type="file"
                  accept=".csv,text/csv"
                  required
                  onChange={(
                    event
                  ) =>
                    setFile(
                      event.target
                        .files?.[0] ??
                        null
                    )
                  }
                  className="block w-full rounded border border-gray-300 bg-white p-2 text-[10.5px] text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-[10px] file:font-semibold"
                />
              </label>

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={
                    !file ||
                    working
                  }
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded bg-[#741d35] px-4 text-[11px] font-bold text-white hover:bg-[#5c172a] disabled:opacity-50"
                >
                  <Upload
                    size={13}
                  />

                  {working
                    ? "Working..."
                    : "Upload and Validate"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* DRY RUN */}
        {loadingDetail && (
          <LoadingSkeleton />
        )}

        {!loadingDetail &&
          job && (
            <section className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
                <ImportMetric
                  icon={
                    <FileSpreadsheet
                      size={15}
                    />
                  }
                  label="Total"
                  value={
                    job.counts
                      .total_rows
                  }
                  note="Validated rows"
                />

                <ImportMetric
                  icon={
                    <CheckCircle2
                      size={15}
                    />
                  }
                  label="Valid"
                  value={
                    job.counts
                      .valid_rows
                  }
                  note="Eligible rows"
                />

                <ImportMetric
                  icon={
                    <XCircle
                      size={15}
                    />
                  }
                  label="Invalid"
                  value={
                    job.counts
                      .invalid_rows
                  }
                  note="Not applied"
                />

                <ImportMetric
                  icon={
                    <RefreshCcw
                      size={15}
                    />
                  }
                  label="Updates"
                  value={
                    job.counts
                      .update_rows
                  }
                  note="Existing Products"
                />

                <ImportMetric
                  icon={
                    <ShieldCheck
                      size={15}
                    />
                  }
                  label="Unchanged"
                  value={
                    job.counts
                      .unchanged_rows
                  }
                  note="No mutation"
                />

                <ImportMetric
                  icon={
                    <FileDown
                      size={15}
                    />
                  }
                  label="Applied / Failed"
                  value={`${job.counts.applied_rows} / ${job.counts.failed_rows}`}
                  note="Apply result"
                />
              </div>

              <section
                id="dry-run"
                className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-gray-900">
                        Dry-run Summary
                      </h2>

                      <StatusBadge
                        status={
                          job.status
                        }
                      />
                    </div>

                    <p className="mt-1 text-[10.5px] text-gray-500">
                      Backend-validated import
                      state before mutation.
                    </p>
                  </div>

                  {job.status ===
                    "ready" && (
                    <button
                      type="button"
                      disabled={
                        working ||
                        !job.capabilities
                          .apply
                      }
                      onClick={() => {
                        void apply();
                      }}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded bg-[#741d35] px-4 text-[11px] font-bold text-white hover:bg-[#5c172a] disabled:opacity-50"
                    >
                      <ShieldCheck
                        size={13}
                      />
                      Apply Validated Updates
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  <DryRunFact
                    label="Import ID"
                    value={
                      job.id
                    }
                  />

                  <DryRunFact
                    label="Checksum"
                    value={
                      job.checksum ??
                      "Unavailable"
                    }
                    mono
                  />
                </div>
              </section>

              <section
                id="errors"
                className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-900">
                    Row Validation Errors
                  </h2>

                  <p className="mt-0.5 text-[10.5px] text-gray-500">
                    Rows that failed
                    deterministic import
                    validation.
                  </p>
                </div>

                {job.errors?.length ? (
                  <EnterpriseDataTable
                    rows={job.errors}
                    columns={
                      errorColumns
                    }
                    actionLabel="Review row"
                    href={() =>
                      "#errors"
                    }
                    page={
                      job.errors_page ??
                      1
                    }
                    totalPages={
                      job.errors_last_page ??
                      1
                    }
                    previousHref={
                      (job.errors_page ??
                        1) >
                      1
                        ? href({
                            errors_page:
                              (job.errors_page ??
                                1) -
                              1,
                          })
                        : undefined
                    }
                    nextHref={
                      (job.errors_page ??
                        1) <
                      (job.errors_last_page ??
                        1)
                        ? href({
                            errors_page:
                              (job.errors_page ??
                                1) +
                              1,
                          })
                        : undefined
                    }
                  />
                ) : (
                  <div className="p-6">
                    <EmptyState title="No row errors" />
                  </div>
                )}
              </section>
            </section>
          )}

        {/* HISTORY */}
        <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
          <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100">
            <History
              size={15}
              className="mt-0.5 text-[#741d35]"
            />

            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Import History
              </h2>

              <p className="mt-0.5 text-[10.5px] text-gray-500">
                Previous Product CSV
                validation and apply jobs.
              </p>
            </div>
          </div>

          {loadingHistory ? (
            <div className="p-4">
              <LoadingSkeleton />
            </div>
          ) : history.length ? (
            <EnterpriseDataTable
              rows={history}
              columns={
                historyColumns
              }
              actionLabel="Open import"
              href={(row) =>
                href({
                  import: row.id,
                  errors_page: null,
                })
              }
              page={historyPage}
              totalPages={
                historyLastPage
              }
              previousHref={
                historyPage > 1
                  ? href({
                      page:
                        historyPage -
                        1,
                    })
                  : undefined
              }
              nextHref={
                historyPage <
                historyLastPage
                  ? href({
                      page:
                        historyPage +
                        1,
                    })
                  : undefined
              }
            />
          ) : (
            <div className="p-6">
              <EmptyState title="No Product imports" />
            </div>
          )}
        </section>
      </PermissionGuard>

      {/* EXPORT */}
      <PermissionGuard
        permission={
          EXPORT_PERMISSION
        }
      >
        <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
          <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#741d35]/15 bg-[#741d35]/5 text-[#741d35]">
              <FileDown
                size={15}
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Export Products
              </h2>

              <p className="mt-0.5 text-[10.5px] text-gray-500">
                Download the live tenant
                Catalogue as a formula-safe
                Product CSV.
              </p>
            </div>
          </div>

          <div className="p-5">
            <div className="rounded border border-gray-200 bg-gray-50 p-4">
              <p className="text-[10px] leading-relaxed text-gray-600">
                Approval status is exported
                for information only and is
                not accepted as an import
                mutation field.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <label className="block">
                <span className="block mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                  Search
                </span>

                <input
                  value={
                    exportFilters.search
                  }
                  onChange={(
                    event
                  ) =>
                    setExportFilters(
                      (current) => ({
                        ...current,
                        search:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  className={
                    fieldClass
                  }
                  placeholder="Product name or SKU"
                />
              </label>

              <label className="block">
                <span className="block mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                  Status
                </span>

                <select
                  value={
                    exportFilters.status
                  }
                  onChange={(
                    event
                  ) =>
                    setExportFilters(
                      (current) => ({
                        ...current,
                        status:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  className={
                    fieldClass
                  }
                >
                  <option value="">
                    All
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                  <option value="draft">
                    Draft
                  </option>
                </select>
              </label>

              <label className="block">
                <span className="block mb-1.5 text-[9.5px] font-bold uppercase tracking-wide text-gray-500">
                  Category Slug
                </span>

                <input
                  value={
                    exportFilters.category
                  }
                  onChange={(
                    event
                  ) =>
                    setExportFilters(
                      (current) => ({
                        ...current,
                        category:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  className={
                    fieldClass
                  }
                  placeholder="e.g. skin-care"
                />
              </label>
            </div>

            <div className="flex justify-end mt-5 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={
                  exporting
                }
                onClick={() => {
                  void exportProducts();
                }}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded bg-[#741d35] px-4 text-[11px] font-bold text-white hover:bg-[#5c172a] disabled:opacity-50"
              >
                <Download
                  size={13}
                />

                {exporting
                  ? "Exporting..."
                  : "Download Product CSV"}
              </button>
            </div>
          </div>
        </section>
      </PermissionGuard>
    </div>
  );
}

function ImportAnalyticsPanel({analytics}:{analytics:ImportAnalytics}) {
  const hasTrend=analytics.trend.some(point=>point.jobs||point.records||point.applied||point.rejected);
  const distribution=analytics.status_distribution.filter(item=>item.count>0);
  const colors=["#059669","#f59e0b","#dc2626","#2563eb","#7c3aed","#94a3b8"];
  return <section className="grid grid-cols-1 gap-4 xl:grid-cols-2" aria-label="Import operations analytics"><article className="rounded border border-gray-200 bg-white p-4 shadow-2xs"><h2 className="text-sm font-bold text-gray-900">Import Operations Trend</h2><p className="mt-0.5 text-[10.5px] text-gray-500">Tenant import jobs and row outcomes created during the last 30 days.</p>{hasTrend?<div className="mt-3 h-64" data-testid="import-operations-trend"><ResponsiveContainer width="100%" height="100%"><LineChart data={analytics.trend} margin={{top:8,right:12,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/><XAxis dataKey="date" tick={{fontSize:9}} minTickGap={24}/><YAxis allowDecimals={false} tick={{fontSize:9}}/><Tooltip/><Legend wrapperStyle={{fontSize:10}}/><Line type="monotone" dataKey="records" name="Records" stroke="#7c3aed" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="applied" name="Applied" stroke="#059669" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="rejected" name="Rejected" stroke="#dc2626" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div>:<AnalyticsEmpty label="No import activity in the last 30 days"/>}</article><article className="rounded border border-gray-200 bg-white p-4 shadow-2xs"><h2 className="text-sm font-bold text-gray-900">Import Job Status Distribution</h2><p className="mt-0.5 text-[10.5px] text-gray-500">All tenant Product import jobs grouped by their persisted status.</p>{distribution.length?<div className="mt-3 h-64" data-testid="import-status-distribution"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution} dataKey="count" nameKey="status" innerRadius={55} outerRadius={82} paddingAngle={2}>{distribution.map((item,index)=><Cell key={item.status} fill={colors[index%colors.length]}/>)}</Pie><Tooltip/><Legend wrapperStyle={{fontSize:10}}/></PieChart></ResponsiveContainer></div>:<AnalyticsEmpty label="No import jobs available"/>}</article></section>;
}

function AnalyticsEmpty({label}:{label:string}) {
  return <div className="mt-3 flex h-48 items-center justify-center rounded border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-500">{label}</div>;
}

function ImportMetric({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="text-[#741d35]">
          {icon}
        </div>

        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
          Live
        </span>
      </div>

      <div className="mt-3">
        <span className="block text-[10px] font-semibold text-gray-500">
          {label}
        </span>

        <strong className="block text-lg font-black text-gray-900 mt-0.5">
          {value}
        </strong>

        <span className="block text-[9.5px] text-gray-400 mt-1">
          {note}
        </span>
      </div>
    </div>
  );
}

function DryRunFact({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100 last:border-r-0">
      <span className="block text-[9.5px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <span
        className={`block mt-1.5 text-[11px] font-semibold text-gray-900 break-all ${
          mono
            ? "font-mono"
            : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
