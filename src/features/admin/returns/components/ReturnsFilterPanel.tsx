"use client";

import React from "react";
import { Search, X, SlidersHorizontal, BookmarkPlus } from "lucide-react";
import styles from "./returns-queue.module.css";
import type { ReturnFilterParams } from "@/types/admin";

interface ReturnsFilterPanelProps {
  filters: ReturnFilterParams;
  onFilterChange: (key: keyof ReturnFilterParams, value: string) => void;
  onQuickFilterToggle: (chipLabel: string) => void;
  onClearAll: () => void;
  onSaveView: () => void;
}

export function ReturnsFilterPanel({
  filters,
  onFilterChange,
  onQuickFilterToggle,
  onClearAll,
  onSaveView,
}: ReturnsFilterPanelProps) {
  const quickFilterChips = [
    "Safety Complaint",
    "Evidence Required",
    "Inspection Pending",
    "SLA Breach",
    "Authenticity",
    "Refund Decision Required",
    "High Value",
    "Repeat Claimant",
    "Unassigned",
  ];

  return (
    <div className={styles.filterPanelCard}>
      {/* Search Input Row */}
      <div className={styles.searchRow}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search return ID, order ID, customer, product, SKU, supplier or refund reference..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
        {filters.search && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => onFilterChange("search", "")}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Primary Filters Grid */}
      <div className={styles.primaryFiltersGrid}>
        <select
          className={styles.filterSelect}
          value={filters.returnStatus || ""}
          onChange={(e) => onFilterChange("returnStatus", e.target.value)}
        >
          <option value="">Return Status</option>
          <option value="New">New</option>
          <option value="Evidence Required">Evidence Required</option>
          <option value="Eligibility Review">Eligibility Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Pickup Scheduled">Pickup Scheduled</option>
          <option value="In Transit">In Transit</option>
          <option value="Received">Received</option>
          <option value="Inspection Pending">Inspection Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Escalated">Escalated</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filters.refundStatus || ""}
          onChange={(e) => onFilterChange("refundStatus", e.target.value)}
        >
          <option value="">Refund Status</option>
          <option value="Not Required">Not Required</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Approved">Approved</option>
          <option value="Processing">Processing</option>
          <option value="Partially Refunded">Partially Refunded</option>
          <option value="Fully Refunded">Fully Refunded</option>
          <option value="Rejected">Rejected</option>
          <option value="Failed">Failed</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filters.inspectionStatus || ""}
          onChange={(e) => onFilterChange("inspectionStatus", e.target.value)}
        >
          <option value="">Inspection Status</option>
          <option value="Not Required">Not Required</option>
          <option value="PENDING">Pending</option>
          <option value="REQUIRED">Required</option>
          <option value="Scheduled">Scheduled</option>
          <option value="IN PROGRESS">In Progress</option>
          <option value="PASSED">Passed</option>
          <option value="FAILED">Failed</option>
          <option value="LAB REVIEW REQUIRED">Lab Review Required</option>
          <option value="OVERRIDDEN">Overridden</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filters.disputeStatus || ""}
          onChange={(e) => onFilterChange("disputeStatus", e.target.value)}
        >
          <option value="">Dispute Status</option>
          <option value="NONE">None</option>
          <option value="OPEN">Open</option>
          <option value="UNDER REVIEW">Under Review</option>
          <option value="SUPPLIER RESPONSE PENDING">Supplier Response Pending</option>
          <option value="RESOLVED">Resolved</option>
          <option value="ESCALATED">Escalated</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filters.returnType || ""}
          onChange={(e) => onFilterChange("returnType", e.target.value)}
        >
          <option value="">Return Type</option>
          <option value="Product Return">Product Return</option>
          <option value="Exchange Request">Exchange Request</option>
          <option value="Refund Only">Refund Only</option>
          <option value="Safety Complaint">Safety Complaint</option>
          <option value="Authenticity Complaint">Authenticity Complaint</option>
          <option value="Delivery Damage">Delivery Damage</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filters.reasonCategory || ""}
          onChange={(e) => onFilterChange("reasonCategory", e.target.value)}
        >
          <option value="">Reason Category</option>
          <option value="Product Defect">Product Defect</option>
          <option value="Wrong Shade">Wrong Shade</option>
          <option value="Skin Irritation">Skin Irritation</option>
          <option value="Suspected Counterfeit">Suspected Counterfeit</option>
          <option value="Broken Bottle">Broken Bottle</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filters.supplier || ""}
          onChange={(e) => onFilterChange("supplier", e.target.value)}
        >
          <option value="">Supplier</option>
          <option value="Luxe Distribution">Luxe Distribution</option>
          <option value="Vogue Supply">Vogue Supply</option>
          <option value="Pure Essence">Pure Essence</option>
          <option value="Pure Organic Co.">Pure Organic Co.</option>
          <option value="Serene Botanics Lanka">Serene Botanics Lanka</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filters.brand || ""}
          onChange={(e) => onFilterChange("brand", e.target.value)}
        >
          <option value="">Brand</option>
          <option value="Aurora Skin">Aurora Skin</option>
          <option value="Lumière Labs">Lumière Labs</option>
          <option value="Velvet Touch">Velvet Touch</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filters.productCategory || ""}
          onChange={(e) => onFilterChange("productCategory", e.target.value)}
        >
          <option value="">Product Category</option>
          <option value="Skincare">Skincare</option>
          <option value="Cosmetics">Cosmetics</option>
          <option value="Haircare">Haircare</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filters.logisticsPartner || ""}
          onChange={(e) => onFilterChange("logisticsPartner", e.target.value)}
        >
          <option value="">Logistics Partner</option>
          <option value="ShipXpress">ShipXpress</option>
          <option value="RiderFast">RiderFast</option>
          <option value="QuickGo">QuickGo</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filters.riskLevel || ""}
          onChange={(e) => onFilterChange("riskLevel", e.target.value)}
        >
          <option value="">Risk Level</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filters.assignedOfficer || ""}
          onChange={(e) => onFilterChange("assignedOfficer", e.target.value)}
        >
          <option value="">Assigned Officer</option>
          <option value="me">Assigned to Me</option>
          <option value="unassigned">Unassigned</option>
          <option value="Elena Vance">Elena Vance</option>
          <option value="Dilan Perera">Dilan Perera</option>
        </select>

        <input
          type="date"
          className={styles.filterSelect}
          value={filters.openedDate || ""}
          onChange={(e) => onFilterChange("openedDate", e.target.value)}
        />

        <input
          type="date"
          className={styles.filterSelect}
          value={filters.dueDate || ""}
          onChange={(e) => onFilterChange("dueDate", e.target.value)}
        />

        <button type="button" className={styles.moreFiltersBtn}>
          <SlidersHorizontal size={14} /> More Filters
        </button>
      </div>

      {/* Quick Filters Row */}
      <div className={styles.quickFilterRow}>
        <div className={styles.chipsList}>
          <span className={styles.quickLabel}>Quick Filters:</span>
          {quickFilterChips.map((chip) => {
            const isActive = filters.quickFilter === chip;
            return (
              <button
                key={chip}
                type="button"
                className={`${styles.chip} ${isActive ? styles.chipActive : ""}`}
                onClick={() => onQuickFilterToggle(chip)}
              >
                {chip}
              </button>
            );
          })}
        </div>

        <div className={styles.filterActionsRight}>
          <button type="button" className={styles.btnClearAll} onClick={onClearAll}>
            Clear All
          </button>
          <button type="button" className={styles.btnOutline} style={{ fontSize: "0.75rem" }} onClick={onSaveView}>
            <BookmarkPlus size={14} style={{ marginRight: 4 }} /> Save View
          </button>
        </div>
      </div>
    </div>
  );
}
