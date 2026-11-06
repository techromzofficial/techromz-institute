'use client';

import { useEffect, useState } from 'react';
import { systemEfficiency } from '@/mocks/admin/supplierQueue.mock';

export function SystemEfficiencyCard() {
  const [data, setData] = useState<typeof systemEfficiency | null>(null);

  useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) setData(systemEfficiency);
    }, 550);
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card">
      <p className="eyebrow">System Efficiency</p>
      {!data ? (
        <div className="skeleton" style={{ height: 60, borderRadius: 8, marginTop: 10 }} />
      ) : (
        <>
          <span className="muted">{data.label}</span>
          <div className="efficiency-value">
            <strong>{data.value}</strong>
            <small>{data.comparison}</small>
          </div>
          <span className="progress-track">
            <i style={{ width: `${data.progress}%` }} />
          </span>
        </>
      )}
    </section>
  );
}
