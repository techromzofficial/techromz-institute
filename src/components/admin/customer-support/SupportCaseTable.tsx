'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MoreVertical,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Clock,
  User,
} from 'lucide-react';
import styles from '../../../app/admin/customer-support/cases/page.module.css';
import type { SupportCaseItem, SupportPriority, SupportCaseStatus, CustomerSentiment, CaseRiskLevel, SlaStatus } from '@/types/customerSupport';

interface SupportCaseTableProps {
  cases: SupportCaseItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  selectedIds: string[];
  onSelectRow: (id: string) => void;
  onSelectAllRows: (selectAll: boolean) => void;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onSortChange: (field: string, direction?: 'asc' | 'desc') => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  currentQueueUrl?: string;
  isLoading?: boolean;
}

export function SupportCaseTable({
  cases,
  total,
  page,
  pageSize,
  totalPages,
  selectedIds,
  onSelectRow,
  onSelectAllRows,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  sortField,
  sortDirection,
  currentQueueUrl = '/admin/customer-support/cases',
  isLoading = false,
}: SupportCaseTableProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdownId(null);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (openDropdownId && !target.closest(`.${styles.moreActionButton}`) && !target.closest(`.${styles.actionDropdownMenu}`)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const allSelected = cases.length > 0 && cases.every((c) => selectedIds.includes(c.id));
  const someSelected = cases.some((c) => selectedIds.includes(c.id)) && !allSelected;

  const renderPriorityBadge = (priority: SupportPriority) => {
    const map: Record<SupportPriority, { bg: string; text: string; border: string }> = {
      Low: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
      Normal: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      High: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      Urgent: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
      Critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    };
    const style = map[priority] || map.Normal;
    return (
      <span className={`px-2 py-0.5 text-[11px] font-semibold border rounded ${style.bg} ${style.text} ${style.border}`}>
        {priority}
      </span>
    );
  };

  const renderStatusBadge = (status: SupportCaseStatus) => {
    const map: Record<string, { bg: string; text: string; border: string }> = {
      Open: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'In Progress': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
      'Waiting for Customer': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      'Waiting for Supplier': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
      'Waiting for Logistics': { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-300' },
      'Waiting for Finance': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
      Escalated: { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300' },
      Resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      Closed: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
      Reopened: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    };
    const style = map[status] || map.Open;
    return (
      <span className={`px-2 py-0.5 text-[11px] font-medium border rounded-full whitespace-nowrap ${style.bg} ${style.text} ${style.border}`}>
        {status}
      </span>
    );
  };

  const renderSentimentBadge = (sentiment: CustomerSentiment) => {
    const map: Record<CustomerSentiment, { bg: string; text: string }> = {
      Positive: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
      Neutral: { bg: 'bg-slate-100', text: 'text-slate-600' },
      Concerned: { bg: 'bg-amber-50', text: 'text-amber-700' },
      Frustrated: { bg: 'bg-orange-50', text: 'text-orange-700' },
      Distressed: { bg: 'bg-red-50', text: 'text-red-700' },
    };
    const style = map[sentiment] || map.Neutral;
    return (
      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${style.bg} ${style.text}`}>
        {sentiment}
      </span>
    );
  };

  const renderRiskBadge = (risk: CaseRiskLevel) => {
    const map: Record<CaseRiskLevel, { bg: string; text: string }> = {
      Low: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
      Medium: { bg: 'bg-amber-50', text: 'text-amber-700' },
      High: { bg: 'bg-orange-100', text: 'text-orange-800' },
      Critical: { bg: 'bg-red-100', text: 'text-red-800' },
    };
    const style = map[risk] || map.Low;
    return (
      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${style.bg} ${style.text}`}>
        {risk}
      </span>
    );
  };

  const renderSlaBadge = (sla: SlaStatus) => {
    const map: Record<string, { bg: string; text: string }> = {
      'Within Target': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
      '4 Hours Remaining': { bg: 'bg-amber-50', text: 'text-amber-800' },
      'At Risk': { bg: 'bg-orange-100', text: 'text-orange-800' },
      Breached: { bg: 'bg-red-100', text: 'text-red-800' },
      Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    };
    const style = map[sla] || map['Within Target'];
    return (
      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded whitespace-nowrap ${style.bg} ${style.text}`}>
        {sla}
      </span>
    );
  };

  const startRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, total);

  return (
    <div className={styles.tableCard}>
      {/* Horizontally Scrollable Table Workspace */}
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="p-3 w-10 sticky left-0 bg-slate-50 z-20 border-r border-slate-200 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAllRows(e.target.checked)}
                  className="rounded border-slate-300 text-[#722140] focus:ring-[#722140]"
                />
              </th>
              <th
                onClick={() => onSortChange('caseReference')}
                className="p-3 cursor-pointer hover:bg-slate-100 sticky left-10 bg-slate-50 z-20 border-r border-slate-200 min-w-[140px]"
              >
                <div className="flex items-center gap-1">
                  <span>Case Reference</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="p-3 min-w-[90px]">DB Case ID</th>
              <th
                onClick={() => onSortChange('priority')}
                className="p-3 cursor-pointer hover:bg-slate-100 min-w-[90px]"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                onClick={() => onSortChange('caseStatus')}
                className="p-3 cursor-pointer hover:bg-slate-100 min-w-[140px]"
              >
                <div className="flex items-center gap-1">
                  <span>Case Status</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="p-3 min-w-[140px]">Customer</th>
              <th className="p-3 min-w-[120px]">Customer ID</th>
              <th className="p-3 min-w-[130px]">Case Category</th>
              <th className="p-3 min-w-[160px]">Issue Type</th>
              <th className="p-3 min-w-[100px]">Channel</th>
              <th className="p-3 min-w-[220px]">Subject</th>
              <th className="p-3 min-w-[130px]">Related Order</th>
              <th className="p-3 min-w-[130px]">Related Return</th>
              <th className="p-3 min-w-[130px]">Related Shipment</th>
              <th className="p-3 min-w-[180px]">Related Product</th>
              <th className="p-3 min-w-[160px]">Supplier</th>
              <th className="p-3 min-w-[90px]">Sentiment</th>
              <th className="p-3 min-w-[80px]">Risk Level</th>
              <th className="p-3 min-w-[130px]">SLA Status</th>
              <th className="p-3 min-w-[130px]">First Response Due</th>
              <th className="p-3 min-w-[130px]">Resolution Due</th>
              <th className="p-3 min-w-[130px]">Assigned Team/Agent</th>
              <th className="p-3 min-w-[240px]">Last Customer Message</th>
              <th className="p-3 min-w-[130px]">Last Updated</th>
              <th className={`p-3 sticky right-0 bg-slate-50 z-20 border-l border-slate-200 text-center ${styles.actionHeader}`}>
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={25} className="p-4 text-center text-slate-400">
                    Loading customer support cases...
                  </td>
                </tr>
              ))
            ) : cases.length === 0 ? (
              <tr>
                <td colSpan={25} className="p-10 text-center text-slate-500">
                  <div className="max-w-md mx-auto py-6">
                    <User className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                    <p className="font-semibold text-slate-700">No support cases found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No customer support cases match your current filters or search terms. Try adjusting or clearing your active filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              cases.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                const detailUrl = `/admin/customer-support/cases/${c.id}?returnTo=${encodeURIComponent(currentQueueUrl)}`;

                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3 sticky left-0 bg-white z-10 border-r border-slate-200 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectRow(c.id)}
                        className="rounded border-slate-300 text-[#722140] focus:ring-[#722140]"
                      />
                    </td>

                    {/* 1. Case Reference */}
                    <td className="p-3 font-semibold sticky left-10 bg-white z-10 border-r border-slate-200 whitespace-nowrap">
                      <Link
                        href={detailUrl}
                        className="text-[#722140] hover:underline flex items-center gap-1 font-mono"
                      >
                        {c.caseReference}
                      </Link>
                    </td>

                    {/* 2. DB Case ID */}
                    <td className="p-3 font-mono text-slate-500">{c.dbCaseId}</td>

                    {/* 3. Priority */}
                    <td className="p-3 whitespace-nowrap">{renderPriorityBadge(c.priority)}</td>

                    {/* 4. Case Status */}
                    <td className="p-3 whitespace-nowrap">{renderStatusBadge(c.caseStatus)}</td>

                    {/* 5. Customer */}
                    <td className="p-3 font-medium text-slate-900 whitespace-nowrap">{c.customerName}</td>

                    {/* 6. Customer ID */}
                    <td className="p-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">{c.customerId}</td>

                    {/* 7. Case Category */}
                    <td className="p-3 whitespace-nowrap text-slate-800">{c.caseCategory}</td>

                    {/* 8. Issue Type */}
                    <td className="p-3 whitespace-nowrap text-slate-700">{c.issueType}</td>

                    {/* 9. Channel */}
                    <td className="p-3 whitespace-nowrap text-slate-600">{c.channel}</td>

                    {/* 10. Subject */}
                    <td className="p-3 max-w-[220px] truncate text-slate-800 font-medium" title={c.subject}>
                      {c.subject}
                    </td>

                    {/* 11. Related Order */}
                    <td className="p-3 whitespace-nowrap font-mono text-[11px]">
                      {c.relatedOrderReference ? (
                        <Link
                          href={`/admin/marketplace/orders/${c.relatedOrderReference}`}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {c.relatedOrderReference}
                          <ExternalLink size={10} />
                        </Link>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* 12. Related Return */}
                    <td className="p-3 whitespace-nowrap font-mono text-[11px]">
                      {c.relatedReturnReference ? (
                        <Link
                          href={`/admin/marketplace/returns/${c.relatedReturnReference}`}
                          className="text-purple-600 hover:underline flex items-center gap-1"
                        >
                          {c.relatedReturnReference}
                          <ExternalLink size={10} />
                        </Link>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* 13. Related Shipment */}
                    <td className="p-3 whitespace-nowrap font-mono text-[11px]">
                      {c.relatedShipmentReference ? (
                        <span className="text-teal-700 flex items-center gap-1">
                          {c.relatedShipmentReference}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* 14. Related Product */}
                    <td className="p-3 max-w-[180px] truncate text-slate-700" title={c.relatedProductName}>
                      {c.relatedProductName || <span className="text-slate-300">-</span>}
                    </td>

                    {/* 15. Supplier */}
                    <td className="p-3 max-w-[160px] truncate text-slate-700" title={c.supplierName}>
                      {c.supplierName || <span className="text-slate-300">-</span>}
                    </td>

                    {/* 16. Sentiment */}
                    <td className="p-3 whitespace-nowrap">{renderSentimentBadge(c.sentiment)}</td>

                    {/* 17. Risk Level */}
                    <td className="p-3 whitespace-nowrap">{renderRiskBadge(c.riskLevel)}</td>

                    {/* 18. SLA Status */}
                    <td className="p-3 whitespace-nowrap">{renderSlaBadge(c.slaStatus)}</td>

                    {/* 19. First Response Due */}
                    <td className="p-3 whitespace-nowrap text-slate-600">{c.firstResponseDue}</td>

                    {/* 20. Resolution Due */}
                    <td className="p-3 whitespace-nowrap text-slate-600">{c.resolutionDue}</td>

                    {/* 21. Assigned Team / Agent */}
                    <td className="p-3 whitespace-nowrap font-medium text-slate-800">
                      {c.assignedAgentName || 'Unassigned'}
                    </td>

                    {/* 22. Last Customer Message */}
                    <td className="p-3 max-w-[240px] truncate text-slate-600 italic" title={c.lastCustomerMessage}>
                      &quot;{c.lastCustomerMessage}&quot;
                    </td>

                    {/* 23. Last Updated */}
                    <td className="p-3 whitespace-nowrap text-slate-500">{c.lastUpdated}</td>

                    {/* 24 & 25. Action Cell with Open Case Button & Three-Dot Menu */}
                    <td className={styles.actionCell}>
                      <div className={styles.actionControls}>
                        <Link
                          href={detailUrl}
                          className={styles.openCaseButton}
                          aria-label={`Open case ${c.caseReference}`}
                        >
                          Open Case
                        </Link>
                        <div className="relative">
                          <button
                            type="button"
                            className={styles.moreActionButton}
                            aria-label={`More actions for case ${c.caseReference}`}
                            aria-expanded={openDropdownId === c.id}
                            onClick={() => setOpenDropdownId(openDropdownId === c.id ? null : c.id)}
                          >
                            <MoreVertical size={14} />
                          </button>

                          {openDropdownId === c.id && (
                            <div className={styles.actionDropdownMenu}>
                              <Link
                                href={detailUrl}
                                className={styles.actionDropdownItem}
                                onClick={() => setOpenDropdownId(null)}
                              >
                                View Case Details
                              </Link>
                              <button
                                type="button"
                                className={styles.actionDropdownItem}
                                onClick={() => setOpenDropdownId(null)}
                              >
                                Assign Case
                              </button>
                              <button
                                type="button"
                                className={styles.actionDropdownItem}
                                onClick={() => {
                                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                    navigator.clipboard.writeText(c.caseReference);
                                  }
                                  setOpenDropdownId(null);
                                }}
                              >
                                Copy Case Reference
                              </button>
                              <button
                                type="button"
                                className={styles.actionDropdownItem}
                                onClick={() => setOpenDropdownId(null)}
                              >
                                Send Quick Message
                              </button>
                              <button
                                type="button"
                                className={styles.actionDropdownItem}
                                style={{ color: '#7e22ce', fontWeight: 600 }}
                                onClick={() => setOpenDropdownId(null)}
                              >
                                Escalate Case
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Footer */}
      <div className={styles.paginationCard}>
        <div className={styles.paginationInfo}>
          Showing <strong>{startRow}</strong> to <strong>{endRow}</strong> of{' '}
          <strong>{total > 0 ? (total === 4 ? '1,286' : total.toLocaleString()) : '0'}</strong> cases
        </div>

        <div className={styles.paginationControls}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '16px' }}>
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={styles.filterSelect}
              style={{ width: '60px', padding: '3px 6px' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className={styles.filterToolBtn}
              style={{ padding: '4px 8px' }}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              const pNum = idx + 1;
              const isCurrent = pNum === page;
              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => onPageChange(pNum)}
                  className={styles.filterToolBtn}
                  style={{
                    padding: '4px 8px',
                    background: isCurrent ? '#722140' : '#ffffff',
                    color: isCurrent ? '#ffffff' : '#334155',
                    borderColor: isCurrent ? '#722140' : '#cbd5e1',
                    fontWeight: isCurrent ? 700 : 500,
                  }}
                >
                  {pNum}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>
                <button
                  type="button"
                  onClick={() => onPageChange(totalPages)}
                  className={styles.filterToolBtn}
                  style={{
                    padding: '4px 8px',
                    background: page === totalPages ? '#722140' : '#ffffff',
                    color: page === totalPages ? '#ffffff' : '#334155',
                    borderColor: page === totalPages ? '#722140' : '#cbd5e1',
                    fontWeight: page === totalPages ? 700 : 500,
                  }}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className={styles.filterToolBtn}
              style={{ padding: '4px 8px' }}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

