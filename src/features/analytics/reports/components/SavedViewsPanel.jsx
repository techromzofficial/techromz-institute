"use client";

import React from "react";
import { Bookmark, ChevronRight } from "lucide-react";

export function SavedViewsPanel({ views = [], activeSavedView = "", onSelectView }) {
  const defaultViews = [
    {
      id: "executive-order-summary",
      name: "Executive Order Summary",
      filters: { period: "last-30-days", orderStatus: "all", paymentStatus: "all" },
    },
    {
      id: "daily-operations-view",
      name: "Daily Operations View",
      filters: { period: "today", orderStatus: "processing" },
    },
    {
      id: "payment-failure-review",
      name: "Payment Failure Review",
      filters: { paymentStatus: "failed", page: "1" },
    },
    {
      id: "supplier-fulfilment-review",
      name: "Supplier Fulfilment Review",
      filters: { fulfilmentStatus: "awaiting-supplier", page: "1" },
    },
  ];

  const list = views.length > 0 ? views : defaultViews;

  return (
    <section className="reportSideCard savedViewsCard analytics-card right-panel-card flex-column">
      <header className="sideCardHeader flex-between mb-2">
        <div className="flex-center-gap">
          <Bookmark size={13} className="header-icon text-muted" />
          <h3 className="sideCardTitle text-xs font-bold uppercase tracking-wider text-muted">
            Saved Views
          </h3>
        </div>
      </header>
      <div className="savedViewList saved-views-stack flex-1">
        {list.map((view) => {
          const viewId = view.id || view.key || view.name.toLowerCase().replace(/\s+/g, "-");
          const isSelected = activeSavedView === viewId;

          return (
            <button
              key={viewId}
              type="button"
              className={`savedViewRow saved-view-item ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectView && onSelectView(view)}
              aria-current={isSelected ? "true" : undefined}
            >
              <span className="savedViewName view-name" title={view.name}>
                {view.name}
              </span>
              <ChevronRight size={13} className="chevron-muted flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

