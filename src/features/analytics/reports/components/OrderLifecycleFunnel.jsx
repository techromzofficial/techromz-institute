"use client";

import React from "react";

export function OrderLifecycleFunnel({ funnelStages = [] }) {
  const defaultStages = [
    { stageNumber: 1, stageTitle: "Orders Created", count: "12,486", conversion: "—" },
    { stageNumber: 2, stageTitle: "Payment Confirmed", count: "11,904", conversion: "95.3%" },
    { stageNumber: 3, stageTitle: "Supplier Confirmed", count: "11,128", conversion: "93.5%" },
    { stageNumber: 4, stageTitle: "Fully Allocated", count: "10,842", conversion: "98.6%" },
    { stageNumber: 5, stageTitle: "Dispatched", count: "10,762", conversion: "99.2%" },
    { stageNumber: 6, stageTitle: "Delivered", count: "10,842", conversion: "100.7%" },
    { stageNumber: 7, stageTitle: "Completed", count: "10,516", conversion: "97.0%" },
  ];

  const stages = funnelStages.length > 0 ? funnelStages : defaultStages;

  // Trapezoid SVG widths for 7 stages
  // ViewBox: 0 0 240 160
  const stageHeight = 22;
  const stageFills = [
    "#42a5f5", // 1 Blue
    "#5c6bc0", // 2 Indigo
    "#7e57c2", // 3 Purple
    "#ab47bc", // 4 Deep Purple
    "#ec407a", // 5 Pink
    "#ef5350", // 6 Red/Coral
    "#ffa726", // 7 Orange
  ];

  return (
    <div className="analytics-card chart-card flex-column">
      <div className="chart-card-header flex-between">
        <h3 className="chart-title">Order Lifecycle Funnel</h3>
        <div className="funnel-table-header">
          <span>Orders</span>
          <span>Conversion</span>
        </div>
      </div>

      <div className="funnel-container flex-1">
        <svg viewBox="0 0 240 160" className="tapered-funnel-svg 7-stage" preserveAspectRatio="none">
          {stages.map((stage, idx) => {
            const y1 = idx * stageHeight + idx;
            const y2 = y1 + stageHeight;
            const topIndent = idx * 10;
            const botIndent = (idx + 1) * 10;
            const points = `${topIndent},${y1} ${240 - topIndent},${y1} ${240 - botIndent},${y2} ${botIndent},${y2}`;
            const fill = stageFills[idx % stageFills.length];

            return (
              <g key={stage.stageNumber || idx}>
                <polygon points={points} fill={fill} />
                <text x={topIndent + 12} y={y1 + 15} className="funnel-svg-val" fill="#ffffff">
                  {stage.stageNumber}. {stage.stageTitle}
                </text>
                <text x={175 - topIndent / 2} y={y1 + 15} className="funnel-svg-label" textAnchor="end" fill="#ffffff">
                  {stage.count}
                </text>
                <text x={228 - topIndent} y={y1 + 15} className="funnel-svg-label" textAnchor="end" fill="#ffffff">
                  {stage.conversion}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

