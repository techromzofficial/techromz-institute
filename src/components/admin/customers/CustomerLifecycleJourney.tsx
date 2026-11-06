"use client";

import React from "react";
import { Check, AlertTriangle, ShieldAlert } from "lucide-react";
import { LifecycleNode } from "@/types/customer";

const DEFAULT_LIFECYCLE_NODES: LifecycleNode[] = [
  { id: "registered", stepNumber: 1, label: "Registered", status: "Upcoming" },
  { id: "profile_started", stepNumber: 2, label: "Profile Started", status: "Upcoming" },
  { id: "contact_verified", stepNumber: 3, label: "Contact Verified", status: "Upcoming" },
  { id: "identity_verified", stepNumber: 4, label: "Identity Verified", status: "Upcoming" },
  { id: "first_purchase", stepNumber: 5, label: "First Purchase", status: "Upcoming" },
  { id: "active_customer", stepNumber: 6, label: "Active Customer", status: "Upcoming" },
  { id: "repeat_customer", stepNumber: 7, label: "Repeat Customer", status: "Upcoming" },
  { id: "loyalty_member", stepNumber: 8, label: "Loyalty Member", status: "Upcoming" },
  { id: "high_value", stepNumber: 9, label: "High-Value Member", status: "Upcoming" },
  { id: "at_risk", stepNumber: 10, label: "At Risk", status: "Upcoming" },
  { id: "dormant", stepNumber: 11, label: "Dormant", status: "Upcoming" },
  { id: "restricted", stepNumber: 12, label: "Restricted", status: "Upcoming" },
];

interface CustomerLifecycleJourneyProps {
  nodes?: LifecycleNode[];
  title?: string;
  subtitle?: string;
}

export function CustomerLifecycleJourney({
  nodes,
  title = "Customer Lifecycle Journey",
  subtitle = "End-to-end lifecycle progression nodes from onboarding to retention",
}: CustomerLifecycleJourneyProps) {
  const displayNodes = nodes && nodes.length > 0 ? nodes : DEFAULT_LIFECYCLE_NODES;
  const hasAuthoritativeLifecycle = Boolean( nodes && nodes.length > 0,);
  return (
    <div className="bg-white border border-line rounded-lg p-3.5 sm:p-4 shadow-2xs w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono">
          {title}
        </h3>
        <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono hidden sm:inline">
          {subtitle}
        </span>
      </div>

      {!hasAuthoritativeLifecycle && (
      <div className="mb-3 rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-[9.5px] font-medium text-slate-400">
          Lifecycle metrics are not available from an authoritative source yet.
        </span>
      </div>
      )}

      <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[1100px] flex items-start justify-between relative px-6 py-2">
          {/* Centered Horizontal Connector Line */}
          <div className="absolute top-[22px] left-10 right-10 h-0.5 bg-slate-200 z-0" />

          {displayNodes.map((node) => {
            const isCompleted = node.status === "Completed";
            const isCurrent = node.status === "Current";
            const isWarning = node.status === "Warning";
            const isCritical = node.status === "Critical";

            let circleClass = "bg-slate-100 border-slate-300 text-slate-400";
            if (isCompleted) {
              circleClass = "bg-emerald-500 border-emerald-500 text-white shadow-2xs";
            } else if (isCurrent) {
              circleClass = "bg-amber-500 border-amber-500 text-white ring-4 ring-amber-100 shadow-2xs";
            } else if (isWarning) {
              circleClass = "bg-amber-50 border-2 border-amber-400 text-amber-700";
            } else if (isCritical) {
              circleClass = "bg-rose-500 border-rose-500 text-white ring-4 ring-rose-100 shadow-2xs";
            }

            return (
              <div
                key={node.id}
                className="flex-1 flex flex-col items-center text-center relative z-10 min-w-[70px] max-w-[85px] group cursor-pointer"
              >
                {/* Node Circle */}
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${circleClass}`}
                >
                  {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  {isCurrent && <span className="font-mono">{node.stepNumber}</span>}
                  {isWarning && <AlertTriangle className="w-3.5 h-3.5" />}
                  {isCritical && <ShieldAlert className="w-3.5 h-3.5" />}
                  {!isCompleted && !isCurrent && !isWarning && !isCritical && (
                    <span className="font-mono text-slate-400 text-[10px]">{node.stepNumber}</span>
                  )}
                </div>

                {/* Stage Label */}
                <span className="text-[10px] font-bold text-slate-800 mt-2 leading-tight block text-center max-w-[80px] break-words group-hover:text-[#8F002B] transition-colors">
                  {node.label}
                </span>

                {/* Node Count */}
                {node.count !== undefined && (
                  <span className="mt-0.5 text-[9px] font-mono font-bold text-[#8F002B] block text-center">
                    {node.count}
                  </span>
                )}

                {/* Stage Date */}
                {node.date && (
                  <span className="mt-0.5 text-[8.5px] font-mono text-slate-400 block text-center">
                    {node.date}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
