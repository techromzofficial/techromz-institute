"use client";

import React from "react";
import styles from "./returns-queue.module.css";

export function ReturnsQueueSkeleton() {
  return (
    <div className={styles.pageContainer} aria-busy="true" aria-label="Loading Returns Queue">
      <div style={{ width: "240px", height: "28px", background: "#e5e7eb", borderRadius: "4px" }} />
      <div style={{ width: "600px", height: "16px", background: "#f3f4f6", borderRadius: "4px" }} />

      <div className={styles.metricsGrid}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className={styles.metricCard} style={{ height: "64px", background: "#f3f4f6" }} />
        ))}
      </div>

      <div className={styles.filterPanelCard} style={{ height: "120px", background: "#f9fafb" }} />

      <div className={styles.mainContentLayout}>
        <div className={styles.leftTableContainer} style={{ height: "400px", background: "#f3f4f6" }} />
        <div className={styles.rightSidebar}>
          <div className={styles.sideCard} style={{ height: "200px", background: "#f3f4f6" }} />
          <div className={styles.sideCard} style={{ height: "200px", background: "#f3f4f6" }} />
        </div>
      </div>
    </div>
  );
}
