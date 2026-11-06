import { Shipment, LogisticsPartner, LogisticsMetrics } from "@/types/logistics";
import type {
  LogisticsShipment,
  PriorityAlertItem,
  ShipmentDetailViewModel,
  ShipmentFilterParams,
  ShipmentMetrics,
} from "@/types/admin";
import {
  mockLogisticsMetrics,
  mockLogisticsShipments,
  mockPartners,
  mockPriorityAlerts,
  mockShipmentDetail,
  mockShipmentMetrics,
  mockShipments,
} from "@/mocks/admin/logistics.mock";

// TODO(api): Replace these isolated mock adapters when Laravel exposes Admin
// logistics endpoints with equivalent hub and shipment-operation contracts.
const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const fetchLogisticsMetrics = async (): Promise<LogisticsMetrics> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockLogisticsMetrics), 400));
};

export const fetchShipments = async (filters: any = {}): Promise<{ data: Shipment[]; total: number; totalPages: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockShipments];
      
      if (filters.status && filters.status !== "all") {
        filtered = filtered.filter(s => s.status === filters.status);
      }
      
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(s => 
          s.trackingNumber.toLowerCase().includes(query) || 
          s.orderReference.toLowerCase().includes(query)
        );
      }

      resolve({
        data: filtered,
        total: filtered.length,
        totalPages: 1
      });
    }, 600);
  });
};

export const fetchLogisticsPartners = async (): Promise<LogisticsPartner[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockPartners), 500));
};

export async function fetchShipmentOperations(
  params: ShipmentFilterParams = {},
): Promise<{ data: LogisticsShipment[]; total: number; totalPages: number }> {
  await delay(300);

  let filtered = [...mockLogisticsShipments];
  const search = params.search?.trim().toLowerCase();

  if (search) {
    filtered = filtered.filter((shipment) =>
      [
        shipment.publicReference,
        shipment.orderReference,
        shipment.customerName,
      ].some((value) => value.toLowerCase().includes(search)),
    );
  }

  const fieldFilters: Array<[keyof ShipmentFilterParams, keyof LogisticsShipment]> = [
    ["shipmentStatus", "status"],
    ["pickupStatus", "pickupStatus"],
    ["deliveryStatus", "deliveryStatus"],
    ["packageStatus", "packageStatus"],
    ["codStatus", "codStatus"],
    ["riskLevel", "riskLevel"],
    ["slaStatus", "slaStatus"],
    ["carrier", "carrier"],
  ];

  fieldFilters.forEach(([filterKey, shipmentKey]) => {
    const value = params[filterKey];
    if (typeof value === "string" && value !== "" && value !== "all") {
      filtered = filtered.filter((shipment) => shipment[shipmentKey] === value);
    }
  });

  if (params.filterKey === "priority") {
    filtered = filtered.filter((shipment) => shipment.isPriority);
  }

  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.max(params.pageSize ?? 10, 1);
  const total = filtered.length;

  return {
    data: filtered.slice((page - 1) * pageSize, page * pageSize),
    total,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  };
}

export async function fetchShipmentDetail(id: string): Promise<ShipmentDetailViewModel> {
  await delay(300);

  const shipment = mockLogisticsShipments.find((item) =>
    [item.id, item.publicReference, item.dbShipmentId].includes(id),
  );

  if (!shipment) {
    throw new Error("Shipment not found");
  }

  return {
    ...mockShipmentDetail,
    shipment: { ...shipment },
    lifecycle: mockShipmentDetail.lifecycle.map((stage) => ({ ...stage })),
    tracking: mockShipmentDetail.tracking.map((event) => ({ ...event })),
    related: {
      ...mockShipmentDetail.related,
      orderReference: shipment.orderReference,
      customerName: shipment.customerName,
    },
    metrics: { ...mockShipmentDetail.metrics },
    capabilities: { ...mockShipmentDetail.capabilities },
  };
}

export async function fetchShipmentMetrics(): Promise<ShipmentMetrics> {
  await delay(200);
  return { ...mockShipmentMetrics };
}

export async function fetchLogisticsPriorityAlerts(): Promise<PriorityAlertItem[]> {
  await delay(200);
  return mockPriorityAlerts.map((alert) => ({ ...alert }));
}

export async function updateShipmentCarrier(
  id: string,
  newCarrierId: string,
): Promise<{ success: boolean; message: string }> {
  await delay(300);
  return { success: true, message: `Successfully updated carrier for shipment ${id}` };
}

export async function markShipmentException(
  id: string,
  reason: string,
): Promise<{ success: boolean; message: string }> {
  await delay(300);
  return { success: true, message: `Exception logged for shipment ${id}` };
}
