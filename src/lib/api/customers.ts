import { api } from "./client";

import type {
  CustomerHealthMetricItem,
  CustomerKpiCard,
} from "@/types/customer";

import type {
  CustomerDetailFullData,
} from "@/types/customer-detail";

export interface CustomerCommandCenterCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string | null;
  country: string | null;
  accountStatus: string;
  membershipStatus: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CustomerCommandCenterStatusSummary {
  active: number;
  dormant: number;
  verificationPending: number | null;
  restricted: number | null;
  cases: number | null;
  returns: number | null;
}

export interface CustomerCommandCenterRightRail {
  healthScore: number | null;
  healthGrade: string | null;

  healthBars: Array<{
    label: string;
    val: number;
  }>;

  alerts: Array<{
    id: string;
    text: string;
    count?: number;
    severity:
      | "High"
      | "Medium"
      | "Low";
  }>;

  quickQueues: Array<{
    label: string;
    count: string | number;
  }>;
}

export interface CustomerCommandCenterCapabilities {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
  segments: boolean;
  loyalty: boolean;
  consent: boolean;
  verification: boolean;
  risk: boolean;
}

export interface CustomerCommandCenterResponse {
  kpis: CustomerKpiCard[];

  statusSummary:
    CustomerCommandCenterStatusSummary;

  healthScorecard:
    CustomerHealthMetricItem[];

  customers:
    CustomerCommandCenterCustomer[];

  pagination: {
    total: number;
    currentPage: number;
    perPage: number;
    lastPage: number;
  };

  rightRail:
    CustomerCommandCenterRightRail;

  capabilities:
    CustomerCommandCenterCapabilities;
}

export interface CustomerWritePayload {
  name?: string;
  email?: string;
  phone?: string | null;
  companyName?: string | null;
  country?: string | null;
  expectedUpdatedAt?: string | null;
}

export interface CustomerWriteResponse {
  message: string;

  customer:
    CustomerCommandCenterCustomer;

  capabilities: {
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

export interface CustomerAddress {
  uuid: string;
  label: string | null;
  address_role: "shipping" | "billing" | "both";
  contact_name: string | null;
  company_name: string | null;
  phone: string | null;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  status: "active" | "inactive";
  created_at: string | null;
  updated_at: string | null;
}

export interface CustomerPreference {
  preferred_language: string | null;
  preferred_currency: string | null;
  preferred_contact_channels: string[];
  notification_channels: string[];
  shopping_preferences: Record<string, unknown>;
  consent_authority: "consent_records";
}

export interface CustomerTag {
  uuid: string;
  name: string;
  created_at: string | null;
}

export interface CustomerConsent {
  uuid: string;
  purpose: string;
  status: string;
  captured_at: string | null;
  withdrawn_at: string | null;
  created_at: string | null;
}

export interface CustomerPrivacyRequest {
  uuid: string;
  request_type: string;
  status: string;
  reason: string | null;
  decision_reason: string | null;
  version: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface CustomerOrder {
  uuid: string;
  order_number: string;
  status: string;
  payment_status: string | null;
  currency: string;
  total: string;
  item_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface CustomerActivity {
  uuid: string;
  reference_uuid: string | null;
  source: "customer_audit" | "orders";
  type: string;
  summary: string;
  occurred_at: string | null;
}

export interface CustomerAuditEvent {
  uuid: string;
  action: string;
  reason: string | null;
  correlation_id: string | null;
  occurred_at: string | null;
}

export interface CanonicalPage<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

interface CanonicalCustomer {
  uuid: string;
  name: string;
  email?: string;
  phone?: string | null;
  company_name: string | null;
  country: string | null;
  lifecycle_state: string;
  previous_lifecycle_state: string | null;
  lifecycle_version: number;
  lifecycle_changed_at: string | null;
  membership: { status: string | null; role: string | null };
  created_at: string | null;
  updated_at: string | null;
}

interface CommandCenterMetrics {
  total: number;
  active: number;
  suspended: number;
  locked: number;
  disabled: number;
  anonymized: number;
  recently_created: number;
  recently_updated: number;
  recent_period_days: number;
  recent_since: string;
}

const unwrapData = <T>(response: unknown): T =>
  (response as { data: T }).data;

const emptyPage = <T>(): CanonicalPage<T> => ({
  data: [],
  meta: { current_page: 1, per_page: 25, total: 0, last_page: 1 },
});

const customerRecord = (customer: CanonicalCustomer): CustomerCommandCenterCustomer => ({
  id: customer.uuid,
  name: customer.name,
  email: customer.email ?? "",
  phone: customer.phone ?? "",
  companyName: customer.company_name,
  country: customer.country,
  accountStatus: customer.lifecycle_state,
  membershipStatus: customer.membership.status ?? "",
  createdAt: customer.created_at,
  updatedAt: customer.updated_at,
});

const directoryResponse = (
  page: CanonicalPage<CanonicalCustomer>,
): CustomerCommandCenterResponse => ({
  kpis: [],
  statusSummary: {
    active: page.data.filter((customer) => customer.lifecycle_state === "active").length,
    dormant: page.data.filter((customer) => customer.lifecycle_state === "disabled").length,
    verificationPending: null,
    restricted: page.data.filter((customer) => ["suspended", "locked"].includes(customer.lifecycle_state)).length,
    cases: null,
    returns: null,
  },
  healthScorecard: [],
  customers: page.data.map(customerRecord),
  pagination: {
    total: page.meta.total,
    currentPage: page.meta.current_page,
    perPage: page.meta.per_page,
    lastPage: page.meta.last_page,
  },
  rightRail: { healthScore: null, healthGrade: null, healthBars: [], alerts: [], quickQueues: [] },
  capabilities: {
    read: true,
    create: false,
    update: false,
    delete: false,
    export: false,
    import: false,
    segments: false,
    loyalty: false,
    consent: true,
    verification: false,
    risk: false,
  },
});

const detailResponse = (customer: CanonicalCustomer): CustomerDetailFullData => ({
  profile: {
    id: customer.uuid,
    name: customer.name,
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    companyName: customer.company_name,
    country: customer.country,
    avatarInitials: customer.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    accountStatus: customer.lifecycle_state,
    lifecycleVersion: customer.lifecycle_version,
    membershipStatus: customer.membership.status,
    registeredDate: customer.created_at,
    updatedAt: customer.updated_at,
    lifecycleSegment: customer.lifecycle_state === "active" ? "Active" : "Restricted",
    region: customer.country,
    concurrencyNotice: null,
  },
  healthScores: [],
  lifecycleMilestones: [],
  addresses: [],
  segments: [],
  identity: null,
  purchaseBehaviour: null,
  returnsDisputes: null,
  loyalty: null,
  consentPrivacy: null,
  riskRestrictions: null,
  supportComms: null,
  relatedRecords: null,
  recordQuality: null,
  recentActivities: [],
  lifecycleNodes: [],
  capabilities: {
    read: true,
    update: true,
    delete: false,
    orders: true,
    returns: false,
    loyalty: false,
    consent: true,
    verification: false,
    risk: false,
    support: false,
  },
});

export const customerApi = {

  async getCommandCenterDashboard(params?: Record<string, unknown>): Promise<CustomerCommandCenterResponse> {
    const [metricsResponse, directory] = await Promise.all([
      api.get("/admin/customers/command-center"),
      customerApi.getDirectory(params),
    ]);
    const metrics = unwrapData<CommandCenterMetrics>(metricsResponse);

    return {
      ...directory,
      kpis: [
        { seq: 1, id: "total", label: "Total Customers", value: metrics.total.toLocaleString(), change: "", changeDirection: "neutral", statusState: "info", iconName: "Users" },
        { seq: 2, id: "active", label: "Active", value: metrics.active.toLocaleString(), change: "", changeDirection: "neutral", statusState: "positive", iconName: "UserCheck" },
        { seq: 3, id: "recent", label: `New (${metrics.recent_period_days}d)`, value: metrics.recently_created.toLocaleString(), change: "", changeDirection: "neutral", statusState: "info", iconName: "UserPlus" },
        { seq: 4, id: "restricted", label: "Suspended / Locked", value: (metrics.suspended + metrics.locked).toLocaleString(), change: "", changeDirection: "neutral", statusState: "warning", iconName: "ShieldAlert" },
      ],
      statusSummary: {
        active: metrics.active,
        dormant: metrics.disabled,
        verificationPending: null,
        restricted: metrics.suspended + metrics.locked,
        cases: null,
        returns: null,
      },
    };
  },

  async getDirectory(params?: Record<string, unknown>): Promise<CustomerCommandCenterResponse> {
    const canonicalParams = {
      search: params?.q,
      lifecycle_state: params?.lifecycle_state,
      created_from: params?.created_from,
      created_to: params?.created_to,
      updated_from: params?.updated_from,
      updated_to: params?.updated_to,
      page: params?.page,
      per_page: params?.perPage,
      sort: params?.sort === "updatedAt" ? "updated_at" : params?.sort,
      direction: params?.direction,
    };
    const response = await api.get("/admin/customers", { params: canonicalParams });
    return directoryResponse(response as CanonicalPage<CanonicalCustomer>);
  },

  async getCustomerDetail(customerUuid: string): Promise<CustomerDetailFullData> {
    const response = await api.get(`/admin/customers/${encodeURIComponent(customerUuid)}`);
    return detailResponse(unwrapData<CanonicalCustomer>(response));
  },

  async createCustomer(payload: CustomerWritePayload): Promise<CustomerWriteResponse> {
    const response = await api.post("/admin/customers", {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      company_name: payload.companyName,
      country: payload.country,
    });
    const customer = unwrapData<CanonicalCustomer>(response);
    return { message: "Customer created successfully.", customer: customerRecord(customer), capabilities: { read: true, update: true, delete: false } };
  },

  async updateCustomer(customerUuid: string, payload: CustomerWritePayload): Promise<CustomerWriteResponse> {
    const response = await api.patch(`/admin/customers/${encodeURIComponent(customerUuid)}`, {
      company_name: payload.companyName,
      country: payload.country,
      expected_updated_at: payload.expectedUpdatedAt,
    });
    const customer = unwrapData<CanonicalCustomer>(response);
    return { message: "Customer updated successfully.", customer: customerRecord(customer), capabilities: { read: true, update: true, delete: false } };
  },

  transitionLifecycle: (customerUuid: string, payload: { target_state: string; reason: string; expected_version: number }) =>
    api.post(`/admin/customers/${encodeURIComponent(customerUuid)}/lifecycle`, payload),
  getAddresses: (customerUuid: string, params?: Record<string, unknown>): Promise<CanonicalPage<CustomerAddress>> =>
    api.get(`/admin/customers/${encodeURIComponent(customerUuid)}/addresses`, { params }) as Promise<CanonicalPage<CustomerAddress>>,
  createAddress: (customerUuid: string, payload: Record<string, unknown>) =>
    api.post(`/admin/customers/${encodeURIComponent(customerUuid)}/addresses`, payload),
  updateAddress: (customerUuid: string, addressUuid: string, payload: Record<string, unknown>) =>
    api.patch(`/admin/customers/${encodeURIComponent(customerUuid)}/addresses/${encodeURIComponent(addressUuid)}`, payload),
  deleteAddress: (customerUuid: string, addressUuid: string) =>
    api.delete(`/admin/customers/${encodeURIComponent(customerUuid)}/addresses/${encodeURIComponent(addressUuid)}`),
  setDefaultAddress: (customerUuid: string, addressUuid: string, role: "shipping" | "billing") =>
    api.post(`/admin/customers/${encodeURIComponent(customerUuid)}/addresses/${encodeURIComponent(addressUuid)}/set-default`, { role }),
  getPreferences: (customerUuid: string): Promise<{ data: CustomerPreference }> =>
    api.get(`/admin/customers/${encodeURIComponent(customerUuid)}/preferences`) as Promise<{ data: CustomerPreference }>,
  updatePreferences: (customerUuid: string, payload: Partial<CustomerPreference>) =>
    api.patch(`/admin/customers/${encodeURIComponent(customerUuid)}/preferences`, payload),
  getTags: (customerUuid: string, params?: Record<string, unknown>): Promise<CanonicalPage<CustomerTag>> =>
    api.get(`/admin/customers/${encodeURIComponent(customerUuid)}/tags`, { params }) as Promise<CanonicalPage<CustomerTag>>,
  addTag: (customerUuid: string, name: string) =>
    api.post(`/admin/customers/${encodeURIComponent(customerUuid)}/tags`, { name }),
  removeTag: (customerUuid: string, tagUuid: string) =>
    api.delete(`/admin/customers/${encodeURIComponent(customerUuid)}/tags/${encodeURIComponent(tagUuid)}`),
  getConsents: (customerUuid: string, params?: Record<string, unknown>): Promise<CanonicalPage<CustomerConsent>> =>
    api.get(`/admin/customers/${encodeURIComponent(customerUuid)}/consents`, { params }) as Promise<CanonicalPage<CustomerConsent>>,
  createConsent: (customerUuid: string, payload: Record<string, unknown>) =>
    api.post(`/admin/customers/${encodeURIComponent(customerUuid)}/consents`, payload),
  withdrawConsent: (customerUuid: string, consentUuid: string, reason: string) =>
    api.post(`/admin/customers/${encodeURIComponent(customerUuid)}/consents/${encodeURIComponent(consentUuid)}/withdraw`, { reason }),
  getPrivacyRequests: (customerUuid: string, params?: Record<string, unknown>): Promise<CanonicalPage<CustomerPrivacyRequest>> =>
    api.get(`/admin/customers/${encodeURIComponent(customerUuid)}/privacy-requests`, { params }) as Promise<CanonicalPage<CustomerPrivacyRequest>>,
  createPrivacyRequest: (customerUuid: string, payload: Record<string, unknown>) =>
    api.post(`/admin/customers/${encodeURIComponent(customerUuid)}/privacy-requests`, payload),
  updatePrivacyRequest: (customerUuid: string, requestUuid: string, payload: Record<string, unknown>) =>
    api.patch(`/admin/customers/${encodeURIComponent(customerUuid)}/privacy-requests/${encodeURIComponent(requestUuid)}`, payload),
  getOrders: (customerUuid: string, params?: Record<string, unknown>): Promise<CanonicalPage<CustomerOrder>> =>
    api.get(`/admin/customers/${encodeURIComponent(customerUuid)}/orders`, { params }) as Promise<CanonicalPage<CustomerOrder>>,
  getActivity: (customerUuid: string, params?: Record<string, unknown>): Promise<CanonicalPage<CustomerActivity>> =>
    api.get(`/admin/customers/${encodeURIComponent(customerUuid)}/activity`, { params }) as Promise<CanonicalPage<CustomerActivity>>,
  getAudit: (customerUuid: string, params?: Record<string, unknown>): Promise<CanonicalPage<CustomerAuditEvent>> =>
    api.get(`/admin/customers/${encodeURIComponent(customerUuid)}/audit`, { params }) as Promise<CanonicalPage<CustomerAuditEvent>>,

};
