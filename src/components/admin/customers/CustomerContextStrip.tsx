"use client";

import React, {
  useMemo,
} from "react";
import {
  Lock,
  RefreshCw,
} from "lucide-react";
import {
  useAdminContext,
} from "@/contexts/AdminContext";

interface CustomerContextStripProps {
  tenant?: string;
  ecosystem?: string;
  businessUnit?: string;
  salesChannels?: string;
  region?: string;
  currency?: string;
  customerScope?: string;
  recordVersion?: string;
  lastSynced?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function CustomerContextStrip({
  tenant: tenantOverride,
  ecosystem: ecosystemOverride,
  businessUnit: businessUnitOverride,
  salesChannels: salesChannelsOverride,
  region: regionOverride,
  currency: currencyOverride,
  customerScope = "Tenant Customer Record",
  recordVersion,
  lastSynced,
  onRefresh,
  isRefreshing = false,
}: CustomerContextStripProps) {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
  } = useAdminContext();

  const syncedAt = useMemo(
    () =>
      lastSynced ??
      new Date().toLocaleString(),
    [lastSynced],
  );

  const contextValues = {
    tenant:
      tenantOverride ??
      tenant?.name ??
      "Current Tenant",

    ecosystem:
      ecosystemOverride ??
      ecosystem?.name ??
      "Current Ecosystem",

    businessUnit:
      businessUnitOverride ??
      businessUnit?.name ??
      "All Business Units",

    salesChannels:
      salesChannelsOverride ??
      channel?.name ??
      "All Channels",

    region:
      regionOverride ?? "—",

    currency:
      currencyOverride ?? "—",

    customerScope,

    recordVersion:
      recordVersion ?? "—",
  };

  return (
    <div className="bg-white border border-line rounded-lg px-3 py-2 text-[11px] font-medium text-slate-600 flex flex-wrap items-center justify-between gap-y-1.5 shadow-2xs">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <div>
          <span className="text-slate-400 font-mono text-[10px] uppercase">
            Tenant
          </span>

          <span className="ml-1.5 font-bold text-slate-800">
            {contextValues.tenant}
          </span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[10px] uppercase">
            Ecosystem
          </span>

          <span className="ml-1.5 font-bold text-slate-800">
            {contextValues.ecosystem}
          </span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[10px] uppercase">
            Business Unit
          </span>

          <span className="ml-1.5 font-bold text-slate-800">
            {contextValues.businessUnit}
          </span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[10px] uppercase">
            Sales Channels
          </span>

          <span className="ml-1.5 font-bold text-slate-800">
            {contextValues.salesChannels}
          </span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[10px] uppercase">
            Region
          </span>

          <span className="ml-1.5 font-bold text-slate-800">
            {contextValues.region}
          </span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[10px] uppercase">
            Currency
          </span>

          <span className="ml-1.5 font-bold text-slate-800">
            {contextValues.currency}
          </span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[10px] uppercase">
            Customer Scope
          </span>

          <span className="ml-1.5 font-bold text-slate-800">
            {contextValues.customerScope}
          </span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[10px] uppercase">
            Record Version
          </span>

          <span className="ml-1.5 font-bold text-slate-800">
            {contextValues.recordVersion}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[10.5px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />

          <span className="font-bold text-emerald-700">
            Live Data
          </span>
        </div>

        <div className="text-slate-400 font-mono">
          Last Synced{" "}
          <span className="text-slate-700 font-semibold">
            {syncedAt}
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <Lock className="w-3 h-3 text-slate-400" />

          <span className="text-[10px] italic">
            Access limited to assigned business context
          </span>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-ink transition-colors disabled:opacity-50"
            title="Refresh Context Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}