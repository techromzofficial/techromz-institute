/** Public support API contract. Unavailable analytics remain null. */
export type SupportCapabilities = Record<string, boolean>;
export type SupportFilters = Record<string, string>;
export interface SupportMessage {
  uuid: string; body: string; author: string; direction: string;
  delivery_status: string; read_at: string | null; created_at: string;
}
export interface SupportContext {
  available: boolean; reason?: string; reference_id?: string; label?: string; sku?: string;
  status?: string; href?: string; tracking?: { status: string; occurred_at: string }[];
  amount?: string; currency?: string;
  items?: { product_name: string; quantity: string }[];
  shipments?: { reference: string; status: string; href: string }[];
  packages?: { uuid: string; package_type: string; weight_kg: string; tracking_number: string | null }[];
}
export interface SupportRecord {
  uuid: string; reference: string; subject: string; description: string;
  category: string; channel: string; priority: string; status: string;
  is_complaint: boolean; severity: string | null; restricted: boolean;
  issue_type?: string | null;
  dependency: string | null; version: number; created_at: string; updated_at: string;
  resolved_at: string | null; escalated_at: string | null; resolution: string | null;
  reopen_count: number; customer: { uuid: string; name: string | null };
  assignee: { uuid: string; name: string } | null;
  sla: { status: string; reason: string }; allowed_transitions: string[];
  context?: Record<string, SupportContext>; messages?: SupportMessage[]; notes?: SupportMessage[];
  history?: { uuid: string; action: string; reason: string | null; actor: string; created_at: string; before: string; after: string }[];
}
export interface SupportList {
  data: SupportRecord[];
  meta: { total: number; current_page: number; last_page: number; per_page: number };
  capabilities: SupportCapabilities;
}
export interface SupportDashboard {
  total: number; open: number; unassigned: number; new_today: number; in_progress: number;
  waiting: number; escalated: number; critical: number; resolved_today: number;
  statuses: { status: string; count: number }[];
  priorities: { priority: string; count: number }[];
  categories: { category: string; count: number }[];
  severity: { severity: string | null; count: number }[];
  trend: { date: string; count: number; resolved?: number; escalated?: number }[];
  workload: { uuid: string; name: string; count: number; capacity: null }[];
  timezone: string; unavailable: string[]; alerts: SupportRecord[];
  sources?: Record<string, { available: boolean; reason?: string; total?: number; statuses?: { status: string; count: number }[]; issues?: { id: string; label: string; count: number }[] }>;
}
export interface SupportLookup { id: string; label: string }
export interface SupportView { uuid: string; name: string; filters: SupportFilters }
export const supportStatuses = ['open', 'assigned', 'in_progress', 'waiting_customer', 'resolved', 'closed'];
export const supportPriorities = ['low', 'normal', 'high', 'urgent', 'critical'];
export const supportCategories = ['general_inquiry', 'order_delivery', 'returns_refunds', 'product_quality', 'supplier_issue', 'payment_issue', 'safety_concern', 'account_access', 'technical_issue'];
export const supportChannels = ['in_app', 'email', 'phone', 'web', 'whatsapp', 'sms'];
export const supportDependencies = ['supplier', 'logistics', 'finance', 'customer', 'compliance'];
export const supportIssueTypes = ['late_shipment', 'lost_shipment', 'damaged_delivery', 'missing_item', 'wrong_delivery', 'partial_delivery', 'failed_delivery_attempt', 'product_quality', 'product_safety', 'refund_delay', 'supplier_response', 'other'];
export const supportLabel = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
