"use client";

import React from "react";
import { CustomerTabItem } from "@/types/customer";

interface CustomerCommandTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  items?: CustomerTabItem[];
}

export function CustomerCommandTabs({
  activeTab,
  onTabChange,
  items,
}: CustomerCommandTabsProps) {
  const tabs = items ?? [
    { id: "Overview", label: "Overview" },
    { id: "Active", label: "Active" },
    { id: "New", label: "New" },
    { id: "Verified", label: "Verified" },
    { id: "Loyalty", label: "Loyalty" },
    { id: "Dormant", label: "Dormant" },
    { id: "Restricted", label: "Restricted" },
    { id: "High-Value", label: "High-Value" },
    { id: "Service Cases", label: "Service Cases" },
    { id: "Returns & Disputes", label: "Returns & Disputes" },
    { id: "Privacy Requests", label: "Privacy Requests" },
  ];

  return (
    <div className="border-b border-line mb-4 overflow-x-auto scrollbar-none bg-white px-3 rounded-t-lg shadow-2xs">
      <nav className="flex items-center gap-5 text-[12px] min-w-max">
        {tabs.map((tab) => {
          const isActive = activeTab.toLowerCase() === tab.id.toLowerCase() || activeTab === tab.label;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-2.5 px-1 relative transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? "text-[#8F002B] font-bold"
                  : "text-slate-600 hover:text-ink font-semibold"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-[#8F002B]/10 text-[#8F002B]" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8F002B] rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
