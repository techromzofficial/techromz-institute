"use client";

import React from "react";
import Link from "next/link";
import { Eye, CheckCircle2, Save, ArrowLeft, ArrowRight, X } from "lucide-react";
import { CustomerFormMode } from "@/types/customer-form";

interface CustomerFormHeaderProps {
  mode: CustomerFormMode;
  customerId?: string;
  onCancel: () => void;
  onPreview: () => void;
  onValidate: () => void;
  onSaveDraft: () => void;
  onSaveAndContinue: () => void;
  isSaving?: boolean;
}

export function CustomerFormHeader({
  mode,
  customerId,
  onCancel,
  onPreview,
  onValidate,
  onSaveDraft,
  onSaveAndContinue,
  isSaving = false,
}: CustomerFormHeaderProps) {
  const isEdit = mode === "edit";

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-line/60">
      {/* Breadcrumb + Page Title */}
      <Link
        href={
          customerId
            ? `/admin/customers/${customerId}`
            : "/admin/customers/directory"
        }
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-[#671021] transition-colors"
      >
        <ArrowLeft size={15} />
        <span>
          {customerId
            ? "Back to Customer"
            : "Back to Customer Directory"}
        </span>
      </Link>
      <div>
        <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
          <Link href="/admin/customers" className="hover:text-[#671021] transition-colors">
            Customers
          </Link>
          <span>/</span>
          <Link href="/admin/customers/directory" className="hover:text-[#671021] transition-colors">
            Customer Directory
          </Link>
          <span>/</span>
          {isEdit ? (
            <>
              <Link href={`/admin/customers/${customerId}`} className="hover:text-[#671021] transition-colors">
                Customer Detail
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold font-mono">Edit</span>
            </>
          ) : (
            <span className="text-slate-800 font-bold font-mono">Customer Create</span>
          )}
        </nav>

        <h1 className="text-xl font-black text-ink tracking-tight font-sans">
          {isEdit ? "Customer Create / Edit" : "Customer Create"}
        </h1>

        <p className="text-[11px] text-slate-500 font-medium mt-0.5 max-w-4xl">
          Create and edit customer master records, identity, contact details, addresses, privacy preferences, loyalty status, risk controls, and review readiness across the beauty marketplace.
        </p>
      </div>

      {/* Action Buttons Top Right */}
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 bg-white border border-line rounded-md text-[11.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onPreview}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-line rounded-md text-[11.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>Preview Customer</span>
        </button>

        <button
          type="button"
          onClick={onValidate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-line rounded-md text-[11.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Validate Customer</span>
        </button>

        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-line rounded-md text-[11.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5 text-slate-500" />
          <span>{isSaving ? "Saving..." : "Save Draft"}</span>
        </button>

        <button
          type="button"
          onClick={onSaveAndContinue}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#671021] text-white rounded-md text-[11.5px] font-bold hover:bg-[#520d1a] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <span>Save & Continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
