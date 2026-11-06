'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import type { PriorityAlertData } from '@/types/customerSupport';
import styles from '../../../app/admin/customer-support/cases/page.module.css';

interface PriorityAlertsProps {
  alerts: PriorityAlertData[];
  onNavigateToCase?: (caseId: string) => void;
}

export function PriorityAlerts({ alerts, onNavigateToCase }: PriorityAlertsProps) {
  return (
    <div className={styles.rightCard}>
      <div className={styles.rightCardTitle}>
        <span>Priority Alerts</span>
        <span style={{ fontSize: '11px', textTransform: 'none', color: '#64748b', cursor: 'pointer' }}>View All</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {alerts.map((alert) => {
          const detailUrl = `/admin/customer-support/cases/${alert.caseId}`;
          let borderColor = '#ef4444';
          if (alert.tone === 'warning') borderColor = '#f59e0b';
          if (alert.tone === 'info') borderColor = '#3b82f6';

          return (
            <div
              key={alert.id}
              className={styles.priorityAlertRow}
              style={{ borderLeftColor: borderColor }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} style={{ color: borderColor }} />
                  <span>{alert.alertTitle}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                  {alert.caseReference}
                </div>
              </div>

              <Link
                href={detailUrl}
                onClick={() => onNavigateToCase?.(alert.caseId)}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#722140',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {alert.actionLabel || 'Open Case'}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

