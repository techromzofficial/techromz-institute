"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/analytics/analyticsFormatters";

export function UnderlyingOrderRecordsTable({
  records = [],
  totalRecords = 4,
  page = 1,
  rowsPerPage = 25,
  onPageChange,
  onRowsPerPageChange,
  currentSearchParams,
}) {
  const currentReturnTo = encodeURIComponent(
    `/admin/analytics/reports/order-performance?${currentSearchParams?.toString() || ""}`
  );

  const getStatusPillClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("paid") || s.includes("delivered") || s.includes("completed")) return "badge-success";
    if (s.includes("processing") || s.includes("confirmed") || s.includes("transit")) return "badge-info";
    if (s.includes("hold") || s.includes("pending") || s.includes("risk") || s.includes("assigned")) return "badge-warning";
    if (s.includes("failed") || s.includes("cancelled") || s.includes("returned")) return "badge-danger";
    return "badge-muted";
  };

  return (
    <div className="underlyingRecordsCard analytics-card records-table-card flex-column">
      <div className="chart-card-header flex-between">
        <h3 className="table-title">Underlying Order Records</h3>
        <span className="table-count-badge">Total Records: {totalRecords}</span>
      </div>

      <div className="underlyingRecordsScroll records-table-scroll-container flex-1">
        <table className="underlying-records-table">
          <thead>
            <tr>
              <th>Public Order Reference</th>
              <th>Database Order ID</th>
              <th>Order Date</th>
              <th>Customer</th>
              <th>Customer ID</th>
              <th>Customer Segment</th>
              <th>Channel</th>
              <th className="text-right">Items</th>
              <th className="text-right">Suppliers</th>
              <th className="text-center">Split</th>
              <th className="text-right">Gross Order Total</th>
              <th className="text-right">Discount</th>
              <th className="text-right">Shipping</th>
              <th className="text-right">Tax</th>
              <th className="text-right">Net Order Total</th>
              <th className="text-center">Currency</th>
              <th>Payment Method</th>
              <th className="text-center">Payment Status</th>
              <th className="text-center">Order Status</th>
              <th className="text-center">Fulfilment Status</th>
              <th>Batch Allocation</th>
              <th>Delivery Status</th>
              <th>Logistics Partner</th>
              <th className="text-center">Risk Level</th>
              <th>SLA Status</th>
              <th className="text-center">Return Status</th>
              <th>Assigned Officer</th>
              <th className="th-sticky-action text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={28} className="empty-table-cell text-center">
                  No order records found for the selected criteria.
                </td>
              </tr>
            ) : (
              records.map((order) => {
                const orderDetailUrl = `/admin/marketplace/orders/${encodeURIComponent(
                  order.databaseOrderId || order.publicOrderReference
                )}?returnTo=${currentReturnTo}`;

                return (
                  <tr key={order.publicOrderReference || order.databaseOrderId}>
                    <td className="cell-order-ref bold">{order.publicOrderReference}</td>
                    <td className="cell-muted">{order.databaseOrderId}</td>
                    <td className="cell-date">{order.orderDate}</td>
                    <td className="cell-customer bold">{order.customerName}</td>
                    <td className="cell-muted">{order.customerId}</td>
                    <td>{order.customerSegment}</td>
                    <td>{order.marketplaceChannel}</td>
                    <td className="text-right">{order.itemCount}</td>
                    <td className="text-right">{order.supplierCount}</td>
                    <td className="text-center">{order.splitOrder ? "Yes" : "No"}</td>
                    <td className="text-right bold">
                      {typeof order.grossOrderTotal === "number"
                        ? formatCurrency(order.grossOrderTotal, order.currency, false)
                        : order.grossOrderTotal}
                    </td>
                    <td className="text-right">
                      {typeof order.discountAmount === "number"
                        ? formatCurrency(order.discountAmount, order.currency, false)
                        : order.discountAmount}
                    </td>
                    <td className="text-right">
                      {typeof order.shippingAmount === "number"
                        ? formatCurrency(order.shippingAmount, order.currency, false)
                        : order.shippingAmount}
                    </td>
                    <td className="text-right">
                      {typeof order.taxAmount === "number"
                        ? formatCurrency(order.taxAmount, order.currency, false)
                        : order.taxAmount}
                    </td>
                    <td className="text-right bold">
                      {typeof order.netOrderTotal === "number"
                        ? formatCurrency(order.netOrderTotal, order.currency, false)
                        : order.netOrderTotal}
                    </td>
                    <td className="text-center">{order.currency}</td>
                    <td>{order.paymentMethod}</td>
                    <td className="text-center">
                      <span className={`status-pill ${getStatusPillClass(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`status-pill ${getStatusPillClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`status-pill ${getStatusPillClass(order.fulfilmentStatus)}`}>
                        {order.fulfilmentStatus}
                      </span>
                    </td>
                    <td>{order.batchAllocation}</td>
                    <td>{order.deliveryStatus}</td>
                    <td>{order.logisticsPartner}</td>
                    <td className="text-center">
                      <span className={`status-pill ${getStatusPillClass(order.riskLevel)}`}>
                        {order.riskLevel}
                      </span>
                    </td>
                    <td>{order.slaStatus}</td>
                    <td className="text-center">{order.returnStatus || "-"}</td>
                    <td>{order.assignedOfficer}</td>
                    <td className="td-sticky-action text-center">
                      <Link href={orderDetailUrl} className="view-order-link icon-link">
                        View Order <ExternalLink size={11} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-pagination-footer flex-between">
        <div className="rows-per-page-selector">
          <span className="pagination-label">Rows per page:</span>
          <select
            className="pagination-select"
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange && onRowsPerPageChange(parseInt(e.target.value, 10))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="pagination-controls flex-center-gap">
          <button
            type="button"
            className="pagination-btn"
            disabled={page <= 1}
            onClick={() => onPageChange && onPageChange(page - 1)}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="pagination-info">Page {page} of {Math.ceil(totalRecords / rowsPerPage) || 1}</span>
          <button
            type="button"
            className="pagination-btn"
            disabled={page >= Math.ceil(totalRecords / rowsPerPage)}
            onClick={() => onPageChange && onPageChange(page + 1)}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

