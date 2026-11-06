"use client";

import React from "react";
import { X } from "lucide-react";
import { CustomerFormFullData } from "@/types/customer-form";

interface CustomerFormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CustomerFormFullData;
}

export function CustomerFormPreviewModal({
  isOpen,
  onClose,
  data,
}: CustomerFormPreviewModalProps) {
  if (!isOpen) {
    return null;
  }

  const {
    basicIdentity,
    businessContext,
    completenessMetrics,
    mode,
    customerId,
  } = data;

  const initials = `${basicIdentity.firstName?.[0] ?? ""}${
    basicIdentity.lastName?.[0] ?? ""
  }`.toUpperCase();

  const displayInitials =
    initials || "—";

  const completeness =
    typeof completenessMetrics.overallCompleteness === "number"
      ? `${completenessMetrics.overallCompleteness}%`
      : "—";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-line flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-line flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-50 text-[#671021] text-[10px] font-bold border border-rose-200">
              {mode === "edit"
                ? customerId
                  ? `Edit Preview (${customerId})`
                  : "Edit Preview"
                : "New Customer Preview"}
            </span>

            <h3 className="text-sm font-extrabold text-ink">
              Unsaved Live Form Preview
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-[11.5px]">
          {/* Identity summary */}
          <div className="flex items-center gap-3 p-3 bg-[#671021]/5 border border-[#671021]/20 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[#671021] text-white flex items-center justify-center font-black text-sm">
              {displayInitials}
            </div>

            <div>
              <h4 className="text-sm font-bold text-ink">
                {[
                  basicIdentity.title,
                  basicIdentity.firstName,
                  basicIdentity.lastName,
                ]
                  .filter(Boolean)
                  .join(" ") || "Customer details not entered"}
              </h4>

              <span className="text-[10px] text-slate-500 font-mono">
                Display:{" "}
                {basicIdentity.displayName || "Not specified"}{" "}
                | DOB:{" "}
                {basicIdentity.dob || "Not specified"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">
                Gender
              </span>

              <span className="font-semibold text-slate-800">
                {basicIdentity.gender || "Not specified"}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">
                Preferred Language
              </span>

              <span className="font-semibold text-slate-800">
                {basicIdentity.preferredLanguage || "Not specified"}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">
                Nationality
              </span>

              <span className="font-semibold text-slate-800">
                {basicIdentity.nationality || "Not specified"}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">
                Occupation
              </span>

              <span className="font-semibold text-slate-800">
                {basicIdentity.occupation || "Not specified"}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono mb-1">
              Customer Notes
            </span>

            <p className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-700 italic">
              {basicIdentity.customerNotes ||
                "No customer notes recorded."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-line">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">
                Business Unit
              </span>

              <span className="font-semibold text-[#671021]">
                {businessContext?.businessUnit ?? "—"}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">
                Overall Completeness
              </span>

              <span className="font-bold text-slate-700 font-mono">
                {completeness}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-line bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#671021] text-white font-bold text-[11.5px] rounded hover:bg-[#520d1a] transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}