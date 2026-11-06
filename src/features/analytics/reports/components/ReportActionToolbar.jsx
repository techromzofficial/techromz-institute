"use client";

import React from "react";
import { Download, Bookmark, Calendar, TrendingUp, Share2, MoreHorizontal } from "lucide-react";

export function ReportActionToolbar({ onOpenExportModal, onOpenScheduleModal }) {
  return (
    <div className="report-action-toolbar">
      <button type="button" onClick={onOpenExportModal} className="btn-primary-burgundy icon-text-btn">
        <Download size={13} /> Export Report
      </button>

      <button type="button" className="btn-secondary-outline icon-text-btn">
        <Bookmark size={13} /> Save View
      </button>

      <button type="button" onClick={onOpenScheduleModal} className="btn-secondary-outline icon-text-btn">
        <Calendar size={13} /> Schedule Report
      </button>

      <button type="button" className="btn-secondary-outline icon-text-btn">
        <TrendingUp size={13} /> Compare Periods
      </button>

      <button type="button" className="btn-secondary-outline icon-text-btn">
        <Share2 size={13} /> Share Report
      </button>

      <button type="button" className="btn-secondary-outline icon-btn-only" aria-label="More actions">
        <MoreHorizontal size={14} />
      </button>
    </div>
  );
}

