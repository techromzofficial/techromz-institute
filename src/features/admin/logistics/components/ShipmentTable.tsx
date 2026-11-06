import React from "react";
import { Shipment } from "@/types/logistics";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ShipmentTableProps {
  shipments: Shipment[];
}

export function ShipmentTable({ shipments }: ShipmentTableProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-warning";
      case "In Transit":
        return "bg-primary-100 text-primary-900";
      case "Delivered":
        return "bg-green-100 text-success";
      case "Exception":
        return "bg-red-100 text-danger";
      default:
        return "bg-gray-100 text-muted";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-line shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-canvas text-muted font-medium border-b border-line">
            <tr>
              <th className="px-6 py-4">Tracking No.</th>
              <th className="px-6 py-4">Order Ref</th>
              <th className="px-6 py-4">Logistics Partner</th>
              <th className="px-6 py-4">Route</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Est. Delivery</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-8">
                  No shipments found.
                </td>
              </tr>
            ) : (
              shipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-ink">{shipment.trackingNumber}</td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/marketplace/orders?search=${shipment.orderReference}`} className="text-primary-900 font-medium hover:underline">
                      {shipment.orderReference}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-ink">{shipment.partnerName}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-muted text-xs">From:</div>
                      <div className="text-ink">{shipment.origin}</div>
                      <div className="text-muted text-xs mt-1">To:</div>
                      <div className="text-ink">{shipment.destination}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-ink">{shipment.estimatedDelivery}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-muted hover:text-primary-900 transition-colors p-2 rounded-full hover:bg-canvas" title="View Details">
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
