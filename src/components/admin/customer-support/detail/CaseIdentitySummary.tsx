'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Database,
  User,
  Tag,
  HelpCircle,
  MessageSquare,
  Clock,
  UserCheck,
  Users,
  ShoppingBag,
  Truck,
  RotateCcw,
  Package,
  Building,
} from 'lucide-react';
import type { SupportCaseItem } from '@/types/customerSupport';
import styles from '@/app/admin/customer-support/cases/[caseId]/page.module.css';

interface CaseIdentitySummaryProps {
  caseInfo: SupportCaseItem;
}

export function CaseIdentitySummary({ caseInfo }: CaseIdentitySummaryProps) {
  return (
    <div className={styles.caseSummaryCard}>
      {/* 2 Metadata Grid Rows (6 columns each) */}
      <div className={styles.summaryGrid}>
        {/* Row 1 */}
        <div>
          <span className={styles.metaLabel}>Public Case Reference</span>
          <div className={styles.metaValue}>
            <FileText size={12} className="text-[#650000] shrink-0" />
            <span className={styles.monoValue}>{caseInfo.caseReference}</span>
          </div>
        </div>

        <div>
          <span className={styles.metaLabel}>Database Support Case ID</span>
          <div className={styles.metaValue}>
            <Database size={12} className="text-slate-400 shrink-0" />
            <span className="font-mono text-slate-700">{caseInfo.dbCaseId}</span>
          </div>
        </div>

        <div>
          <span className={styles.metaLabel}>Case Category</span>
          <div className={styles.metaValue}>
            <Tag size={12} className="text-blue-500 shrink-0" />
            <span>{caseInfo.caseCategory}</span>
          </div>
        </div>

        <div>
          <span className={styles.metaLabel}>Issue Type</span>
          <div className={styles.metaValue}>
            <HelpCircle size={12} className="text-amber-500 shrink-0" />
            <span>{caseInfo.issueType}</span>
          </div>
        </div>

        <div>
          <span className={styles.metaLabel}>Created</span>
          <div className={styles.metaValue}>
            <Clock size={12} className="text-slate-400 shrink-0" />
            <span>{caseInfo.createdAt}</span>
          </div>
        </div>

        <div>
          <span className={styles.metaLabel}>Customer</span>
          <div className={styles.metaValue}>
            <User size={12} className="text-slate-600 shrink-0" />
            <span>{caseInfo.customerName}</span>
          </div>
        </div>

        {/* Row 2 */}
        <div>
          <span className={styles.metaLabel}>Subject</span>
          <div className={styles.metaValue}>
            <span className="truncate" title={caseInfo.subject}>
              {caseInfo.subject}
            </span>
          </div>
        </div>

        <div>
          <span className={styles.metaLabel}>Channel</span>
          <div className={styles.metaValue}>
            <MessageSquare size={12} className="text-purple-500 shrink-0" />
            <span>{caseInfo.channel}</span>
          </div>
        </div>

        <div>
          <span className={styles.metaLabel}>Last Updated</span>
          <div className={styles.metaValue}>
            <Clock size={12} className="text-slate-400 shrink-0" />
            <span>{caseInfo.lastUpdated}</span>
          </div>
        </div>

        <div>
          <span className={styles.metaLabel}>Customer ID</span>
          <div className={styles.metaValue}>
            <User size={12} className="text-slate-400 shrink-0" />
            <span className="font-mono text-slate-600">{caseInfo.customerId}</span>
          </div>
        </div>

        <div>
          <span className={styles.metaLabel}>Assigned Agent</span>
          <div className={styles.metaValue}>
            <UserCheck size={12} className="text-slate-600 shrink-0" />
            <span>{caseInfo.assignedAgentName || 'Unassigned'}</span>
          </div>
        </div>

        <div>
          <span className={styles.metaLabel}>Assigned Team</span>
          <div className={styles.metaValue}>
            <Users size={12} className="text-slate-600 shrink-0" />
            <span>{caseInfo.assignedTeam || 'Customer Operations'}</span>
          </div>
        </div>
      </div>

      {/* Relationship Row (5 items with vertical divider lines) */}
      <div className={styles.relationshipGrid}>
        <div className={styles.relationshipItem}>
          <span className={styles.metaLabel}>Related Order</span>
          <div className={styles.metaValue}>
            <ShoppingBag size={12} className="text-slate-500 shrink-0" />
            {caseInfo.relatedOrderReference ? (
              <Link
                href={`/admin/marketplace/orders/${caseInfo.relatedOrderReference}`}
                className="font-mono text-blue-600 hover:underline"
              >
                {caseInfo.relatedOrderReference}
              </Link>
            ) : (
              <span className="text-slate-400 font-normal">None</span>
            )}
          </div>
        </div>

        <div className={styles.relationshipItem}>
          <span className={styles.metaLabel}>Related Shipment</span>
          <div className={styles.metaValue}>
            <Truck size={12} className="text-slate-500 shrink-0" />
            {caseInfo.relatedShipmentReference ? (
              <span className="font-mono text-slate-800">
                {caseInfo.relatedShipmentReference}
              </span>
            ) : (
              <span className="text-slate-400 font-normal">None</span>
            )}
          </div>
        </div>

        <div className={styles.relationshipItem}>
          <span className={styles.metaLabel}>Related Return</span>
          <div className={styles.metaValue}>
            <RotateCcw size={12} className="text-slate-500 shrink-0" />
            {caseInfo.relatedReturnReference ? (
              <span className="font-mono text-slate-800">
                {caseInfo.relatedReturnReference}
              </span>
            ) : (
              <span className="text-slate-400 font-normal">None</span>
            )}
          </div>
        </div>

        <div className={styles.relationshipItem}>
          <span className={styles.metaLabel}>Related Product</span>
          <div className={styles.metaValue}>
            <Package size={12} className="text-slate-500 shrink-0" />
            <span className="truncate" title={caseInfo.relatedProductName}>
              {caseInfo.relatedProductName || 'None'}
            </span>
          </div>
        </div>

        <div className={styles.relationshipItem}>
          <span className={styles.metaLabel}>Supplier</span>
          <div className={styles.metaValue}>
            <Building size={12} className="text-slate-500 shrink-0" />
            <span className="truncate" title={caseInfo.supplierName}>
              {caseInfo.supplierName || 'None'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

