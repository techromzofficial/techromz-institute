"use client";

import React, {
  useEffect,
  useState,
} from "react";

import {
  Search,
  X,
} from "lucide-react";

import { useDebounce } from "@/hooks/useDebounce";

interface ShipmentFiltersProps {
  search: string;
  status: string;
  statuses: string[];
  onChange: (filters: {
    search: string;
    status: string;
  }) => void;
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export function ShipmentFilters({
  search,
  status,
  statuses,
  onChange,
}: ShipmentFiltersProps) {
  const [searchTerm, setSearchTerm] =
    useState(search);

  const debouncedSearch =
    useDebounce(
      searchTerm,
      500,
    );

  useEffect(() => {
    if (
      debouncedSearch !== search
    ) {
      onChange({
        search: debouncedSearch,
        status,
      });
    }
  }, [
    debouncedSearch,
    search,
    status,
    onChange,
  ]);

  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  const hasActiveFilters =
    searchTerm !== "" ||
    status !== "";

  const handleClear = () => {
    setSearchTerm("");

    onChange({
      search: "",
      status: "",
    });
  };

  return (
    <div className="logistics-workspace-main filter-panel-rich">
      <div className="filter-top-row">
        <div className="search-box">
          <Search
            className="search-icon"
            size={18}
          />

          <input
            type="text"
            placeholder="Search shipment, tracking or order number..."
            className="search-input"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value,
              )
            }
          />
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            className="clear-filters-btn"
            onClick={handleClear}
          >
            <X size={14} />
            Clear Filters
          </button>
        ) : null}
      </div>

      <div className="filter-controls-grid">
        <div className="filter-group">
          <label>
            Shipment Status
          </label>

          <select
            value={status}
            onChange={(event) =>
              onChange({
                search: searchTerm,
                status:
                  event.target.value,
              })
            }
          >
            <option value="">
              All Persisted Statuses
            </option>

            {statuses.map(
              (persistedStatus) => (
                <option
                  key={
                    persistedStatus
                  }
                  value={
                    persistedStatus
                  }
                >
                  {formatStatus(
                    persistedStatus,
                  )}
                </option>
              ),
            )}
          </select>
        </div>
      </div>
    </div>
  );
}