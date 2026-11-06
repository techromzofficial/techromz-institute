"use client";

import React from "react";

export function OrdersByPaymentMethod({ paymentData }) {
  const methods = paymentData || [
    { name: "Card", count: "6,412", percentage: 51.4 },
    { name: "eWallet", count: "3,126", percentage: 25.1 },
    { name: "Bank Transfer", count: "1,642", percentage: 13.1 },
    { name: "COD", count: "1,304", percentage: 10.4 },
  ];

  return (
    <div className="analytics-card breakdown-card flex-column">
      <div className="chart-card-header">
        <h3 className="chart-title">Orders by Payment Method</h3>
      </div>

      <div className="breakdown-list-stack flex-1">
        {methods.map((item, idx) => (
          <div key={idx} className="breakdown-row">
            <span className="method-dot-marker" />
            <span className="breakdown-name">{item.name}</span>
            <span className="breakdown-count">{item.count}</span>
            <span className="breakdown-pct">({item.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

