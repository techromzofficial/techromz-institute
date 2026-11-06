'use client';
import React from 'react';
import { SupplierSummary } from '@/services/api/brandsSuppliers';
import { MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SupplierDataTableProps } from '@/features/brands-suppliers/types/brandsSuppliers.types';

// ---------------------------------------------------------------------------
// Badge helpers (pure, no hardcoded rows)
// ---------------------------------------------------------------------------

function getStatusBadge(status: string) {
  let bg = 'bg-gray-100', text = 'text-gray-700', border = 'border-gray-200';

  if (['Verified', 'Compliant', 'Active', 'Complete'].includes(status)) {
    bg = 'bg-white'; text = 'text-green-600'; border = 'border-green-200';
  } else if (['Pending', 'Needs Review', 'Partial'].includes(status)) {
    bg = 'bg-white'; text = 'text-orange-500'; border = 'border-orange-200';
  } else if (['Suspended', 'Non-Compliant', 'Restricted'].includes(status)) {
    bg = 'bg-white'; text = 'text-red-600'; border = 'border-red-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${bg} ${text} ${border}`}>
      {status}
    </span>
  );
}

function getRiskBadge(level: string) {
  let color = 'text-gray-500';
  if (level === 'Low') color = 'text-green-600';
  if (level === 'Medium') color = 'text-orange-500';
  if (level === 'High') color = 'text-red-600';
  return <span className={`font-medium text-xs ${color}`}>{level}</span>;
}

function getScoreColor(score: string) {
  const num = parseInt(score.split('/')[0] ?? '0');
  if (num >= 90) return 'text-green-600';
  if (num >= 75) return 'text-green-500';
  if (num >= 50) return 'text-orange-500';
  return 'text-red-600';
}

// ---------------------------------------------------------------------------
// Pagination helper
// ---------------------------------------------------------------------------

function buildPageNumbers(current: number, total: number): Array<number | '...'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | '...'> = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

export function SupplierDataTable({
  data,
  onRowClick,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  page,
  pageSize,
  totalItems,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
  loading,
  emptyTitle = 'No suppliers found',
  emptyDescription = 'Try adjusting your filters or search query.',
}: SupplierDataTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageNumbers = buildPageNumbers(page, totalPages);

  const startRow = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, totalItems);

  return (
    <div className="w-full flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 border-b border-gray-200 whitespace-nowrap font-medium">
            <tr>
              <th className="px-4 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-[#7a122e] focus:ring-[#7a122e]"
                />
              </th>
              <th className="px-4 py-3 min-w-[200px]">Supplier Name / Legal Entity</th>
              <th className="px-4 py-3">Supplier ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">BU</th>
              <th className="px-4 py-3 text-right">Active Brands</th>
              <th className="px-4 py-3 text-right">Active Products</th>
              <th className="px-4 py-3 text-center">Verification Status</th>
              <th className="px-4 py-3 text-center">Compliance</th>
              <th className="px-4 py-3 text-right">Authorization Coverage</th>
              <th className="px-4 py-3 text-center">Contract Status</th>
              <th className="px-4 py-3 text-center">Catalogue Readiness</th>
              <th className="px-4 py-3">Channel Eligibility</th>
              <th className="px-4 py-3">Region Coverage</th>
              <th className="px-4 py-3 text-right">Performance Score</th>
              <th className="px-4 py-3 text-center">Risk Level</th>
              <th className="px-4 py-3 min-w-[150px]">Owner / Reviewer</th>
              <th className="px-4 py-3 min-w-[150px]">Updated At</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-4 py-3 text-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mx-auto" />
                  </td>
                  {Array.from({ length: 19 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={20} className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-gray-900">{emptyTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">{emptyDescription}</p>
                </td>
              </tr>
            ) : (
              data.map((row: SupplierSummary) => {
                const dateParts = row.updatedAt.split(' ');
                const dateLine = [dateParts[0], dateParts[1], dateParts[2]].filter(Boolean).join(' ');
                const timeLine = [dateParts[3], dateParts[4]].filter(Boolean).join(' ');

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedIds.includes(row.id) ? 'bg-red-50/30' : ''
                    }`}
                    onClick={() => onRowClick && onRowClick(row.id)}
                  >
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => onSelectRow && onSelectRow(row.id)}
                        className="rounded border-gray-300 text-[#7a122e] focus:ring-[#7a122e]"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 overflow-hidden shrink-0">
                          {row.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="truncate max-w-[160px]" title={row.name}>{row.name}</span>
                          <span className="text-[10px] text-gray-400 font-normal truncate max-w-[160px]">{row.name} Inc.</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{row.id}</td>
                    <td className="px-4 py-3 text-gray-700">{row.type}</td>
                    <td className="px-4 py-3 text-gray-500">{row.country}</td>
                    <td className="px-4 py-3 text-gray-500">{row.bu}</td>
                    <td className="px-4 py-3 text-gray-900 text-right">{row.activeBrands}</td>
                    <td className="px-4 py-3 text-gray-900 text-right">{row.activeProducts}</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(row.verificationStatus)}</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(row.compliance)}</td>
                    <td className="px-4 py-3 text-gray-900 text-right">{row.authorizationCoverage}</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(row.contractStatus)}</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(row.catalogueReadiness)}</td>
                    <td className="px-4 py-3 text-gray-500">{row.channelEligibility}</td>
                    <td className="px-4 py-3 text-gray-500">{row.regionCoverage}</td>
                    <td className={`px-4 py-3 text-right font-medium ${getScoreColor(row.performanceScore)}`}>
                      {row.performanceScore}
                    </td>
                    <td className="px-4 py-3 text-center">{getRiskBadge(row.riskLevel)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{row.owner}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      <div className="flex flex-col">
                        <span>{dateLine}</span>
                        <span className="text-[10px]">{timeLine}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center items-center">
                        <button className="text-gray-400 hover:text-gray-700">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div>
          {totalItems === 0
            ? 'No entries'
            : `Showing ${startRow} to ${endRow} of ${totalItems.toLocaleString()} entries`}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange && onPageChange(page - 1)}
              disabled={page <= 1}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            {pageNumbers.map((p, idx) =>
              p === '...' ? (
                <span key={`ellipsis-${idx}`} className="w-6 text-center">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange && onPageChange(p as number)}
                  className={`w-6 h-6 rounded flex items-center justify-center font-medium transition-colors ${
                    p === page
                      ? 'bg-[#7a122e] text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => onPageChange && onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 bg-white outline-none hover:border-gray-400"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt} / page</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
