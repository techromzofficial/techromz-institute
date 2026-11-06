'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, RefreshCw, Truck, X } from 'lucide-react';

interface CommerceContextBannerProps {
  context?: string;
  orderId?: string;
  returnId?: string;
  shipmentId?: string;
  onClearContext: () => void;
}

export function CommerceContextBanner({
  context,
  orderId,
  returnId,
  shipmentId,
  onClearContext,
}: CommerceContextBannerProps) {
  if (!context) return null;

  if (context === 'order' && orderId) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2.5">
          <ShoppingBag size={18} className="text-blue-600" />
          <div>
            <span className="font-bold">Filtered by Order Context:</span> Order ID{' '}
            <span className="font-mono font-semibold">ORD-{orderId}</span>
            <span className="ml-2 text-blue-700">
              Displaying all customer support tickets related to this specific marketplace order.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/marketplace/orders/${orderId}`}
            className="px-2.5 py-1 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
          >
            View Order #ORD-{orderId}
          </Link>
          <button
            onClick={onClearContext}
            className="text-blue-600 hover:text-blue-900 p-1"
            aria-label="Clear context"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (context === 'return' && returnId) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4 flex items-center justify-between text-xs text-purple-900">
        <div className="flex items-center gap-2.5">
          <RefreshCw size={18} className="text-purple-600" />
          <div>
            <span className="font-bold">Filtered by Return Context:</span> Return ID{' '}
            <span className="font-mono font-semibold">RET-{returnId}</span>
            <span className="ml-2 text-purple-700">
              Displaying customer support cases linked to this return request.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/marketplace/returns/${returnId}`}
            className="px-2.5 py-1 bg-purple-600 text-white font-medium rounded hover:bg-purple-700 transition-colors"
          >
            View Return #RET-{returnId}
          </Link>
          <button
            onClick={onClearContext}
            className="text-purple-600 hover:text-purple-900 p-1"
            aria-label="Clear context"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (context === 'shipment' && shipmentId) {
    return (
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4 flex items-center justify-between text-xs text-teal-900">
        <div className="flex items-center gap-2.5">
          <Truck size={18} className="text-teal-600" />
          <div>
            <span className="font-bold">Filtered by Shipment Context:</span> Shipment ID{' '}
            <span className="font-mono font-semibold">SHP-{shipmentId}</span>
            <span className="ml-2 text-teal-700">
              Displaying support inquiries associated with parcel delivery tracking.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClearContext}
            className="text-teal-600 hover:text-teal-900 p-1"
            aria-label="Clear context"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}

