"use client";

import React, { useState } from "react";
import {
  Download,
  Plus,
  Layers,
  ChevronDown,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  UserX,
} from "lucide-react";

interface HeaderActionItem {
  label: string;
  onClick?: () => void;
  primary?: boolean;
  variant?: "primary" | "outline" | "secondary";
}

interface CustomerCommandHeaderProps {
  title?: string;
  subtitle?: string;
  breadcrumbCurrent?: string;
  selectedCount?: number;
  onExportReport?: () => void;
  onOpenAddCustomer?: () => void;
  onBulkAction?: (action: string) => void;
  actions?: HeaderActionItem[];
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

export function CustomerCommandHeader({
  title = "Customer Management Command Center",
  subtitle = "Monitor customer network intelligence, lifecycle, identity, orders, loyalty, service, privacy, risk, and engagement across the beauty marketplace.",
  breadcrumbCurrent = "Command Center",
  selectedCount = 0,
  onExportReport,
  onOpenAddCustomer,
  onBulkAction,
  actions,
  primaryActionLabel,
  onPrimaryAction,
}: CustomerCommandHeaderProps) {
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  return (
    <div className="bg-white border-b border-line px-6 py-4 flex flex-col gap-3">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
            <span>Customers</span>
            <span>/</span>
            <span className="text-ink font-bold">{breadcrumbCurrent}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">
            {title}
          </h1>
          <p className="text-[13px] text-muted mt-1 max-w-4xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Custom Action Buttons if provided */}
          {actions ? (
            actions.map((act, idx) => {
              const isPrimary = act.primary || act.variant === "primary";
              return (
                <button
                  key={idx}
                  onClick={act.onClick}
                  className={`h-9 px-3.5 rounded-md text-[12px] font-bold flex items-center gap-1.5 transition-colors ${
                    isPrimary
                      ? "bg-[#8F002B] hover:bg-[#720022] text-white shadow-sm"
                      : "bg-white border border-line text-slate-700 hover:bg-slate-50 shadow-xs"
                  }`}
                >
                  {isPrimary && <Plus size={14} />}
                  <span>{act.label}</span>
                </button>
              );
            })
          ) : (
            <>
              {/* Default Export Report Button */}
              {onExportReport && (
                <button
                  onClick={onExportReport}
                  className="h-9 px-3.5 rounded-md bg-white border border-line text-[12px] font-semibold text-ink hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download size={14} className="text-slate-600" />
                  <span>Export Report</span>
                </button>
              )}

              {/* Bulk Actions Menu */}
              {onBulkAction && (
                <div className="relative">
                  <button
                    onClick={() => setIsBulkOpen(!isBulkOpen)}
                    disabled={selectedCount === 0}
                    className={`h-9 px-3.5 rounded-md border text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
                      selectedCount > 0
                        ? "bg-white border-line text-ink hover:bg-slate-50 cursor-pointer"
                        : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Layers size={14} />
                    <span>Bulk Actions ({selectedCount})</span>
                    <ChevronDown size={14} />
                  </button>

                  {isBulkOpen && selectedCount > 0 && (
                    <div className="absolute right-0 mt-1 w-52 bg-white rounded-md shadow-xl border border-line py-1 z-30 text-[12px] font-medium text-ink">
                      <button
                        onClick={() => {
                          onBulkAction("Verify Identity");
                          setIsBulkOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ShieldCheck size={14} className="text-emerald-600" /> Verify Identity
                      </button>
                      <button
                        onClick={() => {
                          onBulkAction("Re-assign Owner");
                          setIsBulkOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <UserPlus size={14} className="text-sky-600" /> Re-assign Customer Owner
                      </button>
                      <button
                        onClick={() => {
                          onBulkAction("Sync Consent");
                          setIsBulkOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <RefreshCw size={14} className="text-purple-600" /> Sync Consent Status
                      </button>
                      <div className="border-t border-line my-1" />
                      <button
                        onClick={() => {
                          onBulkAction("Restrict Selected");
                          setIsBulkOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 font-bold"
                      >
                        <UserX size={14} /> Restrict Selected Customers
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Primary Action Button */}
              {(onPrimaryAction || onOpenAddCustomer) && (
                <button
                  onClick={onPrimaryAction || onOpenAddCustomer}
                  className="h-9 px-4 rounded-md bg-[#8F002B] hover:bg-[#720022] text-white text-[12px] font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus size={15} />
                  <span>{primaryActionLabel || "+ Add Customer"}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
