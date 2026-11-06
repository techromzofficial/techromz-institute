"use client";

import React, { useState, useEffect } from "react";
import {
  FILTER_OPTIONS,
  DEFAULT_ANALYTICS_FILTERS,
} from "@/lib/analytics/analyticsFilterUtils";
import { Download, Bookmark, RefreshCw, Filter } from "lucide-react";

export function AnalyticsFilters({
  activeFilters,
  onApplyFilters,
  onClearAll,
  onSaveView,
  onExportDashboard,
}) {
  const [localFilters, setLocalFilters] = useState(activeFilters);

  // Keep local filter state synced with props when activeFilters change externally
  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  const handleSelectChange = (key, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_ANALYTICS_FILTERS);
    onClearAll();
  };

  const showCustomDates = localFilters.reportingPeriod === "custom-range";

  return (
    <form onSubmit={handleSubmit} className="analytics-filter-card">
      <div className="analytics-filter-grid">
        {/* Row 1 Filter Controls */}
        <div className="filter-field">
          <label className="filter-label">Reporting Period</label>
          <select
            className="filter-select"
            value={localFilters.reportingPeriod || "last-30-days"}
            onChange={(e) => handleSelectChange("reportingPeriod", e.target.value)}
          >
            {FILTER_OPTIONS.reportingPeriod.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Comparison Period</label>
          <select
            className="filter-select"
            value={localFilters.comparisonPeriod || "previous-30-days"}
            onChange={(e) => handleSelectChange("comparisonPeriod", e.target.value)}
          >
            {FILTER_OPTIONS.comparisonPeriod.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Business Domain</label>
          <select
            className="filter-select"
            value={localFilters.businessDomain || "all"}
            onChange={(e) => handleSelectChange("businessDomain", e.target.value)}
          >
            {FILTER_OPTIONS.businessDomain.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Marketplace Channel</label>
          <select
            className="filter-select"
            value={localFilters.marketplaceChannel || "all"}
            onChange={(e) => handleSelectChange("marketplaceChannel", e.target.value)}
          >
            {FILTER_OPTIONS.marketplaceChannel.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Supplier</label>
          <select
            className="filter-select"
            value={localFilters.supplier || "all"}
            onChange={(e) => handleSelectChange("supplier", e.target.value)}
          >
            {FILTER_OPTIONS.supplier.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Brand</label>
          <select
            className="filter-select"
            value={localFilters.brand || "all"}
            onChange={(e) => handleSelectChange("brand", e.target.value)}
          >
            {FILTER_OPTIONS.brand.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Product Category</label>
          <select
            className="filter-select"
            value={localFilters.productCategory || "all"}
            onChange={(e) => handleSelectChange("productCategory", e.target.value)}
          >
            {FILTER_OPTIONS.productCategory.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Product</label>
          <select
            className="filter-select"
            value={localFilters.product || "all"}
            onChange={(e) => handleSelectChange("product", e.target.value)}
          >
            {FILTER_OPTIONS.product.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Customer Segment</label>
          <select
            className="filter-select"
            value={localFilters.customerSegment || "all"}
            onChange={(e) => handleSelectChange("customerSegment", e.target.value)}
          >
            {FILTER_OPTIONS.customerSegment.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Region</label>
          <select
            className="filter-select"
            value={localFilters.region || "all"}
            onChange={(e) => handleSelectChange("region", e.target.value)}
          >
            {FILTER_OPTIONS.region.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2 Filter Controls */}
      <div className="analytics-filter-grid secondary-row">
        <div className="filter-field">
          <label className="filter-label">Warehouse</label>
          <select
            className="filter-select"
            value={localFilters.warehouse || "all"}
            onChange={(e) => handleSelectChange("warehouse", e.target.value)}
          >
            {FILTER_OPTIONS.warehouse.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Logistics Partner</label>
          <select
            className="filter-select"
            value={localFilters.logisticsPartner || "all"}
            onChange={(e) => handleSelectChange("logisticsPartner", e.target.value)}
          >
            {FILTER_OPTIONS.logisticsPartner.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Payment Method</label>
          <select
            className="filter-select"
            value={localFilters.paymentMethod || "all"}
            onChange={(e) => handleSelectChange("paymentMethod", e.target.value)}
          >
            {FILTER_OPTIONS.paymentMethod.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Currency</label>
          <select
            className="filter-select"
            value={localFilters.currency || "LKR"}
            onChange={(e) => handleSelectChange("currency", e.target.value)}
          >
            {FILTER_OPTIONS.currency.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Risk Level</label>
          <select
            className="filter-select"
            value={localFilters.riskLevel || "all"}
            onChange={(e) => handleSelectChange("riskLevel", e.target.value)}
          >
            {FILTER_OPTIONS.riskLevel.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {showCustomDates && (
          <>
            <div className="filter-field">
              <label className="filter-label">Date From</label>
              <input
                type="date"
                className="filter-select"
                value={localFilters.dateFrom || ""}
                onChange={(e) => handleSelectChange("dateFrom", e.target.value)}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label">Date To</label>
              <input
                type="date"
                className="filter-select"
                value={localFilters.dateTo || ""}
                onChange={(e) => handleSelectChange("dateTo", e.target.value)}
              />
            </div>
          </>
        )}

        {/* Filter Action Buttons */}
        <div className="filter-actions-cell">
          <button type="submit" className="button primary sm analytics-apply-btn">
            Apply Filters
          </button>
          <button
            type="button"
            className="button sm text-btn"
            onClick={handleReset}
          >
            Clear All
          </button>
          <button
            type="button"
            className="button sm"
            onClick={onSaveView}
            title="Save current filter view"
          >
            <Bookmark size={13} /> Save View
          </button>
          <button
            type="button"
            className="button sm"
            onClick={onExportDashboard}
            title="Export dashboard report"
          >
            <Download size={13} /> Export Dashboard
          </button>
        </div>
      </div>
    </form>
  );
}

