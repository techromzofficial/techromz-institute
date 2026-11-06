"use client";

import React from "react";
import { Download, Calendar, Share2, PlusCircle, Bookmark, FileSpreadsheet } from "lucide-react";

export function ReportActionsPanel({ onOpenExportModal, onOpenScheduleModal }) {
  return (
    <div className="analytics-card right-panel-card flex-column">
      <h3 className="right-card-title">Report Actions</h3>
      <div className="report-actions-stack">
        <button type="button" onClick={onOpenExportModal} className="right-action-btn flex-between">
          <span className="action-text">
            <Download size={12} /> Export Report
          </span>
        </button>

        <button type="button" onClick={onOpenExportModal} className="right-action-btn flex-between">
          <span className="action-text">
            <FileSpreadsheet size={12} /> Export Underlying Data
          </span>
        </button>

        <button type="button" onClick={onOpenScheduleModal} className="right-action-btn flex-between">
          <span className="action-text">
            <Calendar size={12} /> Schedule Report
          </span>
        </button>

        <button type="button" className="right-action-btn flex-between">
          <span className="action-text">
            <Share2 size={12} /> Share Report
          </span>
        </button>

        <button type="button" className="right-action-btn flex-between">
          <span className="action-text">
            <PlusCircle size={12} /> Create Dashboard Widget
          </span>
        </button>

        <button type="button" className="right-action-btn flex-between">
          <span className="action-text">
            <Bookmark size={12} /> Save as New Report
          </span>
        </button>
      </div>
    </div>
  );
}

