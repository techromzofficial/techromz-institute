"use client";

import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  MoreVertical,
  User,
  ShieldCheck,
  Eye,
  Edit,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CustomerRecord } from "@/types/customer";

interface CustomerPortfolioTableProps {
  customers: CustomerRecord[];
  totalCount: number;
  selectedCustomerId: string | null;
  onSelectCustomer: (id: string) => void;
  selectedRowIds: string[];
  onSelectRow: (id: string) => void;
  onSelectAllOnPage: () => void;
  sortColumn: keyof CustomerRecord;
  sortDirection: "asc" | "desc";
  onSort: (column: keyof CustomerRecord) => void;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  showToast: (msg: string) => void;
}

export function CustomerPortfolioTable({
  customers,
  totalCount,
  selectedCustomerId,
  onSelectCustomer,
  selectedRowIds,
  onSelectRow,
  onSelectAllOnPage,
  sortColumn,
  sortDirection,
  onSort,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  showToast,
}: CustomerPortfolioTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const allSelectedOnPage =
    customers.length > 0 && customers.every((c) => selectedRowIds.includes(c.id));

  const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;

  const renderSortHeader = (label: string, columnKey: keyof CustomerRecord) => {
    const isSorted = sortColumn === columnKey;
    return (
      <th
        onClick={() => onSort(columnKey)}
        className="px-2.5 py-2 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          {isSorted ? (
            sortDirection === "asc" ? (
              <ChevronUp size={12} className="text-[#671021]" />
            ) : (
              <ChevronDown size={12} className="text-[#671021]" />
            )
          ) : (
            <ChevronDown size={10} className="text-slate-300" />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="bg-white border border-line rounded-b-lg shadow-sm flex flex-col justify-between overflow-hidden">
      {/* Table Title Bar */}
      <div className="px-4 py-2 border-b border-line bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono">
          Customer Portfolio <span className="text-slate-400 font-normal font-sans">(Showing 1 to {customers.length} of {totalCount})</span>
        </h3>
      </div>

      {/* Main Table Container */}
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-50 border-b border-line">
              <th className="px-3 py-2 w-8 text-center">
                <input
                  type="checkbox"
                  checked={allSelectedOnPage}
                  onChange={onSelectAllOnPage}
                  className="rounded border-slate-300 text-[#671021] focus:ring-[#671021]"
                />
              </th>
              {renderSortHeader("Customer", "name")}
              {renderSortHeader("Customer ID", "id")}
              {renderSortHeader("Customer Type", "customerType")}
              {renderSortHeader("Email", "email")}
              {renderSortHeader("Phone", "phone")}
              {renderSortHeader("Region", "region")}
              {renderSortHeader("Preferred Channel", "preferredChannel")}
              {renderSortHeader("Verification Status", "verificationStatus")}
              {renderSortHeader("Profile Completeness", "profileCompleteness")}
              {renderSortHeader("Lifecycle Segment", "lifecycleSegment")}
              {renderSortHeader("Loyalty Tier", "loyaltyTier")}
              {renderSortHeader("Total Orders", "totalOrders")}
              {renderSortHeader("Lifetime Value (LKR)", "lifetimeValue")}
              {renderSortHeader("Last Order", "lastOrderDate")}
              {renderSortHeader("Returns", "returnsCount")}
              {renderSortHeader("Open Cases", "openCasesCount")}
              {renderSortHeader("Consent Status", "consentStatus")}
              {renderSortHeader("Risk Level", "riskLevel")}
              {renderSortHeader("Restriction Status", "restrictionStatus")}
              {renderSortHeader("Customer Owner", "owner")}
              {renderSortHeader("Last Activity", "lastActivity")}
              {renderSortHeader("Updated At", "updatedAt")}
              <th className="px-2.5 py-2 text-right text-[10px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-sans">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={24} className="py-12 text-center text-slate-400 font-mono text-[12px]">
                  No customer records found
                </td>
              </tr>
            ) : (
              customers.map((c) => {
              const isSelectedRow = selectedCustomerId === c.id;
              const isChecked = selectedRowIds.includes(c.id);

              return (
                <tr
                  key={c.id}
                  onClick={() => onSelectCustomer(c.id)}
                  className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                    isSelectedRow ? "bg-red-50/20" : ""
                  }`}
                >
                  <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onSelectRow(c.id)}
                      className="rounded border-slate-300 text-[#671021] focus:ring-[#671021]"
                    />
                  </td>

                  {/* Customer Avatar & Name */}
                  <td className="px-2.5 py-2 font-bold text-ink whitespace-nowrap min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#671021] text-white flex items-center justify-center text-[10px] font-bold">
                        {c.avatarInitials}
                      </div>
                      <span className="hover:underline">{c.name}</span>
                    </div>
                  </td>

                  {/* Customer ID */}
                  <td className="px-2.5 py-2 font-mono text-slate-700 font-semibold whitespace-nowrap">
                    {c.id}
                  </td>

                  {/* Customer Type */}
                  <td className="px-2.5 py-2 text-slate-600 whitespace-nowrap">
                    {c.customerType}
                  </td>

                  {/* Email */}
                  <td className="px-2.5 py-2 text-slate-600 font-mono text-[10.5px] whitespace-nowrap truncate max-w-[180px]" title={c.email}>
                    {c.email}
                  </td>

                  {/* Phone */}
                  <td className="px-2.5 py-2 text-slate-600 font-mono text-[10.5px] whitespace-nowrap">
                    {c.phone}
                  </td>

                  {/* Region */}
                  <td className="px-2.5 py-2 text-slate-600 whitespace-nowrap truncate max-w-[120px]" title={c.region}>
                    {c.region ? c.region.split(",")[0] : "—"}
                  </td>

                  {/* Preferred Channel */}
                  <td className="px-2.5 py-2 text-slate-600 whitespace-nowrap">
                    {c.preferredChannel}
                  </td>

                  {/* Verification Status */}
                  <td className="px-2.5 py-2 whitespace-nowrap">
                    {c.verificationStatus === "Verified" && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[9.5px] border border-emerald-200">
                        Verified
                      </span>
                    )}
                    {c.verificationStatus === "Verification Pending" && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[9.5px] border border-amber-200">
                        Pending
                      </span>
                    )}
                    {c.verificationStatus === "Unverified" && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[9.5px] border border-slate-200">
                        Unverified
                      </span>
                    )}
                    {c.verificationStatus === ("Restricted" as any) && (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[9.5px] border border-rose-200">
                        Restricted
                      </span>
                    )}
                  </td>

                  {/* Profile Completeness */}
                  <td className="px-2.5 py-2 font-mono whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 text-[10px]">{c.profileCompleteness}%</span>
                      <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            typeof c.profileCompleteness === "number"
                              ? c.profileCompleteness > 80
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                              : "bg-slate-300"
                          }`}
                          style={{ width: `${c.profileCompleteness}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Lifecycle Segment */}
                  <td className="px-2.5 py-2 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[9.5px] border border-slate-200">
                      {c.lifecycleSegment}
                    </span>
                  </td>

                  {/* Loyalty Tier */}
                  <td className="px-2.5 py-2 whitespace-nowrap">
                    {c.loyaltyTier === "Platinum" && (
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[9.5px] border border-purple-200">
                        Platinum
                      </span>
                    )}
                    {c.loyaltyTier === "Gold" && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[9.5px] border border-amber-200">
                        Gold
                      </span>
                    )}
                    {c.loyaltyTier === "Silver" && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[9.5px] border border-slate-200">
                        Silver
                      </span>
                    )}
                    {c.loyaltyTier === "Bronze" && (
                      <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-bold text-[9.5px] border border-orange-200">
                        Bronze
                      </span>
                    )}
                    {c.loyaltyTier === "Standard" && (
                      <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-[9.5px]">
                        Standard
                      </span>
                    )}
                  </td>

                  {/* Total Orders */}
                  <td className="px-2.5 py-2 font-mono font-bold text-slate-800 text-right whitespace-nowrap">
                    {c.totalOrders}
                  </td>

                  {/* Lifetime Value (LKR) */}
                  <td className="px-2.5 py-2 font-mono font-bold text-slate-800 text-right whitespace-nowrap">
                    {typeof c.lifetimeValue === "number"
                      ? c.lifetimeValue.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })
                      : "—"}                  
                  </td>

                  {/* Last Order */}
                  <td className="px-2.5 py-2 text-slate-600 font-mono text-[10px] whitespace-nowrap">
                    {c.lastOrderDate}
                  </td>

                  {/* Returns */}
                  <td className="px-2.5 py-2 font-mono text-center font-bold text-slate-700 whitespace-nowrap">
                    {c.returnsCount}
                  </td>

                  {/* Open Cases */}
                  <td className="px-2.5 py-2 font-mono text-center font-bold text-slate-700 whitespace-nowrap">
                    {c.openCasesCount}
                  </td>

                  {/* Consent Status */}
                  <td className="px-2.5 py-2 whitespace-nowrap">
                    {c.consentStatus === "Consented" && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[9.5px] border border-emerald-200">
                        Consented
                      </span>
                    )}
                    {c.consentStatus === "Pending" && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[9.5px] border border-amber-200">
                        Pending
                      </span>
                    )}
                    {c.consentStatus === "Revoked" && (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[9.5px] border border-rose-200">
                        Revoked
                      </span>
                    )}
                  </td>

                  {/* Risk Level */}
                  <td className="px-2.5 py-2 whitespace-nowrap">
                    {c.riskLevel === "Low" && (
                      <span className="text-emerald-600 font-bold text-[10px]">Low</span>
                    )}
                    {c.riskLevel === "Medium" && (
                      <span className="text-amber-600 font-bold text-[10px]">Medium</span>
                    )}
                    {c.riskLevel === "High" && (
                      <span className="text-rose-600 font-bold text-[10px]">High</span>
                    )}
                  </td>

                  {/* Restriction Status */}
                  <td className="px-2.5 py-2 whitespace-nowrap">
                    {c.restrictionStatus === "Restricted" ? (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[9.5px] border border-rose-200">
                        Restricted
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">None</span>
                    )}
                  </td>

                  {/* Customer Owner */}
                  <td className="px-2.5 py-2 text-slate-700 font-medium whitespace-nowrap">
                    {c.owner}
                  </td>

                  {/* Last Activity */}
                  <td className="px-2.5 py-2 text-slate-500 font-mono text-[9.5px] whitespace-nowrap">
                    {c.lastActivity}
                  </td>

                  {/* Updated At */}
                  <td className="px-2.5 py-2 text-slate-500 font-mono text-[9.5px] whitespace-nowrap">
                    {c.updatedAt}
                  </td>

                  {/* Action Menu */}
                  <td className="px-2.5 py-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {activeMenuId === c.id && (
                        <div className="absolute right-0 mt-1 w-44 bg-white rounded-md shadow-xl border border-line py-1 z-30 text-[11px] font-medium text-ink">
                          <button
                            onClick={() => {
                              onSelectCustomer(c.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Eye size={13} className="text-slate-600" /> View Details
                          </button>
                          <button
                            onClick={() => {
                              showToast(`Verify identity for customer ${c.id}`);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <ShieldCheck size={13} className="text-emerald-600" /> Verify Identity
                          </button>
                          <div className="border-t border-line my-1" />
                          <button
                            onClick={() => {
                              showToast(`Restricted customer ${c.id}`);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-700 flex items-center gap-2 font-bold"
                          >
                            <UserX size={13} /> Restrict Access
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

      {/* Pagination Bar */}
      <div className="p-3 border-t border-line bg-slate-50 flex items-center justify-between text-[11px]">
        <div className="text-slate-500">
          Showing 1 to {customers.length} of {totalCount} customers
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-line bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 py-0.5 rounded bg-[#671021] text-white font-bold text-[10px]">
              {currentPage}
            </span>
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-line bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="h-7 px-2 border border-line rounded bg-white text-[11px] font-semibold text-slate-700"
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
}
