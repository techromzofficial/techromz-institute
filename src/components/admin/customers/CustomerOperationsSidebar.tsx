"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { CustomerRightRailSectionData } from "@/types/customer";

interface CustomerOperationsSidebarProps {
  data?: CustomerRightRailSectionData;
  onFilterClick?: (type: string, value: string) => void;
  onOpenAddCustomer?: () => void;
  onExportReport?: () => void;
  onActionClick?: (actionKey: string) => void;
  showToast?: (msg: string) => void;
}

export function CustomerOperationsSidebar({
  data,
  onFilterClick,
  onOpenAddCustomer,
  onExportReport,
  onActionClick,
  showToast = (msg: string) => console.log(msg),
}: CustomerOperationsSidebarProps) {
  const healthScore = data?.healthScore ?? 0;
  const healthGrade = data?.healthGrade ?? "N/A";
  const healthTitle = data?.healthTitle ?? "Customer Operations Health";

  const healthMetrics = data?.healthBars ?? [];

  const alerts = data?.alerts ?? [];
  const alertsTitle = data?.alertsTitle ?? "Priority Customer Alerts";

  return (
    <div className="flex flex-col gap-4 min-w-0">
      {/* A. Health Scorecard Panel */}
      <div className="bg-white border border-line rounded-lg p-3.5 shadow-sm text-[11px]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono">
            {healthTitle}
          </h4>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-black font-mono text-ink">
            {healthScore > 0 ? `${healthScore}/100` : "—"}
          </span>
          <span className="text-[10px] font-bold text-slate-500 font-mono">
            {healthGrade}
          </span>
        </div>

        <div className="space-y-2">
          {healthMetrics.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-center">
              <span className="text-[9.5px] font-medium text-slate-400">
                Health metrics are not available from an authoritative source yet.
              </span>
            </div>
          ) : (
            healthMetrics.map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-600 font-medium">{item.label}</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {item.val}%
                  </span>
                </div>

                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${item.val}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() =>
            showToast(
              healthMetrics.length > 0
                ? "Opening Full Customer Health Dashboard..."
                : "Customer health metrics are not available yet."
            )
          }          
          className="mt-3 pt-2 border-t border-line text-[10px] font-bold text-[#8F002B] hover:underline text-left block w-full"
                  >
          View full health details &rarr;
        </button>
      </div>

      {/* B. Priority Alerts */}
      <div className="bg-white border border-line rounded-lg p-3.5 shadow-sm text-[11px]">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono">
            {alertsTitle}
          </h4>
          <button
            onClick={() => showToast("Showing all priority customer alerts...")}
            className="text-[9.5px] font-bold text-[#8F002B] hover:underline"
          >
            View all alerts &rarr;
          </button>
        </div>

        <div className="space-y-1.5">
          {alerts.length === 0 ? (
            <div className="p-3 text-center text-slate-400 font-mono text-[10.5px]">
              No priority customer alerts available
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => showToast(`Focused alert: ${alert.text}`)}
                className="flex items-center justify-between p-1.5 bg-slate-50 hover:bg-slate-100 rounded border border-slate-100 cursor-pointer transition-colors text-[10px]"
              >
                <div className="flex items-center gap-1.5 min-w-0 pr-1">
                  <AlertCircle size={12} className="text-amber-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-700 truncate" title={alert.text}>
                    {alert.text}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {alert.count !== undefined && (
                    <span className="font-bold font-mono text-slate-700 text-[9.5px]">{alert.count}</span>
                  )}
                  <span
                    className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                      alert.severity === "High"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* C. Dynamic Status Summaries */}
      {data?.summaries && data.summaries.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.summaries.map((sec, idx) => (
            <div key={idx} className="bg-white border border-line rounded-lg p-3 shadow-sm text-[10px]">
              <h5 className="font-bold text-ink uppercase font-mono mb-2 text-[10px]">{sec.title}</h5>
              <div className="space-y-1">
                {sec.items.map((it, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-1.5">
                      {it.color && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: it.color }} />}
                      <span className="text-slate-600">{it.label}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                      <span>{it.count}</span>
                      <span className="text-[9px] text-slate-400 font-normal">({it.pct})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* D. Quick Queues */}
      {data?.quickQueues && (
        <div className="bg-white border border-line rounded-lg p-3.5 shadow-sm text-[11px]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono">
              Quick Queues
            </h4>
            <button
              onClick={() => showToast("Opening operational queues...")}
              className="text-[9.5px] font-bold text-[#8F002B] hover:underline"
            >
              View all &rarr;
            </button>
          </div>

          <div className="space-y-1.5 text-[10px]">
            {data.quickQueues.map((q, idx) => (
              <div
                key={idx}
                onClick={() => onFilterClick?.("chip", q.label)}
                className="flex justify-between items-center p-1.5 hover:bg-slate-50 rounded cursor-pointer transition-colors"
              >
                <span className="font-semibold text-slate-700">{q.label}</span>
                <span className="font-bold font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[9.5px]">
                  {q.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
