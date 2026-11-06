"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./return-detail.module.css";
import type { ReturnCaseDetails } from "@/types/admin";
import { fetchReturnCaseDetails } from "@/services/api/returnsService";
import { ReturnCaseHeader } from "./ReturnCaseHeader";
import { ReturnCaseTabs } from "./ReturnCaseTabs";
import { ReturnDetailTabsContent } from "./ReturnDetailTabsContent";
import { CaseDecisionPanel } from "./CaseDecisionPanel";
import { ReturnCaseModals, ReturnDetailModalType } from "./ReturnCaseModals";
import { ReturnCaseSkeleton } from "./ReturnCaseSkeleton";
import { ReturnCaseNotFound } from "./ReturnCaseNotFound";

interface ReturnDetailViewProps {
  returnId: string;
}

export function ReturnDetailView({ returnId }: ReturnDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<ReturnCaseDetails | null>(null);
  const [activeModal, setActiveModal] = useState<ReturnDetailModalType>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const activeTab = searchParams.get("tab") || "overview";

  const loadCase = useCallback(async () => {
    try {
      const data = await fetchReturnCaseDetails(returnId);
      setDetails(data);
    } catch (err) {
      console.error("Failed to load return case details", err);
    }
  }, [returnId]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`/admin/marketplace/returns/${encodeURIComponent(returnId)}?${params.toString()}`);
  };

  const handleActionSuccess = (msg: string) => {
    setToastMsg(msg);
    loadCase();
    setTimeout(() => setToastMsg(null), 4000);
  };

  if (loading && !details) {
    return <ReturnCaseSkeleton />;
  }

  if (!details) {
    return <ReturnCaseNotFound returnId={returnId} />;
  }

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

      {/* Header Card */}
      <ReturnCaseHeader
        details={details}
        onApproveReplacement={() => setActiveModal("approve_replacement")}
        onApproveFullRefund={() => setActiveModal("approve_refund")}
        onRequestEvidence={() => setActiveModal("request_evidence")}
        onScheduleInspection={() => setActiveModal("schedule_inspection")}
        onRejectReturn={() => setActiveModal("reject_return")}
        onEscalateCase={() => setActiveModal("escalate_case")}
        onSuspendDecision={() => setActiveModal("suspend_decision")}
      />

      {/* 12 Navigation Tabs */}
      <ReturnCaseTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        evidenceCount={details.evidenceList.length}
        issuesCount={details.operationalIssues.length}
      />

      {/* Main 2-Column Section */}
      <div className={styles.mainLayout}>
        {/* Left Column: Active Tab Content */}
        <div className={styles.leftColumn}>
          <ReturnDetailTabsContent
            details={details}
            activeTab={activeTab}
            onSelectTab={handleTabChange}
            onViewPayment={() => handleActionSuccess("Payment details panel opened.")}
            onViewFulfilment={() => handleActionSuccess("Supplier fulfilment record opened.")}
            onViewCustomer={() => handleActionSuccess(`Customer record for ${details.customerProfile.customerName} opened.`)}
            onContactCustomer={() => setActiveModal("contact_customer")}
            onViewClaimHistory={() => handleTabChange("audit")}
            onEditNote={() => setActiveModal("edit_note")}
          />
        </div>

        {/* Right Column: Sticky Decision Panel */}
        <div className={styles.rightColumn}>
          <CaseDecisionPanel
            data={details.decisionPanel}
            onSelectTab={handleTabChange}
            onApproveFullRefund={() => setActiveModal("approve_refund")}
            onApproveReplacement={() => setActiveModal("approve_replacement")}
            onApprovePartialRefund={() => setActiveModal("approve_partial")}
            onRequestEvidence={() => setActiveModal("request_evidence")}
            onScheduleInspection={() => setActiveModal("schedule_inspection")}
            onRejectReturn={() => setActiveModal("reject_return")}
            onEscalateCase={() => setActiveModal("escalate_case")}
            onSuspendDecision={() => setActiveModal("suspend_decision")}
            onOverrideInspection={() => setActiveModal("override_inspection")}
          />
        </div>
      </div>

      {/* Modals */}
      <ReturnCaseModals
        activeModal={activeModal}
        returnId={returnId}
        onClose={() => setActiveModal(null)}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
