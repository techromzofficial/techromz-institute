"use client";

import React from "react";
import Link from "next/link";
import { Info, ExternalLink } from "lucide-react";
import styles from "./return-detail.module.css";
import type { OriginalOrderSummaryData } from "@/types/admin";

interface OriginalOrderSummaryProps {
  order: OriginalOrderSummaryData;
  onViewPayment?: () => void;
  onViewFulfilment?: () => void;
}

export function OriginalOrderSummary({
  order,
  onViewPayment,
  onViewFulfilment,
}: OriginalOrderSummaryProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <span>Original Order Summary</span>
          <Info size={14} style={{ color: "#6b7280" }} />
        </div>
        <Link
          href={`/admin/marketplace/orders/${encodeURIComponent(order.orderReference)}`}
          style={{ color: "#6b7280", textDecoration: "none" }}
          title="Open Screen 11 Order Details"
        >
          <ExternalLink size={14} />
        </Link>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Order Reference</span>
          <span className={styles.metaValue}>
            <Link
              href={`/admin/marketplace/orders/${encodeURIComponent(order.orderReference)}`}
              className={styles.orderLink}
            >
              {order.orderReference}
            </Link>
          </span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Supplier</span>
          <span className={styles.metaValue}>{order.supplierName}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Order Date</span>
          <span className={styles.metaValue}>{order.orderDate}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Product</span>
          <span className={styles.metaValue}>{order.productName}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Order Total</span>
          <span className={styles.metaValue}>{order.orderTotal}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Ordered Quantity</span>
          <span className={styles.metaValue}>{order.orderedQuantity}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Payment Status</span>
          <span className={`${styles.statusPill} ${styles.pillSuccess}`} style={{ width: "fit-content" }}>
            {order.paymentStatus}
          </span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Returned Quantity</span>
          <span className={styles.metaValue}>{order.returnedQuantity}</span>
        </div>

        <div className={styles.metaItem} style={{ gridColumn: "span 2" }}>
          <span className={styles.metaLabel}>Delivery Status</span>
          <span className={styles.metaValue}>{order.deliveryStatus}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
        <Link
          href={`/admin/marketplace/orders/${encodeURIComponent(order.orderReference)}`}
          className={styles.btnOutline}
          style={{ textDecoration: "none" }}
        >
          View Original Order
        </Link>
        <button
          type="button"
          className={styles.btnOutline}
          onClick={onViewPayment}
        >
          View Payment
        </button>
        <button
          type="button"
          className={styles.btnOutline}
          onClick={onViewFulfilment}
        >
          View Supplier Fulfilment
        </button>
      </div>
    </div>
  );
}
