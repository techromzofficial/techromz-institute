"use client";

import React, { useEffect, useState } from "react";
import { Search, RotateCcw, Calendar, X } from "lucide-react";
import type { MarketplaceOrderFilterParams } from "@/types/admin";

interface OrderFilterPanelProps {
  filters: MarketplaceOrderFilterParams;
  onFilterChange: (updated: Partial<MarketplaceOrderFilterParams>) => void;
  onClearFilters: () => void;
}

const CHIP_OPTIONS = [
  { key: "failed_payment", label: "Failed Payment" },
  { key: "awaiting_supplier", label: "Awaiting Supplier" },
  { key: "batch_allocation_missing", label: "Batch Allocation Missing" },
  { key: "high_risk", label: "High Risk" },
  { key: "sla_breach", label: "SLA Breach" },
  { key: "return_requested", label: "Return Requested" },
  { key: "refund_requested", label: "Refund Requested" },
  { key: "cod_pending", label: "COD Pending" },
  { key: "split_order", label: "Split Order" },
  { key: "delivery_exception", label: "Delivery Exception" },
  { key: "customer_complaint", label: "Customer Complaint" },
];

export function OrderFilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
}: OrderFilterPanelProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  // Debounced search handling
  useEffect(() => {
    setSearchValue(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== (filters.search || "")) {
        onFilterChange({ search: searchValue, page: 1 });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue]);

  const activeFlags = filters.flags || [];

  const toggleFlag = (flagKey: string) => {
    let newFlags: string[];
    if (activeFlags.includes(flagKey)) {
      newFlags = activeFlags.filter((f) => f !== flagKey);
    } else {
      newFlags = [...activeFlags, flagKey];
    }
    onFilterChange({ flags: newFlags, page: 1 });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.orderStatus && filters.orderStatus !== "all") ||
    Boolean(filters.paymentStatus && filters.paymentStatus !== "all") ||
    Boolean(filters.paymentMethod && filters.paymentMethod !== "all") ||
    Boolean(filters.fulfilmentStatus && filters.fulfilmentStatus !== "all") ||
    Boolean(filters.deliveryStatus && filters.deliveryStatus !== "all") ||
    Boolean(filters.supplier && filters.supplier !== "all") ||
    Boolean(filters.brand && filters.brand !== "all") ||
    Boolean(filters.logisticsPartner && filters.logisticsPartner !== "all") ||
    Boolean(filters.riskLevel && filters.riskLevel !== "all") ||
    Boolean(filters.assignedOfficer && filters.assignedOfficer !== "all") ||
    Boolean(filters.filterKey) ||
    activeFlags.length > 0;

  return (
    <div className="order-filter-panel">
      {/* Row 1: Search & Core Status Selectors */}
      <div className="filter-row">
        <div className="search-control">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Order ID, customer, phone, email, SKU..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => {
                setSearchValue("");
                onFilterChange({ search: "", page: 1 });
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-select-group">
          <label className="filter-label">Order Status</label>
          <select
            className="filter-select"
            value={filters.orderStatus || "all"}
            onChange={(e) => onFilterChange({ orderStatus: e.target.value, page: 1 })}
          >
            <option value="all">All Statuses</option>
            <option value="processing">Processing</option>
            <option value="on hold">On Hold</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="filter-select-group">
          <label className="filter-label">Payment Status</label>
          <select
            className="filter-select"
            value={filters.paymentStatus || "all"}
            onChange={(e) => onFilterChange({ paymentStatus: e.target.value, page: 1 })}
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="partially paid">Partially Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="filter-select-group">
          <label className="filter-label">Payment Method</label>
          <select
            className="filter-select"
            value={filters.paymentMethod || "all"}
            onChange={(e) => onFilterChange({ paymentMethod: e.target.value, page: 1 })}
          >
            <option value="all">All Methods</option>
            <option value="card">Card</option>
            <option value="bank transfer">Bank Transfer</option>
            <option value="cod">COD</option>
          </select>
        </div>

        <div className="filter-select-group">
          <label className="filter-label">Fulfilment Status</label>
          <select
            className="filter-select"
            value={filters.fulfilmentStatus || "all"}
            onChange={(e) => onFilterChange({ fulfilmentStatus: e.target.value, page: 1 })}
          >
            <option value="all">All Statuses</option>
            <option value="awaiting supplier">Awaiting Supplier</option>
            <option value="not started">Not Started</option>
            <option value="partially allocated">Partially Allocated</option>
            <option value="packed">Packed</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="filter-select-group">
          <label className="filter-label">Delivery Status</label>
          <select
            className="filter-select"
            value={filters.deliveryStatus || "all"}
            onChange={(e) => onFilterChange({ deliveryStatus: e.target.value, page: 1 })}
          >
            <option value="all">All Statuses</option>
            <option value="not dispatched">Not Dispatched</option>
            <option value="in transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="delayed">Delayed</option>
            <option value="not available">Not Available</option>
          </select>
        </div>
      </div>

      {/* Row 2: Secondary Metadata Selectors */}
      <div className="filter-row">
        <div className="filter-select-group">
          <label className="filter-label">Supplier</label>
          <select
            className="filter-select"
            value={filters.supplier || "all"}
            onChange={(e) => onFilterChange({ supplier: e.target.value, page: 1 })}
          >
            <option value="all">All Suppliers</option>
            <option value="Serene Botanics Lanka">Serene Botanics Lanka</option>
            <option value="Ceylon Glow Exports">Ceylon Glow Exports</option>
            <option value="Velvet Botanics Ltd.">Velvet Botanics Ltd.</option>
            <option value="LuxeSkin Wholesale">LuxeSkin Wholesale</option>
            <option value="Tokyo Beauty Co.">Tokyo Beauty Co.</option>
          </select>
        </div>

        <div className="filter-select-group">
          <label className="filter-label">Brand</label>
          <select
            className="filter-select"
            value={filters.brand || "all"}
            onChange={(e) => onFilterChange({ brand: e.target.value, page: 1 })}
          >
            <option value="all">All Brands</option>
            <option value="Aurora Skin">Aurora Skin</option>
            <option value="Lumière Labs">Lumière Labs</option>
            <option value="Velvet Touch">Velvet Touch</option>
            <option value="LuxeSkin Premium">LuxeSkin Premium</option>
            <option value="Tokyo Glow">Tokyo Glow</option>
          </select>
        </div>

        <div className="filter-select-group">
          <label className="filter-label">Logistics Partner</label>
          <select
            className="filter-select"
            value={filters.logisticsPartner || "all"}
            onChange={(e) => onFilterChange({ logisticsPartner: e.target.value, page: 1 })}
          >
            <option value="all">All Partners</option>
            <option value="shipxpress">ShipXpress</option>
            <option value="riderfast">RiderFast</option>
            <option value="quickgo">QuickGo</option>
          </select>
        </div>

        <div className="filter-select-group">
          <label className="filter-label">Risk Level</label>
          <select
            className="filter-select"
            value={filters.riskLevel || "all"}
            onChange={(e) => onFilterChange({ riskLevel: e.target.value, page: 1 })}
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="filter-select-group">
          <label className="filter-label">Assigned Officer</label>
          <select
            className="filter-select"
            value={filters.assignedOfficer || "all"}
            onChange={(e) => onFilterChange({ assignedOfficer: e.target.value, page: 1 })}
          >
            <option value="all">All Officers</option>
            <option value="Elena Vance">Elena Vance</option>
            <option value="Dilan Perera">Dilan Perera</option>
            <option value="Nadeesha Silva">Nadeesha Silva</option>
            <option value="Kasun Jayawardena">Kasun Jayawardena</option>
            <option value="Ruwanthi Mendis">Ruwanthi Mendis</option>
          </select>
        </div>

        <div className="filter-select-group">
          <label className="filter-label">Order Date</label>
          <div className="date-picker-button">
            <Calendar size={14} />
            <span>Select Date Range</span>
          </div>
        </div>

        <div className="filter-select-group">
          <label className="filter-label">Delivery Date</label>
          <div className="date-picker-button">
            <Calendar size={14} />
            <span>Select Date Range</span>
          </div>
        </div>
      </div>

      {/* Row 3: Removable Filter Chips & Clear Action */}
      <div className="filter-chips-row">
        <div className="filter-chips-list">
          {CHIP_OPTIONS.map((chip) => {
            const isActive = activeFlags.includes(chip.key);
            return (
              <button
                key={chip.key}
                type="button"
                className={`filter-chip ${isActive ? "active" : ""}`}
                onClick={() => toggleFlag(chip.key)}
                aria-pressed={isActive}
              >
                {chip.label}
                {isActive && <X size={12} className="chip-remove" />}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="clear-all-filters-btn"
            onClick={onClearFilters}
          >
            <RotateCcw size={14} />
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
