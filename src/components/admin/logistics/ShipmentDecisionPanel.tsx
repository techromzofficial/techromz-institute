"use client";

import React, { useState } from "react";
import { Check, XCircle, AlertTriangle, Truck } from "lucide-react";
import { logisticsApi } from "@/lib/api/logistics";

interface ShipmentDecisionPanelProps {
  shipmentId: string;
  capabilities: {
    canConfirmPickup: boolean;
    canChangeCarrier: boolean;
    canMarkException: boolean;
    canCancel: boolean;
  };
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ShipmentDecisionPanel({ shipmentId, capabilities, onSuccess, onError }: ShipmentDecisionPanelProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleConfirmPickup = async () => {
    onError("Pickup confirmation is unavailable until an authoritative workflow endpoint is configured.");
  };

  const handleChangeCarrier = async () => {
    onError("Carrier reassignment is unavailable until an authoritative workflow endpoint is configured.");
  };

  const handleMarkException = async () => {
    onError("Exception creation is unavailable until an authoritative workflow endpoint is configured.");
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this shipment? This cannot be undone.")) return;
    
    setLoadingAction("cancel");
    try {
      await logisticsApi.cancelShipment(shipmentId);
      onSuccess("Shipment cancellation persisted.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to cancel shipment.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="side-panel-card decision-panel">
      <h4>Decision & Actions</h4>
      <div className="decision-btn-group">
        <button 
          className="btn-decision primary" 
          disabled
          title="Awaiting an authoritative pickup-confirmation endpoint"
          onClick={handleConfirmPickup}
        >
          <Check size={16} /> 
          {loadingAction === "confirm" ? "Confirming..." : "Confirm Pickup Handover"}
        </button>
        
        <button 
          className="btn-decision" 
          disabled
          title="Awaiting an authoritative carrier-reassignment endpoint"
          onClick={handleChangeCarrier}
        >
          <Truck size={16} /> 
          {loadingAction === "changeCarrier" ? "Changing..." : "Change Carrier"}
        </button>

        <button 
          className="btn-decision danger-outline" 
          disabled
          title="Awaiting an authoritative exception workflow endpoint"
          onClick={handleMarkException}
        >
          <AlertTriangle size={16} /> 
          {loadingAction === "exception" ? "Logging..." : "Mark Exception"}
        </button>

        <button 
          className="btn-decision danger-outline" 
          disabled={!capabilities.canCancel || loadingAction !== null}
          onClick={handleCancel}
        >
          <XCircle size={16} /> 
          {loadingAction === "cancel" ? "Cancelling..." : "Cancel Shipment"}
        </button>
      </div>
    </div>
  );
}

