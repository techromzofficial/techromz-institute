'use client';

import React from 'react';
import {
  Headset,
  FilePlus,
  UserX,
  Clock,
  UserCheck,
  Building2,
  Truck,
  Landmark,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Flame,
  CheckCircle2,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SupportCaseMetricSummary } from '@/types/customerSupport';
import styles from '../../../app/admin/customer-support/cases/page.module.css';

interface SupportKpiCardsProps {
  metrics: SupportCaseMetricSummary | null;
  activeFilterKey?: string;
  onSelectFilter: (key: string, value: string) => void;
}

export function SupportKpiCards({
  metrics,
  activeFilterKey,
  onSelectFilter,
}: SupportKpiCardsProps) {
  if (!metrics) {
    return (
      <div className="kpi-skeleton-container flex gap-3 flex-wrap">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="kpi-card-skeleton animate-pulse bg-slate-100 rounded-lg h-20 w-36"
          />
        ))}
      </div>
    );
  }

  const row1 = [
    {
      key: 'all',
      filterKey: 'status',
      filterVal: 'all',
      icon: Headset,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      label: 'Total Open Cases',
      value: metrics.totalOpenCases.toLocaleString(),
    },
    {
      key: 'new-today',
      filterKey: 'quickFilter',
      filterVal: 'new-today',
      icon: FilePlus,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
      label: 'New Cases Today',
      value: metrics.newCasesToday.toString(),
      badge: metrics.newCasesTodayTrendPercent ? `+${metrics.newCasesTodayTrendPercent}%` : undefined,
      badgePositive: true,
    },
    {
      key: 'unassigned',
      filterKey: 'assignedAgent',
      filterVal: 'unassigned',
      icon: UserX,
      iconBg: '#fff7ed',
      iconColor: '#ea580c',
      label: 'Unassigned Cases',
      value: metrics.unassignedCases.toString(),
    },
    {
      key: 'in-progress',
      filterKey: 'status',
      filterVal: 'in-progress',
      icon: Clock,
      iconBg: '#eff6ff',
      iconColor: '#0284c7',
      label: 'In Progress',
      value: metrics.inProgress.toString(),
    },
    {
      key: 'waiting-customer',
      filterKey: 'status',
      filterVal: 'waiting-for-customer',
      icon: UserCheck,
      iconBg: '#f5f3ff',
      iconColor: '#7c3aed',
      label: 'Waiting for Customer',
      value: metrics.waitingForCustomer.toString(),
    },
    {
      key: 'waiting-supplier',
      filterKey: 'status',
      filterVal: 'waiting-for-supplier',
      icon: Building2,
      iconBg: '#fff7ed',
      iconColor: '#d97706',
      label: 'Waiting for Supplier',
      value: metrics.waitingForSupplier.toString(),
    },
    {
      key: 'waiting-logistics',
      filterKey: 'status',
      filterVal: 'waiting-for-logistics',
      icon: Truck,
      iconBg: '#f0fdfa',
      iconColor: '#0d9488',
      label: 'Waiting for Logistics',
      value: metrics.waitingForLogistics.toString(),
    },
  ];

  const row2 = [
    {
      key: 'waiting-finance',
      filterKey: 'status',
      filterVal: 'waiting-for-finance',
      icon: Landmark,
      iconBg: '#f0fdfa',
      iconColor: '#0284c7',
      label: 'Waiting for Finance',
      value: metrics.waitingForFinance.toString(),
    },
    {
      key: 'sla-at-risk',
      filterKey: 'sla',
      filterVal: 'at-risk',
      icon: AlertTriangle,
      iconBg: '#fffbe6',
      iconColor: '#d97706',
      label: 'SLA At Risk',
      value: metrics.slaAtRisk.toString(),
      isHighlight: true,
      highlightColor: '#d97706',
    },
    {
      key: 'sla-breaches',
      filterKey: 'sla',
      filterVal: 'breached',
      icon: ShieldAlert,
      iconBg: '#fef2f2',
      iconColor: '#dc2626',
      label: 'SLA Breaches',
      value: metrics.slaBreaches.toString(),
      isHighlight: true,
      highlightColor: '#dc2626',
    },
    {
      key: 'escalated-cases',
      filterKey: 'status',
      filterVal: 'escalated',
      icon: TrendingUp,
      iconBg: '#faf5ff',
      iconColor: '#9333ea',
      label: 'Escalated Cases',
      value: metrics.escalatedCases.toString(),
    },
    {
      key: 'safety-complaints',
      filterKey: 'quickFilter',
      filterVal: 'safety-complaint',
      icon: Flame,
      iconBg: '#fef2f2',
      iconColor: '#b91c1c',
      label: 'Safety Complaints',
      value: metrics.safetyComplaints.toString(),
      isHighlight: true,
      highlightColor: '#b91c1c',
    },
    {
      key: 'resolved-today',
      filterKey: 'status',
      filterVal: 'resolved',
      icon: CheckCircle2,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
      label: 'Resolved Today',
      value: metrics.resolvedToday.toString(),
    },
    {
      key: 'customer-satisfaction',
      filterKey: 'sentiment',
      filterVal: 'positive',
      icon: Star,
      iconBg: '#fffbe6',
      iconColor: '#ca8a04',
      label: 'Customer Satisfaction',
    },
  ];

interface KpiCardItemConfig {
  key: string;
  filterKey: string;
  filterVal: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  badge?: string;
  badgePositive?: boolean;
  isHighlight?: boolean;
  highlightColor?: string;
}

  const renderCard = (card: KpiCardItemConfig) => {
    const Icon = card.icon;
    const isActive = activeFilterKey === card.key || activeFilterKey === card.filterVal;

    let cardClass = styles.kpiCard;
    if (isActive) {
      cardClass += ` ${styles.kpiCardActive}`;
    } else if (card.key === 'sla-at-risk') {
      cardClass += ` ${styles.kpiCardHighlightAmber}`;
    } else if (card.key === 'sla-breaches' || card.key === 'safety-complaints') {
      cardClass += ` ${styles.kpiCardHighlightRed}`;
    }

    return (
      <button
        key={card.key}
        type="button"
        onClick={() => onSelectFilter(card.filterKey, card.filterVal)}
        className={cardClass}
      >
        <div className={styles.kpiHeader}>
          <div
            className={styles.kpiIconBox}
            style={{ backgroundColor: card.iconBg, color: card.iconColor }}
          >
            <Icon size={16} />
          </div>
          {card.badge && (
            <span className={styles.kpiBadge}>
              <TrendingUp size={10} style={{ display: 'inline', marginRight: '2px' }} />
              {card.badge}
            </span>
          )}
        </div>
        <div className={styles.kpiValue}>{card.value}</div>
        <div className={styles.kpiLabel}>{card.label}</div>
      </button>
    );
  };

  return (
    <div className={styles.kpiSection}>
      <div className={styles.kpiGrid}>{row1.map(renderCard)}</div>
      <div className={styles.kpiGrid}>{row2.map(renderCard)}</div>
    </div>
  );
}
