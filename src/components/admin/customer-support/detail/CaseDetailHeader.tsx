'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, Send, MoreVertical } from 'lucide-react';
import styles from '@/app/admin/customer-support/cases/[caseId]/page.module.css';

interface CaseDetailHeaderProps {
  caseReference: string;
  subject: string;
  returnToUrl: string;
  onOpenAddNote: () => void;
  onOpenSendUpdate: () => void;
  onOpenMoreActions: () => void;
}

export function CaseDetailHeader({
  caseReference,
  subject,
  returnToUrl,
  onOpenAddNote,
  onOpenSendUpdate,
  onOpenMoreActions,
}: CaseDetailHeaderProps) {
  return (
    <div className={styles.caseHeader}>
      {/* Breadcrumb Navigation */}
      <div className={styles.breadcrumbNav}>
        <Link href="/admin/customer-support/cases" className="hover:underline">
          Customer Support
        </Link>
        <ChevronRight size={10} />
        <Link href={returnToUrl} className="hover:underline">
          Support Operations
        </Link>
        <ChevronRight size={10} />
        <span className={styles.breadcrumbActive}>{caseReference}</span>
      </div>

      <div className={styles.caseHeaderTop}>
        <h1 className={styles.caseTitle}>{subject}</h1>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onOpenAddNote}
          >
            <Plus size={13} />
            <span>Add Note</span>
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={onOpenSendUpdate}
          >
            <Send size={13} />
            <span>Send Customer Update</span>
          </button>
          <button
            type="button"
            className={styles.btnIconButton}
            onClick={onOpenMoreActions}
            aria-label="More actions"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

