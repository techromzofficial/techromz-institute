"use client";

import React from "react";

import type {
  CustomerContactInformationFormState,
} from "@/types/customer-form";

interface CustomerContactInformationFormProps {
  mode: "create" | "edit";
  formState: CustomerContactInformationFormState;

  onChange: (
    field: keyof CustomerContactInformationFormState,
    value: string,
  ) => void;

  errors?: Record<string, string>;
}

export function CustomerContactInformationForm({
  mode,
  formState,
  onChange,
  errors = {},
}: CustomerContactInformationFormProps) {
  return (
    <div className="bg-white border border-line rounded-lg p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <h3 className="text-xs font-black text-ink uppercase tracking-wider font-mono">
          2. Contact Information
        </h3>

        <span className="text-[10.5px] text-slate-400 font-mono">
          Step 3 / 13 — Authoritative Customer Contact Record
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-[11px]">
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Email Address{" "}
            <span className="text-rose-500">*</span>
          </label>

          <input
            type="email"
            required
            readOnly={mode === "edit"}
            aria-readonly={mode === "edit"}
            autoComplete="email"
            value={formState.email}
            onChange={(event) =>
              onChange(
                "email",
                event.target.value,
              )
            }
            placeholder="customer@example.com"
            className={`w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] font-semibold text-slate-800 focus:outline-none focus:border-[#671021] ${mode === "edit" ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`}
          />

          {errors.email && (
            <span className="text-[10px] text-rose-600 mt-0.5 block">
              {errors.email}
            </span>
          )}
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Phone Number
          </label>

          <input
            type="tel"
            readOnly={mode === "edit"}
            aria-readonly={mode === "edit"}
            autoComplete="tel"
            value={formState.phone}
            onChange={(event) =>
              onChange(
                "phone",
                event.target.value,
              )
            }
            placeholder="+94 77 123 4567"
            className={`w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] text-slate-800 focus:outline-none focus:border-[#671021] ${mode === "edit" ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`}
          />

          {errors.phone && (
            <span className="text-[10px] text-rose-600 mt-0.5 block">
              {errors.phone}
            </span>
          )}
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Company Name
          </label>

          <input
            type="text"
            value={formState.companyName}
            onChange={(event) =>
              onChange(
                "companyName",
                event.target.value,
              )
            }
            placeholder="e.g. Techromz Customer QA"
            className="w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] text-slate-800 focus:outline-none focus:border-[#671021]"
          />

          {errors.companyName && (
            <span className="text-[10px] text-rose-600 mt-0.5 block">
              {errors.companyName}
            </span>
          )}
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Country
          </label>

          <input
            type="text"
            autoComplete="country-name"
            value={formState.country}
            onChange={(event) =>
              onChange(
                "country",
                event.target.value,
              )
            }
            placeholder="e.g. Sri Lanka"
            className="w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] text-slate-800 focus:outline-none focus:border-[#671021]"
          />

          {errors.country && (
            <span className="text-[10px] text-rose-600 mt-0.5 block">
              {errors.country}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-[10.5px] text-slate-500">
        {mode === "edit"
          ? "Email and phone are account-owned PII and are read-only in this profile editor. Company and country changes are persisted with conflict protection."
          : "Email, phone, company and country are stored when the customer account is created. Verification status is managed separately."}
      </div>
    </div>
  );
}
