"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import {
  AlertTriangle,
  CheckCircle2,
  PackageSearch,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import {
  CartesianGrid,
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  EnterpriseDataTable,
  type Column,
} from "@/components/admin/common/EnterpriseDataTable";
import { FilterWorkspace } from "@/components/admin/common/FilterWorkspace";
import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import {
  LoadingSkeleton,
  EmptyState,
} from "@/components/admin/common/States";

import {
  CatalogueError,
  formatDate,
  type LiveApiError,
} from "@/features/admin/catalogue/components/LiveCatalogueState";

import { qualityApi } from "@/features/admin/catalogue/api/catalogueApi";

import type {
  PageResult,
  QualityDashboard,
  QualityFinding,
} from "@/features/admin/catalogue/contracts/catalogueContracts";

import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";

export default function QualityPage() {
  const params = useSearchParams();
  const key = params.toString();

  const [dashboard, setDashboard] =
    useState<QualityDashboard | null>(null);

  const [findings, setFindings] =
    useState<PageResult<QualityFinding> | null>(null);

  const [error, setError] =
    useState<LiveApiError | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const load = useCallback(() => {
    setLoading(true);

    return Promise.all([
      qualityApi.dashboard(),
      qualityApi.findings({
        search:
          params.get("search") ||
          undefined,
        status:
          params.get("status") ||
          undefined,
        page: Number(
          params.get("page") || 1
        ),
        pageSize: 20,
      }),
    ])
      .then(([metrics, page]) => {
        setDashboard(metrics);
        setFindings(page);
        setError(null);
      })
      .catch((reason) => {
        setError(
          reason as LiveApiError
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, params]);

  useEffect(() => {
    void load();
  }, [load]);

  async function refreshQuality() {
    setRefreshing(true);
    setError(null);

    try {
      await qualityApi.refresh();
      await load();
    } catch (reason) {
      setError(
        reason as LiveApiError
      );
    } finally {
      setRefreshing(false);
    }
  }

  const path = (page: number) => {
    const next =
      new URLSearchParams(key);

    if (page > 1) {
      next.set(
        "page",
        String(page)
      );
    } else {
      next.delete("page");
    }

    return `/admin/catalogue/quality${
      next.size
        ? `?${next.toString()}`
        : ""
    }`;
  };

  const columns =
    useMemo<
      Column<QualityFinding>[]
    >(
      () => [
        {
          header: "Issue",
          cell: (finding) => (
            <div>
              <strong className="block text-[11.5px] font-bold text-gray-900">
                {finding.message}
              </strong>

              <span className="block mt-0.5 text-[9.5px] text-gray-400">
                {finding.field ??
                  finding.type}
              </span>
            </div>
          ),
        },
        {
          header: "Resource",
          cell: (finding) => (
            <Link
              href={`/admin/catalogue/products/${finding.resourceId}`}
              className="text-[11px] font-semibold text-[#741d35] hover:underline"
            >
              {finding.resourceName}
            </Link>
          ),
        },
        {
          header: "Severity",
          cell: (finding) => (
            <StatusBadge
              status={finding.severity}
            />
          ),
        },
        {
          header: "Status",
          cell: (finding) => (
            <StatusBadge
              status={finding.status}
            />
          ),
        },
        {
          header: "Detected",
          cell: (finding) =>
            formatDate(
              finding.detectedAt
            ),
        },
      ],
      []
    );

  return (
    <PermissionGuard
      permission={
        CATALOGUE_PERMISSIONS.qualityView
      }
      fallback={
        <CatalogueError
          error={Object.assign(
            new Error(
              "Permission required"
            ),
            {
              status: 403,
            }
          )}
        />
      }
    >
      <div className="flex flex-col gap-4 p-6">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">
              Catalogue
              <span className="mx-2 text-gray-300">
                /
              </span>
              Quality
            </div>

            <h1 className="mt-2 text-xl font-bold tracking-tight text-gray-900">
              Catalogue Quality
            </h1>

            <p className="mt-1 text-[11px] text-gray-500">
              Deterministic tenant Catalogue
              data findings and operational
              quality controls.
            </p>
          </div>

          <PermissionGuard
            permission={
              CATALOGUE_PERMISSIONS.qualityManage
            }
          >
            <button
              type="button"
              onClick={() => {
                void refreshQuality();
              }}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded bg-[#741d35] text-white text-[11px] font-bold hover:bg-[#5c172a] disabled:opacity-50"
            >
              <RefreshCcw
                size={14}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh Quality"}
            </button>
          </PermissionGuard>
        </div>

        {/* KPI CARDS */}
        {dashboard && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <QualityMetric
              icon={
                <PackageSearch
                  size={16}
                />
              }
              label="Products"
              value={
                dashboard.totalProducts
              }
              note="Tenant Catalogue"
            />

            <QualityMetric
              icon={
                <ShieldAlert
                  size={16}
                />
              }
              label="Products with Issues"
              value={
                dashboard.productsWithQualityIssues
              }
              note="Active quality findings"
            />

            <QualityMetric
              icon={
                <AlertTriangle
                  size={16}
                />
              }
              label="Critical"
              value={
                dashboard.criticalFindings
              }
              note="Deterministic findings"
            />

            <QualityMetric
              icon={
                <CheckCircle2
                  size={16}
                />
              }
              label="Warnings"
              value={
                dashboard.warningFindings
              }
              note="Deterministic findings"
            />
          </div>
        )}

        {dashboard && (
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3" aria-label="Catalogue quality visualizations">
            <QualityTrend data={dashboard.trend} />
            <IssueDistribution data={dashboard.issueDistribution} />
            <StatusDistribution data={dashboard.statusDistribution} />
          </section>
        )}

        {/* FILTERS */}
        <div className="bg-white border border-gray-200 rounded p-4 shadow-2xs">
          <FilterWorkspace
            statusOptions={[
              "open",
              "acknowledged",
              "resolved",
            ]}
            showAssignment={
              false
            }
          />
        </div>

        {/* FINDINGS */}
        <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">
              Quality Findings
            </h2>

            <p className="mt-0.5 text-[10.5px] text-gray-500">
              Backend-generated Catalogue
              quality findings linked to
              operational Product records.
            </p>
          </div>

          {loading && (
            <div className="p-4">
              <LoadingSkeleton />
            </div>
          )}

          {error && (
            <div className="p-4">
              <CatalogueError
                error={error}
              />
            </div>
          )}

          {!loading &&
            !error &&
            findings &&
            (findings.data.length ? (
              <EnterpriseDataTable
                rows={findings.data}
                columns={columns}
                actionLabel="Open Product"
                href={(finding) =>
                  `/admin/catalogue/products/${finding.resourceId}`
                }
                page={findings.page}
                totalPages={Math.max(
                  1,
                  Math.ceil(
                    findings.total /
                      findings.pageSize
                  )
                )}
                previousHref={
                  findings.page > 1
                    ? path(
                        findings.page -
                          1
                      )
                    : undefined
                }
                nextHref={
                  findings.page *
                    findings.pageSize <
                  findings.total
                    ? path(
                        findings.page +
                          1
                      )
                    : undefined
                }
              />
            ) : (
              <div className="p-6">
                <EmptyState title="No quality findings" />
              </div>
            ))}
        </section>

        {/* QUALITY BREAKDOWN */}
        {dashboard && (
          <section className="bg-white border border-gray-200 rounded shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">
                Finding Breakdown
              </h2>

              <p className="mt-0.5 text-[10.5px] text-gray-500">
                Current deterministic
                Catalogue quality categories.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3">
              <BreakdownItem
                label="Missing Category"
                value={
                  dashboard.missingCategory
                }
              />

              <BreakdownItem
                label="Missing Required Attributes"
                value={
                  dashboard.missingRequiredAttributes
                }
              />

              <BreakdownItem
                label="Missing Media"
                value={
                  dashboard.missingMedia
                }
              />
            </div>
          </section>
        )}
      </div>
    </PermissionGuard>
  );
}

const QUALITY_COLORS = ["#741d35", "#c2410c", "#2563eb", "#059669", "#7c3aed", "#64748b"];

function QualityTrend({data}:{data:QualityDashboard["trend"]}) {
  const hasData=data.some(point=>point.detected||point.critical||point.resolved);
  return <article className="rounded border border-gray-200 bg-white p-4 shadow-2xs"><h2 className="text-sm font-bold text-gray-900">Catalogue Quality Trend</h2><p className="mt-0.5 text-[10.5px] text-gray-500">Findings first detected and resolved during the last 30 days.</p>{hasData?<div className="mt-4 h-64" data-testid="quality-trend-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{top:8,right:12,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/><XAxis dataKey="date" tick={{fontSize:9}} minTickGap={24}/><YAxis allowDecimals={false} tick={{fontSize:9}}/><Tooltip/><Legend wrapperStyle={{fontSize:10}}/><Line type="monotone" dataKey="detected" name="Detected" stroke="#2563eb" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="resolved" name="Resolved" stroke="#059669" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="critical" name="Critical" stroke="#dc2626" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div>:<ChartEmpty label="No quality activity in the last 30 days"/>}</article>;
}

function IssueDistribution({data}:{data:QualityDashboard["issueDistribution"]}) {
  const total=data.reduce((sum,item)=>sum+item.count,0);
  return <article className="rounded border border-gray-200 bg-white p-4 shadow-2xs"><h2 className="text-sm font-bold text-gray-900">Issue Distribution</h2><p className="mt-0.5 text-[10.5px] text-gray-500">Current open and acknowledged findings by deterministic rule.</p>{total?<div className="mt-4 h-64" data-testid="quality-issue-distribution"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="count" nameKey="type" innerRadius={55} outerRadius={82} paddingAngle={2}>{data.map((item,index)=><Cell key={item.type} fill={QUALITY_COLORS[index%QUALITY_COLORS.length]}/>)}</Pie><Tooltip/><Legend formatter={(value)=>String(value).replaceAll("_"," ")} wrapperStyle={{fontSize:10}}/></PieChart></ResponsiveContainer></div>:<ChartEmpty label="No active quality findings"/>}</article>;
}

function StatusDistribution({data}:{data:QualityDashboard["statusDistribution"]}) {
  const active=data.filter(item=>item.count>0);
  return <article className="rounded border border-gray-200 bg-white p-4 shadow-2xs"><h2 className="text-sm font-bold text-gray-900">Issue Status Summary</h2><p className="mt-0.5 text-[10.5px] text-gray-500">Active findings grouped by their persisted workflow status.</p>{active.length?<div className="mt-4 h-64" data-testid="quality-status-distribution"><ResponsiveContainer width="100%" height="100%"><BarChart data={active} layout="vertical" margin={{top:8,right:12,left:18,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/><XAxis type="number" allowDecimals={false} tick={{fontSize:9}}/><YAxis type="category" dataKey="status" tick={{fontSize:9}} width={80}/><Tooltip/><Bar dataKey="count" name="Findings" fill="#741d35" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div>:<ChartEmpty label="No active status totals"/>}</article>;
}

function ChartEmpty({label}:{label:string}) {
  return <div className="mt-4 flex h-64 items-center justify-center rounded border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-500">{label}</div>;
}

function QualityMetric({
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

        <strong className="block text-xl font-black text-gray-900 mt-0.5">
          {value}
        </strong>

        <span className="block text-[9.5px] text-gray-400 mt-1">
          {note}
        </span>
      </div>
    </div>
  );
}

function BreakdownItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100 last:border-r-0">
      <span className="block text-[9.5px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </span>

      <strong className="block mt-2 text-lg font-black text-gray-900">
        {value}
      </strong>
    </div>
  );
}
