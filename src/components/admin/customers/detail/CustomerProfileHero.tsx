"use client";

import React from "react";
import { CustomerDetailRecord } from "@/types/customer-detail";
import { User, ShieldCheck, Award, CheckCircle2, AlertCircle } from "lucide-react";

interface CustomerProfileHeroProps {
  profile: CustomerDetailRecord;
}

export function CustomerProfileHero({ profile }: CustomerProfileHeroProps) {
  return (
    <div className="bg-white border border-line rounded-xl p-4 sm:p-5 shadow-sm text-[11px]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Profile Info Left Side */}
        <div className="flex items-start gap-4 min-w-0">
          {/* Avatar */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#671021] text-white flex items-center justify-center text-xl sm:text-2xl font-black flex-shrink-0 shadow-sm border-2 border-white ring-2 ring-slate-100">
            {profile.avatarInitials}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-ink tracking-tight truncate">
                {profile.name}
              </h2>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {profile.customerType}
                </span>
                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {profile.lifecycleSegment}
                </span>
                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                  {profile.verificationStatus}
                </span>
                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {profile.loyaltyTier} Member
                </span>
                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {profile.riskLevel} Risk
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              {profile.tagline}
            </p>

            <span className="text-[10px] text-slate-400 font-mono font-semibold mt-0.5">
              Customer ID: {profile.id}
            </span>
          </div>
        </div>
      </div>

      {/* Detail Fields 4-Column Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-3 mt-4 pt-4 border-t border-line/60 text-[10.5px]">
        <div>
          <span className="text-slate-400 font-mono text-[9.5px] uppercase block">Customer Type</span>
          <span className="font-bold text-slate-800">{profile.customerType}</span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[9.5px] uppercase block">Lifecycle Status</span>
          <span className="font-bold text-slate-800">{profile.lifecycleSegment}</span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[9.5px] uppercase block">Verification Status</span>
          <span className="font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 inline" />
            <span>{profile.verificationStatus}</span>
          </span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[9.5px] uppercase block">Loyalty Tier</span>
          <span className="font-bold text-amber-700">{profile.loyaltyTier}</span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[9.5px] uppercase block">Risk Level</span>
          <span className="font-bold text-emerald-600">{profile.riskLevel}</span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[9.5px] uppercase block">Restriction State</span>
          <span className="font-bold text-slate-800">{profile.restrictionStatus}</span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[9.5px] uppercase block">Preferred Channel</span>
          <span className="font-bold text-slate-800">{profile.preferredChannel}</span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[9.5px] uppercase block">Region</span>
          <span className="font-bold text-slate-800 truncate block">{profile.region}</span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[9.5px] uppercase block">Customer Owner</span>
          <span className="font-bold text-slate-800">{profile.owner}</span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[9.5px] uppercase block">Registered</span>
          <span className="font-mono text-slate-700">{profile.registeredDate}</span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[9.5px] uppercase block">Last Activity</span>
          <span className="font-mono text-slate-700">{profile.lastActivity}</span>
        </div>

        <div>
          <span className="text-slate-400 font-mono text-[9.5px] uppercase block">Last Order</span>
          <span className="font-mono text-slate-700">{profile.lastOrderDate}</span>
        </div>
      </div>
    </div>
  );
}
