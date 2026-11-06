import { api } from "@/lib/api";

export interface LogisticsCommandCenterShipment {
  id: number;
  uuid: string;
  shipment_number: string;
  shipment_type?: "domestic"|"international";
  origin_country_code?:string|null;origin_city?:string|null;destination_country_code?:string|null;destination_city?:string|null;destination_address?:string|null;
  estimated_departure_at?:string|null;estimated_country_arrival_at?:string|null;estimated_final_delivery_at?:string|null;
  order_reference: string | null;
  carrier: string | null;
  tracking_number: string | null;
  shipping_method: string | null;
  origin_port: string | null;
  destination_port: string | null;
  estimated_ship_date: string | null;
  estimated_delivery_date: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  status: string;
}

export interface LogisticsCommandCenterSummary {
  shipments: {
    total: number;
    pending: number;
    delivered_today: number;
  };
}

export interface LogisticsCommandCenterNavigationItem {
  code: string;
  label: string;
  href: string;
}

export interface LogisticsCommandCenterCapabilities {
  read: boolean;
  manage: boolean;
  add_partner: boolean;
  export: boolean;
}

export interface LogisticsCommandCenterResponse {
  summary: LogisticsCommandCenterSummary;
  status_counts: Record<string, number>;
  analytics: {
    shipment_trend: Array<{ date: string; label: string; created: number; delivered: number }>;
    shipment_status_distribution: Array<{ status: string; count: number }>;
  };
  recent_shipments: LogisticsCommandCenterShipment[];
  navigation: LogisticsCommandCenterNavigationItem[];
  capabilities: LogisticsCommandCenterCapabilities;
}

export interface LogisticsShipmentOrder {
  id: number;
  order_number: string;
}

export interface LogisticsShipmentRow {
  id: number;
  uuid: string;
  shipment_number: string;
  order: LogisticsShipmentOrder | null;
  carrier: string | null;
  tracking_number: string | null;
  shipping_method: string | null;
  origin_port: string | null;
  destination_port: string | null;
  estimated_ship_date: string | null;
  estimated_delivery_date: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  status: string;
}

export interface LogisticsShipmentListSummary {
  total: number;
  pending: number;
  delivered_today: number;
}

export interface LogisticsShipmentListCapabilities {
  read: boolean;
  manage: boolean;
  create: boolean;
  import_updates: boolean;
  export_manifest: boolean;
  priority_queue: boolean;
  report_issue: boolean;
  carrier_portal: boolean;
}

export interface LogisticsShipmentListResponse {
  data: LogisticsShipmentRow[];
  summary: LogisticsShipmentListSummary;
  status_counts: Record<string, number>;
  filters: {
    statuses: string[];
  };
  capabilities: LogisticsShipmentListCapabilities;
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface LogisticsShipmentQuery {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export interface LogisticsShipmentOrderItem {
  id: number;
  uuid: string | null;
  product_id: number | null;
  product_variant_id: number | null;
  product_name: string | null;
  sku: string | null;
  variant_label: string | null;
  ordered_quantity: number;
  allocated_quantity: number;
  remaining_quantity: number;
  unit: string | null;
}

export interface LogisticsShipmentAllocationLocation {
  id: number;
  code: string | null;
  name: string | null;
}

export interface LogisticsShipmentAllocation {
  id: number;
  order_item_id: number;
  inventory_balance_id: number;
  inventory_reservation_id: number;
  quantity: number;
  unit: string | null;
  warehouse: LogisticsShipmentAllocationLocation | null;
  location: LogisticsShipmentAllocationLocation | null;
}

export interface LogisticsAllocationOption {
  inventory_balance_id: number;
  product: { id: number; name: string; sku: string | null } | null;
  product_variant_id: number | null;
  variant_sku: string | null;
  warehouse: LogisticsShipmentAllocationLocation | null;
  location: LogisticsShipmentAllocationLocation | null;
  available_quantity: number;
  on_hand_quantity: number;
  reserved_quantity: number;
  batch: { id: number; lot_number: string; expires_at: string | null } | null;
}

export interface LogisticsShipmentTrackingHistory {
  id: number;
  event_type: string;
  status: string | null;
  location: string | null;
  occurred_at: string;
  processing_status: string;
  latitude: number | null;
  longitude: number | null;
}

export interface LogisticsShipmentCreationOptions { orders:Array<{id:number;order_number:string;currency:string;delivery_address:Record<string,unknown>|null;items:Array<{id:number;product_name:string|null;sku:string|null;quantity:string}>}>;warehouses:Array<{id:number;code:string;name:string;address_line_1:string|null;city:string|null;country_code:string|null;latitude:number|null;longitude:number|null}>;carriers:Array<{id:number;name:string;code:string}>;services:Array<{id:number;retail_carrier_id:number;name:string;code:string;min_weight_kg:string;max_weight_kg:string;max_packages:number;international_supported:boolean}>;capabilities:{create:boolean}; }
export interface LogisticsShipmentPackagePayload {package_type:string;weight_kg:number;length_cm:number;width_cm:number;height_cm:number;tracking_number?:string|null;label_reference?:string|null;}
export interface LogisticsShipmentRoutePointPayload {sequence:number;location_name:string;country_code:string;city:string;latitude:number;longitude:number;estimated_arrival_at?:string|null;estimated_departure_at?:string|null;note?:string|null;}
export interface LogisticsGeocodingResult {id:string;display_name:string;facility_name:string|null;city:string|null;region:string|null;country:string|null;country_code:string|null;latitude:number;longitude:number;}
export interface LogisticsShipmentCreationPayload {order_id:number;warehouse_id:number;retail_carrier_id:number;retail_carrier_service_id:number;idempotency_key:string;shipment_type:"domestic"|"international";origin_country_code?:string|null;origin_city?:string|null;origin_location?:string|null;origin_latitude?:number|null;origin_longitude?:number|null;destination_country_code:string;destination_city:string;destination_address:string;destination_latitude?:number|null;destination_longitude?:number|null;estimated_departure_at?:string|null;estimated_country_arrival_at?:string|null;estimated_final_delivery_at?:string|null;transit_points:LogisticsShipmentRoutePointPayload[];shipping_cost:number;shipping_currency:string;estimated_ship_date?:string|null;estimated_delivery_date?:string|null;packages:LogisticsShipmentPackagePayload[];}

export interface LogisticsTrackingPoint { id?: number; sequence?:number; status?: string | null; event_type?: string; label: string | null; city?:string|null;country_code?:string|null;latitude: number; longitude: number; occurred_at?: string; estimated_arrival_at?:string|null;estimated_departure_at?:string|null;note?:string|null; }
export interface LogisticsTrackingMap { origin: LogisticsTrackingPoint | null; destination: LogisticsTrackingPoint | null; latest_location: LogisticsTrackingPoint | null; planned_transit_points?:LogisticsTrackingPoint[];events: LogisticsTrackingPoint[];estimated_arrival?:string|null;estimated_delivery?:string|null;is_live: false; }

export interface LogisticsShipmentStatusHistory {
  id: number;
  previous_status: string;
  new_status: string;
  source: string;
  occurred_at: string;
}

export interface LogisticsShipmentDetail {
  id: number;
  uuid: string;
  shipment_number: string;
  shipment_type?: "domestic"|"international";
  origin_country_code?:string|null;origin_city?:string|null;destination_country_code?:string|null;destination_city?:string|null;destination_address?:string|null;
  estimated_departure_at?:string|null;estimated_country_arrival_at?:string|null;estimated_final_delivery_at?:string|null;

  order: {
    id: number;
    order_number: string;
    items: LogisticsShipmentOrderItem[];
  } | null;

  allocations: LogisticsShipmentAllocation[];
  tracking_history: LogisticsShipmentTrackingHistory[];
  status_history: LogisticsShipmentStatusHistory[];

  carrier: string | null;
  retail_carrier_id: number | null;
  retail_carrier_service_id: number | null;
  shipping_cost: string | number | null;
  shipping_currency: string | null;
  tracking_number: string | null;
  shipping_method: string | null;
  origin_port: string | null;
  destination_port: string | null;
  estimated_ship_date: string | null;
  estimated_delivery_date: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  status: string;
}

export interface LogisticsShipmentDetailCapabilities {
  read: boolean;
  manage: boolean;
  add_tracking_event?: boolean;

  allocate: boolean;
  start_picking: boolean;
  pack: boolean;
  mark_ready_to_ship: boolean;
  dispatch: boolean;
  cancel: boolean;

  confirm_pickup: boolean;
  change_carrier: boolean;
  mark_exception: boolean;
  carrier_portal: boolean;
}

export interface LogisticsShipmentDetailResponse {
  shipment: LogisticsShipmentDetail;
  tracking_map: LogisticsTrackingMap;
  capabilities: LogisticsShipmentDetailCapabilities;
}

export interface LogisticsFulfilmentOrderSupplier {
  id: number;
  company_name: string;
}

export interface LogisticsFulfilmentOrderBuyer {
  id: number;
  name: string;
}

export interface LogisticsFulfilmentOrderRow {
  id: number;
  uuid: string;
  order_number: string;
  fulfillment_status: string | null;
  order_status: string;
  supplier: LogisticsFulfilmentOrderSupplier | null;
  buyer: LogisticsFulfilmentOrderBuyer | null;
  item_count: number;
  shipment_count: number;
  expected_delivery_date: string | null;
  total_amount: string | number;
  currency: string | null;
}

export interface LogisticsFulfilmentOrderListResponse {
  data: LogisticsFulfilmentOrderRow[];

  summary: {
    total: number;
    pending: number;
    confirmed: number;
  };
  status_counts: Record<string, number>;

  filters: {
    fulfillment_statuses: string[];
  };

  capabilities: {
    read: boolean;
    manage: boolean;
    allocate_inventory: boolean;
    assign_warehouse: boolean;
    pick: boolean;
    pack: boolean;
    dispatch: boolean;
  };

  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface LogisticsFulfilmentOrderQuery {
  search?: string;
  fulfillment_status?: string;
  page?: number;
  per_page?: number;
}

export interface LogisticsFulfilmentOrderItem {
  id: number;
  product_name: string | null;
  sku: string | null;
  variant_label: string | null;
  quantity: string | number;
  unit_price: string | number | null;
  total_amount: string | number | null;
  currency: string | null;
}

export interface LogisticsFulfilmentOrderShipment {
  id: number;
  uuid: string;
  shipment_number: string;
  carrier: string | null;
  tracking_number: string | null;
  shipping_method: string | null;
  estimated_delivery_date: string | null;
  status: string;
}

export interface LogisticsFulfilmentOrderDetail {
  id: number;
  uuid: string;
  order_number: string;
  fulfillment_status: string | null;
  order_status: string;

  supplier: LogisticsFulfilmentOrderSupplier | null;
  buyer: LogisticsFulfilmentOrderBuyer | null;

  expected_delivery_date: string | null;
  total_amount: string | number;
  currency: string | null;

  items: LogisticsFulfilmentOrderItem[];
  shipments: LogisticsFulfilmentOrderShipment[];
}

export interface LogisticsFulfilmentOrderDetailResponse {
  order: LogisticsFulfilmentOrderDetail;

  capabilities: {
    read: boolean;
    manage: boolean;
    allocate_inventory: boolean;
    assign_warehouse: boolean;
    pick: boolean;
    pack: boolean;
    dispatch: boolean;
  };
}

export interface LogisticsCarrierService {
  id: number;
  service_name: string;
  service_code: string | null;
  status: string | null;
  shipment_method_slug: string | null;
  shipment_method_name: string | null;
}

export interface LogisticsCarrierRow {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  partner_type: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  status: string | null;

  country: {
    name: string | null;
    code: string | null;
  };

  currency: {
    code: string | null;
  };

  services: LogisticsCarrierService[];
}

export interface LogisticsCarrierListResponse {
  data: LogisticsCarrierRow[];

  summary: {
    total: number;
    active: number;
    services: number;
  };

  filters: {
    partner_types: string[];
    statuses: string[];
  };

  capabilities: {
    read: boolean;
    manage: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    manage_credentials: boolean;
    manage_rates: boolean;
  };
}

export interface LogisticsCarrierQuery {
  search?: string;
  partner_type?: string;
  status?: string;
}

export interface LogisticsWarehouseLocation {
  id: number;
  uuid: string;
  code: string;
  name: string | null;
  status: string | null;
}

export interface LogisticsWarehouseSupplier {
  id: number;
  company_name: string;
}

export interface LogisticsWarehouseRow {
  id: number;
  uuid: string;
  code: string;
  name: string;
  status: string | null;
  address_line_1: string | null; address_line_2: string | null; city: string | null; region: string | null; postal_code: string | null; country_code: string | null;
  contact_name: string | null; contact_phone: string | null; contact_email: string | null; timezone: string; opens_at: string | null; closes_at: string | null; dispatch_cutoff_at: string | null; capabilities: string[]; archived_at: string | null;
  supplier: LogisticsWarehouseSupplier | null;
  locations: LogisticsWarehouseLocation[];
}

export interface LogisticsLocationListResponse {
  data: LogisticsWarehouseRow[];

  summary: {
    warehouses: number;
    active: number;
    locations: number;
  };
  status_counts: Record<string, number>;

  filters: {
    statuses: string[];
  };

  capabilities: {
    read: boolean;
    manage: boolean;
    create_warehouse: boolean;
    update_warehouse: boolean;
    delete_warehouse: boolean;
    archive_warehouse: boolean;
    create_location: boolean;
    update_location: boolean;
    delete_location: boolean;
  };
}

export interface LogisticsWarehousePayload { code: string; name: string; address_line_1: string; address_line_2?: string | null; city: string; region?: string | null; postal_code?: string | null; country_code: string; contact_name: string; contact_phone: string; contact_email?: string | null; timezone: string; opens_at?: string | null; closes_at?: string | null; dispatch_cutoff_at?: string | null; capabilities?: string[]; }
export interface LogisticsWarehouseLocationPayload { code: string; name?: string | null; status?: "active" | "inactive"; }

export interface LogisticsLocationQuery {
  search?: string;
  status?: string;
}

export interface LogisticsShipmentMethodRow {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  method_type: string;
  description: string | null;
  status: string;
}

export interface LogisticsServiceabilityPartner {
  id: number;
  name: string;
  partner_type: string | null;
  status: string | null;
}

export interface LogisticsServiceabilityShipmentMethod {
  id: number;
  name: string;
  slug: string;
  method_type: string;
  status: string;
}

export interface LogisticsPartnerServiceRow {
  id: number;
  uuid: string;
  service_name: string;
  service_code: string | null;
  description: string | null;
  status: string;
  partner: LogisticsServiceabilityPartner;
  shipment_method: LogisticsServiceabilityShipmentMethod | null;
}

export interface LogisticsServiceabilityResponse {
  methods: LogisticsShipmentMethodRow[];
  services: LogisticsPartnerServiceRow[];

  summary: {
    methods: number;
    active_methods: number;
    services: number;
  };

  filters: {
    method_types: string[];
    statuses: string[];
  };

  capabilities: {
    read: boolean;
    manage: boolean;
    evaluate_serviceability: boolean;
    route_automatically: boolean;
    manage_zones: boolean;
    manage_rules: boolean;
    manage_coverage: boolean;
  };
}

export interface LogisticsServiceabilityQuery {
  search?: string;
  method_type?: string;
  status?: string;
}

export interface LogisticsTrackingOrder {
  id: number;
  order_number: string;
}

export interface LogisticsTrackingRow {
  id: number;
  uuid: string;
  shipment_number: string;
  carrier: string | null;
  tracking_number: string | null;
  shipping_method: string | null;
  origin_port: string | null;
  destination_port: string | null;
  estimated_ship_date: string | null;
  estimated_delivery_date: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  status: string;
  order: LogisticsTrackingOrder;
}

export interface LogisticsTrackingResponse {
  data: LogisticsTrackingRow[];

  summary: {
    total: number;
    with_tracking_number: number;
    delivered: number;
  };

  filters: {
    statuses: string[];
  };

  capabilities: {
    read: boolean;
    manage: boolean;
    refresh_tracking: boolean;
    sync_carrier: boolean;
    add_tracking_event: boolean;
    update_status: boolean;
  };

  pagination: {
    current_page: number;
    per_page: number;
    last_page: number;
    total: number;
  };
}

export interface LogisticsTrackingQuery {
  search?: string;
  status?: string;
  tracked_only?: boolean;
  page?: number;
  per_page?: number;
}

export interface LogisticsObservedStatus {
  status: string;
  total: number;
}

export interface LogisticsExceptionResponse {
  summary: {
    total_shipments: number;
    classified_exceptions: number;
    open_exceptions: number;
  };

  observed_statuses: LogisticsObservedStatus[];

  exception_records: never[];

  classification: {
    available: boolean;
    source: string | null;
  };

  capabilities: {
    read: boolean;
    manage: boolean;
    classify_exception: boolean;
    create_exception: boolean;
    assign_exception: boolean;
    resolve_exception: boolean;
    update_shipment_status: boolean;
    create_claim: boolean;
  };
}

export interface LogisticsReturnResponse {
  summary: {
    total_shipments: number;
    return_records: number;
    active_collections: number;
    completed_returns: number;
  };

  status_counts: Record<string, number>;

  return_records: LogisticsReturnRecord[];

  domain: {
    available: boolean;
    record_source: string | null;
    collection_workflow_available: boolean;
    reverse_logistics_workflow_available: boolean;
    finance_refunds_are_return_records: boolean;
  };

  capabilities: {
    read: boolean;
    manage: boolean;
    create_return: boolean;
    approve_return: boolean;
    reject_return: boolean;
    schedule_collection: boolean;
    assign_carrier: boolean;
    receive_return: boolean;
    inspect_return: boolean;
    close_return: boolean;
    create_refund: boolean;
  };
}

export interface LogisticsReturnOrderItem { id: number; product_name: string | null; sku: string | null; quantity: number; unit: string | null; }
export interface LogisticsReturnDisposition { id: number; disposition: "restock" | "quarantine" | "damaged"; quantity: number; inventory_balance_id: number; }
export interface LogisticsReturnItem { id: number; uuid: string; order_item_id: number; requested_quantity: number; received_quantity: number; inspected_quantity: number; dispositions: LogisticsReturnDisposition[]; }
export interface LogisticsReturnRecord { id: number; uuid: string; status: string; order: { id: number; order_number: string; items: LogisticsReturnOrderItem[] } | null; items: LogisticsReturnItem[]; }
export interface RetailCarrier { id: number; uuid: string; name: string; code: string; status: "active" | "inactive" | "degraded" | "archived"; provider_type: "courier" | "freight" | "postal" | "three_pl" | "in_house"; contact_name: string | null; contact_phone: string | null; contact_email: string | null; account_reference: string | null; coverage: string | null; integration_mode: "manual" | "api" | "aggregator"; integration_health: string; last_successful_sync_at: string | null; archived_at: string | null; tracking_url_template: string | null; }
export interface RetailCarrierListResponse { data: RetailCarrier[]; capabilities: { read: boolean; manage: boolean; create: boolean; update: boolean; activate: boolean; deactivate: boolean; archive: boolean; manage_credentials: boolean; }; current_page: number; per_page: number; total: number; last_page: number; }
export interface RetailCarrierPayload { name: string; code: string; status?: "active" | "inactive" | "degraded"; provider_type?: RetailCarrier["provider_type"]; contact_name?: string | null; contact_phone?: string | null; contact_email?: string | null; account_reference?: string | null; coverage?: string | null; integration_mode?: RetailCarrier["integration_mode"]; tracking_url_template?: string | null; }
export interface RetailCarrierService { id:number; uuid:string; retail_carrier_id:number; shipment_method_id:number|null; name:string; code:string; provider_service_code:string|null; service_type:"standard"|"express"|"same_day"|"pickup"|"freight"; description:string|null; sla_hours:number; min_weight_kg:string|number; max_weight_kg:string|number; max_packages:number; tracking_supported:boolean; cod_supported:boolean; returns_supported:boolean; international_supported:boolean; status:"active"|"inactive"|"archived"; archived_at:string|null; }
export type RetailCarrierServicePayload = Omit<RetailCarrierService,"id"|"uuid"|"status"|"archived_at">;
export interface RetailCarrierServiceListResponse { data:RetailCarrierService[]; capabilities:{read:boolean;manage:boolean;create:boolean;update:boolean;archive:boolean}; current_page:number;per_page:number;total:number;last_page:number; }
export interface RetailShippingZone { id:number; uuid:string; name:string; code:string; countries:string[]; regions:string[]|null; postal_code_rules:Array<{type:"include"|"exclude";pattern:string}>|null; status:"active"|"inactive"|"archived"; archived_at:string|null; }
export type RetailShippingZonePayload = Pick<RetailShippingZone,"name"|"code"|"countries"|"regions"|"postal_code_rules">;
export interface RetailShippingZoneListResponse { data:RetailShippingZone[]; capabilities:{read:boolean;manage:boolean}; current_page:number;per_page:number;total:number;last_page:number; }
export interface RetailShippingRateRule { id:number;uuid:string;retail_shipping_zone_id:number;retail_carrier_service_id:number;kind:"rate"|"surcharge";name:string;code:string;min_weight_kg:string;max_weight_kg:string;amount:string;per_kg_amount:string;currency:string;priority:number;effective_from:string|null;effective_until:string|null;status:"active"|"inactive"|"expired"|"archived";archived_at:string|null; }
export type RetailShippingRateRulePayload = Omit<RetailShippingRateRule,"id"|"uuid"|"status"|"archived_at">;
export interface RetailShippingRateRuleListResponse {data:RetailShippingRateRule[];capabilities:{read:boolean;manage:boolean};current_page:number;per_page:number;total:number;last_page:number;}
export interface ReturnInventoryOption { inventory_balance_id: number; warehouse: LogisticsShipmentAllocationLocation | null; location: LogisticsShipmentAllocationLocation | null; }

export interface LogisticsClaimsCostResponse {
  summary: {
    total_shipments: number;
    logistics_claims: number;
    logistics_cost_records: number;
    logistics_reconciliation_records: number;
  };

  claims: never[];
  cost_records: never[];
  reconciliation_records: never[];

  domains: {
    claims: {
      available: boolean;
      record_source: string | null;
    };

    costs: {
      available: boolean;
      record_source: string | null;
    };

    reconciliation: {
      available: boolean;
      record_source: string | null;
      finance_authoritative: boolean;
      finance_route: string;
    };
  };

  capabilities: {
    read: boolean;
    manage: boolean;
    create_claim: boolean;
    assign_claim: boolean;
    resolve_claim: boolean;
    record_logistics_cost: boolean;
    edit_logistics_cost: boolean;
    reconcile_carrier_charge: boolean;
    approve_reconciliation: boolean;
    settle_claim: boolean;
    mutate_finance_reconciliation: boolean;
  };
}

export interface LogisticsReportsAuditStatus {
  status: string;
  total: number;
}

export interface LogisticsReportsAuditResponse {
  summary: {
    total_shipments: number;
    report_definitions: number;
    import_jobs: number;
    export_jobs: number;
    audit_records: number;
  };

  shipment_statuses: LogisticsReportsAuditStatus[];

  reports: never[];
  imports: never[];
  exports: never[];
  audit_records: never[];

  domains: {
    reports: {
      available: boolean;
      record_source: string | null;
    };

    imports: {
      available: boolean;
      record_source: string | null;
    };

    exports: {
      available: boolean;
      record_source: string | null;
    };

    audit: {
      available: boolean;
      record_source: string | null;
    };
  };

  capabilities: {
    read: boolean;
    manage: boolean;
    generate_report: boolean;
    download_report: boolean;
    import_shipments: boolean;
    export_shipments: boolean;
    schedule_report: boolean;
    view_audit_detail: boolean;
    export_audit: boolean;
  };
}

export interface LogisticsShipmentMutationResponse {
  shipment: {
    id: number;
    uuid: string;
    shipment_number: string;
    status: string;
    carrier: string | null;
    tracking_number: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
  };
}

export interface LogisticsShipmentAllocationPayload {
  order_item_id: number;
  inventory_balance_id: number;
  quantity: number;
}

export interface LogisticsShipmentAllocationResponse {
  allocation: {
    id: number;
    order_item_id: number;
    inventory_balance_id: number;
    inventory_reservation_id: number;
    quantity: string | number;
  };

  shipment: {
    id: number;
    uuid: string;
    shipment_number: string;
    status: string;
  };
}

export const logisticsApi = {
  async getCommandCenter(): Promise<LogisticsCommandCenterResponse> {
    return api.get(
      "/admin/logistics",
    );
  },

  async getShipments(
    params: LogisticsShipmentQuery = {},
  ): Promise<LogisticsShipmentListResponse> {
    const searchParams =
      new URLSearchParams();

    if (params.search) {
      searchParams.set(
        "search",
        params.search,
      );
    }

    if (params.status) {
      searchParams.set(
        "status",
        params.status,
      );
    }

    if (params.page) {
      searchParams.set(
        "page",
        String(params.page),
      );
    }

    if (params.per_page) {
      searchParams.set(
        "per_page",
        String(params.per_page),
      );
    }

    const query =
      searchParams.toString();

    return api.get(
      query
        ? `/admin/logistics/shipments?${query}`
        : "/admin/logistics/shipments",
    );
  },

  async getShipment(
  shipmentId: string,
  ): Promise<LogisticsShipmentDetailResponse> {
    return api.get(
      `/admin/logistics/shipments/${encodeURIComponent(
        shipmentId,
      )}`,
    );
  },
  async getShipmentCreationOptions():Promise<LogisticsShipmentCreationOptions>{return api.get('/admin/logistics/shipments/creation-options');},
  async searchWorldwideLocations(query:string):Promise<{data:LogisticsGeocodingResult[]}>{return api.get(`/admin/logistics/locations/search?q=${encodeURIComponent(query)}&limit=6`);},
  async createShipment(payload:LogisticsShipmentCreationPayload):Promise<{shipment:{id:number;uuid:string;shipment_number:string;status:string}}>{return api.post('/admin/logistics/shipments',payload);},
  async updateShipmentRoute(shipmentId:string,payload:Omit<LogisticsShipmentCreationPayload,"order_id"|"warehouse_id"|"retail_carrier_id"|"retail_carrier_service_id"|"idempotency_key"|"shipping_cost"|"shipping_currency"|"packages">){return api.put(`/admin/logistics/shipments/${encodeURIComponent(shipmentId)}/route`,payload);},
  async addShipmentTrackingEvent(shipmentId:string,payload:{status:"pending"|"dispatched"|"in_transit"|"out_for_delivery"|"delivered";event_type:string;location:string;city?:string|null;country_code?:string|null;latitude:number;longitude:number;occurred_at:string;customer_note?:string|null;internal_note?:string|null}){return api.post(`/admin/logistics/shipments/${encodeURIComponent(shipmentId)}/tracking-events`,payload);},

  async getAllocationOptions(
    shipmentId: string,
    orderItemId?: number,
  ): Promise<{ data: LogisticsAllocationOption[] }> {
    const query = orderItemId ? `?order_item_id=${orderItemId}` : "";
    return api.get(
      `/admin/logistics/shipments/${encodeURIComponent(shipmentId)}/allocation-options${query}`,
    );
  },

  async allocateInventory(
    shipmentId: string,
    payload: LogisticsShipmentAllocationPayload,
  ): Promise<LogisticsShipmentAllocationResponse> {
    return api.post(
      `/admin/logistics/shipments/${encodeURIComponent(shipmentId)}/allocations`,
      payload,
    );
  },

  async startPicking(
    shipmentId: string,
  ): Promise<LogisticsShipmentMutationResponse> {
    return api.post(
      `/admin/logistics/shipments/${encodeURIComponent(shipmentId)}/start-picking`,
      {},
    );
  },

  async packShipment(
    shipmentId: string,
    weightKg: number,
  ): Promise<LogisticsShipmentMutationResponse> {
    return api.post(
      `/admin/logistics/shipments/${encodeURIComponent(shipmentId)}/pack`,
      { weight_kg: weightKg },
    );
  },

  async markReadyToShip(
    shipmentId: string,
  ): Promise<LogisticsShipmentMutationResponse> {
    return api.post(
      `/admin/logistics/shipments/${encodeURIComponent(shipmentId)}/ready-to-ship`,
      {},
    );
  },

  async dispatchShipment(
    shipmentId: string,
    payload: {
      carrier: string;
      tracking_number: string;
    },
  ): Promise<LogisticsShipmentMutationResponse> {
    return api.post(
      `/admin/logistics/shipments/${encodeURIComponent(shipmentId)}/dispatch`,
      payload,
    );
  },

  async cancelShipment(
    shipmentId: string,
  ): Promise<LogisticsShipmentMutationResponse> {
    return api.post(
      `/admin/logistics/shipments/${encodeURIComponent(shipmentId)}/cancel`,
      {},
    );
  },
  async reassignShipment(shipmentId:string,payload:{retail_carrier_id:number;retail_carrier_service_id:number;reason:string;cost_impact:number;new_shipping_cost:number;sla_impact_hours:number;estimated_delivery_date?:string|null}):Promise<LogisticsShipmentMutationResponse>{return api.post(`/admin/logistics/shipments/${encodeURIComponent(shipmentId)}/reassign`,payload);},

  async getFulfilmentOrders(
  params: LogisticsFulfilmentOrderQuery = {},
  ): Promise<LogisticsFulfilmentOrderListResponse> {
    const searchParams = new URLSearchParams();

    if (params.search) {
      searchParams.set(
        "search",
        params.search,
      );
    }

    if (params.fulfillment_status) {
      searchParams.set(
        "fulfillment_status",
        params.fulfillment_status,
      );
    }

    if (params.page) {
      searchParams.set(
        "page",
        String(params.page),
      );
    }

    if (params.per_page) {
      searchParams.set(
        "per_page",
        String(params.per_page),
      );
    }

    const query =
      searchParams.toString();

    return api.get(
      query
        ? `/admin/logistics/fulfilment-orders?${query}`
        : "/admin/logistics/fulfilment-orders",
    );
  },
  async getFulfilmentOrder(
  orderId: string,
  ): Promise<LogisticsFulfilmentOrderDetailResponse> {
    return api.get(
      `/admin/logistics/fulfilment-orders/${encodeURIComponent(
        orderId,
      )}`,
    );
  },
  async getCarriers(
  params: LogisticsCarrierQuery = {},
  ): Promise<LogisticsCarrierListResponse> {
    const searchParams =
      new URLSearchParams();

    if (params.search) {
      searchParams.set(
        "search",
        params.search,
      );
    }

    if (params.partner_type) {
      searchParams.set(
        "partner_type",
        params.partner_type,
      );
    }

    if (params.status) {
      searchParams.set(
        "status",
        params.status,
      );
    }

    const query =
      searchParams.toString();

    return api.get(
      query
        ? `/admin/logistics/carriers?${query}`
        : "/admin/logistics/carriers",
    );
  },
  async getLocations(
  params: LogisticsLocationQuery = {},
  ): Promise<LogisticsLocationListResponse> {
    const searchParams =
      new URLSearchParams();

    if (params.search) {
      searchParams.set(
        "search",
        params.search,
      );
    }

    if (params.status) {
      searchParams.set(
        "status",
        params.status,
      );
    }

    const query =
      searchParams.toString();

    return api.get(
      query
        ? `/admin/logistics/locations?${query}`
        : "/admin/logistics/locations",
    );
  },
  async createWarehouse(payload: LogisticsWarehousePayload): Promise<{ warehouse: LogisticsWarehouseRow }> { return api.post('/admin/logistics/warehouses', payload); },
  async updateWarehouse(id: number, payload: LogisticsWarehousePayload): Promise<{ warehouse: LogisticsWarehouseRow }> { return api.put(`/admin/logistics/warehouses/${id}`, payload); },
  async setWarehouseStatus(id: number, status: "active" | "inactive", reason?: string): Promise<{ warehouse: LogisticsWarehouseRow }> { return api.patch(`/admin/logistics/warehouses/${id}/status`, { status, reason }); },
  async archiveWarehouse(id: number, reason: string): Promise<{ warehouse: LogisticsWarehouseRow }> { return api.post(`/admin/logistics/warehouses/${id}/archive`, { reason }); },
  async createWarehouseLocation(warehouseId: number, payload: LogisticsWarehouseLocationPayload): Promise<{ location: LogisticsWarehouseLocation }> { return api.post(`/admin/logistics/warehouses/${warehouseId}/locations`, payload); },
  async updateWarehouseLocation(warehouseId: number, locationId: number, payload: LogisticsWarehouseLocationPayload): Promise<{ location: LogisticsWarehouseLocation }> { return api.put(`/admin/logistics/warehouses/${warehouseId}/locations/${locationId}`, payload); },
  async setWarehouseLocationStatus(warehouseId: number, locationId: number, status: "active" | "inactive", reason?: string): Promise<{ location: LogisticsWarehouseLocation }> { return api.patch(`/admin/logistics/warehouses/${warehouseId}/locations/${locationId}/status`, { status, reason }); },
  async archiveWarehouseLocation(warehouseId: number, locationId: number, reason: string): Promise<{ location: LogisticsWarehouseLocation }> { return api.post(`/admin/logistics/warehouses/${warehouseId}/locations/${locationId}/archive`, { reason }); },
  async getServiceability(
  params: LogisticsServiceabilityQuery = {},
  ): Promise<LogisticsServiceabilityResponse> {
    const searchParams =
      new URLSearchParams();

    if (params.search) {
      searchParams.set(
        "search",
        params.search,
      );
    }

    if (params.method_type) {
      searchParams.set(
        "method_type",
        params.method_type,
      );
    }

    if (params.status) {
      searchParams.set(
        "status",
        params.status,
      );
    }

    const query =
      searchParams.toString();

    return api.get(
      query
        ? `/admin/logistics/serviceability-routing?${query}`
        : "/admin/logistics/serviceability-routing",
    );
  },
  async getTracking(
  params: LogisticsTrackingQuery = {},
  ): Promise<LogisticsTrackingResponse> {
    const searchParams =
      new URLSearchParams();

    if (params.search) {
      searchParams.set(
        "search",
        params.search,
      );
    }

    if (params.status) {
      searchParams.set(
        "status",
        params.status,
      );
    }

    if (params.tracked_only) {
      searchParams.set(
        "tracked_only",
        "1",
      );
    }

    if (params.page) {
      searchParams.set(
        "page",
        String(params.page),
      );
    }

    if (params.per_page) {
      searchParams.set(
        "per_page",
        String(params.per_page),
      );
    }

    const query =
      searchParams.toString();

    return api.get(
      query
        ? `/admin/logistics/tracking?${query}`
        : "/admin/logistics/tracking",
    );
  },
  async getExceptions(): Promise<LogisticsExceptionResponse> {
    return api.get(
      "/admin/logistics/exceptions",
    );
  },
    async getReturns(): Promise<LogisticsReturnResponse> {
    return api.get(
      "/admin/logistics/returns",
    );
  },
  async receiveReturn(returnId: number, payload: { order_item_id: number; quantity: number }): Promise<{ return_item: LogisticsReturnItem }> { return api.post(`/admin/logistics/returns/${returnId}/receive`, payload); },
  async inspectReturn(returnId: number, itemId: number, quantity: number): Promise<{ return_item: LogisticsReturnItem }> { return api.post(`/admin/logistics/returns/${returnId}/items/${itemId}/inspect`, { quantity }); },
  async getReturnInventoryOptions(returnId: number, itemId: number): Promise<{ data: ReturnInventoryOption[] }> { return api.get(`/admin/logistics/returns/${returnId}/items/${itemId}/inventory-options`); },
  async disposeReturn(returnId: number, itemId: number, payload: { inventory_balance_id: number; disposition: "restock" | "quarantine" | "damaged"; quantity: number; idempotency_key: string }): Promise<{ disposition: LogisticsReturnDisposition }> { return api.post(`/admin/logistics/returns/${returnId}/items/${itemId}/dispositions`, payload); },
  async getRetailCarriers(query: { search?: string; status?: string; provider_type?: string; page?: number; per_page?: number } = {}): Promise<RetailCarrierListResponse> { const params = new URLSearchParams(); Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== "") params.set(key, String(value)); }); const suffix = params.toString(); return api.get(`/admin/logistics/retail-carriers${suffix ? `?${suffix}` : ""}`); },
  async createRetailCarrier(payload: RetailCarrierPayload): Promise<{ carrier: RetailCarrier }> { return api.post('/admin/logistics/retail-carriers', payload); },
  async updateRetailCarrier(id: number, payload: RetailCarrierPayload): Promise<{ carrier: RetailCarrier }> { return api.put(`/admin/logistics/retail-carriers/${id}`, payload); },
  async setRetailCarrierStatus(id: number, status: "active" | "inactive"): Promise<{ carrier: RetailCarrier }> { return api.patch(`/admin/logistics/retail-carriers/${id}/status`, { status }); },
  async archiveRetailCarrier(id: number, reason: string): Promise<{ carrier: RetailCarrier }> { return api.post(`/admin/logistics/retail-carriers/${id}/archive`, { reason }); },
  async getRetailCarrierServices(query: Record<string,string|number|undefined> = {}): Promise<RetailCarrierServiceListResponse> { const p=new URLSearchParams();Object.entries(query).forEach(([k,v])=>{if(v!==undefined&&v!=="")p.set(k,String(v));});return api.get(`/admin/logistics/retail-carrier-services${p.size?`?${p}`:""}`); },
  async getRetailCarrierService(id:number): Promise<{service:RetailCarrierService}>{return api.get(`/admin/logistics/retail-carrier-services/${id}`);},
  async createRetailCarrierService(payload:RetailCarrierServicePayload): Promise<{service:RetailCarrierService}>{return api.post('/admin/logistics/retail-carrier-services',payload);},
  async updateRetailCarrierService(id:number,payload:RetailCarrierServicePayload): Promise<{service:RetailCarrierService}>{return api.put(`/admin/logistics/retail-carrier-services/${id}`,payload);},
  async setRetailCarrierServiceStatus(id:number,status:"active"|"inactive"): Promise<{service:RetailCarrierService}>{return api.patch(`/admin/logistics/retail-carrier-services/${id}/status`,{status});},
  async archiveRetailCarrierService(id:number,reason:string): Promise<{service:RetailCarrierService}>{return api.post(`/admin/logistics/retail-carrier-services/${id}/archive`,{reason});},
  async getRetailShippingZones(query:Record<string,string|number|undefined>={}):Promise<RetailShippingZoneListResponse>{const p=new URLSearchParams();Object.entries(query).forEach(([k,v])=>{if(v!==undefined&&v!=="")p.set(k,String(v));});return api.get(`/admin/logistics/shipping-zones${p.size?`?${p}`:""}`);},
  async getRetailShippingZone(id:number):Promise<{zone:RetailShippingZone}>{return api.get(`/admin/logistics/shipping-zones/${id}`);},
  async createRetailShippingZone(payload:RetailShippingZonePayload):Promise<{zone:RetailShippingZone}>{return api.post('/admin/logistics/shipping-zones',payload);},
  async updateRetailShippingZone(id:number,payload:RetailShippingZonePayload):Promise<{zone:RetailShippingZone}>{return api.put(`/admin/logistics/shipping-zones/${id}`,payload);},
  async setRetailShippingZoneStatus(id:number,status:"active"|"inactive",reason:string):Promise<{zone:RetailShippingZone}>{return api.patch(`/admin/logistics/shipping-zones/${id}/status`,{status,reason});},
  async archiveRetailShippingZone(id:number,reason:string):Promise<{zone:RetailShippingZone}>{return api.post(`/admin/logistics/shipping-zones/${id}/archive`,{reason});},
  async getRetailShippingRateRules(query:Record<string,string|number|undefined>={}):Promise<RetailShippingRateRuleListResponse>{const p=new URLSearchParams();Object.entries(query).forEach(([k,v])=>{if(v!==undefined&&v!=="")p.set(k,String(v));});return api.get(`/admin/logistics/shipping-rate-rules${p.size?`?${p}`:""}`);},
  async createRetailShippingRateRule(payload:RetailShippingRateRulePayload):Promise<{rule:RetailShippingRateRule}>{return api.post('/admin/logistics/shipping-rate-rules',payload);},
  async updateRetailShippingRateRule(id:number,payload:RetailShippingRateRulePayload):Promise<{rule:RetailShippingRateRule}>{return api.put(`/admin/logistics/shipping-rate-rules/${id}`,payload);},
  async setRetailShippingRateRuleStatus(id:number,status:"active"|"inactive"|"expired",reason:string):Promise<{rule:RetailShippingRateRule}>{return api.patch(`/admin/logistics/shipping-rate-rules/${id}/status`,{status,reason});},
  async archiveRetailShippingRateRule(id:number,reason:string):Promise<{rule:RetailShippingRateRule}>{return api.post(`/admin/logistics/shipping-rate-rules/${id}/archive`,{reason});},
    async getClaimsCostReconciliation(): Promise<LogisticsClaimsCostResponse> {
    return api.get(
      "/admin/logistics/claims-cost-reconciliation",
    );
  },
  async getReportsImportExportAudit(): Promise<LogisticsReportsAuditResponse> {
    return api.get(
      "/admin/logistics/reports-import-export-audit",
    );
  },
  async downloadReportsAuditExport(): Promise<Blob> {
    return api.download("/admin/logistics/reports-import-export-audit/export");
  },
};
