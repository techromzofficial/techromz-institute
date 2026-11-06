"use client";

import React from "react";
import styles from "./return-detail.module.css";

export const RETURN_DETAIL_TABS = [
  { id: "overview", label: "Case Overview" },
  { id: "items", label: "Returned Items" },
  { id: "evidence", label: "Customer Evidence" },
  { id: "eligibility", label: "Eligibility Assessment" },
  { id: "inspection", label: "Product Inspection" },
  { id: "batch", label: "Batch & Authenticity" },
  { id: "refund", label: "Refund Calculation" },
  { id: "responsibility", label: "Responsibility & Recovery" },
  { id: "logistics", label: "Return Logistics" },
  { id: "communications", label: "Communications" },
  { id: "issues", label: "Operational Issues" },
  { id: "audit", label: "Audit History" },
];

interface ReturnCaseTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  evidenceCount?: number;
  issuesCount?: number;
}

export function ReturnCaseTabs({
  activeTab,
  onTabChange,
  evidenceCount = 3,
  issuesCount = 2,
}: ReturnCaseTabsProps) {
  return (
    <div className={styles.tabsContainer} role="tablist" aria-label="Return Case Sections">
      {RETURN_DETAIL_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        let badge: number | undefined = undefined;
        if (tab.id === "evidence") badge = evidenceCount;
        if (tab.id === "issues") badge = issuesCount;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            type="button"
            className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span>{tab.label}</span>
            {badge !== undefined && (
              <span className={`${styles.tabBadge} ${isActive ? styles.tabBadgeActive : ""}`}>
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
