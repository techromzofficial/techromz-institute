'use client';

import React from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { ChartCard } from '@/components/admin/shared/ChartCard';

interface DataItem {
  name: string;
  value: number;
  color: string;
  percentage?: string;
}

interface DonutChartCardProps {
  title: string;
  data: DataItem[];
  totalLabel: string;
  totalValue: number | string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function DonutChartCard({
  title,
  data,
  totalLabel,
  totalValue,
  loading,
  error,
  onRetry,
}: DonutChartCardProps) {
  return (
    <ChartCard
      title={title}
      loading={loading}
      error={error}
      onRetry={onRetry}
      className="h-full"
    >
      {data.length === 0 ? (
        <div
          role="status"
          className="min-h-[200px] flex items-center justify-center text-xs text-gray-500"
        >
          No distribution data available.
        </div>
      ) : (
        <div className="flex items-center min-h-[200px]">
          <div className="w-1/2 h-40 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-gray-900">
                {totalValue}
              </span>
              <span className="text-[10px] text-gray-500">
                {totalLabel}
              </span>
            </div>
          </div>

          <div className="w-1/2 pl-4 flex flex-col gap-2">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
