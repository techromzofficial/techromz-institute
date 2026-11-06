"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CustomerRecord } from "@/types/customer";
import {
  ArrowUpDown,
  MoreVertical,
  ShieldAlert,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface CustomerDirectoryTableProps {
  records: CustomerRecord[];
  selectedCustomerId: string;
  onSelectCustomer: (customer: CustomerRecord) => void;
  selectedRowIds: string[];
  onToggleSelectRow: (id: string) => void;
  onToggleSelectAll: () => void;
  showToast: (msg: string) => void;

  pagination: {
    total: number;
    currentPage: number;
    perPage: number;
    lastPage: number;
  };

  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}

export function CustomerDirectoryTable({
  records,
  selectedCustomerId,
  onSelectCustomer,
  selectedRowIds,
  onToggleSelectRow,
  onToggleSelectAll,
  showToast,
  pagination,
  onPageChange,
  onPerPageChange,
}: CustomerDirectoryTableProps) {
  const [activeMenuId, setActiveMenuId] =
    useState<string | null>(null);

  const isAllSelected =
    records.length > 0 &&
    records.every((record) =>
      selectedRowIds.includes(record.id),
    );

  const formatLKR = (val: number) => {
    return `LKR ${val.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="bg-white border border-line rounded-lg shadow-2xs flex flex-col w-full overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin max-h-[560px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-[11px] min-w-[2100px]">
          <thead className="sticky top-0 bg-slate-50 border-b border-line z-20 text-[10.5px] font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="p-2.5 w-10 min-w-[40px] text-center bg-slate-50 sticky left-0 z-30 shadow-xs border-r border-line/40">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 text-[#671021] focus:ring-[#671021] cursor-pointer"
                />
              </th>

              <th className="px-3 py-2.5 font-bold min-w-[170px] sticky left-[40px] bg-slate-50 z-30 shadow-xs border-r border-line/40">
                <div className="flex items-center gap-1">
                  <span>Customer</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="px-2.5 py-2.5 font-bold min-w-[110px]">
                Customer ID
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[90px]">
                Type
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[160px]">
                Email
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[125px]">
                Phone
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[140px]">
                Country / Region
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[110px]">
                Channel
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[125px]">
                Verification
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[115px]">
                Completeness
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[105px]">
                Segment
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[95px]">
                Loyalty
              </th>
              <th className="px-2.5 py-2.5 font-bold text-right min-w-[85px]">
                Orders
              </th>
              <th className="px-2.5 py-2.5 font-bold text-right min-w-[130px]">
                LTV (LKR)
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[105px]">
                Last Order
              </th>
              <th className="px-2.5 py-2.5 font-bold text-center min-w-[65px]">
                Returns
              </th>
              <th className="px-2.5 py-2.5 font-bold text-center min-w-[65px]">
                Cases
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[95px]">
                Consent
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[80px]">
                Risk
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[95px]">
                Restriction
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[100px]">
                Duplicate Risk
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[120px]">
                Owner
              </th>
              <th className="px-2.5 py-2.5 font-bold min-w-[135px]">
                Last Activity
              </th>

              <th className="px-2 py-2.5 text-center min-w-[55px] sticky right-0 bg-slate-50 z-30 shadow-xs border-l border-line/40">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-line text-slate-700 bg-white">
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={24}
                  className="py-12 text-center text-slate-400 font-mono text-[12px]"
                >
                  No customer records found
                </td>
              </tr>
            ) : (
              records.map((c) => {
                const isRowSelected =
                  selectedCustomerId === c.id;

                const isChecked =
                  selectedRowIds.includes(c.id);

                const initials =
                  c.avatarInitials ||
                  c.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase();

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCustomer(c)}
                    className={`transition-colors cursor-pointer text-[11px] ${
                      isRowSelected
                        ? "bg-amber-50/70 hover:bg-amber-50"
                        : isChecked
                          ? "bg-slate-50/80 hover:bg-slate-100/80"
                          : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td
                      className="p-2.5 w-10 min-w-[40px] text-center sticky left-0 bg-white z-10 border-r border-line/40"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          onToggleSelectRow(c.id)
                        }
                        className="rounded border-slate-300 text-[#671021] focus:ring-[#671021] cursor-pointer"
                      />
                    </td>

                    <td className="px-3 py-2 min-w-[170px] sticky left-[40px] bg-white z-10 shadow-xs border-r border-line/40">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#671021] text-white flex items-center justify-center font-bold text-[9.5px] flex-shrink-0">
                          {initials || "—"}
                        </div>

                        <Link
                          href={`/admin/customers/${c.id}`}
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                          className="font-bold text-[#671021] hover:underline truncate max-w-[125px]"
                          title={c.name}
                        >
                          {c.name}
                        </Link>
                      </div>
                    </td>

                    <td className="px-2.5 py-2 min-w-[110px] font-mono text-slate-500 font-semibold">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                        className="hover:text-[#671021] hover:underline"
                      >
                        {c.id}
                      </Link>
                    </td>

                    <td className="px-2.5 py-2 min-w-[90px] text-slate-600">
                      {c.customerType ?? "—"}
                    </td>

                    <td
                      className="px-2.5 py-2 min-w-[160px] text-slate-600 font-mono text-[10.5px] truncate max-w-[150px]"
                      title={c.email}
                    >
                      {c.email}
                    </td>

                    <td className="px-2.5 py-2 min-w-[125px] text-slate-600 font-mono text-[10.5px] whitespace-nowrap">
                      {c.phone || "—"}
                    </td>

                    <td
                      className="px-2.5 py-2 min-w-[140px] text-slate-600 truncate max-w-[140px]"
                      title={
                        c.region ??
                        c.country ??
                        undefined
                      }
                    >
                      {c.region ??
                        c.country ??
                        "—"}
                    </td>

                    <td className="px-2.5 py-2 min-w-[110px] text-slate-600">
                      {c.preferredChannel ?? "—"}
                    </td>

                    <td className="px-2.5 py-2 min-w-[125px]">
                      {c.verificationStatus ===
                        "Verified" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      )}

                      {c.verificationStatus ===
                        "Verification Pending" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}

                      {c.verificationStatus ===
                        "Unverified" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Unverified
                        </span>
                      )}

                      {(c.verificationStatus as string) ===
                        "Restricted" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <ShieldAlert className="w-3 h-3" />
                          Restricted
                        </span>
                      )}

                      {!c.verificationStatus && (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-2.5 py-2 min-w-[115px]">
                      {typeof c.profileCompleteness ===
                      "number" ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-1">
                            <div
                              className={`h-full rounded-full ${
                                c.profileCompleteness >=
                                80
                                  ? "bg-emerald-500"
                                  : c.profileCompleteness >=
                                      50
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                              }`}
                              style={{
                                width: `${c.profileCompleteness}%`,
                              }}
                            />
                          </div>

                          <span className="font-mono font-bold text-[10px] text-slate-700">
                            {c.profileCompleteness}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-2.5 py-2 min-w-[105px] font-semibold text-slate-800">
                      {c.lifecycleSegment ?? "—"}
                    </td>

                    <td className="px-2.5 py-2 min-w-[95px]">
                      {c.loyaltyTier ? (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            c.loyaltyTier ===
                            "Platinum"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : c.loyaltyTier ===
                                  "Gold"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : c.loyaltyTier ===
                                    "Silver"
                                  ? "bg-slate-200 text-slate-800"
                                  : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {c.loyaltyTier}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-2.5 py-2 min-w-[85px] text-right font-mono font-bold text-slate-800">
                      {typeof c.totalOrders === "number"
                        ? c.totalOrders
                        : "—"}
                    </td>

                    <td className="px-2.5 py-2 min-w-[130px] text-right font-mono font-bold text-slate-800">
                      {typeof c.lifetimeValue ===
                      "number"
                        ? formatLKR(
                            c.lifetimeValue,
                          )
                        : "—"}
                    </td>

                    <td className="px-2.5 py-2 min-w-[105px] text-slate-600 font-mono text-[10px] whitespace-nowrap">
                      {c.lastOrderDate ?? "—"}
                    </td>

                    <td className="px-2.5 py-2 min-w-[65px] text-center font-mono text-slate-700">
                      {typeof c.returnsCount ===
                      "number"
                        ? c.returnsCount
                        : "—"}
                    </td>

                    <td className="px-2.5 py-2 min-w-[65px] text-center">
                      <span
                        className={`font-mono font-bold ${
                          typeof c.openCasesCount ===
                            "number" &&
                          c.openCasesCount > 0
                            ? "text-rose-600"
                            : "text-slate-400"
                        }`}
                      >
                        {typeof c.openCasesCount ===
                        "number"
                          ? c.openCasesCount
                          : "—"}
                      </span>
                    </td>

                    <td className="px-2.5 py-2 min-w-[95px]">
                      {c.consentStatus ? (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            c.consentStatus ===
                            "Consented"
                              ? "bg-emerald-50 text-emerald-700"
                              : c.consentStatus ===
                                  "Pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {c.consentStatus}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-2.5 py-2 min-w-[80px]">
                      {c.riskLevel ? (
                        <span
                          className={`font-bold ${
                            c.riskLevel === "High"
                              ? "text-rose-600"
                              : c.riskLevel ===
                                  "Medium"
                                ? "text-amber-600"
                                : "text-slate-600"
                          }`}
                        >
                          {c.riskLevel}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-2.5 py-2 min-w-[95px]">
                      {c.restrictionStatus ? (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            c.restrictionStatus ===
                            "Restricted"
                              ? "bg-rose-100 text-rose-800"
                              : "text-slate-500"
                          }`}
                        >
                          {c.restrictionStatus}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-2.5 py-2 min-w-[100px]">
                      {c.duplicateRisk ? (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            c.duplicateRisk ===
                            "High"
                              ? "bg-rose-100 text-rose-800"
                              : c.duplicateRisk ===
                                  "Medium"
                                ? "bg-amber-100 text-amber-800"
                                : "text-slate-500"
                          }`}
                        >
                          {c.duplicateRisk}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-2.5 py-2 min-w-[120px] text-slate-600 whitespace-nowrap">
                      {c.owner ?? "—"}
                    </td>

                    <td className="px-2.5 py-2 min-w-[135px] text-slate-500 font-mono text-[10px] whitespace-nowrap">
                      {c.lastActivity ?? "—"}
                    </td>

                    <td
                      className="px-2 py-2 min-w-[55px] text-center sticky right-0 bg-white z-10 shadow-xs border-l border-line/40"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setActiveMenuId(
                              activeMenuId ===
                                c.id
                                ? null
                                : c.id,
                            )
                          }
                          className="p-1 rounded text-slate-400 hover:text-ink hover:bg-slate-100"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {activeMenuId === c.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white border border-line rounded-lg shadow-lg py-1 z-40 text-[11.5px]">
                            <button
                              onClick={() => {
                                onSelectCustomer(c);
                                setActiveMenuId(
                                  null,
                                );
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                            >
                              View Preview
                            </button>

                            <Link
                              href={`/admin/customers/${c.id}`}
                              onClick={() =>
                                setActiveMenuId(
                                  null,
                                )
                              }
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 block"
                            >
                              Full Profile Details
                            </Link>

                            <button
                              onClick={() => {
                                showToast(
                                  "Email action is not available from the Customer Directory yet.",
                                );
                                setActiveMenuId(
                                  null,
                                );
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-500"
                            >
                              Send Email
                            </button>

                            <div className="border-t border-line my-1" />

                            <button
                              onClick={() => {
                                showToast(
                                  "Verification requests are managed by the Verification & Compliance module.",
                                );
                                setActiveMenuId(
                                  null,
                                );
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-500"
                            >
                              Request Verification
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 bg-slate-50 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-[11.5px] text-slate-600 rounded-b-lg">
        <div>
          Showing{" "}
          <span className="font-bold text-ink">
            {records.length === 0
              ? "0"
              : `${
                  (pagination.currentPage - 1) *
                    pagination.perPage +
                  1
                } to ${
                  (pagination.currentPage - 1) *
                    pagination.perPage +
                  records.length
                }`}
          </span>{" "}
          of{" "}
          <span className="font-bold text-ink">
            {pagination.total}
          </span>{" "}
          customers
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span>Rows per page:</span>

            <select
              value={pagination.perPage}
              onChange={(e) =>
                onPerPageChange?.(
                  Number(e.target.value),
                )
              }
              className="h-7 px-1.5 bg-white border border-line rounded text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-[#671021]"
            >
              <option value="25">
                25
              </option>
              <option value="50">
                50
              </option>
              <option value="100">
                100
              </option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                onPageChange?.(
                  pagination.currentPage - 1,
                )
              }
              disabled={
                pagination.currentPage <= 1
              }
              className="h-7 px-2.5 rounded bg-white border border-line text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Prev
            </button>

            <span className="h-7 px-2.5 flex items-center rounded bg-[#671021] text-white font-bold">
              {pagination.currentPage}
            </span>

            <span className="text-slate-400">
              of {pagination.lastPage}
            </span>

            <button
              onClick={() =>
                onPageChange?.(
                  pagination.currentPage + 1,
                )
              }
              disabled={
                pagination.currentPage >=
                pagination.lastPage
              }
              className="h-7 px-2.5 rounded bg-white border border-line text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}