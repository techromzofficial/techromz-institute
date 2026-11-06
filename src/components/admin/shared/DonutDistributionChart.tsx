import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutData {
  name: string;
  value: number;
  color: string;
}

export function DonutDistributionChart({
  data = [],
  totalLabel = "Total Records",
  totalValue
}: {
  data?: DonutData[];
  totalLabel?: string;
  totalValue?: string | number;
}) {
  const sum = data.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
  const hasRealData = sum > 0;

  const displayData: DonutData[] = hasRealData
    ? data
    : [{ name: "No Data", value: 1, color: "#e5e7eb" }];

  const displayTotalValue = totalValue !== undefined ? totalValue : (hasRealData ? sum.toLocaleString() : "0");

  return (
    <div className="flex items-center justify-between w-full h-full min-h-[200px]">
      <div className="relative w-1/2 h-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%" minHeight={180}>
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={68}
              paddingAngle={hasRealData ? 2 : 0}
              dataKey="value"
              stroke="none"
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {hasRealData && (
              <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
          <span className="text-xl font-bold text-gray-900 leading-none">{displayTotalValue}</span>
          <span className="text-[10px] text-gray-500 mt-1 uppercase font-semibold">{totalLabel}</span>
        </div>
      </div>

      <div className="w-1/2 flex flex-col gap-1.5 pl-3">
        {hasRealData ? (
          data.map((item, i) => {
            const pct = sum > 0 ? ((item.value / sum) * 100).toFixed(1) : '0.0';
            return (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-1 font-medium whitespace-nowrap pl-1">
                  <span className="font-semibold text-gray-900">{item.value}</span>
                  <span className="text-gray-400 text-[10px]">({pct}%)</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-muted space-y-1">
            <div className="font-semibold text-gray-700">Status Categories</div>
            <div className="text-[11px] text-gray-500">All category counts: 0 (0.0%)</div>
            <div className="text-[10px] text-gray-400 italic">No operational records found</div>
          </div>
        )}
      </div>
    </div>
  );
}
