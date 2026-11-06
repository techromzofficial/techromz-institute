'use client';

import React from 'react';
import { Clock, ShieldCheck, AlertOctagon, UserX, ArrowUpRight, Flame, Smile } from 'lucide-react';
import type { SupportOperationsHealthData } from '@/types/customerSupport';
import styles from '../../../app/admin/customer-support/cases/page.module.css';

interface SupportOperationsHealthProps {
  health: SupportOperationsHealthData | null;
}

export function SupportOperationsHealth({ health }: SupportOperationsHealthProps) {
  if (!health) {
    return (
      <div className={styles.rightCard}>
        <div style={{ height: '16px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '12px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: '24px', background: '#f1f5f9', borderRadius: '4px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.rightCard}>
      <h3 className={styles.rightCardTitle}>Support Operations Health</h3>

      <div className={styles.healthMetricRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475467' }}>
          <Clock size={14} style={{ color: '#2563eb' }} />
          <span>Average First Response</span>
        </div>
        <span style={{ fontWeight: 800, color: '#0f172a' }}>{health.avgFirstResponseMinutes} Minutes</span>
      </div>

      <div className={styles.healthMetricRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475467' }}>
          <Clock size={14} style={{ color: '#9333ea' }} />
          <span>Average Resolution Time</span>
        </div>
        <span style={{ fontWeight: 800, color: '#0f172a' }}>{health.avgResolutionHours} Hours</span>
      </div>

      <div className={styles.healthMetricRow} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475467' }}>
            <ShieldCheck size={14} style={{ color: '#16a34a' }} />
            <span>Cases Within SLA</span>
          </div>
          <span style={{ fontWeight: 800, color: '#16a34a' }}>{health.casesWithinSlaPercent}%</span>
        </div>
        <div style={{ width: '100%', background: '#e2e8f0', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ background: '#16a34a', height: '100%', width: `${health.casesWithinSlaPercent}%`, borderRadius: '999px' }} />
        </div>
      </div>

      <div className={styles.healthMetricRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475467' }}>
          <AlertOctagon size={14} style={{ color: '#dc2626' }} />
          <span>Active SLA Breaches</span>
        </div>
        <span style={{ fontWeight: 800, color: '#dc2626' }}>{health.activeSlaBreaches}</span>
      </div>

      <div className={styles.healthMetricRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475467' }}>
          <UserX size={14} style={{ color: '#d97706' }} />
          <span>Unassigned Cases</span>
        </div>
        <span style={{ fontWeight: 800, color: '#d97706' }}>{health.unassignedCases}</span>
      </div>

      <div className={styles.healthMetricRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475467' }}>
          <ArrowUpRight size={14} style={{ color: '#9333ea' }} />
          <span>Escalated Cases</span>
        </div>
        <span style={{ fontWeight: 800, color: '#9333ea' }}>{health.escalatedCases}</span>
      </div>

      <div className={styles.healthMetricRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475467' }}>
          <Flame size={14} style={{ color: '#b91c1c' }} />
          <span>Safety Cases Open</span>
        </div>
        <span style={{ fontWeight: 800, color: '#b91c1c' }}>{health.safetyCasesOpen}</span>
      </div>

      <div className={styles.healthMetricRow} style={{ borderBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475467' }}>
          <Smile size={14} style={{ color: '#ca8a04' }} />
          <span>Customer Satisfaction</span>
        </div>
        <span style={{ fontWeight: 800, color: '#0f172a' }}>{health.customerSatisfactionPercent}%</span>
      </div>
    </div>
  );
}

