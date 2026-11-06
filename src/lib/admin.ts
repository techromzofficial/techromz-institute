import type {
  OrderDetailDto,
  OrderDetailViewModel,
  Tone,
} from "@/types/admin";

export const adminRoute = {
  supplier: (_id: string) =>
    "/admin/verification-compliance/supplier-verification",

  authorization: (id: string) =>
    `/admin/brands-suppliers/brand-authorizations/${encodeURIComponent(id)}`,

  product: (id: string) =>
    `/admin/catalogue/product-approvals/${encodeURIComponent(id)}`,

  batch: (id: string) =>
    `/admin/catalogue/inventory/batches/${encodeURIComponent(id)}`,

  order: (id: string) =>
    `/admin/marketplace/orders/${encodeURIComponent(id)}`,

  returnCase: (id: string) =>
    `/admin/marketplace/returns/${encodeURIComponent(id)}`,

  ecosystemModule: (moduleKey: string) =>
    `/admin/ecosystem-modules/${encodeURIComponent(moduleKey)}`,
};

export function statusTone(status: string): Tone {
  const value = status.toLowerCase();

  if (
    /failed|rejected|high|recalled|delayed|open/.test(
      value,
    )
  ) {
    return "danger";
  }

  if (
    /pending|review|hold|progress|partial|medium|requested/.test(
      value,
    )
  ) {
    return "warning";
  }

  if (
    /approved|paid|completed|delivered|passed|active|low|resolved/.test(
      value,
    )
  ) {
    return "success";
  }

  return "neutral";
}

export function toOrderDetailViewModel(
  dto: OrderDetailDto,
): OrderDetailViewModel {
  return {
    id: dto.id,
    publicReference: dto.public_reference,
    orderStatus: dto.status,
    paymentStatus: dto.payment?.status,
    fulfilmentStatus:
      dto.fulfilment_summary?.status,
    deliveryStatus:
      dto.shipment_summary?.delivery_status,
    healthScore: dto.metrics?.health_score,
  };
}

export function parseFilters(
  params: URLSearchParams,
) {
  return Object.fromEntries(
    [...params.entries()].filter(
      ([, value]) => value.trim() !== "",
    ),
  );
}
