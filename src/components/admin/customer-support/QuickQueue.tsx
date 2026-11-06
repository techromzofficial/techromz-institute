'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { QuickQueueItemData } from '@/types/customerSupport';
import styles from '../../../app/admin/customer-support/cases/page.module.css';

interface QuickQueueProps {
  items: QuickQueueItemData[];
}

export function QuickQueue({ items }: QuickQueueProps) {
  return (
    <div className={styles.rightCard}>
      <div className={styles.rightCardTitle}>
        <span>Quick Queue</span>
        <span style={{ fontSize: '11px', textTransform: 'none', color: '#64748b', cursor: 'pointer' }}>View All</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/admin/customer-support/cases/${item.caseId}`}
            className={styles.quickQueueRow}
            style={{ textDecoration: 'none' }}
          >
            <span style={{ color: '#334155', fontWeight: 600 }}>{item.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace', color: '#722140', fontWeight: 700 }}>
              <span>{item.caseReference}</span>
              <ChevronRight size={14} style={{ color: '#94a3b8' }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

