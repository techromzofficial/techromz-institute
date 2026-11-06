"use client";

import React from "react";
import { Check, Clock, AlertCircle } from "lucide-react";
import { ShipmentLifecycleStage } from "@/types/admin";

interface ShipmentLifecycleProps {
  stages: ShipmentLifecycleStage[];
}

export function ShipmentLifecycle({ stages }: ShipmentLifecycleProps) {
  return (
    <div className="lifecycle-card">
      <div className="lifecycle-stepper">
        {stages.map((stage, index) => {
          let Icon = null;
          if (stage.status === "completed") Icon = <Check size={14} />;
          if (stage.status === "active") Icon = <Clock size={14} />;
          if (stage.status === "failed") Icon = <AlertCircle size={14} />;

          return (
            <div key={stage.id} className={`lifecycle-stage ${stage.status}`}>
              <div className="stage-dot">
                {Icon ? Icon : <span>{index + 1}</span>}
              </div>
              <span className="stage-name">{stage.name}</span>
              {stage.timestamp && (
                <span className="stage-time">
                  {new Date(stage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

