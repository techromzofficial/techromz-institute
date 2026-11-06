import React from "react";
import { Search } from "lucide-react";

interface LogisticsFilterPanelProps {
  filters: any;
  onFilterChange: (newFilters: any) => void;
  onClearFilters: () => void;
}

export function LogisticsFilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
}: LogisticsFilterPanelProps) {
  const hasActiveFilters = Boolean(
    (filters.search && filters.search !== "") ||
    (filters.status && filters.status !== "all")
  );

  return (
    <div className="bg-white p-5 rounded-xl border border-line shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-ink">Filter Shipments</h3>
        {hasActiveFilters && (
          <button type="button" className="text-primary-900 text-sm font-medium hover:underline" onClick={onClearFilters}>
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-muted mb-1.5">Search</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 bg-canvas border border-line rounded-lg focus:outline-none focus:border-primary-900 text-sm"
              placeholder="Tracking No. or Order Ref..."
              value={filters.search || ""}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">Status</label>
          <select
            className="w-full px-4 py-2 bg-canvas border border-line rounded-lg focus:outline-none focus:border-primary-900 text-sm"
            value={filters.status || "all"}
            onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Exception">Exception</option>
          </select>
        </div>
      </div>
    </div>
  );
}
