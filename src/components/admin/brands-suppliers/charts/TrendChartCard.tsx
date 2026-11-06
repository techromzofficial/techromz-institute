'use client';

import React from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartCard } from '@/components/admin/shared/ChartCard';

export interface TrendData {
  name: string;
  [key: string]: string | number;
}

interface TrendSeries {
  key: string;
  name: string;
  color: string;
  type: 'line' | 'bar' | 'area';
  stackId?: string;
}

interface TrendChartCardProps {
  title: string;
  data: TrendData[];
  series: TrendSeries[];
  timeRange?: string;
  days?: number;
  onDaysChange?: (days: number) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function TrendChartCard({
  title,
  data,
  series,
  timeRange = 'Last 30 Days',
  days = 30,
  onDaysChange,
  loading,
  error,
  onRetry,
}: TrendChartCardProps) {
  const actions = onDaysChange ? (
    <select
      aria-label={`${title} date range`}
      value={days}
      onChange={(event) => onDaysChange(Number(event.target.value))}
      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
    >
      {[7, 30, 90].map((value) => (
        <option key={value} value={value}>
          Last {value} Days
        </option>
      ))}
    </select>
  ) : undefined;

  return (
    <ChartCard
      title={title}
      subtitle={onDaysChange ? `Last ${days} Days` : timeRange}
      loading={loading}
      error={error}
      onRetry={onRetry}
      actions={actions}
    >
      {data.length === 0 ? (
        <div
          role="status"
          className="h-[240px] flex items-center justify-center text-xs text-gray-500"
        >
          No recorded activity for this period.
        </div>
      ) : (
        <div
          className="h-[240px] w-full min-w-0"
          role="img"
          aria-label={title}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6b7280' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6b7280' }}
              />
              <Tooltip />
              <Legend iconType="circle" iconSize={8} />

              {series.map((item) => {
                if (item.type === 'bar') {
                  return (
                    <Bar
                      key={item.key}
                      dataKey={item.key}
                      name={item.name}
                      fill={item.color}
                      stackId={item.stackId}
                      maxBarSize={40}
                    />
                  );
                }

                if (item.type === 'line') {
                  return (
                    <Line
                      key={item.key}
                      type="monotone"
                      dataKey={item.key}
                      name={item.name}
                      stroke={item.color}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  );
                }

                return (
                  <Area
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    name={item.name}
                    stroke={item.color}
                    fill={item.color}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
