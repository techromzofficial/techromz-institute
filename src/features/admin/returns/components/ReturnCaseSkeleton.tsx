"use client";

import React from "react";
import styles from "./return-detail.module.css";

export function ReturnCaseSkeleton() {
  return (
    <div className={styles.pageContainer} aria-busy="true" aria-label="Loading Return Case Details">
      <div style={{ width: "280px", height: "20px", background: "#e5e7eb", borderRadius: "4px" }} />
      <div className={styles.headerCard} style={{ height: "180px", background: "#f3f4f6" }} />
      <div style={{ width: "100%", height: "40px", background: "#e5e7eb", borderRadius: "6px" }} />
      <div className={styles.mainLayout}>
        <div className={styles.leftColumn}>
          <div className={styles.card} style={{ height: "160px", background: "#f3f4f6" }} />
          <div className={styles.card} style={{ height: "140px", background: "#f3f4f6" }} />
          <div className={styles.card} style={{ height: "180px", background: "#f3f4f6" }} />
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.decisionPanelCard} style={{ height: "400px", background: "#f3f4f6" }} />
        </div>
      </div>
    </div>
  );
}
