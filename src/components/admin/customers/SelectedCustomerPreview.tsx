"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CustomerRecord } from "@/types/customer";
import { User, Mail, Phone, MapPin, Smartphone, ShieldCheck, AlertTriangle } from "lucide-react";

interface SelectedCustomerPreviewProps {
  customer?: CustomerRecord | null;
  showToast?: (msg: string) => void;
  hasCustomers?: boolean;
}

export function SelectedCustomerPreview({
  customer,
  showToast,
  hasCustomers = true,
}: SelectedCustomerPreviewProps) {
  const [activeTab, setActiveTab] = useState("Overview");

  const getInitials = (name?: string) => {
    if (!name) return "CU";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (!customer) {
    return (
      <div className="bg-white border border-line rounded-lg p-3.5 shadow-sm text-[11px] flex flex-col justify-between h-full min-w-0 min-h-[420px]">
        <div>
          <h4 className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono mb-2">
            Selected Customer Preview
          </h4>

          {/* Empty Header Shell */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg mb-3 text-center justify-center min-h-[64px]">
            <User size={24} className="text-slate-300" />
            <span className="text-[11px] font-mono text-slate-500 font-bold">
              {hasCustomers ? "Select a customer to preview details" : "No customers available to preview"}
            </span>
          </div>

          {/* Sub-tabs Shell */}
          <div className="flex items-center gap-2 border-b border-line text-[10px] font-bold mb-3 pb-1 opacity-50">
            {["Overview", "Profile", "Verification", "Orders"].map((tab) => (
              <span key={tab} className="py-1 px-1.5 text-slate-400 cursor-not-allowed">
                {tab}
              </span>
            ))}
          </div>

          {/* Quick Summaries Empty Grid */}
          <div className="grid grid-cols-2 gap-2 text-[9.5px] mb-3">
            <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
              <span className="text-slate-400 block font-medium">Returns & Disputes</span>
              <span className="font-bold text-slate-400 font-mono">—</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
              <span className="text-slate-400 block font-medium">Loyalty & Rewards</span>
              <span className="font-bold text-slate-400 font-mono">—</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
              <span className="text-slate-400 block font-medium">Consent & Privacy</span>
              <span className="font-bold text-slate-400 font-mono">—</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
              <span className="text-slate-400 block font-medium">Risk & Restrictions</span>
              <span className="font-bold text-slate-400 font-mono">—</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
              <span className="text-slate-400 block font-medium">Support & Comms</span>
              <span className="font-bold text-slate-400 font-mono">—</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
              <span className="text-slate-400 block font-medium">Activity</span>
              <span className="font-bold text-slate-400 font-mono">—</span>
            </div>
          </div>

          {/* Contact Info Empty List */}
          <div className="space-y-1.5 text-[10px] border-t border-line pt-2.5 opacity-50">
            <div className="flex items-center gap-2 text-slate-400">
              <Mail size={12} />
              <span className="font-mono text-[10px]">Not selected</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Phone size={12} />
              <span className="font-mono text-[10px]">Not selected</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin size={12} />
              <span>Not selected</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Smartphone size={12} />
              <span>Not selected</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-line flex flex-col gap-1.5">
          <button
            disabled
            className="w-full py-1.5 bg-slate-200 text-slate-400 rounded text-[10.5px] font-bold cursor-not-allowed text-center block"
          >
            View Full Customer Profile
          </button>
          <span className="text-[10px] font-bold text-slate-300 cursor-not-allowed text-left block w-full">
            Audit History &rarr;
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-line rounded-lg p-3.5 shadow-sm text-[11px] flex flex-col justify-between h-full min-w-0 min-h-[420px]">
      <div>
        {/* Title */}
        <h4 className="text-[11px] font-bold text-ink uppercase tracking-wider font-mono mb-2">
          Selected Customer Preview
        </h4>

        {/* Customer Avatar & Header Card */}
        <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-lg mb-3">
          <div className="w-10 h-10 rounded-full bg-[#671021] text-white flex items-center justify-center text-[13px] font-black flex-shrink-0">
            {customer.avatarInitials || getInitials(customer.name)}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-bold text-ink text-[12.5px] truncate">{customer.name}</span>
            <span className="text-[10px] text-slate-500 font-mono">Customer ID: {customer.id}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold text-[8.5px] border border-emerald-200">
                {customer.lifecycleSegment || "Active"}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 font-bold text-[8.5px] border border-amber-200">
                {customer.loyaltyTier || "Standard"} Member
              </span>
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 border-b border-line text-[10px] font-bold mb-3 pb-1">
          {["Overview", "Profile", "Verification", "Orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1 px-1.5 transition-colors cursor-pointer ${
                activeTab === tab ? "text-[#671021] border-b-2 border-[#671021]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sub-tab Content Panels */}
        {activeTab === "Overview" && (
          <>
            {/* Quick Summaries Grid */}
            <div className="grid grid-cols-2 gap-2 text-[9.5px] mb-3">
              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block font-medium">Returns & Disputes</span>
                <span className="font-bold text-slate-800 font-mono">{customer.returnsCount ?? 0} returns</span>
              </div>
              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block font-medium">Loyalty & Rewards</span>
                <span className="font-bold text-purple-700 font-mono">{customer.loyaltyTier || "Standard"} Tier</span>
              </div>
              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block font-medium">Consent & Privacy</span>
                <span className="font-bold text-emerald-600 font-mono">{customer.consentStatus || "Granted"}</span>
              </div>
              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block font-medium">Risk & Restrictions</span>
                <span className="font-bold text-slate-800 font-mono">{customer.riskLevel || "Low"} Risk</span>
              </div>
              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block font-medium">Support & Comms</span>
                <span className="font-bold text-slate-800 font-mono">{customer.openCasesCount ?? 0} open cases</span>
              </div>
              <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-400 block font-medium">Activity</span>
                <span className="font-bold text-slate-800 font-mono">{customer.totalOrders ?? 0} orders</span>
              </div>
            </div>

            {/* Contact Info List */}
            <div className="space-y-1.5 text-[10px] border-t border-line pt-2.5">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail size={12} className="text-slate-400 flex-shrink-0" />
                <span className="font-mono text-[10px] truncate">{customer.email || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone size={12} className="text-slate-400 flex-shrink-0" />
                <span className="font-mono text-[10px]">{customer.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{customer.region || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Smartphone size={12} className="text-slate-400 flex-shrink-0" />
                <span>{customer.preferredChannel || "Website"}</span>
              </div>
            </div>
          </>
        )}

        {activeTab === "Profile" && (
          <div className="space-y-2 text-[10px] py-1">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Customer Type</span>
              <span className="font-bold text-slate-800">{customer.customerType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Profile Completeness</span>
              <span className="font-bold text-emerald-600">{customer.profileCompleteness}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Owner / Account Lead</span>
              <span className="font-bold text-slate-800">{customer.owner || "System"}</span>
            </div>
          </div>
        )}

        {activeTab === "Verification" && (
          <div className="space-y-2 text-[10px] py-1">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Identity Verification</span>
              <span className="font-bold text-emerald-600">{customer.verificationStatus}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Restriction Status</span>
              <span className="font-bold text-slate-800">{customer.restrictionStatus}</span>
            </div>
          </div>
        )}

        {activeTab === "Orders" && (
          <div className="space-y-2 text-[10px] py-1">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Total Orders</span>
              <span className="font-bold text-slate-800 font-mono">{customer.totalOrders}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Last Order Date</span>
              <span className="font-bold text-slate-800 font-mono">{customer.lastOrderDate}</span>
            </div>
          </div>
        )}

        {/* Detailed Attribute List */}
        <div className="space-y-1.5 text-[10px] border-t border-line pt-2.5 mt-2.5">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Verification Status</span>
            <span className="font-bold text-emerald-600">{customer.verificationStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Consent Status</span>
            <span className="font-bold text-emerald-600">{customer.consentStatus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Risk Level</span>
            <span className="font-bold text-emerald-600">{customer.riskLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Restriction Status</span>
            <span className="font-bold text-slate-800">{customer.restrictionStatus}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-100 text-[9.5px]">
            <span className="text-slate-400">Last Activity</span>
            <span className="font-mono text-slate-600">{customer.lastActivity}</span>
          </div>
          <div className="flex justify-between text-[9.5px]">
            <span className="text-slate-400">Updated At</span>
            <span className="font-mono text-slate-600">{customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : "—"}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-line flex flex-col gap-1.5">
        <Link
          href={`/admin/customers/${customer.id}`}
          className="w-full py-1.5 bg-[#671021] text-white rounded text-[10.5px] font-bold hover:bg-[#520d1a] transition-colors text-center block"
        >
          View Full Customer Profile
        </Link>

        <button
          type="button"
          onClick={() => showToast?.(`Opening audit history for customer ${customer.id}`)}
          className="text-[10px] font-bold text-[#671021] hover:underline text-left block w-full cursor-pointer"
        >
          Audit History &rarr;
        </button>
      </div>
    </div>
  );
}
