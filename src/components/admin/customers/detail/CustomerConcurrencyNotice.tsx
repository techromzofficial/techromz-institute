"use client";

import React from "react";
import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface CustomerConcurrencyNoticeProps {
  updatedBy?: string;
  updatedAgo?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function CustomerConcurrencyNotice({
  updatedBy,
  updatedAgo,
  onRefresh,
  isRefreshing = false,
}: CustomerConcurrencyNoticeProps) {
  if (!updatedBy || !updatedAgo) {
    return null;
  }

  return (
    <div className="bg-amber-50/90 border border-amber-200/90 rounded-lg p-2.5 px-3 flex items-center justify-between text-[11.5px] text-amber-900 shadow-2xs">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />

        <span>
          <strong className="font-bold">
            Concurrency Notice:
          </strong>{" "}
          This customer record was updated by{" "}
          <span className="font-semibold">
            {updatedBy}
          </span>{" "}
          {updatedAgo}. Please refresh to view the latest changes.
        </span>
      </div>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 rounded text-[11px] font-bold text-amber-900 hover:bg-amber-100/80 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3 h-3 ${
              isRefreshing
                ? "animate-spin"
                : ""
            }`}
          />

          <span>Refresh</span>
        </button>
      )}
    </div>
  );
}