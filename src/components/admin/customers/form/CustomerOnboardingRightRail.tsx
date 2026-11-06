"use client";

import React from "react";

import {
  AlertCircle,
  AlertTriangle,
  Eye,
  Save,
  ShieldAlert,
} from "lucide-react";

import { CustomerFormFullData } from "@/types/customer-form";

interface CustomerOnboardingRightRailProps {
  data: CustomerFormFullData;
  showToast: (msg: string) => void;
  onSaveDraft: () => void;
  onValidate: () => void;
  onPreview: () => void;
  onSaveAndContinue: () => void;
  isSaving?: boolean;
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

export function CustomerOnboardingRightRail({
  data,
  showToast,
  onSaveDraft,
  onValidate,
  onPreview,
  onSaveAndContinue,
  isSaving = false,
}: CustomerOnboardingRightRailProps) {
  const {
    onboardingHealth,
    draftId,
    version,
    createdBy,
    lastAutosave,
  } = data;

  const progressList =
    onboardingHealth?.progressList ?? [];

  const blockingIssues =
    onboardingHealth?.blockingIssuesList ?? [];

  const warnings =
    onboardingHealth?.warningsList ?? [];

  const approvalReadiness =
    onboardingHealth?.approvalReadiness ?? null;

  const hasScore =
    typeof onboardingHealth?.score === "number";

  const score = hasScore
    ? Math.min(
        100,
        Math.max(
          0,
          onboardingHealth!.score!,
        ),
      )
    : null;

  const radius = 18;
  const circumference =
    2 * Math.PI * radius;

  const scoreOffset =
    score !== null
      ? circumference *
        (1 - score / 100)
      : circumference;

  const handleUnavailableAction = (
    label: string,
  ) => {
    showToast(
      `${label} is not available from this screen yet.`,
    );
  };

  return (
    <div className="flex flex-col gap-3.5 text-[11px] w-full">
      {/* SECTION A: Customer Onboarding Health */}
      <div className="bg-white border border-line rounded-lg p-3.5 shadow-2xs">
        <h4 className="text-[10.5px] font-bold text-ink uppercase tracking-wider font-mono mb-2">
          Customer Onboarding Health
        </h4>

        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100 mb-2.5">
          <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-12 h-12 transform -rotate-90"
              viewBox="0 0 48 48"
            >
              <circle
                cx="24"
                cy="24"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="4"
                fill="transparent"
              />

              {score !== null && (
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={
                    circumference
                  }
                  strokeDashoffset={
                    scoreOffset
                  }
                  strokeLinecap="round"
                  fill="transparent"
                  className="text-emerald-600"
                />
              )}
            </svg>

            <span className="absolute text-[13px] font-black text-ink font-mono">
              {score ?? "—"}
            </span>
          </div>

          <div className="flex flex-col text-[10px]">
            <span className="font-bold text-slate-800 text-[11.5px]">
              {score !== null
                ? `${score} / 100`
                : "—"}
            </span>

            <span className="font-semibold text-slate-500">
              {displayValue(
                onboardingHealth?.statusText,
              )}
            </span>
          </div>
        </div>

        {progressList.length > 0 ? (
          <div className="space-y-1 text-[9.5px]">
            {progressList.map(
              (item) => {
                const pct = Math.min(
                  100,
                  Math.max(
                    0,
                    item.pct,
                  ),
                );

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-slate-600 font-medium">
                      {item.label}
                    </span>

                    <div className="flex items-center gap-2 w-28">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-500"
                          style={{
                            width: `${pct}%`,
                          }}
                        />
                      </div>

                      <span className="font-mono font-bold text-slate-800 text-[9px] w-6 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        ) : (
          <p className="text-[9.5px] text-slate-500">
            Onboarding health metrics are not connected.
          </p>
        )}
      </div>

      {/* SECTION B: Required Fields */}
      <div className="bg-white border border-line rounded-lg p-3.5 shadow-2xs">
        <h4 className="text-[10.5px] font-bold text-ink uppercase tracking-wider font-mono mb-2">
          Required Fields
        </h4>

        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
          <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-800 font-bold block text-[12px]">
              {displayValue(
                onboardingHealth
                  ?.requiredCompleted,
              )}
            </span>

            <span className="text-slate-600 font-sans text-[8.5px]">
              Completed
            </span>
          </div>

          <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-800 font-bold block text-[12px]">
              {displayValue(
                onboardingHealth
                  ?.requiredRemaining,
              )}
            </span>

            <span className="text-slate-600 font-sans text-[8.5px]">
              Remaining
            </span>
          </div>

          <div className="p-1.5 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-800 font-bold block text-[12px]">
              {displayValue(
                onboardingHealth
                  ?.requiredMissing,
              )}
            </span>

            <span className="text-slate-600 font-sans text-[8.5px]">
              Required Missing
            </span>
          </div>
        </div>
      </div>

      {/* SECTION C: Blocking Issues */}
      <div className="bg-white border border-line rounded-lg p-3.5 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10.5px] font-bold text-rose-700 uppercase tracking-wider font-mono">
            Blocking Issues
            {blockingIssues.length > 0
              ? ` (${blockingIssues.length})`
              : ""}
          </h4>

          <button
            type="button"
            onClick={() =>
              handleUnavailableAction(
                "Blocking issue details",
              )
            }
            className="text-[9px] font-bold text-[#671021] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        {blockingIssues.length > 0 ? (
          <div className="space-y-1.5 text-[10px]">
            {blockingIssues.map(
              (issue, index) => (
                <div
                  key={`${issue}-${index}`}
                  className="flex items-start gap-1.5 text-rose-700 bg-rose-50/70 p-1.5 rounded border border-rose-200/60"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-200 text-rose-800 text-[8.5px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>

                  <span className="font-semibold leading-tight">
                    {issue}
                  </span>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="flex items-start gap-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />

            <span>
              Blocking issue data is not available.
            </span>
          </div>
        )}
      </div>

      {/* SECTION D: Warnings */}
      <div className="bg-white border border-line rounded-lg p-3.5 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wider font-mono">
            Warnings
            {warnings.length > 0
              ? ` (${warnings.length})`
              : ""}
          </h4>

          <button
            type="button"
            onClick={() =>
              handleUnavailableAction(
                "Warning details",
              )
            }
            className="text-[9px] font-bold text-[#671021] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        {warnings.length > 0 ? (
          <div className="space-y-1 text-[10px]">
            {warnings.map(
              (warning, index) => (
                <div
                  key={`${warning}-${index}`}
                  className="flex items-start gap-1.5 text-amber-900"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />

                  <span>
                    {warning}
                  </span>
                </div>
              ),
            )}
          </div>
        ) : (
          <span className="text-[10px] text-slate-500">
            Warning data is not available.
          </span>
        )}
      </div>

      {/* SECTION E: Duplicate Risk */}
      <div className="bg-white border border-line rounded-lg p-3.5 shadow-2xs">
        <h4 className="text-[10.5px] font-bold text-ink uppercase tracking-wider font-mono mb-2">
          Duplicate Risk
        </h4>

        <div className="flex items-center justify-between text-[10px] gap-2">
          <span className="font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            {displayValue(
              onboardingHealth
                ?.duplicateRisk,
            )}
          </span>

          <button
            type="button"
            onClick={() =>
              showToast(
                "Duplicate comparison is not available from this screen yet.",
              )
            }
            className="px-2.5 py-1 bg-white border border-line rounded text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Compare
          </button>
        </div>
      </div>

      {/* SECTION F: Approval Readiness */}
      <div className="bg-white border border-line rounded-lg p-3.5 shadow-2xs">
        <div className="flex items-center gap-1.5 mb-2">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />

          <h4 className="text-[10.5px] font-bold text-ink uppercase tracking-wider font-mono">
            Approval Readiness
          </h4>
        </div>

        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">
              Status
            </span>

            <span className="font-bold text-slate-700">
              {displayValue(
                approvalReadiness?.status,
              )}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-slate-500">
              Reviewer
            </span>

            <span className="font-semibold text-slate-800">
              {displayValue(
                approvalReadiness?.reviewer,
              )}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-slate-500">
              Approval Path
            </span>

            <span className="font-semibold text-slate-800 text-[9.5px] text-right">
              {displayValue(
                approvalReadiness
                  ?.approvalPath,
              )}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-slate-500">
              Estimated SLA
            </span>

            <span className="font-mono text-slate-700">
              {displayValue(
                approvalReadiness
                  ?.estimatedSla,
              )}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-slate-500">
              Required documents
            </span>

            <span className="font-mono font-bold text-slate-700">
              {typeof approvalReadiness
                ?.requiredDocumentsMissing ===
              "number"
                ? `${approvalReadiness.requiredDocumentsMissing} missing`
                : "—"}
            </span>
          </div>
        </div>

        {!approvalReadiness && (
          <p className="text-[9.5px] text-slate-500 mt-2 pt-2 border-t border-line">
            Approval readiness is not connected to this screen.
          </p>
        )}
      </div>

      {/* SECTION G: Autosave & Version */}
      <div className="bg-white border border-line rounded-lg p-3.5 shadow-2xs">
        <h4 className="text-[10.5px] font-bold text-ink uppercase tracking-wider font-mono mb-2">
          Autosave & Version
        </h4>

        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">
              Draft ID
            </span>

            <span className="font-mono font-bold text-slate-800">
              {displayValue(
                draftId,
              )}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-slate-500">
              Last Autosave
            </span>

            <span className="font-mono text-slate-700">
              {displayValue(
                lastAutosave,
              )}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-slate-500">
              Version
            </span>

            <span className="font-mono text-slate-700">
              {displayValue(
                version,
              )}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-slate-500">
              Created By
            </span>

            <span className="font-bold text-slate-800">
              {displayValue(
                createdBy,
              )}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION H: Final Actions */}
      <div className="bg-white border border-line rounded-lg p-3.5 shadow-2xs flex flex-col gap-1.5">
        <h4 className="text-[10.5px] font-bold text-ink uppercase tracking-wider font-mono mb-1">
          Final Actions
        </h4>

        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="w-full py-1.5 bg-white border border-line rounded text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center disabled:opacity-50"
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </span>
        </button>

        <button
          type="button"
          onClick={onValidate}
          className="w-full py-1.5 bg-white border border-line rounded text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
        >
          Validate Customer
        </button>

        <button
          type="button"
          onClick={onPreview}
          className="w-full py-1.5 bg-white border border-line rounded text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Preview Customer
          </span>
        </button>

        <button
          type="button"
          onClick={onSaveAndContinue}
          disabled={isSaving}
          className="w-full py-1.5 bg-[#671021] text-white rounded text-[11px] font-bold hover:bg-[#520d1a] transition-colors cursor-pointer text-center disabled:opacity-50"
        >
          Save & Continue
        </button>

        <button
          type="button"
          disabled
          className="w-full py-1.5 bg-slate-100 text-slate-400 border border-slate-200 rounded text-[11px] font-bold text-center cursor-not-allowed"
          title="Approval submission is not connected to this screen."
        >
          Submit for Approval
        </button>
      </div>
    </div>
  );
}