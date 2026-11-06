"use client";

import React, { useState } from "react";
import { ReportPeriodTabs } from "./ReportPeriodTabs";

export function ReportFilters({ queryParams = {}, onApplyFilters, onResetFilters, onOpenExportModal }) {
  const [localFilters, setLocalFilters] = useState(queryParams || {});

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApply = (e) => {
    e.preventDefault();
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    onResetFilters();
  };

  const handleSelectPeriod = (periodId) => {
    const updated = { ...localFilters, period: periodId };
    setLocalFilters(updated);
    onApplyFilters(updated);
  };

  return (
    <form className="report-filter-card" onSubmit={handleApply}>
      {/* Row 1 */}
      <div className="report-filter-grid row-1">
        <div className="filter-field">
          <label className="filter-label">Reporting Period</label>
          <select
            className="filter-select"
            value={localFilters.period || "last-30-days"}
            onChange={(e) => handleChange("period", e.target.value)}
          >
            <option value="last-30-days">Jun 25, 2026 – Jul 24, 2026</option>
            <option value="last-7-days">Last 7 Days</option>
            <option value="last-90-days">Last 90 Days</option>
            <option value="this-month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Comparison Period</label>
          <select
            className="filter-select"
            value={localFilters.comparison || "previous-30-days"}
            onChange={(e) => handleChange("comparison", e.target.value)}
          >
            <option value="previous-30-days">May 26, 2026 – Jun 24, 2026</option>
            <option value="previous-year">Previous Year</option>
            <option value="none">No Comparison</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Marketplace Channel</label>
          <select
            className="filter-select"
            value={localFilters.marketplaceChannel || "all"}
            onChange={(e) => handleChange("marketplaceChannel", e.target.value)}
          >
            <option value="all">All Channels</option>
            <option value="web">Web</option>
            <option value="mobile-app">Mobile App</option>
            <option value="marketplace">Marketplace</option>
            <option value="b2b-portal">B2B Portal</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Order Status</label>
          <select
            className="filter-select"
            value={localFilters.orderStatus || "all"}
            onChange={(e) => handleChange("orderStatus", e.target.value)}
          >
            <option value="all">All Order Statuses</option>
            <option value="processing">Processing</option>
            <option value="awaiting-supplier">Awaiting Supplier</option>
            <option value="allocated">Fully Allocated</option>
            <option value="dispatched">Ready for Dispatch</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Payment Status</label>
          <select
            className="filter-select"
            value={localFilters.paymentStatus || "all"}
            onChange={(e) => handleChange("paymentStatus", e.target.value)}
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Fulfilment Status</label>
          <select
            className="filter-select"
            value={localFilters.fulfilmentStatus || "all"}
            onChange={(e) => handleChange("fulfilmentStatus", e.target.value)}
          >
            <option value="all">All Fulfilment Statuses</option>
            <option value="supplier-confirmed">Supplier Confirmed</option>
            <option value="allocated">Fully Allocated</option>
            <option value="not-allocated">Not Allocated</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Delivery Status</label>
          <select
            className="filter-select"
            value={localFilters.deliveryStatus || "all"}
            onChange={(e) => handleChange("deliveryStatus", e.target.value)}
          >
            <option value="all">All Delivery Statuses</option>
            <option value="not-dispatched">Not Dispatched</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Row 2 */}
      <div className="report-filter-grid row-2">
        <div className="filter-field">
          <label className="filter-label">Supplier</label>
          <select
            className="filter-select"
            value={localFilters.supplier || "all"}
            onChange={(e) => handleChange("supplier", e.target.value)}
          >
            <option value="all">All Suppliers</option>
            <option value="luxe-distribution">Luxe Distribution Pvt Ltd</option>
            <option value="pure-organics">Pure Organics Co</option>
            <option value="vogue-supply">Vogue Supply</option>
            <option value="beauty-plus">Beauty Plus Ltd</option>
            <option value="royal-fragrance">Royal Fragrance Co</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Brand</label>
          <select
            className="filter-select"
            value={localFilters.brand || "all"}
            onChange={(e) => handleChange("brand", e.target.value)}
          >
            <option value="all">All Brands</option>
            <option value="luxe-derm">Luxe Derm</option>
            <option value="vogue-beauty">Vogue Beauty</option>
            <option value="ogx">OGX</option>
            <option value="yardley">Yardley</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Product Category</label>
          <select
            className="filter-select"
            value={localFilters.productCategory || "all"}
            onChange={(e) => handleChange("productCategory", e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="skincare">Skincare</option>
            <option value="makeup">Makeup</option>
            <option value="haircare">Haircare</option>
            <option value="fragrance">Fragrance</option>
            <option value="personal-care">Personal Care</option>
            <option value="wellness">Wellness</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Product</label>
          <select
            className="filter-select"
            value={localFilters.product || "all"}
            onChange={(e) => handleChange("product", e.target.value)}
          >
            <option value="all">All Products</option>
            <option value="vitamin-c">Radiance Vitamin C Serum - 30ml</option>
            <option value="lipstick">Matte Finish Lipstick - Ruby Red</option>
            <option value="moisturizer">Hydrating Face Moisturizer - 50ml</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Customer Segment</label>
          <select
            className="filter-select"
            value={localFilters.customerSegment || "all"}
            onChange={(e) => handleChange("customerSegment", e.target.value)}
          >
            <option value="all">All Segments</option>
            <option value="loyalty">Loyalty</option>
            <option value="regular">Regular</option>
            <option value="occasional">Occasional</option>
            <option value="new">New Customers</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Region</label>
          <select
            className="filter-select"
            value={localFilters.region || "all"}
            onChange={(e) => handleChange("region", e.target.value)}
          >
            <option value="all">All Regions</option>
            <option value="western">Western</option>
            <option value="central">Central</option>
            <option value="southern">Southern</option>
            <option value="northern">Northern</option>
            <option value="eastern">Eastern</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Warehouse</label>
          <select
            className="filter-select"
            value={localFilters.warehouse || "all"}
            onChange={(e) => handleChange("warehouse", e.target.value)}
          >
            <option value="all">All Warehouses</option>
            <option value="colombo-hub">Colombo Central Hub</option>
            <option value="kandy-fulfillment">Kandy Fulfilment Center</option>
            <option value="galle-facility">Galle Logistics Facility</option>
          </select>
        </div>
      </div>

      {/* Row 3 */}
      <div className="report-filter-grid row-3">
        <div className="filter-field">
          <label className="filter-label">Logistics Partner</label>
          <select
            className="filter-select"
            value={localFilters.logisticsPartner || "all"}
            onChange={(e) => handleChange("logisticsPartner", e.target.value)}
          >
            <option value="all">All Partners</option>
            <option value="speedygo">SpeedyGo</option>
            <option value="keenship">KeenShip Delivery</option>
            <option value="quickpack">QuickPack</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Payment Method</label>
          <select
            className="filter-select"
            value={localFilters.paymentMethod || "all"}
            onChange={(e) => handleChange("paymentMethod", e.target.value)}
          >
            <option value="all">All Methods</option>
            <option value="card">Card</option>
            <option value="ewallet">eWallet</option>
            <option value="bank-transfer">Bank Transfer</option>
            <option value="cod">COD</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Currency</label>
          <select
            className="filter-select"
            value={localFilters.currency || "LKR"}
            onChange={(e) => handleChange("currency", e.target.value)}
          >
            <option value="LKR">LKR</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Risk Level</label>
          <select
            className="filter-select"
            value={localFilters.riskLevel || "all"}
            onChange={(e) => handleChange("riskLevel", e.target.value)}
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">SLA Status</label>
          <select
            className="filter-select"
            value={localFilters.slaStatus || "all"}
            onChange={(e) => handleChange("slaStatus", e.target.value)}
          >
            <option value="all">All SLA Statuses</option>
            <option value="within-sla">Within SLA</option>
            <option value="at-risk">SLA At Risk</option>
            <option value="breached">SLA Breached</option>
          </select>
        </div>

        <div className="filter-field">
          <label className="filter-label">Assigned Officer</label>
          <select
            className="filter-select"
            value={localFilters.assignedOfficer || "all"}
            onChange={(e) => handleChange("assignedOfficer", e.target.value)}
          >
            <option value="all">All Officers</option>
            <option value="aria-shah">Aria Shah</option>
            <option value="mia-carter">Mia Carter</option>
            <option value="leo-cruz">Leo Cruz</option>
            <option value="nora-blake">Nora Blake</option>
          </select>
        </div>
      </div>

      {/* Row 4: Period Tabs + Action Buttons */}
      <div className="report-filter-footer-row">
        <ReportPeriodTabs
          activePeriod={localFilters.period || "last-30-days"}
          onSelectPeriod={handleSelectPeriod}
        />

        <div className="filter-actions-group">
          <button type="submit" className="btn-primary-burgundy filter-btn">
            Apply Filters
          </button>
          <button type="button" onClick={handleReset} className="btn-secondary-light filter-btn">
            Clear All
          </button>
          <button type="button" className="btn-secondary-light filter-btn">
            Save View
          </button>
          <button type="button" onClick={onOpenExportModal} className="btn-secondary-light filter-btn">
            Export Filtered Data
          </button>
        </div>
      </div>
    </form>
  );
}

