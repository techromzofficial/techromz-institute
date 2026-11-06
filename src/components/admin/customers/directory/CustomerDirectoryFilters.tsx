"use client";

import React from "react";
import {
  Search,
  RotateCcw,
  Bookmark,
  RefreshCw,
  Lock,
} from "lucide-react";
import { CustomerFilterState } from "@/types/customer";

interface CustomerDirectoryFiltersProps {
  filters: CustomerFilterState;

  onFilterChange: (
    key: keyof CustomerFilterState,
    value: any,
  ) => void;

  onClearAll: () => void;
  onToggleQuickChip: (chip: string) => void;
  onOpenMoreFilters: () => void;
  onOpenSaveView: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function CustomerDirectoryFilters({
  filters,
  onFilterChange,
  onClearAll,
  onOpenSaveView,
  onRefresh,
  isRefreshing,
}: CustomerDirectoryFiltersProps) {
  return (
    <div className="bg-white border-b border-line px-6 py-3.5 flex flex-col gap-3">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="relative w-full xl:max-w-xl">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search customers by name, email, phone or company..."
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange(
                "searchQuery",
                e.target.value,
              )
            }
            className="w-full h-8 pl-8 pr-3 bg-slate-50 border border-line rounded-md text-[12px] text-ink placeholder:text-slate-400 focus:outline-none focus:border-[#671021] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UnavailableFilter label="Customer Type" />
          <UnavailableFilter label="Segment" />
          <UnavailableFilter label="Verification" />
          <UnavailableFilter label="Loyalty" />
          <UnavailableFilter label="Consent" />
          <UnavailableFilter label="Risk" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10.5px] text-slate-400">
          <Lock className="w-3.5 h-3.5" />

          <span>
            Cross-domain customer filters become
            available only when their authoritative
            modules provide the required data.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearAll}
            className="h-8 px-3 rounded-md bg-white border border-line text-[11.5px] font-semibold text-slate-600 hover:text-ink hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Search</span>
          </button>

          <button
            onClick={onOpenSaveView}
            className="h-8 px-3 rounded-md bg-white border border-line text-[11.5px] font-semibold text-ink hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-600" />
            <span>Save View</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 px-3 rounded-md bg-[#671021] hover:bg-[#520d1a] text-white text-[11.5px] font-bold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function UnavailableFilter({
  label,
}: {
  label: string;
}) {
  return (
    <button
      type="button"
      disabled
      title={`${label} filter is not available from an authoritative source yet.`}
      className="h-8 px-2.5 bg-slate-50 border border-line rounded-md text-[11px] text-slate-400 font-medium cursor-not-allowed"
    >
      {label}: —
    </button>
  );
}