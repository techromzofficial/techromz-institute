"use client";

import React from "react";
import Link from "next/link";
import { ShipmentRelatedEntities, ShipmentDecisionMetrics } from "@/types/admin";
import { ExternalLink } from "lucide-react";

interface CarrierPanelProps {
  related: ShipmentRelatedEntities;
  metrics: ShipmentDecisionMetrics;
}

export function CarrierPanel({ related, metrics }: CarrierPanelProps) {
  return (
    <div className="side-panel-card">
      <h4>Entities & Carrier</h4>
      
      <div className="entity-row">
        <span className="entity-label">Carrier</span>
        <span className="entity-val">{related.carrierName}</span>
      </div>

      <div className="entity-row">
        <span className="entity-label">Order Reference</span>
        <Link 
          href={`/admin/marketplace/orders/${encodeURIComponent(related.orderReference)}`}
          className="entity-link"
        >
          {related.orderReference}
        </Link>
      </div>

      <div className="entity-row">
        <span className="entity-label">Customer</span>
        <span className="entity-val">
          {related.customerName}
        </span>
      </div>

      <div className="entity-row">
        <span className="entity-label">Supplier</span>
        <Link 
          href="/admin/verification-compliance/supplier-verification"
          className="entity-link"
        >
          {related.supplierName}
        </Link>
      </div>

      {related.batchId && (
        <div className="entity-row">
          <span className="entity-label">Batch ID</span>
          <Link 
            href={`/admin/catalogue/inventory/batches/${encodeURIComponent(related.batchId)}`}
            className="entity-link"
          >
            {related.batchId}
          </Link>
        </div>
      )}

      {related.returnId && (
        <div className="entity-row">
          <span className="entity-label">Return ID</span>
          <Link 
            href={`/admin/marketplace/returns/${encodeURIComponent(related.returnId)}`}
            className="entity-link"
          >
            {related.returnId}
          </Link>
        </div>
      )}

      <hr className="dropdown-divider" />

      <h4>Health & SLA</h4>
      
      <div className="entity-row">
        <span className="entity-label">SLA Status</span>
        <span className={`status-badge-rich ${metrics.slaStatus === 'Breached' ? 'danger' : metrics.slaStatus === 'At Risk' ? 'warning' : 'success'}`}>
          {metrics.slaStatus}
        </span>
      </div>

      <div className="entity-row">
        <span className="entity-label">Time Remaining</span>
        <span className="entity-val" style={{ color: metrics.slaStatus === 'Breached' ? '#dc2626' : 'inherit' }}>
          {metrics.slaTimeRemaining || 'N/A'}
        </span>
      </div>
      
      <div className="entity-row">
        <span className="entity-label">Risk Level</span>
        <span className={`status-badge-rich ${metrics.riskLevel === 'High' ? 'danger' : metrics.riskLevel === 'Medium' ? 'warning' : 'neutral'}`}>
          {metrics.riskLevel}
        </span>
      </div>
      
      <div className="entity-row">
        <span className="entity-label">Health Score</span>
        <span className="entity-val">{metrics.healthScore}/100</span>
      </div>

    </div>
  );
}
