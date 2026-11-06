"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface ShipmentDetailHeaderProps {
  publicReference: string;
  dbShipmentId: string;
}

export function ShipmentDetailHeader({ publicReference, dbShipmentId }: ShipmentDetailHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    // using router.back() ensures the query parameters from the previous page are preserved
    router.back();
  };

  return (
    <div className="shipment-detail-header">
      <div className="detail-header-top">
        <button onClick={handleBack} className="back-btn-rich">
          <ArrowLeft size={16} /> Back to Logistics Operations
        </button>
      </div>
      <div className="header-identities">
        <h1 className="public-ref">{publicReference}</h1>
        <span className="db-ref">ID: {dbShipmentId}</span>
        <button className="button icon-only" title="Open in Carrier Portal">
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
}

