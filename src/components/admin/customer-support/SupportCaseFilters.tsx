'use client';

import React from 'react';
import { Search, RotateCcw, Bookmark, SlidersHorizontal } from 'lucide-react';
import type { SupportCaseFilterParams } from '@/types/customerSupport';
import styles from '../../../app/admin/customer-support/cases/page.module.css';

interface SupportCaseFiltersProps {
  filters: SupportCaseFilterParams;
  onFilterChange: (key: keyof SupportCaseFilterParams, value: string) => void;
  onClearAll: () => void;
  onOpenSaveViewModal: () => void;
  onOpenMoreFiltersDrawer: () => void;
  activeMoreFiltersCount?: number;
}

export function SupportCaseFilters({
  filters,
  onFilterChange,
  onClearAll,
  onOpenSaveViewModal,
  onOpenMoreFiltersDrawer,
  activeMoreFiltersCount = 0,
}: SupportCaseFiltersProps) {
  const handleChange = (key: keyof SupportCaseFilterParams, val: string) => {
    onFilterChange(key, val);
  };

  return (
    <div className={styles.filterCard}>
      {/* Top Search Bar Row */}
      <div className={styles.filterSearchRow}>
        <div className={styles.searchInputWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search case ID, customer, email, phone, order, return, shipment, product, supplier or message..."
            className={styles.searchInput}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button type="button" onClick={onClearAll} className={styles.filterToolBtn}>
            <RotateCcw size={14} />
            <span>Clear All</span>
          </button>

          <button type="button" onClick={onOpenSaveViewModal} className={styles.filterToolBtn}>
            <Bookmark size={14} />
            <span>Save View</span>
          </button>

          <button type="button" onClick={onOpenMoreFiltersDrawer} className={styles.filterToolBtn}>
            <SlidersHorizontal size={14} />
            <span>More Filters</span>
            {activeMoreFiltersCount > 0 && (
              <span className={styles.kpiBadge} style={{ background: '#722140', color: '#fff', fontSize: '10px' }}>
                {activeMoreFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Grid - 3 Rows x 8 Columns */}
      <div className={styles.filterGrid}>
        {/* Row 1 */}
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Case Status</label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="waiting-for-customer">Waiting for Customer</option>
            <option value="waiting-for-supplier">Waiting for Supplier</option>
            <option value="waiting-for-logistics">Waiting for Logistics</option>
            <option value="waiting-for-finance">Waiting for Finance</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Priority</label>
          <select
            value={filters.priority || 'all'}
            onChange={(e) => handleChange('priority', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>SLA Status</label>
          <select
            value={filters.sla || 'all'}
            onChange={(e) => handleChange('sla', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="within-target">Within Target</option>
            <option value="at-risk">At Risk</option>
            <option value="breached">Breached</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Escalation Status</label>
          <select
            value={filters.escalation || 'all'}
            onChange={(e) => handleChange('escalation', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="normal">Normal</option>
            <option value="escalated">Escalated</option>
            <option value="executive-escalation">Executive Escalation</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Case Category</label>
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleChange('category', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="delivery-issue">Delivery Issue</option>
            <option value="payment-issue">Payment Issue</option>
            <option value="product-safety">Product Safety</option>
            <option value="return-refund">Return & Refund</option>
            <option value="authenticity">Authenticity</option>
            <option value="supplier-issue">Supplier Issue</option>
            <option value="general-inquiry">General Inquiry</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Issue Type</label>
          <select
            value={filters.issueType || 'all'}
            onChange={(e) => handleChange('issueType', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="shipment-not-dispatched">Shipment Not Dispatched</option>
            <option value="payment-failed">Payment Failed</option>
            <option value="skin-irritation">Skin Irritation</option>
            <option value="wrong-shade">Wrong Shade</option>
            <option value="fake-product-claim">Fake Product Claim</option>
            <option value="damaged-goods">Damaged Goods</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Channel</label>
          <select
            value={filters.channel || 'all'}
            onChange={(e) => handleChange('channel', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="in-app-chat">In-App Chat</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="web-portal">Web Portal</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Customer</label>
          <select
            value={filters.customer || 'all'}
            onChange={(e) => handleChange('customer', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="elena-rodriguez">Elena Rodriguez</option>
            <option value="julian-vance">Julian Vance</option>
            <option value="nimal-sirisena">Nimal Sirisena</option>
            <option value="sarah-chen">Sarah Chen</option>
          </select>
        </div>

        {/* Row 2 */}
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Assigned Agent</label>
          <select
            value={filters.assignedAgent || 'all'}
            onChange={(e) => handleChange('assignedAgent', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="unassigned">Unassigned</option>
            <option value="amaya-perera">Amaya Perera</option>
            <option value="dilan-perera">Dilan Perera</option>
            <option value="nadeesha-silva">Nadeesha Silva</option>
            <option value="elena-vance">Elena Vance</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Assigned Team</label>
          <select
            value={filters.assignedTeam || 'all'}
            onChange={(e) => handleChange('assignedTeam', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="tier-1">Tier 1 Support</option>
            <option value="tier-2">Tier 2 Support</option>
            <option value="finance">Finance Team</option>
            <option value="logistics">Logistics Ops</option>
            <option value="safety">Safety & Quality</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Supplier</label>
          <select
            value={filters.supplier || 'all'}
            onChange={(e) => handleChange('supplier', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="luxe-distribution">Luxe Distribution Pvt Ltd</option>
            <option value="vogue-supply">Vogue Beauty Supply</option>
            <option value="pure-essence">Pure Essence Labs</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Product</label>
          <select
            value={filters.product || 'all'}
            onChange={(e) => handleChange('product', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="vitamin-c-serum">Radiance Vitamin C Serum</option>
            <option value="matte-lipstick">Matte Silk Lipstick</option>
            <option value="gold-cream">Gold-Infused Cream</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Order Status</label>
          <select
            value={filters.orderStatus || 'all'}
            onChange={(e) => handleChange('orderStatus', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Return Status</label>
          <select
            value={filters.returnStatus || 'all'}
            onChange={(e) => handleChange('returnStatus', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="requested">Requested</option>
            <option value="approved">Approved</option>
            <option value="inspected">Inspected</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Shipment Status</label>
          <select
            value={filters.shipmentStatus || 'all'}
            onChange={(e) => handleChange('shipmentStatus', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="in-transit">In Transit</option>
            <option value="delayed">Delayed</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Sentiment</label>
          <select
            value={filters.sentiment || 'all'}
            onChange={(e) => handleChange('sentiment', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="concerned">Concerned</option>
            <option value="frustrated">Frustrated</option>
            <option value="distressed">Distressed</option>
          </select>
        </div>

        {/* Row 3 */}
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Risk Level</label>
          <select
            value={filters.risk || 'all'}
            onChange={(e) => handleChange('risk', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Created Date</label>
          <select
            value={filters.createdDate || 'all'}
            onChange={(e) => handleChange('createdDate', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="last-7-days">Last 7 Days</option>
            <option value="last-30-days">Last 30 Days</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Last Updated Date</label>
          <select
            value={filters.updatedDate || 'all'}
            onChange={(e) => handleChange('updatedDate', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this-week">This Week</option>
          </select>
        </div>

        <div className={styles.filterField}>
          <label className={styles.filterLabel}>SLA Due Date</label>
          <select
            value={filters.slaDueDate || 'all'}
            onChange={(e) => handleChange('slaDueDate', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="next-24h">Next 24 Hours</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>
    </div>
  );
}

