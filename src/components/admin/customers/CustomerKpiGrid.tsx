"use client";

import React from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Clock,
  Crown,
  Award,
  UserX,
  ShieldAlert,
  Headphones,
  RefreshCw,
  Lock,
  Copy,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { CustomerKpiCard } from "@/types/customer";

const EMPTY_KPIS: CustomerKpiCard[] = [
  { seq: 1, id: "total-customers", label: "Total Customers", value: "0", change: "—", changeDirection: "neutral", statusState: "info", iconName: "Users" },
  { seq: 2, id: "active-customers", label: "Active Customers", value: "0", change: "—", changeDirection: "neutral", statusState: "info", iconName: "UserCheck" },
  { seq: 3, id: "new-customers", label: "New Customers (30D)", value: "0", change: "—", changeDirection: "neutral", statusState: "info", iconName: "UserPlus" },
  { seq: 4, id: "verified-customers", label: "Verified Customers", value: "0", change: "—", changeDirection: "neutral", statusState: "info", iconName: "ShieldCheck" },
  { seq: 5, id: "verification-pending", label: "Verification Pending", value: "0", change: "—", changeDirection: "neutral", statusState: "info", iconName: "Clock" },
  { seq: 6, id: "high-value-customers", label: "High-Value Customers", value: "0", change: "—", changeDirection: "neutral", statusState: "info", iconName: "Crown" },
  { seq: 7, id: "loyalty-members", label: "Loyalty Members", value: "0", change: "—", changeDirection: "neutral", statusState: "info", iconName: "Award" },
  { seq: 8, id: "dormant-customers", label: "Dormant Customers", value: "0", change: "—", changeDirection: "neutral", statusState: "info", iconName: "UserX" },
  { seq: 9, id: "restricted-customers", label: "Restricted Customers", value: "0", change: "—", changeDirection: "neutral", statusState: "info", iconName: "ShieldAlert" },
  { seq: 10, id: "open-cases", label: "Open Service Cases", value: "0", change: "—", changeDirection: "neutral", statusState: "info", iconName: "Headphones" },
  { seq: 11, id: "returns-disputes", label: "Returns / Disputes", value: "0", change: "—", changeDirection: "neutral", statusState: "info", iconName: "RefreshCw" },
  { seq: 12, id: "privacy-requests", label: "Privacy Requests Pending", value: "0", change: "—", changeDirection: "neutral", statusState: "info", iconName: "Lock" },
];

const iconMap: Record<string, React.ElementType> = {
  Users,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Clock,
  Crown,
  Award,
  UserX,
  ShieldAlert,
  Headphones,
  RefreshCw,
  Lock,
  Copy,
};

interface CustomerKpiGridProps {
  kpis?: CustomerKpiCard[];
  onFilterClick?: (type: string, value: string) => void;
  showToast?: (msg: string) => void;
}

export function CustomerKpiGrid({ kpis, onFilterClick, showToast }: CustomerKpiGridProps) {
  const displayKpis = kpis && kpis.length > 0 ? kpis : EMPTY_KPIS;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
      {displayKpis.map((card) => {
        const Icon = iconMap[card.iconName] || Users;

        const isPositive = card.statusState === "positive";
        const isWarning = card.statusState === "warning";
        const isCritical = card.statusState === "critical";

        let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
        let iconBg = "bg-slate-50 text-slate-600 border-slate-200";

        if (isWarning) {
          badgeBg = "bg-amber-50 text-amber-700 border-amber-200";
          iconBg = "bg-amber-50 text-amber-600 border-amber-200";
        } else if (isCritical) {
          badgeBg = "bg-rose-50 text-rose-700 border-rose-200";
          iconBg = "bg-rose-50 text-rose-600 border-rose-200";
        } else if (card.statusState === "info") {
          badgeBg = "bg-sky-50 text-sky-700 border-sky-200";
          iconBg = "bg-sky-50 text-sky-600 border-sky-200";
        }

        return (
          <div
            key={card.id}
            onClick={() => {
              if (onFilterClick) {
                if (card.id === "active-customers") onFilterClick("tab", "Active");
                else if (card.id === "new-customers") onFilterClick("tab", "New");
                else if (card.id === "verified-customers") onFilterClick("tab", "Verified");
                else if (card.id === "verification-pending") onFilterClick("chip", "Verification Pending");
                else if (card.id === "high-value-customers") onFilterClick("tab", "High-Value");
                else if (card.id === "loyalty-members") onFilterClick("tab", "Loyalty");
                else if (card.id === "dormant-customers") onFilterClick("tab", "Dormant");
                else if (card.id === "restricted-customers") onFilterClick("tab", "Restricted");
                else if (card.id === "open-service-cases") onFilterClick("tab", "Service Cases");
                else if (card.id === "returns-disputes") onFilterClick("tab", "Returns & Disputes");
                else if (card.id === "privacy-requests-pending") onFilterClick("tab", "Privacy Requests");
              }
            }}
            className="bg-white border border-line rounded-lg p-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Top row: Seq & Icon */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9.5px] font-bold text-slate-400">
                {card.seq}
              </span>
              <div className={`p-1.5 rounded-md border ${iconBg}`}>
                <Icon size={14} />
              </div>
            </div>

            {/* Label */}
            <span className="text-[11px] font-semibold text-slate-600 truncate mb-1" title={card.label}>
              {card.label}
            </span>

            {/* Value & Change */}
            <div className="flex items-baseline justify-between mt-auto pt-1">
              <span className="text-lg font-black text-ink font-mono tracking-tight">
                {card.value}
              </span>

              <span
                className={`flex items-center gap-0.5 text-[9.5px] font-bold px-1.5 py-0.2 rounded border ${badgeBg}`}
              >
                {card.changeDirection === "up" ? (
                  <ArrowUpRight size={10} />
                ) : (
                  <ArrowDownRight size={10} />
                )}
                {card.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
