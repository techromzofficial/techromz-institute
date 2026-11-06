"use client";

import React from "react";
import styles from "./order-detail.module.css";

export function OrderDetailSkeleton() {
  return (
    <div className={styles.pageContainer} aria-busy="true" aria-label="Loading order details">
      <div style={{ width: "300px", height: "24px", background: "#e5e7eb", borderRadius: "4px" }} />
      
      <div className={styles.headerSummaryGrid}>
        <div className={styles.card} style={{ minHeight: "180px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ width: "40%", height: "28px", background: "#e5e7eb", borderRadius: "4px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            <div style={{ height: "40px", background: "#f3f4f6", borderRadius: "4px" }} />
            <div style={{ height: "40px", background: "#f3f4f6", borderRadius: "4px" }} />
            <div style={{ height: "40px", background: "#f3f4f6", borderRadius: "4px" }} />
            <div style={{ height: "40px", background: "#f3f4f6", borderRadius: "4px" }} />
          </div>
        </div>
        <div className={styles.card} style={{ minHeight: "180px", background: "#f9fafb" }} />
      </div>

      <div style={{ width: "100%", height: "40px", background: "#e5e7eb", borderRadius: "6px" }} />

      <div className={styles.mainLayoutGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.card} style={{ height: "120px", background: "#f3f4f6" }} />
          <div className={styles.card} style={{ height: "200px", background: "#f3f4f6" }} />
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.card} style={{ height: "160px", background: "#f3f4f6" }} />
          <div className={styles.card} style={{ height: "200px", background: "#501625", opacity: 0.8 }} />
        </div>
      </div>
    </div>
  );
}
