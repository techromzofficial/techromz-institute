import React from 'react';

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex items-center gap-6 border-b border-gray-200 mb-4 px-1 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative pb-3 text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === tab.id
              ? 'text-[#7a0023]'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === tab.id ? 'bg-[#7a0023]/10 text-[#7a0023]' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          )}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7a0023]" />
          )}
        </button>
      ))}
    </div>
  );
}
