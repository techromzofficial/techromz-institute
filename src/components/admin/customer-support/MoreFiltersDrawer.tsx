'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import type { SupportCaseFilterParams } from '@/types/customerSupport';
import styles from '../../../app/admin/customer-support/cases/page.module.css';

interface MoreFiltersDrawerProps {
  isOpen: boolean;
  filters: SupportCaseFilterParams;
  onClose: () => void;
  onFilterChange: (key: keyof SupportCaseFilterParams, value: string) => void;
  onClearAll: () => void;
}

export function MoreFiltersDrawer({
  isOpen,
  filters,
  onClose,
  onFilterChange,
  onClearAll,
}: MoreFiltersDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} style={{ justifyContent: 'flex-end', padding: 0 }} onClick={onClose}>
      <div
        className={styles.modalCard}
        style={{
          width: '420px',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Advanced Support Filters</h2>
          <button type="button" onClick={onClose} className={styles.modalCloseBtn} aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Context Type</label>
            <select
              value={filters.context || 'all'}
              onChange={(e) => onFilterChange('context', e.target.value)}
              className={styles.formSelect}
            >
              <option value="all">All Contexts</option>
              <option value="order">Order Context</option>
              <option value="return">Return Context</option>
              <option value="shipment">Shipment Context</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Saved Filter View</label>
            <select
              value={filters.savedView || 'all'}
              onChange={(e) => onFilterChange('savedView', e.target.value)}
              className={styles.formSelect}
            >
              <option value="all">Default View</option>
              <option value="critical-safety">Critical Safety Queue</option>
              <option value="finance-pending">Pending Finance Clearance</option>
              <option value="unassigned-high-priority">Unassigned High Priority</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Order ID Filter</label>
            <input
              type="text"
              value={filters.orderId || ''}
              onChange={(e) => onFilterChange('orderId', e.target.value)}
              placeholder="e.g. 9021"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Return ID Filter</label>
            <input
              type="text"
              value={filters.returnId || ''}
              onChange={(e) => onFilterChange('returnId', e.target.value)}
              placeholder="e.g. 45075"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Shipment ID Filter</label>
            <input
              type="text"
              value={filters.shipmentId || ''}
              onChange={(e) => onFilterChange('shipmentId', e.target.value)}
              placeholder="e.g. 10293"
              className={styles.formInput}
            />
          </div>
        </div>

        <div className={styles.modalFooter} style={{ justifyContent: 'space-between' }}>
          <button type="button" onClick={onClearAll} className={styles.btnSecondary}>
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
          <button type="button" onClick={onClose} className={styles.btnPrimary}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

