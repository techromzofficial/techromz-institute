"use client";

import React, { useState } from "react";
import { X, Bookmark } from "lucide-react";

interface SaveCustomerViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function SaveCustomerViewModal({
  isOpen,
  onClose,
  onSave,
}: SaveCustomerViewModalProps) {
  const [viewName, setViewName] = useState("High-Value Customers Filter Preset");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-line w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-line flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-bold text-[#671021] uppercase tracking-wider">
              Filter Preset
            </span>
            <h2 className="text-base font-extrabold text-ink">Save Custom Customer View</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-[12px]">
          <div>
            <label className="block font-bold text-ink mb-1">Preset View Name</label>
            <input
              type="text"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              className="w-full h-9 px-3 rounded border border-line text-[12px] font-medium text-ink focus:outline-none focus:border-[#671021]"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] space-y-1 text-slate-600">
            <span className="font-bold text-slate-800 block">Included Active Filters:</span>
            <div>• Date Range: Last 30 Days</div>
            <div>• Active Tab Selection</div>
            <div>• Selected Quick Filter Chips</div>
          </div>
        </div>

        <div className="p-4 border-t border-line bg-slate-50 flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-9 px-4 rounded border border-line text-[12px] font-bold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(viewName);
              onClose();
            }}
            className="h-9 px-5 rounded bg-[#671021] text-white text-[12px] font-bold hover:bg-[#520d1a] flex items-center gap-1.5 shadow-sm"
          >
            <Bookmark size={13} /> Save View
          </button>
        </div>
      </div>
    </div>
  );
}
