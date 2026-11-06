import React from 'react';
import { ChevronRight } from 'lucide-react';

interface RightInsightRailProps {
  children: React.ReactNode;
}

export function RightInsightRail({ children }: RightInsightRailProps) {
  return (
    <div className="w-80 flex-shrink-0 flex flex-col gap-6 pl-6 border-l border-gray-200 ml-6 hidden xl:flex">
      {children}
    </div>
  );
}

interface RailSectionProps {
  title: string;
  action?: { label: string; href?: string; onClick?: () => void };
  children: React.ReactNode;
}

export function RailSection({ title, action, children }: RailSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs font-medium text-[#7a122e] hover:underline"
          >
            {action.label}
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

interface HealthScoreProps {
  score: number;
  label: string;
  status: 'Excellent' | 'Good' | 'Stable' | 'Needs Attention' | 'Critical';
  metrics: { label: string; value: string | number }[];
}

export function RailHealthScore({ score, label, status, metrics }: HealthScoreProps) {
  const getColor = () => {
    if (score >= 90) return 'text-green-600 border-green-600';
    if (score >= 75) return 'text-green-500 border-green-500';
    if (score >= 50) return 'text-yellow-500 border-yellow-500';
    return 'text-red-500 border-red-500';
  };

  const statusColor = () => {
    if (score >= 90) return 'bg-green-100 text-green-700';
    if (score >= 75) return 'bg-green-50 text-green-600';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col items-center">
          <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center flex-col ${getColor()}`}>
            <span className="text-2xl font-bold">{score}</span>
            <span className="text-[10px] text-gray-500 border-t border-current w-12 text-center pt-0.5">/100</span>
          </div>
          <div className="mt-2 text-xs font-medium">
            <span className={`px-2 py-0.5 rounded-full ${statusColor()}`}>{status}</span>
          </div>
        </div>
        <div className="flex-1 pl-4 flex flex-col gap-2">
          {metrics.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{m.label}</span>
              <span className="font-semibold text-gray-900">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
      {label && (
        <button className="text-xs text-[#7a122e] font-medium hover:underline text-left">
          View health dashboard &rarr;
        </button>
      )}
    </div>
  );
}

interface AlertItemProps {
  label: string;
  count: number;
  critical?: boolean;
}

export function RailAlertList({ items }: { items: AlertItemProps[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {item.critical ? (
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            )}
            <span className="text-gray-700 truncate max-w-[200px]" title={item.label}>
              {item.label}
            </span>
          </div>
          <span className="font-medium text-gray-900">{item.count}</span>
        </li>
      ))}
    </ul>
  );
}

interface QueueItemProps {
  label: string;
  count: number;
  icon?: React.ReactNode;
}

export function RailQueueList({ items }: { items: QueueItemProps[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-center justify-between text-xs group cursor-pointer hover:bg-gray-50 p-1 -mx-1 rounded-sm">
          <div className="flex items-center gap-2 text-gray-600 group-hover:text-gray-900 transition-colors">
            {item.icon}
            <span>{item.label}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-900 font-medium">
            <span>{item.count}</span>
            <ChevronRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </li>
      ))}
    </ul>
  );
}
