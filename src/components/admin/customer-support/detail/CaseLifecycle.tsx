'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { LifecycleStage } from '@/types/customerSupportDetail';
import styles from '@/app/admin/customer-support/cases/[caseId]/page.module.css';

interface CaseLifecycleProps {
  stages: LifecycleStage[];
}

export function CaseLifecycle({ stages }: CaseLifecycleProps) {
  return (
    <div className={styles.lifecycleSection}>
      <div className={styles.lifecycleHeader}>
        <span className={styles.lifecycleTitle}>CASE LIFECYCLE STAGE</span>
        <span className={styles.lifecycleStatusTag}>
          STAGE 4 OF 9 ACTIVE
        </span>
      </div>

      <div className={styles.lifecycleTrack}>
        <div className={styles.lifecycleLine} />
        {stages.map((stage) => {
          const isCompleted = stage.status === 'completed';
          const isActive = stage.status === 'active';

          return (
            <div key={stage.stageNumber} className={styles.lifecycleStage}>
              {isCompleted ? (
                <div
                  className={`${styles.lifecycleMarker} ${styles.markerCompleted}`}
                  title={`Completed: ${stage.label}`}
                >
                  <Check size={13} strokeWidth={3} />
                </div>
              ) : isActive ? (
                <div
                  className={`${styles.lifecycleMarker} ${styles.markerActive}`}
                  title={`Active: ${stage.label}`}
                >
                  {stage.stageNumber}
                </div>
              ) : (
                <div
                  className={styles.lifecycleMarker}
                  title={`Pending: ${stage.label}`}
                >
                  {stage.stageNumber}
                </div>
              )}

              <span
                className={`${styles.stageText} ${
                  isActive ? styles.stageTextActive : ''
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

