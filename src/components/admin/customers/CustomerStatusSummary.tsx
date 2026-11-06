"use client";

import React from "react";
import { MoreVertical, AlertTriangle, RefreshCw } from "lucide-react";
import { CustomerStatusSummaryData } from "@/types/customer";

interface CustomerStatusSummaryProps {
  statusSummary?: CustomerStatusSummaryData | null;
  onStatusClick?: (status: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function CustomerStatusSummary({
  statusSummary,
  onStatusClick,
  isLoading = false,
  error = null,
  onRetry,
}: CustomerStatusSummaryProps) {
  const active = statusSummary?.active ?? 0;
  const dormant = statusSummary?.dormant ?? 0;

  const statuses = [
    {
      label: "Active",
      count: active,
      available: true,
      color: "bg-emerald-600",
    },
    {
      label: "Verification Pending",
      count: statusSummary?.verificationPending ?? null,
      available:
        statusSummary?.verificationPending !== null &&
        statusSummary?.verificationPending !== undefined,
      color: "bg-amber-500",
    },
    {
      label: "Dormant",
      count: dormant,
      available: true,
      color: "bg-[#671021]",
    },
    {
      label: "Restricted",
      count: statusSummary?.restricted ?? null,
      available:
        statusSummary?.restricted !== null &&
        statusSummary?.restricted !== undefined,
      color: "bg-rose-600",
    },
    {
      label: "Cases",
      count: statusSummary?.cases ?? null,
      available:
        statusSummary?.cases !== null &&
        statusSummary?.cases !== undefined,
      color: "bg-purple-600",
    },
    {
      label: "Returns",
      count: statusSummary?.returns ?? null,
      available:
        statusSummary?.returns !== null &&
        statusSummary?.returns !== undefined,
      color: "bg-sky-600",
    },
  ];

  const availableCounts = statuses
    .filter((item) => item.available)
    .map((item) => item.count as number);

  const maxValue = Math.max(...availableCounts, 1);

  const formatScale = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toString();
  };

  return (
    <div className="bg-white border border-line rounded-lg p-4 shadow-sm flex flex-col justify-between h-full min-w-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[12px] font-bold text-ink uppercase tracking-wider font-mono">
          Customer Status Summary
        </h3>
        <button className="p-1 hover:bg-slate-100 rounded text-slate-400">
          <MoreVertical size={14} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 my-auto py-2 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="space-y-1">
              <div className="h-3 bg-slate-200 rounded w-1/3" />
              <div className="h-2 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="my-auto py-4 text-center space-y-2">
          <AlertTriangle size={24} className="text-amber-500 mx-auto" />
          <p className="text-[11px] text-slate-600 font-mono">Unable to load status metrics</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold rounded inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} /> Retry
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5 my-auto text-[11px]">
          {statuses.map((item) => {
              const widthPct =
                item.available && typeof item.count === "number"
                  ? (item.count / maxValue) * 100
                  : 0;
            return (
              <div
                key={item.label}
                onClick={() => onStatusClick?.(item.label)}
                className="cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors"
              >
                <div className="flex justify-between items-center mb-1 text-[10px]">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="font-bold font-mono text-slate-800">
                    {item.available && typeof item.count === "number"
                      ? item.count.toLocaleString()
                      : "—"}
                  </span>               
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between text-[9px] font-mono text-slate-400 pt-2 border-t border-line">
        <span>0</span>
        <span>{formatScale(Math.round(maxValue * 0.33))}</span>
        <span>{formatScale(Math.round(maxValue * 0.66))}</span>
        <span>{formatScale(maxValue)}</span>
      </div>
    </div>
  );
}
