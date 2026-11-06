"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, Boxes, ClipboardCheck, Database, PackageCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { LoadingSkeleton } from "@/components/admin/common/States";
import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { DonutDistributionChart } from "@/components/admin/shared/DonutDistributionChart";
import { TrendChart } from "@/components/admin/shared/TrendChart";
import { useAdminContext } from "@/contexts/AdminContext";
import { catalogueApi } from "@/features/admin/catalogue/api/catalogueApi";
import type { CatalogueCommandCenter, MetricSummary } from "@/features/admin/catalogue/contracts/catalogueContracts";
import { CATALOGUE_PERMISSIONS } from "@/features/admin/catalogue/permissions/cataloguePermissions";
import { CatalogueError, displayValue, formatDate, type LiveApiError } from "@/features/admin/catalogue/components/LiveCatalogueState";
import styles from "./catalogue-workspace.module.css";

function MetricCard({ metric, index }: { metric: MetricSummary; index: number }) {
  return <div className={styles.compactKpi}><div className={styles.compactKpiTop}><Boxes size={15}/><span>{String(index+1).padStart(2,"0")}</span></div><label>{metric.label}</label><strong className={metric.availability === "unavailable" ? styles.unavailable : undefined}>{metric.availability === "unavailable" ? "Unavailable" : displayValue(metric.value)}</strong><small>{metric.availability === "unavailable" ? "Not yet calculated by the live API" : "Current tenant"}</small></div>;
}

export default function CatalogueCommandCenterPage() {
  const { hasPermission } = useAdminContext();
  const canRead = hasPermission(CATALOGUE_PERMISSIONS.view);
  const [data, setData] = useState<CatalogueCommandCenter | null>(null);
  const [error, setError] = useState<LiveApiError | null>(null);
  useEffect(() => { if (!canRead) return; let active = true; catalogueApi.getCommandCenter().then(value => active && setData(value)).catch(reason => active && setError(reason)); return () => { active = false; }; }, [canRead]);
  const available = useMemo(() => data?.metrics.filter(metric => metric.availability === "available") ?? [], [data]);
  const composition = useMemo(() => data?.composition.map((item, index) => ({ name: item.label, value: item.value, color: ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#64748b"][index % 8] })) ?? [], [data]);
  const totalProducts = data?.metrics.find(metric => metric.id === "products_total")?.value ?? 0;
  return <PermissionGuard permission={CATALOGUE_PERMISSIONS.view} fallback={<CatalogueError error={Object.assign(new Error("Permission required"), { status: 403 })} />}>
    <div className={styles.screen} data-testid="command-center-screen">
      <header className={styles.screenHeader}><div><p className={styles.breadcrumb}>Catalogue / Command Center</p><h1>Catalogue Command Center</h1><p>Monitor product masters, approvals, catalogue quality, publication readiness and linked operational signals.</p></div><div className={styles.headerActions}><span className={styles.headerAction}><RefreshCw size={14}/> Live tenant data</span><PermissionGuard permission={CATALOGUE_PERMISSIONS.productsView}><Link className={`${styles.headerAction} ${styles.headerActionPrimary}`} href="/admin/catalogue/products">Open Product Master <ArrowRight size={14}/></Link></PermissionGuard></div></header>
      {!data && !error && <LoadingSkeleton/>}{error && <CatalogueError error={error}/>} {data && <>
        <section className={styles.compactKpis} aria-label="Catalogue portfolio metrics">{data.metrics.map((metric,index) => <MetricCard key={metric.id} metric={metric} index={index}/>)}</section>
        <div className={styles.twoColumn}><div className={styles.mainStack}>
          <div className={styles.dashboardGrid}>
            <section className={styles.sectionCard}><div className={styles.sectionHead}><div><h2>Catalogue composition</h2><p>Products by operational category</p></div><Link className={styles.sectionLink} href="/admin/catalogue/products">View products</Link></div><div className={styles.panelBody}><DonutDistributionChart data={composition} totalLabel="Products" totalValue={totalProducts}/></div></section>
            <section className={styles.sectionCard}><div className={styles.sectionHead}><div><h2>Catalogue growth</h2><p>Created, reviewed and published over 30 days</p></div></div><div className={styles.panelBody} style={{height:280}}><TrendChart data={data.trend}/></div></section>
          </div>
          <section className={styles.sectionCard}><div className={styles.sectionHead}><div><h2>Catalogue health scorecard</h2><p>Authoritative readiness calculations only</p></div><Link className={styles.sectionLink} href="/admin/catalogue/quality">Quality operations</Link></div><div className={`${styles.panelBody} ${styles.metricRows}`}>{data.readiness.length ? data.readiness.map(metric => { const value = metric.availability === "available" && metric.value !== null ? metric.value : null; return <div className={styles.metricRow} key={metric.id}><span>{metric.label}</span><strong>{value === null ? "Not yet calculated" : `${value}%`}</strong><div className={styles.track}><div className={styles.fill} style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}/></div></div>; }) : <p className="muted">No readiness metrics are available.</p>}</div></section>
          <section className={styles.sectionCard}><div className={styles.sectionHead}><div><h2>Approval workflow</h2><p>Current tenant review pipeline</p></div><Link className={styles.sectionLink} href="/admin/catalogue/product-approvals">Open queue</Link></div><div className={styles.pipeline}><div className={styles.pipelineStep}><span>Submitted</span><strong>{displayValue(data.approvalQueue.submitted)}</strong><small>Awaiting review</small></div><div className={styles.pipelineStep}><span>Under review</span><strong>{displayValue(data.approvalQueue.underReview)}</strong><small>Review in progress</small></div><div className={styles.pipelineStep}><span>Information requested</span><strong>{displayValue(data.approvalQueue.informationRequested)}</strong><small>Supplier action</small></div><div className={styles.pipelineStep}><span>High risk</span><strong>{displayValue(data.approvalQueue.highRisk)}</strong><small>Critical open findings</small></div></div></section>
          <section className={styles.sectionCard}><div className={styles.sectionHead}><div><h2>Recent Catalogue activity</h2><p>Append-only audit references</p></div></div><div className={styles.panelBody}>{data.recentActivity.length ? <ul className={styles.activityList}>{data.recentActivity.map(item => <li key={item.id}>{item.entityHref ? <Link href={item.entityHref}>{item.label}</Link> : item.label}<small>{formatDate(item.occurredAt)}</small></li>)}</ul> : <div className={styles.emptyPanel}>No recent Catalogue activity.</div>}</div></section>
        </div><aside className={styles.rail} aria-label="Catalogue insights">
          <section className={styles.railCard}><Database size={17}/><h2>Inventory & expiry</h2><p>Inventory signals for the current tenant.</p><span className={styles.railLink}>Available units <strong>{displayValue(data.inventory.availableUnits)}</strong></span><span className={styles.railLink}>Low stock <strong>{displayValue(data.inventory.lowStock)}</strong></span><span className={styles.railLink}>Near expiry <strong>{displayValue(data.inventory.nearExpiry)}</strong></span><span className={styles.railLink}>Recalled / quarantined <strong>{displayValue(data.inventory.recalledOrQuarantined)}</strong></span></section>
          <section className={styles.railCard}><ClipboardCheck size={17}/><h2>Priority approvals</h2><p>{displayValue(data.approvalQueue.total)} products are represented in the live approval queue.</p><Link className={styles.railLink} href="/admin/catalogue/product-approvals">Review queue <ArrowRight size={12}/></Link></section>
          <section className={styles.railCard}><ShieldCheck size={17}/><h2>Data quality</h2><p>Use deterministic checks; no client-authored quality scores are shown.</p><Link className={styles.railLink} href="/admin/catalogue/quality">Open controls <ArrowRight size={12}/></Link></section>
          <section className={styles.railCard}><Activity size={17}/><h2>Operational coverage</h2><p>{available.length} live metrics and {data.readiness.length} readiness references are currently available.</p></section>
        </aside></div>
      </>}
    </div>
  </PermissionGuard>;
}
