import React from 'react';
import { Lock, RefreshCw } from 'lucide-react';

export interface ContextScopeItem {
  label: string;
  value: string;
}

interface ContextScopeBarProps {
  items?: ContextScopeItem[];
  lastSynced?: string;
  accessNote?: string;
}

export function ContextScopeBar({ items = [], lastSynced, accessNote }: ContextScopeBarProps) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="flex flex-wrap items-start justify-between bg-white border-y border-gray-200 py-3 mb-4">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        {safeItems.map((item, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-[10px] font-medium text-gray-500 mb-0.5">{item.label}</span>
            <span className="text-xs font-semibold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-end pl-4 border-l border-gray-200 ml-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Live Data
            </span>
            <span className="text-[10px] text-gray-500">Last synced: {lastSynced || 'Just now'}</span>
          </div>
          <button className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
        {accessNote && (
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <Lock size={10} /> {accessNote}
          </span>
        )}
      </div>
    </div>
  );
}
