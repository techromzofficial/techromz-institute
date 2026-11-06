"use client";

import React from "react";

export const CUSTOMER_DETAIL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "addresses-contacts", label: "Addresses & Contacts" },
  { id: "preferences-tags", label: "Preferences & Tags" },
  { id: "consent-privacy", label: "Consent & Privacy" },
  { id: "orders", label: "Orders" },
  { id: "activity", label: "Activity" },
  { id: "audit-history", label: "Audit History" },
];

interface CustomerDetailTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function CustomerDetailTabs({ activeTab, onTabChange }: CustomerDetailTabsProps) {
  return (
    <div className="bg-white border border-line rounded-lg shadow-2xs overflow-hidden">
      <div className="flex items-center overflow-x-auto scrollbar-thin divide-x divide-line/40 text-[11px] font-bold">
        {CUSTOMER_DETAIL_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-2.5 whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer ${
                isActive
                  ? "bg-[#671021] text-white font-black"
                  : "text-slate-600 hover:text-ink hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
