"use client";

import React from "react";
import {
  ShoppingBag,
  DollarSign,
  Lock,
  RefreshCw,
  Users,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import type { OrderMetricSummary } from "@/types/admin";

interface OrderMetricsRowProps {
  metrics: OrderMetricSummary;
  activeFilterKey?: string;
  onSelectMetric: (filterKey: string) => void;
}

interface MetricCardConfig {
  key: string;
  label: string;
  valueKey: keyof OrderMetricSummary;
  icon: React.ReactNode;
  bgClass: string;
  iconColor: string;
}

export function OrderMetricsRow({
  metrics,
  activeFilterKey,
  onSelectMetric,
}: OrderMetricsRowProps) {
  const row1Configs: MetricCardConfig[] = [
    {
      key: "total_today",
      label: "Total Today",
      valueKey: "totalToday",
      icon: <ShoppingBag size={20} />,
      bgClass: "bg-blue-light",
      iconColor: "#2563eb",
    },
    {
      key: "pending_payment",
      label: "Pending Payment",
      valueKey: "pendingPayment",
      icon: <DollarSign size={20} />,
      bgClass: "bg-orange-light",
      iconColor: "#d97706",
    },
    {
      key: "payment_failed",
      label: "Payment Failed",
      valueKey: "paymentFailed",
      icon: <Lock size={20} />,
      bgClass: "bg-red-light",
      iconColor: "#dc2626",
    },
    {
      key: "processing",
      label: "Processing",
      valueKey: "processing",
      icon: <RefreshCw size={20} />,
      bgClass: "bg-maroon-light",
      iconColor: "#741d35",
    },
    {
      key: "awaiting_supplier",
      label: "Awaiting Supplier",
      valueKey: "awaitingSupplier",
      icon: <Users size={20} />,
      bgClass: "bg-orange-light",
      iconColor: "#d97706",
    },
    {
      key: "ready_for_dispatch",
      label: "Ready for Dispatch",
      valueKey: "readyForDispatch",
      icon: <Package size={20} />,
      bgClass: "bg-green-light",
      iconColor: "#16a34a",
    },
  ];

  const row2Configs: MetricCardConfig[] = [
    {
      key: "in_transit",
      label: "In Transit",
      valueKey: "inTransit",
      icon: <Truck size={20} />,
      bgClass: "bg-blue-light",
      iconColor: "#2563eb",
    },
    {
      key: "delivered_today",
      label: "Delivered Today",
      valueKey: "deliveredToday",
      icon: <CheckCircle2 size={20} />,
      bgClass: "bg-green-light",
      iconColor: "#16a34a",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      valueKey: "cancelled",
      icon: <XCircle size={20} />,
      bgClass: "bg-grey-light",
      iconColor: "#6b7280",
    },
    {
      key: "returns_in_progress",
      label: "Returns in Progress",
      valueKey: "returnsInProgress",
      icon: <RotateCcw size={20} />,
      bgClass: "bg-purple-light",
      iconColor: "#9333ea",
    },
    {
      key: "sla_breaches",
      label: "SLA Breaches",
      valueKey: "slaBreaches",
      icon: <AlertTriangle size={20} />,
      bgClass: "bg-orange-light",
      iconColor: "#dc2626",
    },
    {
      key: "high_risk_orders",
      label: "High-Risk Orders",
      valueKey: "highRiskOrders",
      icon: <ShieldAlert size={20} />,
      bgClass: "bg-red-light",
      iconColor: "#dc2626",
    },
  ];

  const renderCard = (config: MetricCardConfig) => {
    const isSelected = activeFilterKey === config.key;
    const value = metrics[config.valueKey];

    return (
      <button
        key={config.key}
        type="button"
        className={`order-metric-card ${isSelected ? "selected" : ""}`}
        onClick={() => onSelectMetric(config.key)}
        aria-pressed={isSelected}
      >
        <div className="metric-header">
          <span className={`metric-icon-box ${config.bgClass}`} style={{ color: config.iconColor }}>
            {config.icon}
          </span>
          <span className="metric-label">{config.label}</span>
        </div>
        <div className="metric-value">{value.toLocaleString()}</div>
      </button>
    );
  };

  return (
    <div className="order-metrics-section">
      <div className="order-metrics-grid">{row1Configs.map(renderCard)}</div>
      <div className="order-metrics-grid">{row2Configs.map(renderCard)}</div>
    </div>
  );
}
