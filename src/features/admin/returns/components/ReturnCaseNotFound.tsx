"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ChevronLeft } from "lucide-react";
import styles from "./return-detail.module.css";

interface ReturnCaseNotFoundProps {
  returnId: string;
}

export function ReturnCaseNotFound({ returnId }: ReturnCaseNotFoundProps) {
  return (
    <div className={styles.pageContainer}>
      <Link href="/admin/marketplace/returns" className={styles.backLink}>
        <ChevronLeft size={16} />
        <span>Back to Returns Queue</span>
      </Link>

      <div
        className={styles.card}
        style={{
          padding: "48px 32px",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <AlertCircle size={28} />
        </div>

        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 8px 0" }}>
          Return Case Not Found
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", maxWidth: 460, margin: "0 0 24px 0", lineHeight: 1.5 }}>
          No marketplace return case matching reference <strong>&ldquo;{returnId}&rdquo;</strong> was found in the database. Please verify the ID or return to the main queue.
        </p>

        <Link href="/admin/marketplace/returns" className={styles.btnPrimaryDark} style={{ textDecoration: "none" }}>
          Return to Returns & Disputes Queue
        </Link>
      </div>
    </div>
  );
}
