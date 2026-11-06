'use client';

import React from 'react';
import {
  RotateCcw,
  Flag,
  Clock,
  ShieldCheck,
  Search,
  Smile,
  AlertTriangle,
} from 'lucide-react';
import type { SupportCaseItem } from '@/types/customerSupport';
import styles from '@/app/admin/customer-support/cases/[caseId]/page.module.css';

interface CaseStatusStripProps {
  caseInfo: SupportCaseItem;
  escalationStatus?: string;
  resolutionStatus?: string;
}

export function CaseStatusStrip({
  caseInfo,
  escalationStatus = 'None',
  resolutionStatus = 'Investigation Required',
}: CaseStatusStripProps) {
  return (
    <div className={styles.statusStrip}>
      {/* 1. Case Status */}
      <div className={styles.statusItem}>
        <div className={`${styles.statusIcon} bg-blue-50 text-blue-600`}>
          <RotateCcw size={14} />
        </div>
        <div>
          <span className={styles.statusLabel}>Case Status</span>
          <span className={`${styles.statusValue} text-blue-700`}>
            {caseInfo.caseStatus}
          </span>
        </div>
      </div>

      {/* 2. Priority */}
      <div className={styles.statusItem}>
        <div className={`${styles.statusIcon} bg-red-50 text-red-600`}>
          <Flag size={14} />
        </div>
        <div>
          <span className={styles.statusLabel}>Priority</span>
          <span className={`${styles.statusValue} text-red-700`}>
            {caseInfo.priority}
          </span>
        </div>
      </div>

      {/* 3. SLA Status */}
      <div className={styles.statusItem}>
        <div className={`${styles.statusIcon} bg-amber-50 text-amber-600`}>
          <Clock size={14} />
        </div>
        <div>
          <span className={styles.statusLabel}>SLA Status</span>
          <span className={`${styles.statusValue} text-amber-800`}>
            {caseInfo.slaStatus}
          </span>
        </div>
      </div>

      {/* 4. Escalation Status */}
      <div className={styles.statusItem}>
        <div className={`${styles.statusIcon} bg-emerald-50 text-emerald-600`}>
          <ShieldCheck size={14} />
        </div>
        <div>
          <span className={styles.statusLabel}>Escalation Status</span>
          <span className={`${styles.statusValue} text-emerald-800`}>
            {escalationStatus}
          </span>
        </div>
      </div>

      {/* 5. Resolution Status */}
      <div className={styles.statusItem}>
        <div className={`${styles.statusIcon} bg-purple-50 text-purple-600`}>
          <Search size={14} />
        </div>
        <div>
          <span className={styles.statusLabel}>Resolution Status</span>
          <span className={`${styles.statusValue} text-purple-800`}>
            {resolutionStatus}
          </span>
        </div>
      </div>

      {/* 6. Sentiment */}
      <div className={styles.statusItem}>
        <div className={`${styles.statusIcon} bg-amber-50 text-amber-600`}>
          <Smile size={14} />
        </div>
        <div>
          <span className={styles.statusLabel}>Sentiment</span>
          <span className={`${styles.statusValue} text-amber-800`}>
            {caseInfo.sentiment}
          </span>
        </div>
      </div>

      {/* 7. Risk Level */}
      <div className={styles.statusItem}>
        <div className={`${styles.statusIcon} bg-amber-50 text-amber-600`}>
          <AlertTriangle size={14} />
        </div>
        <div>
          <span className={styles.statusLabel}>Risk Level</span>
          <span className={`${styles.statusValue} text-amber-900`}>
            {caseInfo.riskLevel}
          </span>
        </div>
      </div>
    </div>
  );
}

