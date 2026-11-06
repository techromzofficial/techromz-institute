"use client";

import React from "react";
import { formatCount, formatPercent } from "@/lib/analytics/analyticsFormatters";
import { calculateConversionRate } from "@/lib/analytics/analyticsCalculations";
import { buildAnalyticsReportUrl } from "@/lib/analytics/reportRoutes";

export function MarketplaceFunnel({ funnelData, searchParams }) {
  const views = funnelData?.productViews || 1820000;
  const detailViews = funnelData?.productDetailViews || 642000;
  const carts = funnelData?.addToCart || 184000;
  const checkouts = funnelData?.checkoutStarted || 72000;
  const orders = funnelData?.paidOrders || 11904;

  const viewToCart = calculateConversionRate(carts, views, 1);
  const checkoutConv = calculateConversionRate(checkouts, carts, 1);
  const overallConv = calculateConversionRate(orders, views, 2);

  const conversionUrl = buildAnalyticsReportUrl({
    reportId: "conversion-funnel-analysis",
    currentSearchParams: searchParams,
  });

  return (
    <div className="analytics-card chart-card flex-column">
      <div className="chart-card-header">
        <h3 className="chart-title">Marketplace Funnel</h3>
      </div>

      <div className="funnel-container flex-1">
        <div className="funnel-flex-row">
          {/* Tapered Trapezoid SVG Funnel matching Image 2 */}
          <div className="funnel-svg-wrap">
            <svg viewBox="0 0 240 145" className="tapered-funnel-svg" preserveAspectRatio="none">
              {/* Stage 1: Product Views */}
              <polygon points="0,0 240,0 216,28 24,28" fill="#64b5f6" />
              <text x="10" y="18" className="funnel-svg-val" fill="#ffffff">
                {formatCount(views, true)}
              </text>
              <text x="230" y="18" className="funnel-svg-label" textAnchor="end" fill="#ffffff">
                Product Views
              </text>

              {/* Stage 2: Product Detail Views */}
              <polygon points="24,29 216,29 192,57 48,57" fill="#7e57c2" />
              <text x="32" y="47" className="funnel-svg-val" fill="#ffffff">
                {formatCount(detailViews, true)}
              </text>
              <text x="208" y="47" className="funnel-svg-label" textAnchor="end" fill="#ffffff">
                Product Detail Views
              </text>

              {/* Stage 3: Add to Cart */}
              <polygon points="48,58 192,58 168,86 72,86" fill="#ec407a" />
              <text x="56" y="76" className="funnel-svg-val" fill="#ffffff">
                {formatCount(carts, true)}
              </text>
              <text x="184" y="76" className="funnel-svg-label" textAnchor="end" fill="#ffffff">
                Add to Cart
              </text>

              {/* Stage 4: Checkout Started */}
              <polygon points="72,87 168,87 144,115 96,115" fill="#ff7043" />
              <text x="78" y="105" className="funnel-svg-val" fill="#ffffff">
                {formatCount(checkouts, true)}
              </text>
              <text x="162" y="105" className="funnel-svg-label" textAnchor="end" fill="#ffffff">
                Checkout Started
              </text>

              {/* Stage 5: Paid Orders */}
              <polygon points="96,116 144,116 128,144 112,144" fill="#ffa726" />
              <text x="100" y="133" className="funnel-svg-val sm" fill="#ffffff">
                {formatCount(orders, false)}
              </text>
              <text x="140" y="133" className="funnel-svg-label sm" textAnchor="end" fill="#ffffff">
                Paid Orders
              </text>
            </svg>
          </div>

          {/* Conversion Rates Column matching Image 2 */}
          <div className="funnel-conversion-column">
            <div className="conversion-stat-box">
              <span className="conv-label">View-to-Cart Rate</span>
              <span className="conv-val">{formatPercent(viewToCart)}</span>
            </div>
            <div className="conversion-stat-box">
              <span className="conv-label">Checkout Conversion</span>
              <span className="conv-val">{formatPercent(checkoutConv)}</span>
            </div>
            <div className="conversion-stat-box">
              <span className="conv-label">Overall Conversion</span>
              <span className="conv-val highlight">{formatPercent(overallConv, false, 2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-card-footer center">
        <a href={conversionUrl} className="chart-footer-link">
          View Conversion Analysis
        </a>
      </div>
    </div>
  );
}

