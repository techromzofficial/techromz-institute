'use client';

import { HealthScoreGauge } from '@/components/admin/shared/RightIntelligenceRail';

interface SupplierHealthGaugeProps {
  score: number | null;
  label: string;
  statusText: string;
  statusColor?: string;
  metrics: {
    label: string;
    value: string;
    progress: number;
  }[];
  loading?: boolean;
  error?: string | null;
}

export function SupplierHealthGauge({
  score,
  label,
  statusText,
  statusColor,
  metrics,
  loading = false,
  error,
}: SupplierHealthGaugeProps) {
  if (loading) {
    return (
      <div
        role="status"
        className="h-24 animate-pulse bg-gray-100 rounded"
      >
        Loading health metrics…
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-xs text-rose-700">
        Health metrics unavailable: {error}
      </p>
    );
  }

  if (score === null) {
    return (
      <div
        role="status"
        className="border border-dashed rounded p-4 text-xs text-gray-500"
      >
        Health assessment unavailable. No recorded score is available.
      </div>
    );
  }

  return (
    <HealthScoreGauge
      score={score}
      label={label}
      statusText={statusText}
      statusColor={statusColor}
      metrics={metrics}
    />
  );
}
