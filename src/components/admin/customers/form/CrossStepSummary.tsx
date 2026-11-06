"use client";

import React from "react";
import { CustomerWorkflowStep } from "@/types/customer-form";
import { Check, AlertTriangle, X } from "lucide-react";

export type CustomerStepStatusType =
  | "complete"
  | "in-progress"
  | "partial"
  | "blocked"
  | "not-ready";

export interface CrossStepSummaryProps {
  steps: CustomerWorkflowStep[];
  className?: string;
}

export function CrossStepSummary({ steps, className = "" }: CrossStepSummaryProps) {
  return (
    <section className={`cross-step-summary-card bg-white border border-line rounded-lg p-3.5 shadow-2xs w-full min-w-0 overflow-hidden ${className}`}>
      {/* Title */}
      <div className="cross-step-summary-title text-[11.5px] font-bold text-ink uppercase tracking-wider font-mono mb-3">
        Cross-Step Summary
      </div>

      {/* 13-Step Horizontal Row Container */}
      <div className="cross-step-summary-scroll w-full min-w-0 overflow-x-auto overflow-y-hidden scrollbar-thin">
        <div
          className="cross-step-summary-grid grid min-w-[1100px] w-full divide-x divide-line/70 py-1 items-stretch"
          style={{ display: "grid", gridTemplateColumns: "repeat(13, minmax(82px, 1fr))" }}
        >
          {steps.map((step) => {
            const isComplete = step.completionPct === 100;
            const isInProgress = step.statusText === "In Progress";
            const isBlocked = step.status === "Blocked";
            const isNotReady = step.statusText === "Not Ready";

            let circleBg = "bg-amber-500 text-white";
            let statusTextColor = "text-amber-600";
            let IconComponent: React.ComponentType<{ className?: string }> = AlertTriangle;

            if (isComplete) {
              circleBg = "bg-emerald-600 text-white";
              statusTextColor = "text-emerald-600";
              IconComponent = Check;
            } else if (isInProgress) {
              circleBg = "bg-[#671021] text-white";
              statusTextColor = "text-[#671021]";
              IconComponent = Check;
            } else if (isBlocked) {
              circleBg = "bg-rose-600 text-white";
              statusTextColor = "text-rose-600";
              IconComponent = Check;
            } else if (isNotReady) {
              circleBg = "bg-slate-500 text-white";
              statusTextColor = "text-slate-500";
              IconComponent = X;
            } else if (step.id === "validation-risk") {
              circleBg = "bg-rose-600 text-white";
              statusTextColor = "text-amber-600";
              IconComponent = X;
            }

            const displayLabel = getShortStepLabel(step.label);

            return (
              <div
                key={step.id}
                className="cross-step-summary-item flex flex-col items-center justify-between px-1.5 py-1 text-center min-w-[82px] hover:bg-slate-50/80 transition-colors group cursor-pointer"
              >
                {/* Top Row: Filled Circle Icon + Step Name */}
                <div className="flex items-center justify-center gap-1 w-full min-h-[22px]">
                  <div className={`w-3.5 h-3.5 rounded-full ${circleBg} flex items-center justify-center flex-shrink-0 shadow-2xs`}>
                    <IconComponent className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span
                    className="text-[9.5px] font-bold text-slate-800 truncate leading-tight group-hover:text-[#671021] transition-colors"
                    title={step.label}
                  >
                    {displayLabel}
                  </span>
                </div>

                {/* Middle Row: Percentage Value */}
                <span
                  className={`text-[13px] font-black font-mono my-1 ${
                    isInProgress ? "text-[#671021]" : "text-slate-900"
                  }`}
                >
                  {step.completionPct}%
                </span>

                {/* Bottom Row: Status Label */}
                <span className={`text-[9px] font-bold ${statusTextColor} leading-tight block w-full truncate`}>
                  {step.statusText}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Helper function to map full step labels to compact short names matching Image 4 */
function getShortStepLabel(label: string): string {
  switch (label) {
    case "Customer Type":
      return "Customer Type";
    case "Basic Identity":
      return "Basic Identity";
    case "Contact Information":
      return "Contact Info";
    case "Addresses":
      return "Addresses";
    case "Business Context":
      return "Business Context";
    case "Verification Requirements":
      return "Verification";
    case "Communication Preferences":
      return "Comm. Prefs";
    case "Consent & Privacy":
      return "Consent & Privacy";
    case "Loyalty & Membership":
      return "Loyalty & Membership";
    case "Segments":
      return "Segments";
    case "Customer Ownership":
      return "Ownership";
    case "Validation & Risk":
      return "Validation & Risk";
    case "Review & Save":
      return "Review & Save";
    default:
      return label;
  }
}
