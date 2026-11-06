'use client';

import React from 'react';
import styles from '../../../app/admin/customer-support/cases/page.module.css';

interface QuickFilterChip {
  id: string;
  label: string;
  count: number;
  isSpecial?: boolean;
  specialTone?: 'danger' | 'warning';
}

const CHIPS: QuickFilterChip[] = [
  { id: 'unassigned', label: 'Unassigned', count: 46 },
  { id: 'new-today', label: 'New Today', count: 84 },
  { id: 'urgent', label: 'Urgent', count: 31 },
  { id: 'critical', label: 'Critical', count: 12, isSpecial: true, specialTone: 'danger' },
  { id: 'sla-at-risk', label: 'SLA At Risk', count: 29, isSpecial: true, specialTone: 'warning' },
  { id: 'sla-breach', label: 'SLA Breach', count: 12, isSpecial: true, specialTone: 'danger' },
  { id: 'waiting-customer', label: 'Waiting Customer', count: 128 },
  { id: 'waiting-supplier', label: 'Waiting Supplier', count: 74 },
  { id: 'waiting-logistics', label: 'Waiting Logistics', count: 38 },
  { id: 'waiting-finance', label: 'Waiting Finance', count: 21 },
  { id: 'payment-issue', label: 'Payment Issue', count: 217 },
  { id: 'delivery-issue', label: 'Delivery Issue', count: 346 },
  { id: 'return-issue', label: 'Return Issue', count: 264 },
  { id: 'safety-complaint', label: 'Safety Complaint', count: 4, isSpecial: true, specialTone: 'danger' },
  { id: 'authenticity-complaint', label: 'Authenticity Complaint', count: 9 },
  { id: 'refund-request', label: 'Refund Request', count: 156 },
  { id: 'repeat-contact', label: 'Repeat Contact', count: 68 },
  { id: 'negative-sentiment', label: 'Negative Sentiment', count: 121 },
  { id: 'escalated', label: 'Escalated', count: 17 },
  { id: 'reopened', label: 'Reopened', count: 23 },
];

interface SupportQuickFiltersProps {
  activeQuickFilter?: string;
  onSelectQuickFilter: (filterId: string) => void;
}

export function SupportQuickFilters({
  activeQuickFilter,
  onSelectQuickFilter,
}: SupportQuickFiltersProps) {
  return (
    <div className={styles.quickFilterSection}>
      <div className={styles.quickFilterHeader}>
        <span className={styles.quickFilterTitle}>QUICK FILTERS:</span>
      </div>
      <div className={styles.quickFilterRow}>
        {CHIPS.map((chip) => {
          const isActive = activeQuickFilter === chip.id;
          let chipClass = styles.quickChip;

          if (isActive) {
            if (chip.specialTone === 'danger') {
              chipClass += ` ${styles.quickChipRedActive}`;
            } else if (chip.specialTone === 'warning') {
              chipClass += ` ${styles.quickChipAmberActive}`;
            } else {
              chipClass += ` ${styles.quickChipActive}`;
            }
          } else if (chip.specialTone === 'danger') {
            chipClass += ` ${styles.quickChipRed}`;
          } else if (chip.specialTone === 'warning') {
            chipClass += ` ${styles.quickChipAmber}`;
          }

          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onSelectQuickFilter(isActive ? 'all' : chip.id)}
              className={chipClass}
            >
              <span>{chip.label}</span>
              <span className={styles.quickChipCount}>{chip.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

