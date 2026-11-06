'use client';

import React from 'react';
import type { CaseTabType } from '@/types/customerSupportDetail';
import styles from '@/app/admin/customer-support/cases/[caseId]/page.module.css';

interface CaseTabsBarProps {
  activeTab: CaseTabType;
  onSelectTab: (tab: CaseTabType) => void;
  canViewNotes?: boolean;
  counts?: {
    messages?: number;
    internalNotes?: number;
    attachments?: number;
    blockingIssues?: number;
    auditEvents?: number;
  };
}

export function CaseTabsBar({ activeTab, onSelectTab, counts, canViewNotes = true }: CaseTabsBarProps) {
  const tabs: { id: CaseTabType; label: string; count?: number }[] = [
    { id: 'overview', label: 'Case Overview' },
    { id: 'conversation', label: 'Conversation', count: counts?.messages },
    { id: 'customer-context', label: 'Customer Context' },
    { id: 'related-records', label: 'Related Records' },
    { id: 'evidence', label: 'Evidence & Attachments', count: counts?.attachments },
    { id: 'investigation', label: 'Investigation' },
    { id: 'sla-escalation', label: 'SLA & Escalation' },
    { id: 'resolution', label: 'Resolution Workspace' },
    { id: 'internal-notes', label: 'Internal Notes', count: counts?.internalNotes },
    { id: 'communications', label: 'Communications' },
    { id: 'operational-issues', label: 'Operational Issues', count: counts?.blockingIssues },
    { id: 'audit-history', label: 'Audit History', count: counts?.auditEvents },
  ];

  return (
    <div className={styles.tabsWrapper} role="tablist" aria-label="Support Case Workspace Tabs">
      <div className={styles.tabsList}>
        {tabs.filter(tab => canViewNotes || tab.id !== 'internal-notes').map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={event => {
                const available = tabs.filter(item => canViewNotes || item.id !== 'internal-notes');
                const current = available.findIndex(item => item.id === tab.id);
                const index = event.key === 'ArrowRight' ? (current + 1) % available.length : event.key === 'ArrowLeft' ? (current - 1 + available.length) % available.length : event.key === 'Home' ? 0 : event.key === 'End' ? available.length - 1 : -1;
                if (index >= 0) { event.preventDefault(); onSelectTab(available[index].id); document.getElementById(`tab-${available[index].id}`)?.focus(); }
              }}
              className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-slate-100 text-slate-700">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

