import React from 'react';
import { Search, SlidersHorizontal, Download, LayoutTemplate } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  options: { label: string; value: string }[];
}

interface FilterToolbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: () => void;
  filters: FilterOption[];
  onClearAll?: () => void;
  onSaveView?: () => void;
  quickChips?: { id: string; label: string; count?: number; active?: boolean }[];
  onToggleChip?: (id: string) => void;
}

export function FilterToolbar({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  filters,
  onClearAll,
  onSaveView,
  quickChips,
  onToggleChip
}: FilterToolbarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-grow">
          {/* Search */}
          <div className="relative min-w-[240px] max-w-[320px] flex-grow">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-3 py-1.5 text-[13px] border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#7a0023] focus:border-[#7a0023] shadow-sm placeholder:text-gray-400"
            />
          </div>

          {/* Dropdown Filters */}
          {filters.map((filter) => (
            <select
              key={filter.id}
              className="px-3 py-1.5 text-[13px] border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#7a0023] focus:border-[#7a0023] shadow-sm text-gray-700 font-medium"
              defaultValue=""
            >
              <option value="" disabled>{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}

          {/* More Filters button */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            More Filters <SlidersHorizontal size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onClearAll && (
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 text-[13px] font-semibold text-red-600 hover:text-red-700 bg-transparent"
            >
              Clear All
            </button>
          )}
          {onSaveView && (
            <button
              onClick={onSaveView}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Save View <Download size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Chips */}
      {quickChips && quickChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {quickChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => onToggleChip?.(chip.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors border ${
                chip.active
                  ? 'bg-[#7a0023]/10 text-[#7a0023] border-[#7a0023]/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <LayoutTemplate size={12} />
              {chip.label}
              {chip.count !== undefined && (
                <span className={`px-1.5 rounded-full ${chip.active ? 'bg-[#7a0023]/10' : 'bg-gray-100'} text-[10px]`}>
                  {chip.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
