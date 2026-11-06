"use client";

import React from "react";
import { CheckCircle2, ArrowLeft, ArrowRight, Eye } from "lucide-react";

interface CustomerStickyBottomBarProps {
  currentStepNumber: number;
  totalSteps: number;
  stepLabel: string;
  autosaveText: string;
  onCancel: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onSaveAndContinue: () => void;
  onValidate: () => void;
  onPreview: () => void;
  onSaveChanges: () => void;
  isSaving?: boolean;
  canSubmit?: boolean;
}

export function CustomerStickyBottomBar({
  currentStepNumber,
  totalSteps,
  stepLabel,
  autosaveText,
  onCancel,
  onBack,
  onSaveDraft,
  onSaveAndContinue,
  onValidate,
  onPreview,
  onSaveChanges,
  isSaving = false,
  canSubmit = false,
}: CustomerStickyBottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-line shadow-2xl px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 text-[11.5px] min-h-[48px]">
      {/* Left Info */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <span className="font-bold text-slate-800 font-mono text-[11.5px] whitespace-nowrap">
          Step {currentStepNumber} / {totalSteps} — {stepLabel}
        </span>
        <div className="hidden sm:flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px] whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>{autosaveText}</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 bg-white border border-line rounded text-[11.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={currentStepNumber <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-line rounded text-[11.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="px-3 py-1.5 bg-white border border-line rounded text-[11.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Draft"}
        </button>

        <button
          type="button"
          onClick={onSaveAndContinue}
          disabled={isSaving}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#671021] text-white rounded text-[11.5px] font-bold hover:bg-[#520d1a] transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <span>Save & Continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onValidate}
          className="px-3 py-1.5 bg-white border border-line rounded text-[11.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Validate
        </button>

        <button
          type="button"
          onClick={onPreview}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-line rounded text-[11.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>Preview</span>
        </button>

        <button
          type="button"
          disabled={!canSubmit}
          className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-[11.5px] font-bold text-slate-400 cursor-not-allowed disabled:opacity-60"
          title="Resolve blocking validation issues before submitting for approval"
        >
          Submit for Approval
        </button>

        <button
          type="button"
          onClick={onSaveChanges}
          disabled={isSaving}
          className="px-3.5 py-1.5 bg-white border border-[#671021] rounded text-[11.5px] font-bold text-[#671021] hover:bg-rose-50 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
