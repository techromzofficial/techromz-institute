"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, ExternalLink, UserCheck, CreditCard, Package, Truck, User, Flag } from "lucide-react";
import type { MarketplaceOrder } from "@/types/admin";
import { StatusBadge } from "@/components/admin/common/StatusBadge";

interface OrderTableProps {
  orders: MarketplaceOrder[];
  selectedOrderIds: string[];
  onSelectOrder: (orderId: string) => void;
  onSelectAllOrders: (selected: boolean) => void;
  onOpenAssignModal: (orderIds: string[]) => void;
}

export function OrderTable({
  orders,
  selectedOrderIds,
  onSelectOrder,
  onSelectAllOrders,
  onOpenAssignModal,
}: OrderTableProps) {
  const router = useRouter();
  const [activeMenuOrderId, setActiveMenuOrderId] = useState<string | null>(null);

  const allSelected = orders.length > 0 && orders.every((o) => selectedOrderIds.includes(o.id));

  const toggleMenu = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuOrderId(activeMenuOrderId === orderId ? null : orderId);
  };

  const getSlaBadgeClass = (sla: string) => {
    const s = sla.toLowerCase();
    if (s.includes("left") || s.includes("within")) return "success";
    if (s.includes("risk")) return "warning";
    if (s.includes("breach")) return "danger";
    return "neutral";
  };

  const getBatchBadgeClass = (batch: string) => {
    const b = batch.toLowerCase();
    if (b.includes("fully")) return "success";
    if (b.includes("missing") || b.includes("not")) return "warning";
    return "neutral";
  };

  return (
    <div className="order-table-container">
      <div className="table-wrap">
        <table className="order-table">
          <thead>
            <tr>
              <th className="th-checkbox">
                <input
                  type="checkbox"
                  aria-label="Select all orders"
                  checked={allSelected}
                  onChange={(e) => onSelectAllOrders(e.target.checked)}
                />
              </th>
              <th>Order Reference</th>
              <th>Database Order ID</th>
              <th>Customer Name</th>
              <th>Order Date / Time</th>
              <th>Items</th>
              <th>Suppliers</th>
              <th>Split Order</th>
              <th>Order Total</th>
              <th>Currency</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Order Status</th>
              <th>Fulfilment Status</th>
              <th>Batch Allocation</th>
              <th>Delivery Status</th>
              <th>Logistics Partner</th>
              <th>Risk Level</th>
              <th>SLA Status</th>
              <th>Assigned Officer</th>
              <th className="th-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={21} className="empty-table-cell">
                  <div className="state">
                    <h3>No matching orders found</h3>
                    <p className="muted">Try adjusting your filters or search criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isChecked = selectedOrderIds.includes(order.id);
                const isMenuOpen = activeMenuOrderId === order.id;

                return (
                  <tr key={order.id} className={isChecked ? "selected-row" : ""}>
                    <td className="td-checkbox">
                      <input
                        type="checkbox"
                        aria-label={`Select order ${order.orderReference}`}
                        checked={isChecked}
                        onChange={() => onSelectOrder(order.id)}
                      />
                    </td>
                    <td className="cell-order-ref">
                      <Link
                        href={`/admin/marketplace/orders/${encodeURIComponent(order.id)}`}
                        className="order-ref-link"
                      >
                        {order.orderReference}
                      </Link>
                    </td>
                    <td className="cell-db-id">{order.dbOrderId}</td>
                    <td className="cell-customer">{order.customerName}</td>
                    <td className="cell-date">{order.orderDateTime}</td>
                    <td className="cell-items">{order.itemsCount} {order.itemsCount === 1 ? "item" : "items"}</td>
                    <td className="cell-suppliers">{order.suppliersCount} {order.suppliersCount === 1 ? "supplier" : "suppliers"}</td>
                    <td className="cell-split">{order.splitOrder ? "Yes" : "No"}</td>
                    <td className="cell-total">{order.orderTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td className="cell-currency">{order.currency}</td>
                    <td className="cell-method">{order.paymentMethod}</td>
                    <td>
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td>
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td>
                      <StatusBadge status={order.fulfilmentStatus} />
                    </td>
                    <td>
                      <span className={`badge ${getBatchBadgeClass(order.batchAllocation)}`}>
                        {order.batchAllocation}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={order.deliveryStatus} />
                    </td>
                    <td className="cell-logistics">{order.logisticsPartner}</td>
                    <td>
                      <StatusBadge status={order.riskLevel} />
                    </td>
                    <td>
                      <span className={`badge ${getSlaBadgeClass(order.slaStatus)}`}>
                        {order.slaStatus}
                      </span>
                    </td>
                    <td className="cell-officer">{order.assignedOfficer}</td>
                    <td className="cell-actions">
                      <div className="table-action-group">
                        <Link
                          href={`/admin/marketplace/orders/${encodeURIComponent(order.id)}`}
                          className="button primary open-order-btn"
                        >
                          Open Order
                        </Link>
                        <div className="dropdown-menu-wrapper">
                          <button
                            type="button"
                            className="icon-button menu-dots-btn"
                            aria-label={`Actions menu for order ${order.orderReference}`}
                            aria-expanded={isMenuOpen}
                            onClick={(e) => toggleMenu(order.id, e)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {isMenuOpen && (
                            <div className="action-dropdown-menu">
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => {
                                  setActiveMenuOrderId(null);
                                  router.push(`/admin/marketplace/orders/${encodeURIComponent(order.id)}`);
                                }}
                              >
                                <ExternalLink size={14} /> View order
                              </button>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => {
                                  setActiveMenuOrderId(null);
                                  onOpenAssignModal([order.id]);
                                }}
                              >
                                <UserCheck size={14} /> Assign officer
                              </button>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => setActiveMenuOrderId(null)}
                              >
                                <CreditCard size={14} /> View payment
                              </button>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => setActiveMenuOrderId(null)}
                              >
                                <Package size={14} /> View fulfilment
                              </button>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => setActiveMenuOrderId(null)}
                              >
                                <Truck size={14} /> View shipment
                              </button>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => setActiveMenuOrderId(null)}
                              >
                                <User size={14} /> View customer
                              </button>
                              <button
                                type="button"
                                className="dropdown-item priority"
                                onClick={() => setActiveMenuOrderId(null)}
                              >
                                <Flag size={14} /> Flag as priority
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
