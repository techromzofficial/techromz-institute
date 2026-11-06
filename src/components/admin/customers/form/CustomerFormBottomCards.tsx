"use client";

import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import { CustomerFormFullData } from "@/types/customer-form";
import { CrossStepSummary } from "./CrossStepSummary";

interface BottomCardProps {
  data: CustomerFormFullData;
  showToast: (msg: string) => void;
}

function displayValue(
  value?: string | number | null,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return String(value);
}

/* 1. Business Context Assignment Card */
export function CustomerBusinessContextCard({
  data,
}: BottomCardProps) {
  const { businessContext } = data;

  const eligiblePrograms =
    businessContext?.eligiblePrograms ?? [];

  return (
    <div className="bg-white border border-line rounded-lg p-3.5 shadow-2xs h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#671021]" />

          <h4 className="text-[10.5px] font-bold text-ink uppercase tracking-wider font-mono">
            Business Context Assignment
          </h4>
        </div>

        <div className="space-y-2 text-[10.5px]">
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-500 font-medium">
              Business Unit
            </span>

            <span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              {displayValue(
                businessContext?.businessUnit,
              )}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-500 font-medium">
              Sales Channels
            </span>

            <span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-[10px]">
              {displayValue(
                businessContext?.salesChannels,
              )}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-500 font-medium">
              Region
            </span>

            <span className="font-semibold text-slate-800">
              {displayValue(
                businessContext?.region,
              )}
            </span>
          </div>

          <div className="pt-1.5 border-t border-line/60">
            <span className="text-slate-400 font-mono text-[9.5px] uppercase block mb-1">
              Eligible Programs
            </span>

            {eligiblePrograms.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 font-bold text-[9.5px]">
                {eligiblePrograms.map(
                  (program) => (
                    <span
                      key={program}
                      className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      {program}
                    </span>
                  ),
                )}
              </div>
            ) : (
              <span className="text-[10px] text-slate-500">
                Business context is not connected.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2. Validation & Duplicate Intelligence Card */
export function CustomerDuplicateIntelligenceCard({
  data,
}: BottomCardProps) {
  const {
    duplicateIntelligence,
  } = data;

  const hasMatchScore =
    typeof duplicateIntelligence?.matchScore ===
    "number";

  const matchScore =
    hasMatchScore
      ? Math.min(
          100,
          Math.max(
            0,
            duplicateIntelligence!.matchScore!,
          ),
        )
      : null;

  const radius = 28;
  const circumference =
    2 * Math.PI * radius;

  const dashOffset =
    matchScore !== null
      ? circumference *
        (1 - matchScore / 100)
      : circumference;

  const hasValidationFindings =
    typeof duplicateIntelligence
      ?.validationFindingsPassed ===
      "number" &&
    typeof duplicateIntelligence
      ?.validationFindingsTotal ===
      "number";

  return (
    <div className="bg-white border border-line rounded-lg p-3.5 shadow-2xs h-full flex flex-col justify-between overflow-hidden relative">
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <AlertCircle className="w-3.5 h-3.5 text-slate-500" />

          <h4 className="text-[10.5px] font-bold text-ink uppercase tracking-wider font-mono">
            Validation & Duplicate Intelligence
          </h4>
        </div>

        <div className="grid grid-cols-12 gap-3 items-center w-full">
          <div className="col-span-4 flex items-center justify-center min-w-0">
            <div className="relative w-[76px] h-[76px] flex items-center justify-center flex-shrink-0">
              <svg
                viewBox="0 0 76 76"
                className="w-[76px] h-[76px] transform -rotate-90 block"
              >
                <circle
                  cx="38"
                  cy="38"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="5"
                  fill="transparent"
                />

                {matchScore !== null && (
                  <circle
                    cx="38"
                    cy="38"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeDasharray={
                      circumference
                    }
                    strokeDashoffset={
                      dashOffset
                    }
                    strokeLinecap="round"
                    fill="transparent"
                    className="text-emerald-600"
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[14px] font-black text-ink font-mono block leading-none">
                  {matchScore !== null
                    ? `${matchScore}%`
                    : "—"}
                </span>

                <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5 block whitespace-nowrap">
                  Match Score
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-8 space-y-1.5 text-[10px] min-w-0">
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500 font-medium">
                Legal Name Match
              </span>

              <span className="font-bold text-slate-700">
                {displayValue(
                  duplicateIntelligence
                    ?.legalNameMatch,
                )}
              </span>
            </div>

            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500 font-medium">
                Email Match
              </span>

              <span className="font-bold text-slate-700">
                {displayValue(
                  duplicateIntelligence
                    ?.emailMatch,
                )}
              </span>
            </div>

            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500 font-medium">
                Phone Match
              </span>

              <span className="font-bold text-slate-700">
                {displayValue(
                  duplicateIntelligence
                    ?.phoneMatch,
                )}
              </span>
            </div>

            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500 font-medium">
                Risk Level
              </span>

              <span className="font-bold text-slate-700">
                {displayValue(
                  duplicateIntelligence
                    ?.riskLevel,
                )}
              </span>
            </div>

            <div className="flex justify-between items-center gap-2 pt-1.5 border-t border-line/60">
              <span className="text-slate-500 font-medium">
                Validation Findings
              </span>

              <span className="font-mono font-bold text-slate-800">
                {hasValidationFindings
                  ? `${duplicateIntelligence!.validationFindingsPassed} of ${duplicateIntelligence!.validationFindingsTotal} passed`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {!duplicateIntelligence && (
          <p className="text-[9.5px] text-slate-500 mt-2 pt-2 border-t border-line/60">
            Duplicate intelligence and risk
            validation are not connected to this
            Customer screen.
          </p>
        )}
      </div>
    </div>
  );
}

/* 3. Top Corrective Actions Card */
export function CustomerCorrectiveActionsCard({
  data,
  showToast,
}: BottomCardProps) {
  const {
    correctiveActions,
  } = data;

  return (
    <div className="bg-white border border-line rounded-lg p-3.5 shadow-2xs h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />

          <h4 className="text-[10.5px] font-bold text-ink uppercase tracking-wider font-mono">
            Top Corrective Actions
          </h4>
        </div>

        <div className="space-y-2 text-[10.5px]">
          {correctiveActions.length >
          0 ? (
            correctiveActions.map(
              (action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[9.5px] font-bold flex items-center justify-center flex-shrink-0">
                      {action.id}
                    </span>

                    <span className="font-bold text-slate-800 text-[10px] truncate">
                      {
                        action.description
                      }
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        "Corrective action execution is not available from this screen.",
                      )
                    }
                    className="text-[9.5px] font-bold text-slate-500 hover:underline cursor-pointer flex-shrink-0 ml-1"
                  >
                    Action
                  </button>
                </div>
              ),
            )
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-500">
              No authoritative corrective actions
              are available.
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          showToast(
            "Validation findings are not available from this screen yet.",
          )
        }
        className="mt-2 pt-1.5 border-t border-line text-[10px] font-bold text-[#671021] hover:underline flex items-center gap-1 cursor-pointer"
      >
        <span>
          View all findings
        </span>

        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

/* 4. Cross-Step Summary Card */
export function CustomerCrossStepSummary({
  data,
}: {
  data: CustomerFormFullData;
}) {
  return (
    <CrossStepSummary
      steps={data.workflowSteps}
    />
  );
}