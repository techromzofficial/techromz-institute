'use client';

import React from 'react';
import type { CustomerSentimentDistribution, CaseMixCategory } from '@/types/customerSupport';
import styles from '../../../app/admin/customer-support/cases/page.module.css';

interface SentimentCaseMixProps {
  sentiment: CustomerSentimentDistribution | null;
  caseMix: CaseMixCategory[] | null;
}

export function SentimentCaseMix({ sentiment, caseMix }: SentimentCaseMixProps) {
  if (!sentiment || !caseMix) {
    return null;
  }

  const sentimentItems = [
    { label: 'Positive', percent: sentiment.positivePercent, color: '#16a34a' },
    { label: 'Neutral', percent: sentiment.neutralPercent, color: '#64748b' },
    { label: 'Concerned', percent: sentiment.concernedPercent, color: '#d97706' },
    { label: 'Frustrated', percent: sentiment.frustratedPercent, color: '#ea580c' },
    { label: 'Distressed', percent: sentiment.distressedPercent, color: '#dc2626' },
  ];

  return (
    <div className={styles.rightCard}>
      <h3 className={styles.rightCardTitle}>Customer Sentiment & Case Mix</h3>

      {/* Donut Chart and Sentiment Legend */}
      <div style={{ marginBottom: '14px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
          Customer Sentiment
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* SVG Donut Chart */}
          <div style={{ position: 'relative', width: '70px', height: '70px', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#64748b" strokeWidth="4" strokeDasharray="48 52" strokeDashoffset="0" />
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#16a34a" strokeWidth="4" strokeDasharray="22 78" strokeDashoffset="-48" />
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#d97706" strokeWidth="4" strokeDasharray="16 84" strokeDashoffset="-70" />
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ea580c" strokeWidth="4" strokeDasharray="9 91" strokeDashoffset="-86" />
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#dc2626" strokeWidth="4" strokeDasharray="5 95" strokeDashoffset="-95" />
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, fontSize: '11px' }}>
            {sentimentItems.map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '999px', backgroundColor: item.color, display: 'inline-block' }} />
                  <span style={{ color: '#475467' }}>{item.label}</span>
                </div>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', fontStyle: 'italic' }}>* Calculated from recent messages</p>
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
          Case Mix
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {caseMix.map((cat) => (
            <div key={cat.label}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                <span style={{ color: '#475467' }}>{cat.label}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{cat.percent}%</span>
              </div>
              <div style={{ width: '100%', background: '#e2e8f0', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ background: '#722140', height: '100%', width: `${cat.percent}%`, borderRadius: '999px' }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', fontStyle: 'italic' }}>* Calculated from open cases</p>
      </div>
    </div>
  );
}

