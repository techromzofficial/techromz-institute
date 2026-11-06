"use client";

import React from "react";
import { User } from "lucide-react";
import styles from "./return-detail.module.css";
import type { CustomerProfileData } from "@/types/admin";

interface CustomerProfileCardProps {
  profile: CustomerProfileData;
  onViewCustomer?: () => void;
  onContactCustomer?: () => void;
  onViewClaimHistory?: () => void;
}

export function CustomerProfileCard({
  profile,
  onViewCustomer,
  onContactCustomer,
  onViewClaimHistory,
}: CustomerProfileCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <span>Customer Profile</span>
        </div>
        <User size={16} style={{ color: "#6b7280" }} />
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Customer Name</span>
          <span className={styles.metaValue}>{profile.customerName}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Total Orders</span>
          <span className={styles.metaValue}>{profile.totalOrders}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Customer ID</span>
          <span className={styles.metaValue}>{profile.customerId}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Successful Orders</span>
          <span className={styles.metaValue}>{profile.successfulOrders}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Email</span>
          <span className={styles.metaValue}>{profile.email}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Previous Returns</span>
          <span className={styles.metaValue}>{profile.previousReturns}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Phone</span>
          <span className={styles.metaValue}>{profile.phone}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Open Disputes</span>
          <span className={styles.metaValue}>{profile.openDisputes}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Customer Since</span>
          <span className={styles.metaValue}>{profile.customerSince}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Repeat Claim Risk</span>
          <span className={`${styles.statusPill} ${styles.pillSuccess}`} style={{ width: "fit-content" }}>
            {profile.repeatClaimRisk}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
        <button type="button" className={styles.btnOutline} onClick={onViewCustomer}>
          View Customer
        </button>
        <button type="button" className={styles.btnOutline} onClick={onContactCustomer}>
          Contact Customer
        </button>
        <button type="button" className={styles.btnOutline} onClick={onViewClaimHistory}>
          View Claim History
        </button>
      </div>
    </div>
  );
}
