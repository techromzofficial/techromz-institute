import React from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export function TrendChart({ data = [], colors = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'] }: { data?: any[], colors?: string[] }) {
  const hasRealData = Array.isArray(data) && data.length > 0 && data.some(item => {
    if (typeof item === 'object' && item !== null) {
      return Object.entries(item).some(([k, v]) => k !== 'date' && Number(v) > 0);
    }
    return false;
  });

  // Extract trend metric keys or fallback category keys
  const keys = hasRealData && data.length > 0
    ? Object.keys(data[0]).filter(k => !['date'].includes(k))
    : ['Booked', 'Shipped', 'Delivered'];

  // Generate 30 structural date ticks if data is empty
  const displayData = hasRealData
    ? data
    : Array.from({ length: 15 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (14 - i));
        return {
          date: d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        };
      });

  return (
    <div className="w-full h-full min-h-[240px] relative">
      {!hasRealData && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="px-3 py-1.5 bg-canvas/90 border border-line rounded-md text-xs font-semibold text-muted shadow-sm">
            No data available for the selected period
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} domain={[0, 'auto']} />
          {hasRealData && (
            <Tooltip
              contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
            />
          )}
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
            iconType="circle"
            iconSize={7}
          />

          {hasRealData && keys.map((key, i) => {
            const lineColor = colors[i % colors.length] || '#2563eb';
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={lineColor}
                strokeWidth={2}
                dot={{ r: 3.5, fill: lineColor, stroke: '#ffffff', strokeWidth: 1 }}
                activeDot={{ r: 6, fill: lineColor, stroke: '#ffffff', strokeWidth: 2 }}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
