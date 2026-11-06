"use client";

import React from "react";
import { Lock } from "lucide-react";

export interface DirectoryTab {
  id: string;
  label: string;
  count?: number;
  available: boolean;
}

export const DIRECTORY_TABS: DirectoryTab[] = [
  {
    id: "all",
    label: "All Customers",
    available: true,
  },
  {
    id: "active",
    label: "Active",
    available: false,
  },
  {
    id: "new",
    label: "New",
    available: false,
  },
  {
    id: "verified",
    label: "Verified",
    available: false,
  },
  {
    id: "verification-pending",
    label: "Verification Pending",
    available: false,
  },
  {
    id: "incomplete-profiles",
    label: "Incomplete Profiles",
    available: false,
  },
  {
    id: "high-value",
    label: "High Value",
    available: false,
  },
  {
    id: "loyalty-members",
    label: "Loyalty Members",
    available: false,
  },
  {
    id: "dormant",
    label: "Dormant",
    available: false,
  },
  {
    id: "restricted",
    label: "Restricted",
    available: false,
  },
  {
    id: "duplicate-candidates",
    label: "Duplicate Candidates",
    available: false,
  },
  {
    id: "privacy-review",
    label: "Privacy Review",
    available: false,
  },
  {
    id: "archived",
    label: "Archived",
    available: false,
  },
  {
    id: "audit-history",
    label: "Audit History",
    available: false,
  },
];

interface CustomerDirectoryTabsProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export function CustomerDirectoryTabs({
  activeTab,
  onSelectTab,
}: CustomerDirectoryTabsProps) {
  return (
    <div className="bg-white border-b border-line px-6 overflow-x-auto scrollbar-thin">
      <div className="flex items-center gap-1 min-w-max">
        {DIRECTORY_TABS.map((tab) => {
          const isActive =
            tab.available &&
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.available) {
                  onSelectTab(tab.id);
                }
              }}
              disabled={!tab.available}
              title={
                tab.available
                  ? undefined
                  : `${tab.label} is not available from an authoritative source yet.`
              }
              className={`py-3 px-3.5 text-[12px] font-semibold transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? "border-[#671021] text-[#671021] bg-slate-50/50"
                  : tab.available
                    ? "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/30"
                    : "border-transparent text-slate-300 cursor-not-allowed"
              }`}
            >
              <span>{tab.label}</span>

              {!tab.available && (
                <Lock className="w-3 h-3 text-slate-300" />
              )}

              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive
                      ? "bg-[#671021]/10 text-[#671021]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}