"use client";

import React from "react";
import { Info, Check } from "lucide-react";
import styles from "./return-detail.module.css";
import type { LifecycleStage } from "@/types/admin";

interface CaseLifecycleTimelineProps {
  stages: LifecycleStage[];
}

export function CaseLifecycleTimeline({ stages }: CaseLifecycleTimelineProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <span>Case Lifecycle</span>
          <Info size={14} style={{ color: "#6b7280" }} />
        </div>
      </div>

      <div className={styles.timelineStepper}>
        <div className={styles.timelineLine} />
        {stages.map((stage) => {
          const isCompleted = stage.status === "Completed";
          const isPending = stage.status.toLowerCase().includes("pending");

          return (
            <div key={stage.step} className={styles.timelineStep}>
              <div
                className={`${styles.stepCircle} ${
                  isCompleted ? styles.stepCompleted : isPending ? styles.stepPending : ""
                }`}
              >
                {isCompleted ? <Check size={14} /> : stage.step}
              </div>
              <span className={styles.stepTitle}>{stage.title}</span>
              <span
                className={styles.stepStatus}
                style={{
                  color: isCompleted ? "#10b981" : isPending ? "#d97706" : "#6b7280",
                  fontWeight: isPending || isCompleted ? 600 : 400,
                }}
              >
                {stage.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
