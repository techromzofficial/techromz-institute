"use client";

import React from "react";
import { Lock, RefreshCw } from "lucide-react";
import { useAdminContext } from "@/contexts/AdminContext";

interface CustomerContextFiltersProps {
  lastSynced: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function CustomerContextFilters({
  lastSynced,
  isRefreshing,
  onRefresh,
}: CustomerContextFiltersProps) {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
  } = useAdminContext();

  return (
    <div className="bg-white border-b border-line px-6 py-2 shadow-2xs overflow-x-auto scrollbar-thin">
      <div className="flex items-center justify-between min-w-[1180px] gap-3 text-[11px]">
        <div className="flex items-center gap-3">
          <ContextValue
            label="Tenant"
            value={tenant?.name ?? "Current Tenant"}
          />

          <Divider />

          <ContextValue
            label="Ecosystem"
            value={ecosystem?.name ?? "Current Ecosystem"}
          />

          <Divider />

          <ContextValue
            label="Business Unit"
            value={businessUnit?.name ?? "All Business Units"}
          />

          <Divider />

          <ContextValue
            label="Sales Channel"
            value={channel?.name ?? "All Channels"}
          />

          <Divider />

          <ContextValue
            label="Region"
            value="—"
          />

          <Divider />

          <ContextValue
            label="Currency"
            value="—"
          />

          <Divider />

          <ContextValue
            label="Customer Scope"
            value="Tenant Customers"
          />

          <Divider />

          <ContextValue
            label="Date Range"
            value="Current Snapshot"
          />
        </div>

        <div className="flex items-center gap-3.5 ml-auto text-[10.5px]">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Data</span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <span>Sector Pack</span>
            <span className="font-mono font-bold text-slate-800">
              {sectorPack?.name ?? "—"}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <span>Last Synced</span>
            <span className="font-semibold text-slate-700 font-mono">
              {lastSynced}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 text-[10px]">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Access limited to assigned business context</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1 rounded text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors disabled:opacity-50"
            title="Sync live customer data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing
                  ? "animate-spin text-[#671021]"
                  : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function ContextValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col justify-center">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </span>

      <span className="font-bold text-slate-800 text-[11px] leading-tight whitespace-nowrap">
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div className="h-5 w-px bg-slate-200" />
  );
}