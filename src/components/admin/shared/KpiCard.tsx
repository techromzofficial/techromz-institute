import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  index?: number;
  title: string;
  value: string | number;
  delta?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  alert?: boolean;
}

export function KpiCard({ index, title, value, delta, icon: Icon, iconBgColor = 'bg-gray-100', iconColor = 'text-gray-600', alert }: KpiCardProps) {
  return (
    <div className="relative flex flex-col justify-between p-3 bg-white border border-gray-200 rounded-md shadow-sm h-full min-h-[90px]">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-1.5">
          {index !== undefined && <span className="text-[10px] font-bold text-gray-900">{index}</span>}
          <span className="text-[11px] font-medium text-gray-500 truncate">{title}</span>
        </div>
        {Icon && (
          <div className={`flex items-center justify-center w-7 h-7 rounded-full ${iconBgColor} ${iconColor} ${alert ? 'ring-2 ring-red-100' : ''}`}>
            <Icon size={14} strokeWidth={2} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-gray-900 leading-none">{value}</span>
        {delta && (
          <span className={`text-[10px] font-bold flex items-center gap-0.5 ${delta.trend === 'up' ? 'text-green-600' : delta.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {delta.trend === 'up' ? '↑' : delta.trend === 'down' ? '↓' : ''} {delta.value}
          </span>
        )}
      </div>
    </div>
  );
}

export function DashboardGrid({
  children,
  columns = 6,
}: {
  children: React.ReactNode;
  columns?: 4 | 6;
}) {
  const gridClass =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-6";

  return (
    <div className={`grid ${gridClass} gap-3 mb-4`}>
      {children}
    </div>
  );
}
