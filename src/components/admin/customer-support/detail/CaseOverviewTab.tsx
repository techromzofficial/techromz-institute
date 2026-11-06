'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Truck,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  User,
  ShieldCheck,
  Calendar,
  Target,
  Check,
} from 'lucide-react';
import type { CaseDetailFullData, ChecklistItem } from '@/types/customerSupportDetail';
import { CaseLifecycle } from './CaseLifecycle';
import styles from '@/app/admin/customer-support/cases/[caseId]/page.module.css';

interface CaseOverviewTabProps {
  data: CaseDetailFullData;
  onToggleChecklist: (item: ChecklistItem) => void;
}

export function CaseOverviewTab({ data, onToggleChecklist }: CaseOverviewTabProps) {
  const { caseInfo, customerStatement, lifecycleStages, orderContext, shipmentContext, supplierContext, checklist } = data;

  return (
    <div className={styles.caseOverviewPanel}>
      {/* 1. Customer Statement Quote Card */}
      <div className={styles.customerStatement}>
        <div className={styles.customerStatementHeader}>CUSTOMER STATEMENT</div>
        <p className={styles.customerQuoteText}>&ldquo;{customerStatement}&rdquo;</p>
      </div>

      {/* 2. Overview Metadata Grid (2 compact rows) */}
      <div className={styles.overviewMetaGrid}>
        {/* Row 1 */}
        <div className={styles.overviewMetaItem}>
          <span className={styles.overviewMetaLabel}>Category</span>
          <span className={styles.overviewMetaValue}>{caseInfo.caseCategory}</span>
        </div>

        <div className={styles.overviewMetaItem}>
          <span className={styles.overviewMetaLabel}>Issue Type</span>
          <span className={styles.overviewMetaValue}>{caseInfo.issueType}</span>
        </div>

        <div className={styles.overviewMetaItem}>
          <span className={styles.overviewMetaLabel}>Current Owner</span>
          <div className={styles.overviewMetaValue}>
            <User size={11} className="text-slate-500 shrink-0" />
            <span>{caseInfo.assignedAgentName || 'Amaya Perera'}</span>
          </div>
        </div>

        <div className={styles.overviewMetaItem}>
          <span className={styles.overviewMetaLabel}>Assigned Team</span>
          <div className={styles.overviewMetaValue}>
            <ShieldCheck size={11} className="text-slate-500 shrink-0" />
            <span>{caseInfo.assignedTeam || 'Customer Operations'}</span>
          </div>
        </div>

        <div className={styles.overviewMetaItem}>
          <span className={styles.overviewMetaLabel}>Current Status</span>
          <div className={styles.overviewMetaValue}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
            <span className="text-blue-700">{caseInfo.caseStatus}</span>
          </div>
        </div>

        <div className={styles.overviewMetaItem}>
          <span className={styles.overviewMetaLabel}>Priority</span>
          <div className={styles.overviewMetaValue}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            <span className="text-red-700">{caseInfo.priority}</span>
          </div>
        </div>

        {/* Row 2 */}
        <div className={styles.overviewMetaItem}>
          <span className={styles.overviewMetaLabel}>Customer Sentiment</span>
          <div className={styles.overviewMetaValue}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-amber-800">{caseInfo.sentiment}</span>
          </div>
        </div>

        <div className={styles.overviewMetaItem}>
          <span className={styles.overviewMetaLabel}>Risk</span>
          <div className={styles.overviewMetaValue}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-amber-800">{caseInfo.riskLevel}</span>
          </div>
        </div>

        <div className={styles.overviewMetaItem}>
          <span className={styles.overviewMetaLabel}>Repeat Contact</span>
          <div className={styles.overviewMetaValue}>
            <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
            <span>No</span>
          </div>
        </div>

        <div className={styles.overviewMetaItem}>
          <span className={styles.overviewMetaLabel}>Previous Related Cases</span>
          <span className={styles.overviewMetaValue}>0</span>
        </div>
      </div>

      {/* 3. Nine-Stage Case Lifecycle */}
      <CaseLifecycle stages={lifecycleStages} />

      {/* 4. Related Commerce Cards Row */}
      <div className={styles.relatedCardsGrid}>
        {/* Order Context Card */}
        {orderContext && (
          <div className={styles.relatedCard}>
            <div className={styles.relatedCardHeader}>
              <div className={styles.relatedCardIdentity}>
                <div className={styles.relatedCardIcon}>
                  <ShoppingBag size={14} />
                </div>
                <span className={styles.relatedCardTitle}>
                  Order: {orderContext.orderReference}
                </span>
              </div>
              <Link
                href={`/admin/marketplace/orders/${orderContext.orderReference}`}
                className={styles.relatedCardButton}
              >
                <span>View Original Order</span>
                <ExternalLink size={9} className="ml-1 inline" />
              </Link>
            </div>
            <div>
              <div className={styles.contextRow}>
                <span className={styles.contextLabel}>Order Status:</span>
                <span className={`${styles.contextValue} text-blue-700`}>{orderContext.orderStatus}</span>
              </div>
              <div className={styles.contextRow}>
                <span className={styles.contextLabel}>Payment Status:</span>
                <span className={`${styles.contextValue} text-emerald-700`}>{orderContext.paymentStatus}</span>
              </div>
              <div className={styles.contextRow}>
                <span className={styles.contextLabel}>Order Total:</span>
                <span className={`${styles.contextValue} text-slate-900`}>{orderContext.orderTotal}</span>
              </div>
              <div className={styles.contextRow}>
                <span className={styles.contextLabel}>Fulfilment Status:</span>
                <span className={`${styles.contextValue} text-amber-700`}>{orderContext.fulfilmentStatus}</span>
              </div>
            </div>
          </div>
        )}

        {/* Shipment Context Card */}
        {shipmentContext && (
          <div className={styles.relatedCard}>
            <div className={styles.relatedCardHeader}>
              <div className={styles.relatedCardIdentity}>
                <div className={styles.relatedCardIcon}>
                  <Truck size={14} />
                </div>
                <span className={styles.relatedCardTitle}>
                  Shipment: {shipmentContext.shipmentReference}
                </span>
              </div>
              <Link
                href={`/admin/logistics/shipments/${shipmentContext.shipmentReference}`}
                className={styles.relatedCardButton}
              >
                <span>View Shipment</span>
                <ExternalLink size={9} className="ml-1 inline" />
              </Link>
            </div>
            <div>
              <div className={styles.contextRow}>
                <span className={styles.contextLabel}>Shipment Status:</span>
                <span className={`${styles.contextValue} text-blue-700`}>{shipmentContext.shipmentStatus}</span>
              </div>
              <div className={styles.contextRow}>
                <span className={styles.contextLabel}>Pickup Status:</span>
                <span className={`${styles.contextValue} text-blue-700`}>{shipmentContext.pickupStatus}</span>
              </div>
              <div className={styles.contextRow}>
                <span className={styles.contextLabel}>Delivery Status:</span>
                <span className={`${styles.contextValue} text-red-700`}>{shipmentContext.deliveryStatus}</span>
              </div>
              <div className={styles.contextRow}>
                <span className={styles.contextLabel}>Carrier:</span>
                <span className={`${styles.contextValue} text-slate-800`}>{shipmentContext.carrierName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Supplier Context Card */}
        {supplierContext && (
          <div className={styles.relatedCard}>
            <div className={styles.relatedCardHeader}>
              <div className={styles.relatedCardIdentity}>
                <div className={styles.relatedCardIcon}>
                  <Building size={14} />
                </div>
                <span className={styles.relatedCardTitle} title={`Supplier: ${supplierContext.supplierName}`}>
                  Supplier: {supplierContext.supplierName}
                </span>
              </div>
              <button type="button" className={styles.relatedCardButton}>
                <span>View Supplier Fulfilment</span>
              </button>
            </div>
            <div>
              <div className={styles.contextRow}>
                <span className={styles.contextLabel}>Supplier Fulfilment:</span>
                <span className={`${styles.contextValue} text-blue-700 font-mono`}>{supplierContext.fulfilmentReference}</span>
              </div>
              <div className={styles.contextRow}>
                <span className={styles.contextLabel}>Supplier Status:</span>
                <span className={`${styles.contextValue} text-emerald-700`}>{supplierContext.supplierStatus}</span>
              </div>
              <div className={styles.contextRow}>
                <span className={styles.contextLabel}>Operational Issue:</span>
                <span className={`${styles.contextValue} text-red-700`}>{supplierContext.operationalIssue}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Dispatch Investigation Checklist */}
      <div className={styles.checklistSection}>
        <div className={styles.checklistTitleRow}>DISPATCH INVESTIGATION CHECKLIST</div>
        <div className={styles.checklistHeaderMeta}>
          <span>Investigation Owner: <strong>{data.checklistOwner}</strong></span>
          <span>Started: <strong>{data.checklistStarted}</strong></span>
          <span>Due: <strong>{data.checklistDue}</strong></span>
        </div>

        <div className={styles.checklistGrid}>
          {checklist.map((item) => (
            <div key={item.id} className={styles.checklistItem}>
              <div className={styles.checklistTask}>
                <span className="w-4 font-mono text-slate-400 font-normal">{item.id}</span>
                <span>{item.task}</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleChecklist(item)}
                className={item.status === 'Completed' ? styles.badgeCompleted : styles.badgePending}
              >
                {item.status === 'Completed' ? (
                  <>
                    <CheckCircle2 size={10} />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Clock size={10} />
                    <span>Pending</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Bottom Assignment & SLA Summary Row */}
      <div className={styles.assignmentSummary}>
        <div className={styles.assignmentSummaryItem}>
          <User size={16} className="text-slate-400 shrink-0" />
          <div>
            <span className={styles.overviewMetaLabel}>Assigned Agent</span>
            <span className="font-bold text-[10px] text-slate-800">{caseInfo.assignedAgentName || 'Amaya Perera'}</span>
          </div>
        </div>

        <div className={styles.assignmentSummaryItem}>
          <ShieldCheck size={16} className="text-slate-400 shrink-0" />
          <div>
            <span className={styles.overviewMetaLabel}>Assigned Team</span>
            <span className="font-bold text-[10px] text-slate-800">{caseInfo.assignedTeam || 'Customer Operations'}</span>
          </div>
        </div>

        <div className={styles.assignmentSummaryItem}>
          <Clock size={16} className="text-slate-400 shrink-0" />
          <div>
            <span className={styles.overviewMetaLabel}>First Response</span>
            <span className="font-bold text-[10px] text-emerald-700">{caseInfo.firstResponseDue || 'Completed in 9 Minutes'}</span>
          </div>
        </div>

        <div className={styles.assignmentSummaryItem}>
          <Calendar size={16} className="text-slate-400 shrink-0" />
          <div>
            <span className={styles.overviewMetaLabel}>Resolution Due</span>
            <span className="font-bold text-[10px] text-slate-800">{caseInfo.resolutionDue}</span>
          </div>
        </div>

        <div className={styles.assignmentSummaryItem}>
          <Target size={16} className="text-emerald-600 shrink-0" />
          <div>
            <span className={styles.overviewMetaLabel}>SLA Status</span>
            <span className="font-bold text-[10px] text-emerald-700">Within Target</span>
          </div>
        </div>

        <div className={styles.assignmentSummaryItem}>
          <Check size={16} className="text-emerald-600 shrink-0" />
          <div>
            <span className={styles.overviewMetaLabel}>Escalation</span>
            <span className="font-bold text-[10px] text-emerald-700">None</span>
          </div>
        </div>
      </div>
    </div>
  );
}

