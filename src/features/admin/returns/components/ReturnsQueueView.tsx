"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./returns-queue.module.css";
import type {
  ReturnCaseItem,
  ReturnFilterParams,
  ReturnsMetricSummary,
  ReturnsOperationsHealth,
  PriorityAlert,
  RefundPerformanceMetrics,
  QuickQueueItem,
  LiabilitySummary,
} from "@/types/admin";
import {
  fetchReturnCases,
  fetchReturnsMetrics,
  fetchReturnsOperationsHealth,
  fetchPriorityAlerts,
  fetchRefundPerformance,
  fetchQuickQueue,
  fetchLiabilitySummary,
  exportReturnsCsv,
} from "@/services/api/returnsService";
import {
  mockReturnCases,
  mockReturnsMetrics,
  mockOperationsHealth,
  mockPriorityAlerts,
  mockRefundPerformance,
  mockQuickQueue,
  mockLiabilitySummary,
} from "@/mocks/admin/returns.mock";
import { ReturnsHeader } from "./ReturnsHeader";
import { ReturnsMetricsGrid } from "./ReturnsMetricsGrid";
import { ReturnsFilterPanel } from "./ReturnsFilterPanel";
import { ReturnsTable } from "./ReturnsTable";
import { ReturnsSidebar } from "./ReturnsSidebar";
import { ReturnsModals, ReturnsModalType } from "./ReturnsModals";

export function ReturnsQueueView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<ReturnCaseItem[]>(mockReturnCases);
  const [total, setTotal] = useState(mockReturnCases.length);
  const [totalPages, setTotalPages] = useState(1);
  const [metrics, setMetrics] = useState<ReturnsMetricSummary | null>(mockReturnsMetrics);
  const [operationsHealth, setOperationsHealth] = useState<ReturnsOperationsHealth | null>(mockOperationsHealth);
  const [priorityAlerts, setPriorityAlerts] = useState<PriorityAlert[]>(mockPriorityAlerts);
  const [refundPerformance, setRefundPerformance] = useState<RefundPerformanceMetrics | null>(mockRefundPerformance);
  const [quickQueue, setQuickQueue] = useState<QuickQueueItem[]>(mockQuickQueue);
  const [liabilitySummary, setLiabilitySummary] = useState<LiabilitySummary | null>(mockLiabilitySummary);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<ReturnsModalType>(null);
  const [actionReturnId, setActionReturnId] = useState<string | undefined>(undefined);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Extract filter state from URL search params
  const currentFilters: ReturnFilterParams = {
    search: searchParams.get("search") || "",
    returnStatus: searchParams.get("returnStatus") || "",
    refundStatus: searchParams.get("refundStatus") || "",
    inspectionStatus: searchParams.get("inspectionStatus") || "",
    disputeStatus: searchParams.get("disputeStatus") || "",
    returnType: searchParams.get("returnType") || "",
    reasonCategory: searchParams.get("reasonCategory") || "",
    supplier: searchParams.get("supplier") || "",
    brand: searchParams.get("brand") || "",
    productCategory: searchParams.get("productCategory") || "",
    logisticsPartner: searchParams.get("logisticsPartner") || "",
    riskLevel: searchParams.get("riskLevel") || "",
    assignedOfficer: searchParams.get("assignedOfficer") || "",
    openedDate: searchParams.get("openedDate") || "",
    dueDate: searchParams.get("dueDate") || "",
    quickFilter: searchParams.get("quickFilter") || "",
    orderId: searchParams.get("orderId") || "",
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 10,
  };

  const updateUrlFilters = useCallback(
    (newFilters: Partial<ReturnFilterParams>) => {
      const merged = { ...currentFilters, ...newFilters };
      const params = new URLSearchParams();

      Object.entries(merged).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          params.set(k, String(v));
        }
      });

      router.push(`/admin/marketplace/returns?${params.toString()}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, router]
  );

  const loadData = useCallback(async () => {
    try {
      const [
        resCases,
        resMetrics,
        resHealth,
        resAlerts,
        resRefund,
        resQQ,
        resLiability,
      ] = await Promise.all([
        fetchReturnCases(currentFilters),
        fetchReturnsMetrics(),
        fetchReturnsOperationsHealth(),
        fetchPriorityAlerts(),
        fetchRefundPerformance(),
        fetchQuickQueue(),
        fetchLiabilitySummary(),
      ]);

      setCases(resCases.data);
      setTotal(resCases.total);
      setTotalPages(resCases.totalPages);
      setMetrics(resMetrics);
      setOperationsHealth(resHealth);
      setPriorityAlerts(resAlerts);
      setRefundPerformance(resRefund);
      setQuickQueue(resQQ);
      setLiabilitySummary(resLiability);
    } catch (err) {
      console.error("Failed to load returns data", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (key: keyof ReturnFilterParams, value: string) => {
    updateUrlFilters({ [key]: value, page: 1 });
  };

  const handleQuickFilterToggle = (chipLabel: string) => {
    const isSame = currentFilters.quickFilter === chipLabel;
    updateUrlFilters({ quickFilter: isSame ? "" : chipLabel, page: 1 });
  };

  const handleClearAll = () => {
    router.push("/admin/marketplace/returns");
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(cases.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleActionSuccess = (msg: string) => {
    setToastMsg(msg);
    setSelectedIds([]);
    loadData();
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleExportCsv = async () => {
    try {
      const csvStr = await exportReturnsCsv(currentFilters);
      const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Returns_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      handleActionSuccess("Returns report exported to CSV successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {toastMsg && (
        <div
          className="toast success"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: "#10b981",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <ReturnsHeader
        onReviewPriority={() => updateUrlFilters({ quickFilter: "SLA Breach", riskLevel: "High", page: 1 })}
        onAssignCases={() => {
          if (selectedIds.length === 0) {
            setSelectedIds(cases.map((c) => c.id));
          }
          setActiveModal("bulk_assign");
        }}
        onExportReport={handleExportCsv}
        onFilterAuthenticity={() => updateUrlFilters({ quickFilter: "Authenticity", page: 1 })}
        onFilterDamage={() => updateUrlFilters({ returnType: "Delivery Damage", page: 1 })}
        onFilterRefundQueue={() => updateUrlFilters({ refundStatus: "PENDING REVIEW", page: 1 })}
        onFilterSafety={() => updateUrlFilters({ quickFilter: "Safety Complaint", page: 1 })}
      />

      {/* 14 Metrics Grid */}
      {metrics && (
        <ReturnsMetricsGrid
          metrics={metrics}
          activeFilter={currentFilters.quickFilter || currentFilters.returnStatus || currentFilters.refundStatus || currentFilters.inspectionStatus}
          onSelectMetricFilter={(k, v) => updateUrlFilters({ [k]: v, page: 1 })}
        />
      )}

      {/* Filter Panel */}
      <ReturnsFilterPanel
        filters={currentFilters}
        onFilterChange={handleFilterChange}
        onQuickFilterToggle={handleQuickFilterToggle}
        onClearAll={handleClearAll}
        onSaveView={() => setActiveModal("save_view")}
      />

      {/* Main Two-Column Section */}
      <div className={styles.mainContentLayout}>
        <ReturnsTable
          cases={cases}
          total={total}
          page={currentFilters.page || 1}
          pageSize={currentFilters.pageSize || 10}
          totalPages={totalPages}
          selectedIds={selectedIds}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          onPageChange={(newPage) => updateUrlFilters({ page: newPage })}
          onPageSizeChange={(newPageSize) => updateUrlFilters({ pageSize: newPageSize, page: 1 })}
          onOpenBulkAssign={() => setActiveModal("bulk_assign")}
          onOpenOverrideModal={(id) => {
            setActionReturnId(id);
            setActiveModal("override_inspection");
          }}
          onOpenApproveRefundModal={(id) => {
            setActionReturnId(id);
            setActiveModal("approve_refund");
          }}
        />

        {/* Right Sidebar Panels */}
        {operationsHealth && refundPerformance && liabilitySummary && (
          <ReturnsSidebar
            operationsHealth={operationsHealth}
            priorityAlerts={priorityAlerts}
            refundPerformance={refundPerformance}
            quickQueue={quickQueue}
            liabilitySummary={liabilitySummary}
            onFilterSlaBreaches={() => updateUrlFilters({ quickFilter: "SLA Breach", page: 1 })}
          />
        )}
      </div>

      {/* Modals */}
      <ReturnsModals
        activeModal={activeModal}
        selectedIds={selectedIds}
        currentReturnId={actionReturnId}
        currentFilters={currentFilters}
        onClose={() => {
          setActiveModal(null);
          setActionReturnId(undefined);
        }}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
