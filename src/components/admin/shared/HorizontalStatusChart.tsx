import React from 'react';

export interface StatusData {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export function HorizontalStatusChart({ data = [], total }: { data?: StatusData[]; total?: number }) {
  const hasData = Array.isArray(data) && data.length > 0;
  const totalCount = total !== undefined ? total : data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  const displayData: StatusData[] = hasData
    ? data
    : [
        { label: "On Track", count: 0, percentage: 0, color: "#10b981" },
        { label: "At Risk", count: 0, percentage: 0, color: "#f59e0b" },
        { label: "Delayed", count: 0, percentage: 0, color: "#f97316" },
        { label: "Blocked", count: 0, percentage: 0, color: "#ef4444" },
        { label: "On Hold", count: 0, percentage: 0, color: "#64748b" },
      ];

  return (
    <div className="flex flex-col gap-2.5 w-full pt-2">
      {displayData.map((item, i) => (
        <div key={i} className="flex items-center text-[11px]">
          <div className="w-28 flex-shrink-0 text-gray-600 truncate pr-2">{item.label}</div>
          <div className="flex-grow flex items-center gap-2">
            <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
          <div className="w-16 flex-shrink-0 text-right font-medium text-gray-900">{item.count.toLocaleString()}</div>
          <div className="w-12 flex-shrink-0 text-right text-gray-500">({item.percentage.toFixed(1)}%)</div>
        </div>
      ))}

      <div className="flex items-center text-[11px] font-bold mt-2 pt-2 border-t border-gray-100">
        <div className="w-28 flex-shrink-0 text-gray-900 pr-2">Total Operations</div>
        <div className="flex-grow"></div>
        <div className="w-16 flex-shrink-0 text-right text-gray-900">{totalCount.toLocaleString()}</div>
        <div className="w-12 flex-shrink-0 text-right text-gray-900">({hasData && totalCount > 0 ? '100%' : '0%'})</div>
      </div>
    </div>
  );
}
