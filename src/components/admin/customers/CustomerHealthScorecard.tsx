"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { CustomerHealthMetricItem } from "@/types/customer";

interface CustomerHealthScorecardProps {
  items?: CustomerHealthMetricItem[] | null;
  title?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const DEFAULT_HEALTH_LABELS = [
  "Identity Verification",
  "Profile Completeness",
  "Engagement",
  "Purchase Frequency",
  "Loyalty Participation",
  "Service Quality",
  "Return Risk",
  "Privacy Compliance",
  "Fraud Risk Control",
  "Retention Readiness",
];

export function CustomerHealthScorecard({
  items,
  title = "Customer Health Scorecard",
  isLoading = false,
  error = null,
  onRetry,
}: CustomerHealthScorecardProps) {
  const displayItems: CustomerHealthMetricItem[] = DEFAULT_HEALTH_LABELS.map((label) => {
    const found = items?.find((i) => i.label === label);
    return {
      label,
      val: found?.val ?? null,
      color: found?.color ?? "bg-emerald-500",
    };
  });

  return (
    <div className="bg-white border border-line rounded-lg p-3.5 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-[11px] font-black text-ink uppercase tracking-wider font-mono">
          {title} <span className="text-[10px] text-muted font-normal uppercase">(vs Target)</span>
        </h3>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-3 animate-pulse">
          {DEFAULT_HEALTH_LABELS.map((label) => (
            <div key={label} className="p-1.5 bg-slate-50 rounded border border-slate-100 h-12 flex flex-col justify-between">
              <div className="h-2 bg-slate-200 rounded w-2/3" />
              <div className="h-2 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-3 text-center space-y-1.5">
          <AlertTriangle size={18} className="text-amber-500 mx-auto" />
          <p className="text-[11px] text-slate-600 font-mono">Unable to load health metrics</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[9.5px] font-bold rounded inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={10} /> Retry
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-3">
          {displayItems.map((item) => {
            const hasVal = item.val !== null && item.val !== undefined && !isNaN(item.val);
            const safeVal = hasVal ? Math.max(0, Math.min(item.val!, 100)) : 0;
            const displayStr = hasVal ? `${safeVal}%` : "—";
            const barColor = !hasVal
              ? "bg-slate-300"
              : safeVal >= 85
              ? "bg-emerald-500"
              : safeVal >= 75
              ? "bg-amber-500"
              : "bg-rose-500";

            return (
              <div key={item.label} className="flex flex-col justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-[9.5px] font-medium text-slate-600 truncate mb-1" title={item.label}>
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${safeVal}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-[11px] text-slate-800">{displayStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
