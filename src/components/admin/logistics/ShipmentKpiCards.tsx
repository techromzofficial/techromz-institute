"use client";

import React from "react";
import { PackageOpen, Clock, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { ShipmentMetrics } from "@/types/admin";

interface ShipmentKpiCardsProps {
  metrics: ShipmentMetrics | null;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function ShipmentKpiCards({ metrics, activeFilter, onFilterChange }: ShipmentKpiCardsProps) {
  if (!metrics) return <div className="animate-pulse bg-white h-24 rounded-lg"></div>;

  return (
    <div className="metrics-cards-grid">
      <div 
        className={`metric-card-rich ${activeFilter === "all" ? "active" : ""}`}
        onClick={() => onFilterChange("all")}
      >
        <div className="metric-icon-wrap metric-neutral">
          <PackageOpen size={24} />
        </div>
        <div className="metric-info">
          <span className="metric-label">Total Active</span>
          <span className="metric-value">{metrics.totalActive}</span>
        </div>
      </div>

      <div 
        className={`metric-card-rich ${activeFilter === "pending" ? "active" : ""}`}
        onClick={() => onFilterChange("pending")}
      >
        <div className="metric-icon-wrap metric-warning">
          <Clock size={24} />
        </div>
        <div className="metric-info">
          <span className="metric-label">Pending Pickup</span>
          <span className="metric-value">{metrics.pendingPickup}</span>
        </div>
      </div>

      <div 
        className={`metric-card-rich ${activeFilter === "transit" ? "active" : ""}`}
        onClick={() => onFilterChange("transit")}
      >
        <div className="metric-icon-wrap metric-info">
          <TruckIcon />
        </div>
        <div className="metric-info">
          <span className="metric-label">In Transit</span>
          <span className="metric-value">{metrics.inTransit}</span>
        </div>
      </div>

      <div 
        className={`metric-card-rich ${activeFilter === "delivered" ? "active" : ""}`}
        onClick={() => onFilterChange("delivered")}
      >
        <div className="metric-icon-wrap metric-success">
          <CheckCircle size={24} />
        </div>
        <div className="metric-info">
          <span className="metric-label">Delivered Today</span>
          <span className="metric-value">{metrics.deliveredToday}</span>
        </div>
      </div>

      <div 
        className={`metric-card-rich ${activeFilter === "exceptions" ? "active" : ""}`}
        onClick={() => onFilterChange("exceptions")}
      >
        <div className="metric-icon-wrap metric-danger">
          <AlertCircle size={24} />
        </div>
        <div className="metric-info">
          <span className="metric-label">Exceptions</span>
          <span className="metric-value">{metrics.exceptions}</span>
        </div>
      </div>
    </div>
  );
}

function TruckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
  );
}

