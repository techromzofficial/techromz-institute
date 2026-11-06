"use client";

import React, {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileBarChart,
  FileClock,
  Upload,
  Truck,
} from "lucide-react";

import {
  logisticsApi,
  type LogisticsReportsAuditResponse,
} from "@/lib/api/logistics";
import { LogisticsStatusCharts } from "@/features/admin/logistics/components/LogisticsStatusCharts";

function formatValue(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export default function LogisticsReportsAuditPage() {
  const [data, setData] =
    useState<LogisticsReportsAuditResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await logisticsApi.getReportsImportExportAudit();

        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        console.error(
          "Failed to load Logistics reports/import/export/audit:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to load Logistics reporting and audit capability information.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const downloadAuditReport = async () => {
    setExporting(true);
    setError(null);

    try {
      const blob = await logisticsApi.downloadReportsAuditExport();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `logistics-audit-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download the Logistics audit report.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/admin/logistics"
          aria-label="Back to Logistics overview"
          className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reports, Import, Export & Audit
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review tenant-scoped Logistics operations and download the complete shipment audit report.
          </p>
        </div>
      </div>

      {data ? <LogisticsStatusCharts data={data.shipment_statuses.map((item) => ({ key: item.status, count: item.total }))} noun="Shipments" distributionTitle="Shipment Status Distribution" summaryTitle="Persisted Shipment Status Summary" /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">
                Total Shipments
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {data?.summary.total_shipments ?? 0}
              </div>
            </div>

            <Truck
              size={22}
              className="text-slate-400"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">
                Report Definitions
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {data?.summary.report_definitions ?? 0}
              </div>
            </div>

            <FileBarChart
              size={22}
              className="text-slate-400"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">
                Import Jobs
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {data?.summary.import_jobs ?? 0}
              </div>
            </div>

            <Upload
              size={22}
              className="text-slate-400"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">
                Export Jobs
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {data?.summary.export_jobs ?? 0}
              </div>
            </div>

            <Download
              size={22}
              className="text-slate-400"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">
                Audit Records
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {data?.summary.audit_records ?? 0}
              </div>
            </div>

            <FileClock
              size={22}
              className="text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Shipment Status Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            This section is generated from real tenant-scoped shipment records and is not a persisted report definition.
          </p>
        </div>

        <div className="relative min-h-[220px]">
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-b-slate-900" />
            </div>
          ) : null}

          {error ? (
            <div className="p-8">
              <h3 className="font-semibold text-slate-900">
                Reporting capability unavailable
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>
            </div>
          ) : data &&
            data.shipment_statuses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">
                      Shipment Status
                    </th>

                    <th className="px-5 py-3">
                      Count
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.shipment_statuses.map(
                    (status) => (
                      <tr key={status.status}>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {formatValue(
                              status.status,
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-900">
                          {status.total}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <Truck
                size={32}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-900">
                No shipment data available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                No tenant shipment records are currently available for the operational summary.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <FileBarChart
            size={22}
            className="text-slate-400"
          />

          <h2 className="mt-4 font-semibold text-slate-900">
            Reports
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Logistics report definitions, scheduled reports and downloadable report artifacts are not currently implemented.
          </p>

          <div className="mt-4 text-sm font-medium text-slate-900">
            Status:{" "}
            {data?.domains.reports.available
              ? "Available"
              : "Unavailable"}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Upload
            size={22}
            className="text-slate-400"
          />

          <h2 className="mt-4 font-semibold text-slate-900">
            Import
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            No authoritative Logistics shipment import pipeline or persisted import-job domain exists.
          </p>

          <div className="mt-4 text-sm font-medium text-slate-900">
            Status:{" "}
            {data?.domains.imports.available
              ? "Available"
              : "Unavailable"}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Download
            size={22}
            className="text-slate-400"
          />

          <h2 className="mt-4 font-semibold text-slate-900">
            Export
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Download a complete CSV containing shipments, status transitions and tracking events for the current tenant.
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-slate-900">
              Status: {data?.domains.exports.available ? "Available" : "Unavailable"}
            </div>
            <button type="button" onClick={() => void downloadAuditReport()} disabled={exporting || !data?.capabilities.export_audit} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
              <Download size={15} />
              {exporting ? "Exporting..." : "Export audit"}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <FileClock
            size={22}
            className="text-slate-400"
          />

          <h2 className="mt-4 font-semibold text-slate-900">
            Audit
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            A Logistics-specific operational audit record source is not currently exposed by this domain.
          </p>

          <div className="mt-4 text-sm font-medium text-slate-900">
            Status:{" "}
            {data?.domains.audit.available
              ? "Available"
              : "Unavailable"}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-900">
          Logistics audit export
        </div>

        <p className="mt-1 text-sm text-slate-600">
          Export includes shipment records, status transitions and tracking events from the current tenant. Private metadata and provider payloads are excluded.
        </p>
      </div>
    </div>
  );
}
