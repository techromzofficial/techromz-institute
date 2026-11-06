import React from "react";
import { Clock3, Package, Truck } from "lucide-react";
import type { LogisticsCommandCenterSummary } from "@/lib/api/logistics";

interface LogisticsMetricsRowProps {
  summary: LogisticsCommandCenterSummary;
}

export function LogisticsMetricsRow({
  summary,
}: LogisticsMetricsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl border border-line shadow-sm hover-lift">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-primary-100 text-primary-900 p-3 rounded-lg">
            <Package size={20} />
          </div>
        </div>

        <div>
          <span className="text-muted text-sm font-medium">
            Total Shipments
          </span>

          <h3 className="text-3xl font-bold text-ink mt-1">
            {summary.shipments.total}
          </h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-line shadow-sm hover-lift">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-yellow-100 text-warning p-3 rounded-lg">
            <Clock3 size={20} />
          </div>
        </div>

        <div>
          <span className="text-muted text-sm font-medium">
            Pending Shipments
          </span>

          <h3 className="text-3xl font-bold text-ink mt-1">
            {summary.shipments.pending}
          </h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-line shadow-sm hover-lift">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-green-100 text-success p-3 rounded-lg">
            <Truck size={20} />
          </div>
        </div>

        <div>
          <span className="text-muted text-sm font-medium">
            Delivered Today
          </span>

          <h3 className="text-3xl font-bold text-ink mt-1">
            {summary.shipments.delivered_today}
          </h3>
        </div>
      </div>
    </div>
  );
}