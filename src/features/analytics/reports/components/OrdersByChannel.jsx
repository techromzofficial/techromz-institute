"use client";

import React from "react";

export function OrdersByChannel({ channelData }) {
  const channels = channelData || [
    { name: "Web", count: "6,742", percentage: 54.0 },
    { name: "Mobile App", count: "3,618", percentage: 29.0 },
    { name: "Marketplace", count: "1,248", percentage: 10.0 },
    { name: "B2B Portal", count: "472", percentage: 3.8 },
  ];

  return (
    <div className="analytics-card breakdown-card flex-column">
      <div className="chart-card-header">
        <h3 className="chart-title">Orders by Channel</h3>
      </div>

      <div className="breakdown-list-stack flex-1">
        {channels.map((item, idx) => (
          <div key={idx} className="breakdown-row">
            <span className="channel-dot-marker" />
            <span className="breakdown-name">{item.name}</span>
            <span className="breakdown-count">{item.count}</span>
            <span className="breakdown-pct">({item.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

