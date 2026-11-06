export interface Shipment {
  id: string;
  trackingNumber: string;
  orderReference: string;
  partnerName: string;
  origin: string;
  destination: string;
  status: "Pending" | "In Transit" | "Delivered" | "Exception";
  estimatedDelivery: string;
  actualDelivery?: string;
}

export interface LogisticsPartner {
  id: string;
  name: string;
  type: string;
  activeShipments: number;
  onTimeDeliveryRate: number;
  status: "Active" | "Inactive";
}

export interface LogisticsMetrics {
  activeShipments: number;
  deliveredToday: number;
  exceptions: number;
  activePartners: number;
}
