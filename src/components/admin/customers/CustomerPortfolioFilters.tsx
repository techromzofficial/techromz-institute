"use client";

import React from "react";
import { Search, SlidersHorizontal, RotateCcw, Bookmark, RefreshCw } from "lucide-react";
import { CustomerFilterState } from "@/types/customer";

interface CustomerPortfolioFiltersProps {
  filters: CustomerFilterState;
  onChange: (updated: Partial<CustomerFilterState>) => void;
  onClearAll: () => void;
  onOpenSaveView: () => void;
  onOpenMoreFilters: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function CustomerPortfolioFilters({
  filters,
  onChange,
  onClearAll,
  onOpenSaveView,
  onOpenMoreFilters,
  onRefresh,
  isRefreshing,
}: CustomerPortfolioFiltersProps) {
  return (
    <div className="bg-white border border-line rounded-t-lg p-3 border-b-0 space-y-2.5">
      {/* Search Input & Select Dropdowns Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, phone, ID..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            className="w-full h-8 pl-9 pr-3 rounded border border-line text-[11.5px] font-medium text-ink placeholder:text-slate-400 focus:outline-none focus:border-[#671021]"
          />
        </div>

        {/* Segment */}
        <select
          value={filters.segment}
          onChange={(e) => onChange({ segment: e.target.value })}
          className="h-8 px-2.5 rounded border border-line text-[11px] font-semibold text-slate-700 bg-white focus:outline-none"
        >
          <option value="All">Segment: All</option>
          <option value="Active">Active</option>
          <option value="New">New</option>
          <option value="Repeat">Repeat</option>
          <option value="Loyalty">Loyalty</option>
          <option value="High-Value">High-Value</option>
          <option value="Dormant">Dormant</option>
          <option value="Restricted">Restricted</option>
        </select>

        {/* Customer Type */}
        <select
          value={filters.customerType}
          onChange={(e) => onChange({ customerType: e.target.value })}
          className="h-8 px-2.5 rounded border border-line text-[11px] font-semibold text-slate-700 bg-white focus:outline-none"
        >
          <option value="All">Customer Type: All</option>
          <option value="Individual">Individual</option>
          <option value="Business">Business</option>
          <option value="VIP">VIP</option>
        </select>

        {/* Region */}
        <select
          value={filters.region}
          onChange={(e) => onChange({ region: e.target.value })}
          className="h-8 px-2.5 rounded border border-line text-[11px] font-semibold text-slate-700 bg-white focus:outline-none"
        >
          <option value="All">Region: All</option>
          <option value="Western">Western Province</option>
          <option value="Central">Central Province</option>
          <option value="Southern">Southern Province</option>
          <option value="Northern">Northern Province</option>
          <option value="Eastern">Eastern Province</option>
        </select>

        {/* Sales Channel */}
        <select
          value={filters.salesChannel}
          onChange={(e) => onChange({ salesChannel: e.target.value })}
          className="h-8 px-2.5 rounded border border-line text-[11px] font-semibold text-slate-700 bg-white focus:outline-none"
        >
          <option value="All">Channel: All</option>
          <option value="Mobile App">Mobile App</option>
          <option value="Website">Website</option>
          <option value="B2B Portal">B2B Portal</option>
        </select>

        {/* Loyalty Tier */}
        <select
          value={filters.loyaltyTier}
          onChange={(e) => onChange({ loyaltyTier: e.target.value })}
          className="h-8 px-2.5 rounded border border-line text-[11px] font-semibold text-slate-700 bg-white focus:outline-none"
        >
          <option value="All">Loyalty Tier: All</option>
          <option value="Platinum">Platinum</option>
          <option value="Gold">Gold</option>
          <option value="Silver">Silver</option>
          <option value="Bronze">Bronze</option>
        </select>

        {/* Verification Status */}
        <select
          value={filters.verificationStatus}
          onChange={(e) => onChange({ verificationStatus: e.target.value })}
          className="h-8 px-2.5 rounded border border-line text-[11px] font-semibold text-slate-700 bg-white focus:outline-none"
        >
          <option value="All">Verification: All</option>
          <option value="Verified">Verified</option>
          <option value="Verification Pending">Verification Pending</option>
          <option value="Unverified">Unverified</option>
        </select>

        {/* Risk Level */}
        <select
          value={filters.riskLevel}
          onChange={(e) => onChange({ riskLevel: e.target.value })}
          className="h-8 px-2.5 rounded border border-line text-[11px] font-semibold text-slate-700 bg-white focus:outline-none"
        >
          <option value="All">Risk Level: All</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>
        </select>

        {/* Owner */}
        <select
          value={filters.owner}
          onChange={(e) => onChange({ owner: e.target.value })}
          className="h-8 px-2.5 rounded border border-line text-[11px] font-semibold text-slate-700 bg-white focus:outline-none"
        >
          <option value="Any">Owner: Any</option>
          <option value="Rachel Dias">Rachel Dias</option>
          <option value="Waleed Perera">Waleed Perera</option>
          <option value="Iruro Silva">Iruro Silva</option>
        </select>

        {/* Filter Action Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={onOpenMoreFilters}
            className="h-8 px-2.5 rounded border border-line bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
          >
            <SlidersHorizontal size={13} /> More Filters
          </button>
          <button
            onClick={onClearAll}
            className="h-8 px-2.5 rounded border border-line bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
          >
            <RotateCcw size={12} /> Clear All
          </button>
          <button
            onClick={onOpenSaveView}
            className="h-8 px-2.5 rounded border border-line bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
          >
            <Bookmark size={13} /> Save View
          </button>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-8 px-3 rounded bg-[#671021] text-white text-[11px] font-bold hover:bg-[#520d1a] flex items-center gap-1 shadow-xs disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
