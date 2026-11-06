import { Shipment, LogisticsPartner, LogisticsMetrics } from "@/types/logistics";
import type {
  LogisticsShipment,
  ShipmentDetailViewModel,
  ShipmentMetrics,
  PriorityAlertItem,
} from "@/types/admin";

export const mockShipments: Shipment[] = [
  {
    id: "SHP-1001",
    trackingNumber: "TRK987654321",
    orderReference: "ORD-2026-X8",
    partnerName: "Ceylon Global Logistics",
    origin: "Colombo Warehouse",
    destination: "Kandy Central",
    status: "In Transit",
    estimatedDelivery: "2026-08-01",
  },
  {
    id: "SHP-1002",
    trackingNumber: "TRK123456789",
    orderReference: "ORD-2026-Y9",
    partnerName: "SL Express Courier Services",
    origin: "Galle Hub",
    destination: "Colombo 03",
    status: "Delivered",
    estimatedDelivery: "2026-07-29",
    actualDelivery: "2026-07-29",
  },
  {
    id: "SHP-1003",
    trackingNumber: "TRK112233445",
    orderReference: "ORD-2026-Z1",
    partnerName: "FastTrack Logistics",
    origin: "Jaffna Branch",
    destination: "Colombo 01",
    status: "Exception",
    estimatedDelivery: "2026-07-30",
  },
  {
    id: "SHP-1004",
    trackingNumber: "TRK556677889",
    orderReference: "ORD-2026-A2",
    partnerName: "Ceylon Global Logistics",
    origin: "Colombo Warehouse",
    destination: "Negombo",
    status: "Pending",
    estimatedDelivery: "2026-08-02",
  },
];

export const mockPartners: LogisticsPartner[] = [
  {
    id: "PRT-01",
    name: "Ceylon Global Logistics",
    type: "National Cargo",
    activeShipments: 124,
    onTimeDeliveryRate: 98.5,
    status: "Active",
  },
  {
    id: "PRT-02",
    name: "SL Express Courier Services",
    type: "Express Delivery",
    activeShipments: 345,
    onTimeDeliveryRate: 96.2,
    status: "Active",
  },
  {
    id: "PRT-03",
    name: "FastTrack Logistics",
    type: "Same-Day Delivery",
    activeShipments: 89,
    onTimeDeliveryRate: 91.0,
    status: "Active",
  }
];

export const mockLogisticsMetrics: LogisticsMetrics = {
  activeShipments: 558,
  deliveredToday: 142,
  exceptions: 12,
  activePartners: 3,
};
export const mockShipmentDetail: ShipmentDetailViewModel = {
  shipment: {
    id: "1",
    publicReference: "SHP-90210",
    dbShipmentId: "shp_58190291",
    orderReference: "ORD-5012",
    status: "In Transit",
    pickupStatus: "Completed",
    deliveryStatus: "Delayed",
    packageStatus: "Intact",
    codStatus: "Pending",
    riskLevel: "High",
    slaStatus: "Breached",
    carrier: "ExpressLogistics",
    customerName: "Jane Doe",
    destination: "Colombo 03",
    flags: ["Priority", "Fragile"],
    isPriority: true,
  },
  lifecycle: [
    { id: "1", name: "Order Created", status: "completed", timestamp: "2026-07-20T08:00:00Z" },
    { id: "2", name: "Allocated", status: "completed", timestamp: "2026-07-20T09:30:00Z" },
    { id: "3", name: "Packed", status: "completed", timestamp: "2026-07-20T11:00:00Z" },
    { id: "4", name: "Ready for Pickup", status: "completed", timestamp: "2026-07-20T11:15:00Z" },
    { id: "5", name: "Carrier Assigned", status: "completed", timestamp: "2026-07-20T12:00:00Z" },
    { id: "6", name: "Pickup Scheduled", status: "completed", timestamp: "2026-07-21T08:00:00Z" },
    { id: "7", name: "Picked Up", status: "completed", timestamp: "2026-07-21T14:30:00Z" },
    { id: "8", name: "In Transit", status: "active", timestamp: "2026-07-21T18:00:00Z" },
    { id: "9", name: "Exception Logged", status: "failed", timestamp: "2026-07-22T09:00:00Z" },
    { id: "10", name: "Out for Delivery", status: "pending" },
    { id: "11", name: "Delivery Attempted", status: "pending" },
    { id: "12", name: "Delivered", status: "pending" },
    { id: "13", name: "Settled", status: "pending" },
  ],
  tracking: [
    { id: "t1", timestamp: "2026-07-22T09:00:00Z", location: "Sorting Center A", description: "Package delayed due to vehicle breakdown", status: "Exception", isException: true },
    { id: "t2", timestamp: "2026-07-21T18:00:00Z", location: "Transit Hub", description: "Package departed facility", status: "In Transit" },
    { id: "t3", timestamp: "2026-07-21T14:30:00Z", location: "Supplier Warehouse", description: "Package picked up by courier", status: "Picked Up" },
  ],
  related: {
    orderId: "ord_1",
    orderReference: "ORD-5012",
    customerId: "cust_1",
    customerName: "Jane Doe",
    supplierId: "sup_1",
    supplierName: "Glow Cosmetics",
    carrierId: "car_1",
    carrierName: "ExpressLogistics",
    batchId: "batch_88",
  },
  metrics: {
    healthScore: 65,
    confidenceLevel: "Medium",
    riskLevel: "High",
    slaStatus: "Breached",
    slaTimeRemaining: "-4h 30m",
  },
  capabilities: {
    canConfirmPickup: false,
    canChangeCarrier: true,
    canMarkException: true,
    canCancel: false,
  }
};

export const mockLogisticsShipments: LogisticsShipment[] = [
  mockShipmentDetail.shipment,
  {
    id: "2",
    publicReference: "SHP-88192",
    dbShipmentId: "shp_58190292",
    orderReference: "ORD-5013",
    status: "Pending",
    pickupStatus: "Scheduled",
    deliveryStatus: "Not Dispatched",
    packageStatus: "Pending",
    codStatus: "N/A",
    riskLevel: "Low",
    slaStatus: "On Track",
    carrier: "CityCouriers",
    customerName: "John Smith",
    destination: "Kandy",
    flags: [],
    isPriority: false,
  },
  {
    id: "3",
    publicReference: "SHP-77211",
    dbShipmentId: "shp_58190293",
    orderReference: "ORD-5014",
    status: "In Transit",
    pickupStatus: "Completed",
    deliveryStatus: "In Progress",
    packageStatus: "Intact",
    codStatus: "Collected",
    riskLevel: "Medium",
    slaStatus: "At Risk",
    carrier: "ExpressLogistics",
    customerName: "Alice Brown",
    destination: "Galle",
    flags: ["COD"],
    isPriority: false,
  }
];

export const mockShipmentMetrics: ShipmentMetrics = {
  totalActive: 412,
  pendingPickup: 154,
  inTransit: 210,
  deliveredToday: 89,
  exceptions: 12
};

export const mockPriorityAlerts: PriorityAlertItem[] = [
  { id: "a1", type: "SLA Breach", shipmentReference: "SHP-90210", severity: "High" },
  { id: "a2", type: "Failed Delivery", shipmentReference: "SHP-88192", severity: "High" },
  { id: "a3", type: "High Risk", shipmentReference: "SHP-77211", severity: "Medium" }
];
