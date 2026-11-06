'use client';

import { useEffect, useState } from 'react';
import { supplierQueueMetrics, SupplierQueueMetric } from '@/mocks/admin/supplierQueue.mock';

export function VerificationStatsGrid() {
  const [metrics, setMetrics] = useState<SupplierQueueMetric[] | null>(null);

  useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) setMetrics(supplierQueueMetrics);
    }, 500);
    return () => {
      active = false;
    };
  }, []);

  if (!metrics) {
    return (
      <div className="supplier-metrics">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card supplier-metric">
            <div className="skeleton" style={{ height: 14, width: '60%' }} />
            <div className="skeleton" style={{ height: 28, width: '40%', margin: '8px 0' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="supplier-metrics">
      {metrics.map((metric) => (
        <article className={`card supplier-metric ${metric.tone ?? ''}`} key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>Verification queue</small>
        </article>
      ))}
    </div>
  );
}
