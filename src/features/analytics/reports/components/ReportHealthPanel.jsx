"use client";

import React from "react";

export function ReportHealthPanel({ health = {} }) {
  const {
    completeness = "99.2%",
    freshness = "Current",
    orderGrowth = "11.2%",
    fulfilmentHealth = "96.7%",
    deliveryHealth = "94.1%",
    supportSla = "91.3%",
    inventoryRisk = "Medium",
    complianceRisk = "Low",
  } = health;

  return (
    <div className="analytics-card right-panel-card flex-column">
      <h3 className="right-card-title">Report Health</h3>
      <div className="health-metrics-list">
        <div className="health-row flex-between">
          <span className="health-label">Data Completeness</span>
          <span className="health-val bold">{completeness}</span>
        </div>
        <div className="health-progress-bar">
          <div className="bar-fill" style={{ width: completeness }} />
        </div>

        <div className="health-row flex-between">
          <span className="health-label">Data Freshness</span>
          <span className="health-val success">{freshness}</span>
        </div>

        <div className="health-row flex-between">
          <span className="health-label">Order Growth</span>
          <span className="health-val positive">↑ {orderGrowth}</span>
        </div>
        <div className="health-progress-bar">
          <div className="bar-fill positive" style={{ width: orderGrowth }} />
        </div>

        <div className="health-row flex-between">
          <span className="health-label">Fulfilment Health</span>
          <span className="health-val">{fulfilmentHealth}</span>
        </div>
        <div className="health-progress-bar">
          <div className="bar-fill" style={{ width: fulfilmentHealth }} />
        </div>

        <div className="health-row flex-between">
          <span className="health-label">Delivery Health</span>
          <span className="health-val">{deliveryHealth}</span>
        </div>
        <div className="health-progress-bar">
          <div className="bar-fill" style={{ width: deliveryHealth }} />
        </div>

        <div className="health-row flex-between">
          <span className="health-label">Support SLA</span>
          <span className="health-val">{supportSla}</span>
        </div>
        <div className="health-progress-bar">
          <div className="bar-fill" style={{ width: supportSla }} />
        </div>

        <div className="health-row flex-between">
          <span className="health-label">Inventory Risk</span>
          <span className="health-val warning">{inventoryRisk}</span>
        </div>

        <div className="health-row flex-between">
          <span className="health-label">Compliance Risk</span>
          <span className="health-val success">{complianceRisk}</span>
        </div>
      </div>
    </div>
  );
}

