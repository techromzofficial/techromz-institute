"use client";

import React from "react";

import { CustomerBasicIdentityFormState } from "@/types/customer-form";

interface CustomerBasicIdentityFormProps {
  mode: "create" | "edit";
  formState: CustomerBasicIdentityFormState;
  onChange: (
    field: keyof CustomerBasicIdentityFormState,
    value: string,
  ) => void;
  errors?: Record<string, string>;
}

export function CustomerBasicIdentityForm({
  mode,
  formState,
  onChange,
  errors = {},
}: CustomerBasicIdentityFormProps) {
  const identityReadOnly = mode === "edit";
  const unavailableClass = "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";
  const notesCharCount =
    formState.customerNotes?.length ?? 0;

  return (
    <div className="bg-white border border-line rounded-lg p-4 sm:p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <h3 className="text-xs font-black text-ink uppercase tracking-wider font-mono">
          1. Basic Identity
        </h3>

        <span className="text-[10.5px] text-slate-400 font-mono">
          Step 2 / 13 — Core Customer Demographics & Master Metadata
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-[11px]">
        {/* Title */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Title
          </label>

          <select
            disabled
            value={formState.title}
            onChange={(event) =>
              onChange(
                "title",
                event.target.value,
              )
            }
            className={`w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#671021] ${unavailableClass}`}
          >
            <option value="">
              Select Title
            </option>

            <option value="Ms.">
              Ms.
            </option>

            <option value="Mr.">
              Mr.
            </option>

            <option value="Mrs.">
              Mrs.
            </option>

            <option value="Dr.">
              Dr.
            </option>

            <option value="Prof.">
              Prof.
            </option>
          </select>

          {errors.title && (
            <span className="text-[10px] text-rose-600 mt-0.5 block">
              {errors.title}
            </span>
          )}
        </div>

        {/* First Name */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            First Name{" "}
            <span className="text-rose-500">
              *
            </span>
          </label>

          <input
            type="text"
            disabled
            value={formState.firstName}
            onChange={(event) =>
              onChange(
                "firstName",
                event.target.value,
              )
            }
            placeholder="e.g. Amaya"
            className={`w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] font-semibold text-slate-800 focus:outline-none focus:border-[#671021] ${unavailableClass}`}
          />

          {errors.firstName && (
            <span className="text-[10px] text-rose-600 mt-0.5 block">
              {errors.firstName}
            </span>
          )}
        </div>

        {/* Middle Name */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Middle Name
          </label>

          <input
            type="text"
            disabled
            value={formState.middleName}
            onChange={(event) =>
              onChange(
                "middleName",
                event.target.value,
              )
            }
            placeholder="e.g. Nimali"
            className="w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] text-slate-800 focus:outline-none focus:border-[#671021]"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Last Name{" "}
            <span className="text-rose-500">
              *
            </span>
          </label>

          <input
            type="text"
            disabled
            value={formState.lastName}
            onChange={(event) =>
              onChange(
                "lastName",
                event.target.value,
              )
            }
            placeholder="e.g. Perera"
            className={`w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] font-semibold text-slate-800 focus:outline-none focus:border-[#671021] ${unavailableClass}`}
          />

          {errors.lastName && (
            <span className="text-[10px] text-rose-600 mt-0.5 block">
              {errors.lastName}
            </span>
          )}
        </div>

        {/* Display Name */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Display Name{" "}
            <span className="text-rose-500">
              *
            </span>
          </label>

          <input
            type="text"
            required
            readOnly={identityReadOnly}
            aria-readonly={identityReadOnly}
            value={formState.displayName}
            onChange={(event) =>
              onChange(
                "displayName",
                event.target.value,
              )
            }
            placeholder="e.g. Amaya P."
            className={`w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] font-semibold text-slate-800 focus:outline-none focus:border-[#671021] ${identityReadOnly ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`}
          />

          {errors.displayName && (
            <span className="text-[10px] text-rose-600 mt-0.5 block">
              {errors.displayName}
            </span>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Date of Birth
          </label>

          <input
            type="date"
            disabled
            value={formState.dob}
            onChange={(event) =>
              onChange(
                "dob",
                event.target.value,
              )
            }
            className="w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] font-mono text-slate-800 focus:outline-none focus:border-[#671021]"
          />

          {errors.dob && (
            <span className="text-[10px] text-rose-600 mt-0.5 block">
              {errors.dob}
            </span>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Gender
          </label>

          <select
            disabled
            value={formState.gender}
            onChange={(event) =>
              onChange(
                "gender",
                event.target.value,
              )
            }
            className="w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#671021]"
          >
            <option value="">
              Select Gender
            </option>

            <option value="Female">
              Female
            </option>

            <option value="Male">
              Male
            </option>

            <option value="Other">
              Other
            </option>

            <option value="Prefer not to say">
              Prefer not to say
            </option>
          </select>

          {errors.gender && (
            <span className="text-[10px] text-rose-600 mt-0.5 block">
              {errors.gender}
            </span>
          )}
        </div>

        {/* Preferred Language */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Preferred Language
          </label>

          <select
            disabled
            value={formState.preferredLanguage}
            onChange={(event) =>
              onChange(
                "preferredLanguage",
                event.target.value,
              )
            }
            className="w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#671021]"
          >
            <option value="">
              Select Language
            </option>

            <option value="English">
              English
            </option>

            <option value="Sinhala">
              Sinhala
            </option>

            <option value="Tamil">
              Tamil
            </option>
          </select>
        </div>

        {/* Nationality */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Nationality
          </label>

          <select
            disabled
            value={formState.nationality}
            onChange={(event) =>
              onChange(
                "nationality",
                event.target.value,
              )
            }
            className="w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#671021]"
          >
            <option value="">
              Select Nationality
            </option>

            <option value="Sri Lankan">
              Sri Lankan
            </option>

            <option value="Other">
              Other
            </option>
          </select>
        </div>

        {/* Occupation */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Occupation
          </label>

          <input
            type="text"
            disabled
            value={formState.occupation}
            onChange={(event) =>
              onChange(
                "occupation",
                event.target.value,
              )
            }
            placeholder="e.g. Consultant"
            className="w-full h-8.5 px-2.5 rounded border border-line text-[11.5px] text-slate-800 focus:outline-none focus:border-[#671021]"
          />
        </div>

        {/* Customer Notes */}
        <div className="sm:col-span-2">
          <div className="flex justify-between items-center mb-1">
            <label className="block font-bold text-slate-800">
              Customer Notes
            </label>

            <span className="text-[10px] font-mono text-slate-400">
              {notesCharCount} / 500
            </span>
          </div>

          <textarea
            disabled
            rows={2}
            maxLength={500}
            value={formState.customerNotes}
            onChange={(event) =>
              onChange(
                "customerNotes",
                event.target.value,
              )
            }
            placeholder="Add customer notes..."
            className="w-full p-2.5 rounded border border-line text-[11.5px] text-slate-800 focus:outline-none focus:border-[#671021] resize-none"
          />
        </div>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[10.5px] text-amber-900">
        {mode === "edit"
          ? "Customer name is account-owned identity data and is read-only in this profile editor. Company and country are the supported editable profile fields."
          : "Display Name is the canonical customer name. Additional demographic fields remain disabled because customer creation does not persist them."}
      </div>
    </div>
  );
}
