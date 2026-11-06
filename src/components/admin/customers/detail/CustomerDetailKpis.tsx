"use client";

import React from "react";
import { CustomerDetailRecord } from "@/types/customer-detail";
import {
  ShieldCheck,
  UserCheck,
  ShoppingBag,
  DollarSign,
  Award,
  RotateCcw,
  MessageSquare,
  MapPin,
  Lock,
  ShieldAlert,
  HeartPulse,
} from "lucide-react";

interface CustomerDetailKpisProps {
  profile: CustomerDetailRecord;
}

export function CustomerDetailKpis({
  profile,
}: CustomerDetailKpisProps) {
  const hasOpenCases =
    typeof profile.openCasesCount === "number";

  const kpis = [
    {
      id: "profile-completeness",
      label: "Profile Completeness",
      value:
        typeof profile.profileCompleteness === "number"
          ? `${profile.profileCompleteness}%`
          : "—",
      icon: UserCheck,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      id: "verification-readiness",
      label: "Verification Readiness",
      value:
        typeof profile.verificationReadiness === "number"
          ? `${profile.verificationReadiness}%`
          : "—",
      icon: ShieldCheck,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      id: "total-orders",
      label: "Total Orders",
      value:
        typeof profile.totalOrders === "number"
          ? profile.totalOrders.toString()
          : "—",
      icon: ShoppingBag,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      id: "lifetime-value",
      label: "Lifetime Value",
      value:
        typeof profile.lifetimeValue === "number"
          ? `LKR ${profile.lifetimeValue.toLocaleString()}`
          : "—",
      icon: DollarSign,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      id: "avg-order-value",
      label: "Average Order Value",
      value:
        typeof profile.avgOrderValue === "number"
          ? `LKR ${profile.avgOrderValue.toLocaleString()}`
          : "—",
      icon: DollarSign,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      id: "loyalty-points",
      label: "Loyalty Points",
      value:
        typeof profile.loyaltyPoints === "number"
          ? profile.loyaltyPoints.toLocaleString()
          : "—",
      icon: Award,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      id: "return-rate",
      label: "Return Rate",
      value:
        typeof profile.returnRate === "number"
          ? `${profile.returnRate}%`
          : "—",
      icon: RotateCcw,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      id: "open-cases",
      label: "Open Cases",
      value: hasOpenCases
        ? profile.openCasesCount!.toString()
        : "—",
      icon: MessageSquare,
      color:
        hasOpenCases && profile.openCasesCount! > 0
          ? "text-amber-700"
          : "text-slate-600",
      bgColor:
        hasOpenCases && profile.openCasesCount! > 0
          ? "bg-amber-50"
          : "bg-slate-100",
    },
    {
      id: "active-addresses",
      label: "Active Addresses",
      value:
        typeof profile.activeAddressesCount === "number"
          ? profile.activeAddressesCount.toString()
          : "—",
      icon: MapPin,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      id: "consent-coverage",
      label: "Consent Coverage",
      value:
        typeof profile.consentCoverage === "number"
          ? `${profile.consentCoverage}%`
          : "—",
      icon: Lock,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      id: "risk-score",
      label: "Risk Score",
      value:
        typeof profile.riskScore === "number"
          ? profile.riskLevel
            ? `${profile.riskScore} / ${profile.riskLevel}`
            : profile.riskScore.toString()
          : "—",
      icon: ShieldAlert,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      id: "customer-health",
      label: "Customer Health",
      value:
        typeof profile.customerHealthScore === "number"
          ? `${profile.customerHealthScore} / 100`
          : "—",
      icon: HeartPulse,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon;

        return (
          <div
            key={kpi.id}
            className="bg-white border border-line rounded-lg p-3 shadow-2xs flex items-center gap-2.5"
          >
            <div
              className={`w-8 h-8 rounded-lg ${kpi.bgColor} flex items-center justify-center flex-shrink-0`}
            >
              <IconComponent
                className={`w-4 h-4 ${kpi.color}`}
              />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[9.5px] font-semibold text-slate-400 truncate block">
                {kpi.label}
              </span>

              <span className="text-[14px] font-black text-ink font-mono tracking-tight truncate">
                {kpi.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}