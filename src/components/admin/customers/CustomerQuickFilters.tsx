"use client";

import React from "react";
import { UserCheck, Clock, Crown, UserX, ShieldAlert, Headphones, RefreshCw, Lock } from "lucide-react";

interface CustomerQuickFiltersProps {
  activeChips: string[];
  onToggleChip: (chip: string) => void;
}

export function CustomerQuickFilters({
  activeChips,
  onToggleChip,
}: CustomerQuickFiltersProps) {
  const chips = [
    { id: "Assigned to Me", label: "Assigned to Me", icon: UserCheck },
    { id: "Verification Pending", label: "Verification Pending", icon: Clock },
    { id: "High-Value", label: "High-Value", icon: Crown },
    { id: "Dormant", label: "Dormant", icon: UserX },
    { id: "Restricted", label: "Restricted", icon: ShieldAlert },
    { id: "Open Cases", label: "Open Cases", icon: Headphones },
    { id: "Return Risk", label: "Return Risk", icon: RefreshCw },
    { id: "Privacy Requests", label: "Privacy Requests", icon: Lock },
  ];

  return (
    <div className="bg-white border border-line border-t-0 p-2.5 flex items-center flex-wrap gap-2 text-[11px]">
      {chips.map((chip) => {
        const Icon = chip.icon;
        const isActive = activeChips.includes(chip.id);
        return (
          <button
            key={chip.id}
            onClick={() => onToggleChip(chip.id)}
            className={`h-6 px-2.5 rounded-full border flex items-center gap-1.5 font-semibold transition-all ${
              isActive
                ? "bg-[#671021] border-[#671021] text-white shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Icon size={12} className={isActive ? "text-white" : "text-slate-500"} />
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
}
