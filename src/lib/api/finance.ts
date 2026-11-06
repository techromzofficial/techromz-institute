import { api, withQuery } from "@/lib/api";

export type FinancePaymentStatus =
  | "created"
  | "pending"
  | "requires_action"
  | "authorized"
  | "captured"
  | "failed"
  | "cancelled"
  | "partially_refunded"
  | "refunded";

export interface FinancePaymentOrder {
  id: number;
  order_number: string;
}

export interface FinancePaymentCustomer {
  id: number;
  name: string | null;
  email: string | null;
}

export interface FinancePaymentMethod {
  id: number;
  name: string;
  slug: string;
  provider: string | null;
  method_type: string | null;
}

export interface FinancePaymentProvider {
  identifier: string | null;
  reference: string | null;
}

export interface FinancePaymentAttempt {
  id: number;
  uuid: string;
  status: FinancePaymentStatus | string;
}

export interface FinancePaymentRow {
  id: number;
  uuid: string;

  payment_number: string;

  order: FinancePaymentOrder | null;

  invoice_id: number | null;

  customer: FinancePaymentCustomer | null;

  amount: string;
  fee_amount: string;
  currency: string | null;

  status: FinancePaymentStatus;
  payment_status: string;

  payment_method: FinancePaymentMethod | null;

  provider: FinancePaymentProvider;

  attempt: FinancePaymentAttempt | null;

  authorized_at: string | null;
  paid_at: string | null;
  failed_at: string | null;

  created_at: string | null;
  updated_at: string | null;
}

export interface FinanceCurrencySummary {
  currency: string;
  payment_count: number;
  amount: string;
  fees: string;
}

export interface FinancePaymentSummary {
  total: number;

  created: number;
  pending: number;
  requires_action: number;
  authorized: number;
  captured: number;
  failed: number;
  cancelled: number;
  partially_refunded: number;
  refunded: number;

  amounts_by_currency: FinanceCurrencySummary[];
}

export interface FinancePaymentCapabilities {
  read: boolean;
  refund: boolean;
  capture: boolean;
  void: boolean;
  retry: boolean;
  place_hold: boolean;
  risk_review: boolean;
  export: boolean;
}

export interface FinancePaymentFilterOptions {
  statuses: FinancePaymentStatus[];
  providers: string[];
}

export interface FinancePaymentsResponse {
  data: FinancePaymentRow[];

  summary: FinancePaymentSummary;

  filters: FinancePaymentFilterOptions;

  capabilities: FinancePaymentCapabilities;

  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FinancePaymentQuery {
  search?: string;
  status?: FinancePaymentStatus | "";
  provider?: string;
  payment_method_id?: number;
  page?: number;
  per_page?: number;
}

export interface FinancePaymentTransaction {
  id: number;
  uuid: string;
  transaction_reference: string | null;
  transaction_type: string | null;
  amount: string;
  currency: string | null;
  status: string | null;
  gateway_status: string | null;
  provider: {
    identifier: string | null;
    reference: string | null;
  };
  event_reference: string | null;
  occurred_at: string | null;
  created_at: string | null;
}

export interface FinancePaymentRefund {
  id: number;
  uuid: string;
  refund_number: string | null;
  amount: string;
  currency: string | null;
  reason: string | null;
  status: string | null;
  requested_by: number | null;
  provider: {
    identifier: string | null;
    refund_reference: string | null;
  };
  processed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FinancePaymentOperation {
  id: number;
  uuid: string;
  payment_id: number;
  payment_number: string | null;
  payment_attempt_id: number;
  order_id: number;
  operation: "capture" | "cancel";
  status: "reserved" | "completed" | "outcome_unknown";
  reconciliation_state:
    | "provider_dispatch_in_progress"
    | "reconciliation_required"
    | "not_required";
  amount: string;
  currency: string;
  actor: { id: number; name: string | null; email: string | null } | null;
  provider_identifier: string;
  provider_reference: string;
  provider_result_reference: string | null;
  payment_transaction_id: number | null;
  failure_class: string | null;
  completed_at: string | null;
  failed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FinancePaymentOperationsResponse {
  data: FinancePaymentOperation[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FinancePaymentDetail
  extends FinancePaymentRow {
  transactions: FinancePaymentTransaction[];
  refunds: FinancePaymentRefund[];
  operations: FinancePaymentOperation[];
}

export interface FinancePaymentDetailResponse {
  data: FinancePaymentDetail;
  capabilities: FinancePaymentCapabilities;
}

export interface FinanceSupplierPayableSupplier {
  id: number;
  company_name: string;
  email: string | null;
  status: string | null;
  verification_status: string | null;
}

export interface FinanceSupplierPayableSettlement {
  id: number;
  provider_identifier: string | null;
  provider_settlement_reference: string | null;
  period_start: string | null;
  period_end: string | null;
  status: string | null;
  reconciliation_status: string | null;
  finalized_at: string | null;
}

export interface FinanceSupplierPayableRow {
  id: number;
  uuid: string;
  supplier: FinanceSupplierPayableSupplier | null;
  settlement: FinanceSupplierPayableSettlement | null;
  provider_line_reference: string | null;
  gross_amount: string;
  fee_amount: string;
  net_amount: string;
  expected_amount: string | null;
  reported_amount: string | null;
  reconciliation_difference: string;
  currency: string | null;
  reconciliation_status: string | null;
  reconciliation_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FinanceSupplierPayableCurrencySummary {
  currency: string;
  line_count: number;
  gross_amount: string;
  fee_amount: string;
  net_amount: string;
  expected_amount: string;
  reported_amount: string;
  reconciliation_difference: string;
}

export interface FinanceSupplierPayableSummary {
  total_lines: number;
  matched: number;
  discrepancies: number;
  status_counts: Record<string, number>;
  amounts_by_currency: FinanceSupplierPayableCurrencySummary[];
}

export interface FinanceSupplierPayableCapabilities {
  read: boolean;
  approve: boolean;
  schedule_payment: boolean;
  release_payment: boolean;
  mark_paid: boolean;
  export: boolean;
}

export interface FinanceSupplierPayablesResponse {
  data: FinanceSupplierPayableRow[];
  summary: FinanceSupplierPayableSummary;
  capabilities: FinanceSupplierPayableCapabilities;
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FinanceSupplierPayableQuery {
  search?: string;
  reconciliation_status?: string;
  supplier_id?: number;
  page?: number;
  per_page?: number;
}

export interface FinanceSupplierPayableTransaction {
  id: number;
  uuid: string;
  payment_id: number;
  transaction_reference: string | null;
  transaction_type: string | null;
  amount: string;
  currency: string | null;
  status: string | null;
  gateway_status: string | null;
  provider: {
    identifier: string | null;
    reference: string | null;
  };
  event_reference: string | null;
  occurred_at: string | null;
  created_at: string | null;
}

export interface FinanceSupplierPayableRefund {
  id: number;
  uuid: string;
  payment_id: number;
  refund_number: string | null;
  amount: string;
  currency: string | null;
  reason: string | null;
  status: string | null;
  provider: {
    identifier: string | null;
    refund_reference: string | null;
  };
  processed_at: string | null;
  created_at: string | null;
}

export interface FinanceSupplierPayableOrder {
  id: number;
  order_number: string;
  total_amount: string;
  currency: string | null;
  status: string | null;
  payment_status: string | null;
  customer: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
  created_at: string | null;
}

export interface FinanceSupplierPayableDetail
  extends FinanceSupplierPayableRow {
  settlement:
    | (FinanceSupplierPayableSettlement & {
        gross_amount: string;
        fee_amount: string;
        refund_amount: string;
        net_amount: string;
        currency: string | null;
      })
    | null;

  transaction: FinanceSupplierPayableTransaction | null;
  refund: FinanceSupplierPayableRefund | null;
  order: FinanceSupplierPayableOrder | null;
}

export interface FinanceSupplierPayableDetailResponse {
  data: FinanceSupplierPayableDetail;

  capabilities: {
    read: boolean;
    approve: boolean;
    schedule_payment: boolean;
    release_payment: boolean;
    mark_paid: boolean;
  };
}

export interface SupplierPayableRecord {
  id: number; uuid: string; payable_number: string;
  supplier: { id: number; company_name: string; email: string | null } | null;
  invoice: { id: number; invoice_number: string } | null;
  order: { id: number; order_number: string } | null;
  source_type: string; source_id: number; original_amount: string;
  outstanding_amount: string; currency: string; due_date: string | null;
  status: string; hold_reason: string | null; scheduled_for: string | null;
  created_at: string | null; updated_at: string | null;
  history?: Array<{ id: number; event_type: string; previous_status: string | null; new_status: string; reason: string | null; scheduled_for: string | null; occurred_at: string | null; actor: { id: number; name: string | null; email: string | null } | null }>;
}

export interface SupplierPayablesResponse {
  data: SupplierPayableRecord[];
  summary: { total: number; open: number; on_hold: number; scheduled: number; amounts_by_currency: Array<{ currency: string; payable_count: number; original_amount: string; outstanding_amount: string }> };
  capabilities: { read: boolean; materialize: boolean };
  current_page: number; per_page: number; total: number; last_page: number;
}

export interface SupplierPayableDetailResponse {
  data: SupplierPayableRecord;
  capabilities: { read: boolean; hold: boolean; release: boolean; schedule: boolean; cancel_schedule: boolean; settle: false };
  message?: string;
}

export interface FinanceSettlementRow {
  id: number;
  uuid: string;
  provider_identifier: string | null;
  provider_settlement_reference: string | null;
  period_start: string | null;
  period_end: string | null;
  gross_amount: string;
  fee_amount: string;
  refund_amount: string;
  net_amount: string;
  currency: string | null;
  status: string | null;
  reconciliation_status: string | null;
  line_count: number;
  discrepancy_count: number;
  finalized_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FinanceSettlementCurrencySummary {
  currency: string;
  settlement_count: number;
  gross_amount: string;
  fee_amount: string;
  refund_amount: string;
  net_amount: string;
}

export interface FinanceSettlementSummary {
  total: number;
  finalized: number;
  matched: number;
  discrepancies: number;
  status_counts: Record<string, number>;
  reconciliation_counts: Record<string, number>;
  amounts_by_currency: FinanceSettlementCurrencySummary[];
}

export interface FinanceSettlementCapabilities {
  read: boolean;
  import: boolean;
  finalize: boolean;
  schedule_payout: boolean;
  release_payout: boolean;
  export: boolean;
}

export interface FinanceSettlementsResponse {
  data: FinanceSettlementRow[];
  summary: FinanceSettlementSummary;
  filters: {
    providers: string[];
  };
  capabilities: FinanceSettlementCapabilities;
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FinanceSettlementQuery {
  search?: string;
  status?: string;
  reconciliation_status?: string;
  provider?: string;
  page?: number;
  per_page?: number;
}

export interface FinanceSettlementLineSupplier {
  id: number;
  company_name: string | null;
  email: string | null;
  status: string | null;
  verification_status: string | null;
}

export interface FinanceSettlementLineTransaction {
  id: number;
  uuid: string;
  transaction_reference: string | null;
  transaction_type: string | null;
  amount: string;
  currency: string | null;
  status: string | null;
  gateway_status: string | null;
  provider_identifier: string | null;
  provider_reference: string | null;
  occurred_at: string | null;
}

export interface FinanceSettlementLineRefund {
  id: number;
  uuid: string;
  refund_number: string | null;
  amount: string;
  currency: string | null;
  reason: string | null;
  status: string | null;
  provider_identifier: string | null;
  provider_refund_reference: string | null;
  processed_at: string | null;
}

export interface FinanceSettlementLineOrder {
  id: number;
  order_number: string;
  total_amount: string;
  currency: string | null;
  status: string | null;
  payment_status: string | null;
  customer: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
}

export interface FinanceSettlementLine {
  id: number;
  uuid: string;
  provider_line_reference: string | null;
  reconciliation_status: string | null;
  reconciliation_reason: string | null;
  expected_amount: string | null;
  reported_amount: string | null;
  gross_amount: string;
  fee_amount: string;
  net_amount: string;
  reconciliation_difference: string;
  currency: string | null;
  supplier: FinanceSettlementLineSupplier | null;
  transaction: FinanceSettlementLineTransaction | null;
  refund: FinanceSettlementLineRefund | null;
  order: FinanceSettlementLineOrder | null;
  created_at: string | null;
}

export interface FinanceSettlementDetail
  extends FinanceSettlementRow {
  lines: FinanceSettlementLine[];
  audits: Array<{
    id: number;
    action: string;
    actor_id: number | string | null;
    previous_status: string | null;
    new_status: string | null;
    classification: string | null;
    occurred_at: string | null;
  }>;
}

export interface FinanceSettlementDetailResponse {
  data: FinanceSettlementDetail;
  capabilities: FinanceSettlementCapabilities;
}

export interface FinanceSettlementImportPayload {
  provider_config_id: number;
  provider_settlement_reference: string;
  period_start: string;
  period_end: string;
  gross_amount: string;
  fee_amount: string;
  refund_amount: string;
  net_amount: string;
  currency: string;
  lines: Array<{
    line_reference: string;
    provider_reference: string;
    amount: string;
    currency: string;
    internal_reference?: string | null;
  }>;
}

export interface FinanceReconciliationDifferenceCurrency {
  currency: string;
  line_count: number;
  expected_amount: string;
  reported_amount: string;
  reconciliation_difference: string;
}

export interface FinanceReconciliationSummary {
  total_settlements: number;
  matched_settlements: number;
  discrepancy_settlements: number;
  processing_settlements: number;

  total_lines: number;
  matched_lines: number;
  unresolved_lines: number;

  settlement_counts: Record<
    string,
    number
  >;

  line_counts: Record<
    string,
    number
  >;

  differences_by_currency:
    FinanceReconciliationDifferenceCurrency[];
}

export interface FinanceReconciliationCapabilities {
  read: boolean;
  manual_match: boolean;
  force_match: boolean;
  write_off: boolean;
  import: boolean;
  finalize: boolean;
  export: boolean;
}

export interface FinanceReconciliationQuery {
  search?: string;
  provider?: string;
  reconciliation_status?: string;
  line_status?: string;
  currency?: string;
  unresolved?: boolean;
  page?: number;
  per_page?: number;
}

export interface FinanceReconciliationRow {
  id: number;
  uuid: string;

  provider_identifier: string | null;
  provider_settlement_reference: string | null;

  period_start: string | null;
  period_end: string | null;

  currency: string | null;

  gross_amount: string;
  net_amount: string;

  status: string | null;
  reconciliation_status: string | null;

  line_count: number;
  discrepancy_count: number;

  finalized_at: string | null;
  created_at: string | null;
}

export interface FinanceReconciliationsResponse {
  data: FinanceReconciliationRow[];

  summary:
    FinanceReconciliationSummary;

  filters: {
    providers: string[];
    line_statuses: string[];
  };

  capabilities:
    FinanceReconciliationCapabilities;

  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FinanceReconciliationLine {
  id: number;
  uuid: string;

  provider_line_reference:
    string | null;

  reconciliation_status:
    string | null;

  reconciliation_reason:
    string | null;

  expected_amount:
    string | null;

  reported_amount:
    string | null;

  reconciliation_difference:
    string;

  currency:
    string | null;

  created_at:
    string | null;
}

export interface FinanceReconciliationDetail {
  id: number;
  uuid: string;

  provider_identifier:
    string | null;

  provider_settlement_reference:
    string | null;

  period_start:
    string | null;

  period_end:
    string | null;

  currency:
    string | null;

  gross_amount: string;
  fee_amount: string;
  refund_amount: string;
  net_amount: string;

  status:
    string | null;

  reconciliation_status:
    string | null;

  finalized_at:
    string | null;

  lines:
    FinanceReconciliationLine[];
}

export interface FinanceReconciliationDetailResponse {
  data:
    FinanceReconciliationDetail;

  capabilities:
    FinanceReconciliationCapabilities;
}

export interface FinanceRefundPayment {
  id: number;
  payment_number: string | null;
  amount: string;
  currency: string | null;
  status: string | null;
  payment_status: string | null;
}

export interface FinanceRefundOrder {
  id: number;
  order_number: string;
  total_amount: string;
  currency: string | null;
  status: string | null;
  payment_status: string | null;
  customer: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
}

export interface FinanceRefundRow {
  id: number;
  uuid: string;
  refund_number: string | null;
  amount: string;
  currency: string | null;
  reason: string | null;
  status: string | null;
  requested_by: number | null;
  provider_identifier: string | null;
  provider_refund_reference: string | null;
  processed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  history_count: number;
  payment: FinanceRefundPayment | null;
  order: FinanceRefundOrder | null;
}

export interface FinanceRefundCurrencySummary {
  currency: string;
  refund_count: number;
  amount: string;
}

export interface FinanceRefundSummary {
  total: number;
  pending: number;
  refunded: number;
  failed: number;
  cancelled: number;
  status_counts: Record<string, number>;
  amounts_by_currency: FinanceRefundCurrencySummary[];
}

export interface FinanceRefundCapabilities {
  read: boolean;
  request_refund: boolean;
  cancel_refund: boolean;
  retry_refund: boolean;
  compensation: boolean;
  export: boolean;
}

export interface FinanceRefundsResponse {
  data: FinanceRefundRow[];
  summary: FinanceRefundSummary;
  filters: {
    providers: string[];
  };
  capabilities: FinanceRefundCapabilities;
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FinanceRefundQuery {
  search?: string;
  status?: string;
  provider?: string;
  page?: number;
  per_page?: number;
}

export interface FinanceRefundHistory {
  id: number;
  previous_status: string | null;
  new_status: string;
  provider_reference: string | null;
  metadata: Record<string, unknown> | null;
  occurred_at: string | null;
  actor: { id: number; name: string | null; email: string | null } | null;
}

export interface FinanceRefundDetail extends FinanceRefundRow {
  history: FinanceRefundHistory[];
}

export interface FinanceRefundDetailResponse {
  data: FinanceRefundDetail;
  capabilities?: FinanceRefundCapabilities;
  message?: string;
}

export interface FinanceRefundRequest {
  payment_reference: string;
  amount: string;
  currency: string;
  idempotency_key: string;
  reason?: string;
}

export type FinanceCommissionStatus =
  | "calculated"
  | "pending_review"
  | "approved"
  | "settled"
  | "cancelled";

export type FinanceCommissionCalculationType =
  | "percentage"
  | "fixed";

export interface FinanceCommissionCapabilities {
  read: boolean;
  submit_review: boolean;
  approve: boolean;
  settle: boolean;
  cancel: boolean;
  adjust: boolean;
  reverse: boolean;
  waive: boolean;
  dispute: boolean;
}

export interface FinanceCommissionOrder {
  id: number;
  order_number: string;
  currency: string | null;
  status: string | null;
  payment_status: string | null;
}

export interface FinanceCommissionSupplier {
  id: number;
  name: string | null;
}

export interface FinanceCommissionProduct {
  id: number;
  name: string | null;
  sku: string | null;
}

export interface FinanceCommissionCategory {
  id: number;
  name: string | null;
}

export interface FinanceCommissionRule {
  id: number;
  uuid: string;
  name: string;
  calculation_type:
    FinanceCommissionCalculationType;
  percentage_rate: string | null;
  fixed_amount: string | null;
  currency: string | null;
  priority: number;
}

export interface FinanceCommissionRow {
  id: number;
  uuid: string;

  calculation_type:
    FinanceCommissionCalculationType;

  base_amount: string;
  percentage_rate: string | null;
  fixed_amount: string | null;
  commission_amount: string;
  currency: string;

  status: FinanceCommissionStatus;
  status_reason: string | null;

  calculated_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  settled_at: string | null;

  history_count: number | null;

  order: FinanceCommissionOrder | null;
  supplier: FinanceCommissionSupplier | null;
  product: FinanceCommissionProduct | null;
  category: FinanceCommissionCategory | null;
  rule: FinanceCommissionRule | null;

  capabilities:
    FinanceCommissionCapabilities;

  created_at: string | null;
  updated_at: string | null;
}

export interface FinanceCommissionCurrencySummary {
  currency: string;
  commission_count: number;
  base_amount: string;
  commission_amount: string;
}

export interface FinanceCommissionSummary {
  total: number;
  calculated: number;
  pending_review: number;
  approved: number;
  settled: number;
  cancelled: number;
  amounts_by_currency:
    FinanceCommissionCurrencySummary[];
}

export interface FinanceCommissionsCapabilities {
  read: boolean;
  manage: boolean;
  adjust: boolean;
  reverse: boolean;
  waive: boolean;
  dispute: boolean;
  export: boolean;
}

export interface FinanceCommissionQuery {
  search?: string;
  status?: FinanceCommissionStatus | "";
  calculation_type?:
    | FinanceCommissionCalculationType
    | "";
  currency?: string;
  page?: number;
  per_page?: number;
}

export interface FinanceCommissionsResponse {
  data: FinanceCommissionRow[];
  summary: FinanceCommissionSummary;
  capabilities:
    FinanceCommissionsCapabilities;
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FinanceCommissionOrderItem {
  id: number;
  product_name: string | null;
  sku: string | null;
  quantity: string | number | null;
  unit_price: string | null;
  amount: string;
  currency: string | null;
}

export interface FinanceCommissionPerson {
  id: number;
  name: string | null;
}

export interface FinanceCommissionHistory {
  id: number;
  uuid: string;
  previous_status:
    FinanceCommissionStatus | null;
  new_status:
    FinanceCommissionStatus;
  reason: string | null;
  occurred_at: string | null;
  actor: FinanceCommissionPerson | null;
}

export interface FinanceCommissionDetail
  extends FinanceCommissionRow {
  order_item:
    FinanceCommissionOrderItem | null;

  buyer:
    FinanceCommissionPerson | null;

  reviewer:
    FinanceCommissionPerson | null;

  approver:
    FinanceCommissionPerson | null;

  histories:
    FinanceCommissionHistory[];
}

export interface FinanceCommissionDetailResponse {
  data: FinanceCommissionDetail;
}

export interface FinanceCommissionWorkflowPayload {
  reason?: string;
}

export type FinanceInvoiceStatus =
  | "draft"
  | "issued"
  | "cancelled";

export type FinanceInvoicePaymentStatus =
  | "unpaid"
  | "partially_paid"
  | "paid";

export interface FinanceInvoiceOrder {
  id: number;
  order_number: string;
  status: string | null;
  payment_status: string | null;
  currency: string | null;
  total_amount: string;
}

export interface FinanceInvoiceSupplier {
  id: number;
  name: string | null;
}

export interface FinanceInvoiceCapabilities {
  read: boolean;
  issue: boolean;
  cancel: boolean;
  mark_paid: boolean;
  mark_partially_paid: boolean;
  credit_note: boolean;
  debit_note: boolean;
}

export interface FinanceInvoiceRow {
  id: number;
  uuid: string;
  invoice_number: string;

  invoice_date: string | null;
  due_date: string | null;

  subtotal: string;
  tax_amount: string;
  shipping_amount: string;
  discount_amount: string;
  total_amount: string;
  amount_paid: string;
  balance_due: string;

  currency: string;

  status: FinanceInvoiceStatus;
  payment_status:
    FinanceInvoicePaymentStatus;

  sent_at: string | null;
  paid_at: string | null;

  item_count: number | null;
  history_count: number | null;

  order: FinanceInvoiceOrder | null;
  supplier: FinanceInvoiceSupplier | null;

  capabilities:
    FinanceInvoiceCapabilities;

  created_at: string | null;
  updated_at: string | null;
}

export interface FinanceInvoiceCurrencySummary {
  currency: string;
  invoice_count: number;
  total_amount: string;
  amount_paid: string;
  balance_due: string;
}

export interface FinanceInvoiceSummary {
  total: number;

  draft: number;
  issued: number;
  cancelled: number;

  unpaid: number;
  partially_paid: number;
  paid: number;

  amounts_by_currency:
    FinanceInvoiceCurrencySummary[];
}

export interface FinanceInvoicesCapabilities {
  read: boolean;
  manage: boolean;
  create_from_order: boolean;

  mark_paid: boolean;
  mark_partially_paid: boolean;

  create_credit_note: boolean;
  create_debit_note: boolean;

  export: boolean;
}

export interface FinanceInvoiceQuery {
  search?: string;

  status?:
    | FinanceInvoiceStatus
    | "";

  payment_status?:
    | FinanceInvoicePaymentStatus
    | "";

  currency?: string;

  page?: number;
  per_page?: number;
}

export interface FinanceInvoicesResponse {
  data: FinanceInvoiceRow[];

  summary: FinanceInvoiceSummary;

  capabilities:
    FinanceInvoicesCapabilities;

  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FinanceInvoicePerson {
  id: number;
  name: string | null;
}

export interface FinanceInvoiceOrderItemEvidence {
  id: number;
  product_name: string | null;
  sku: string | null;
}

export interface FinanceInvoiceItem {
  id: number;
  uuid: string;

  description: string | null;

  quantity: string | number;
  unit: string | null;

  unit_price: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;

  currency: string;

  order_item:
    FinanceInvoiceOrderItemEvidence | null;
}

export interface FinanceInvoicePaymentEvidence {
  id: number;
  uuid: string;

  payment_number: string;

  amount: string;
  fee_amount: string;

  currency: string | null;

  status: string;
  payment_status: string;

  provider_identifier: string | null;
  provider_reference: string | null;

  authorized_at: string | null;
  paid_at: string | null;
  failed_at: string | null;
}

export interface FinanceInvoiceHistory {
  id: number;
  uuid: string;

  previous_status:
    FinanceInvoiceStatus | null;

  new_status:
    FinanceInvoiceStatus;

  previous_payment_status:
    FinanceInvoicePaymentStatus | null;

  new_payment_status:
    FinanceInvoicePaymentStatus;

  event_type: string;

  reason: string | null;
  occurred_at: string | null;

  actor:
    FinanceInvoicePerson | null;
}

export type FinanceInvoiceFinancialNoteType =
  | "credit"
  | "debit";

export type FinanceInvoiceFinancialNoteStatus =
  | "draft"
  | "issued"
  | "cancelled";

export interface FinanceInvoiceFinancialNoteHistory {
  id: number;
  uuid: string;

  previous_status:
    FinanceInvoiceFinancialNoteStatus | null;

  new_status:
    FinanceInvoiceFinancialNoteStatus;

  event_type: string;

  reason: string | null;
  occurred_at: string | null;

  actor:
    FinanceInvoicePerson | null;
}

export interface FinanceInvoiceFinancialNote {
  id: number;
  uuid: string;

  invoice_id: number;

  type:
    FinanceInvoiceFinancialNoteType;

  note_number: string;

  amount: string;
  currency: string;

  reason: string;

  status:
    FinanceInvoiceFinancialNoteStatus;

  issued_at: string | null;
  cancelled_at: string | null;

  capabilities: {
    read: boolean;
    issue: boolean;
    cancel: boolean;
  };

  histories:
    FinanceInvoiceFinancialNoteHistory[];

  created_at: string | null;
  updated_at: string | null;
}

export interface FinanceInvoiceFinancialNoteMutationResponse {
  message: string;
  data: FinanceInvoiceFinancialNote;
}

export interface FinanceInvoiceFinancialNoteCreatePayload {
  amount: string;
  reason: string;
}

export interface FinanceInvoiceFinancialNoteWorkflowPayload {
  reason?: string;
}

export interface FinanceInvoiceDetail
  extends FinanceInvoiceRow {
  buyer:
    FinanceInvoicePerson | null;

  items:
    FinanceInvoiceItem[];

  payments:
    FinanceInvoicePaymentEvidence[];

  financial_notes:
    FinanceInvoiceFinancialNote[];

  histories:
    FinanceInvoiceHistory[];
}

export interface FinanceInvoiceDetailResponse {
  data: FinanceInvoiceDetail;
}

export interface FinanceInvoiceMutationResponse {
  message: string;
  data: FinanceInvoiceDetail;
}

export interface FinanceInvoiceWorkflowPayload {
  reason?: string;
}

export interface FinanceInvoiceCreatePayload {
  order_id: number;
}

export interface FinanceTaxCurrency {
  id: number;
  uuid: string;
  code: string;
  name: string;
  symbol: string | null;
  decimal_places: number;
  status: string;
  is_default: boolean;
}

export interface FinanceExchangeRate {
  id: number;
  base_currency: string;
  quote_currency: string;
  rate: string;
  rate_date: string | null;
  source: string | null;
  status: string;
}

export interface FinanceTaxRuleCountry {
  id: number;
  iso2: string | null;
  iso3: string | null;
  name: string | null;
}

export interface FinanceTaxRuleRegion {
  id: number;
  code: string | null;
  name: string | null;
}

export interface FinanceTaxRule {
  id: number;
  uuid: string;

  tax_type: string;
  name: string;
  rate: string;

  effective_from: string | null;
  effective_until: string | null;

  status: string;

  country: FinanceTaxRuleCountry | null;
  region: FinanceTaxRuleRegion | null;
}

export interface FinancePaymentProviderCurrencyConfig {
  id: number;
  uuid: string;

  provider_identifier: string;
  display_label: string | null;

  environment: string;
  status: string;

  supported_currencies: string[];
  enabled_capabilities: string[];
}

export interface FinanceTaxCurrencySummary {
  currency_count: number;
  active_currency_count: number;

  exchange_rate_count: number;

  tax_rule_count: number;
  active_tax_rule_count: number;

  payment_provider_count: number;

  tenant_supported_currencies: string[];
}

export interface FinanceTenantCurrencyConfig {
  id: number;
  uuid: string;
  currency_code: string;
  is_enabled: boolean;
  is_base: boolean;
  updated_at: string | null;
}

export interface UpdateTenantCurrencyConfigPayload {
  currency_code: string;
  is_enabled: boolean;
  is_base?: boolean;
}

export interface FinanceTaxCurrencyCapabilities {
  read: boolean;

  manage_currency_reference: boolean;
  manage_exchange_rates: boolean;
  manage_tax_rules: boolean;
  manage_provider_currencies: boolean;
  manage_tenant_currencies?: boolean;
}

export interface FinanceTaxCurrencyQuery {
  currency?: string;
  country?: string;
  tax_status?: string;
}

export interface FinanceTaxCurrencyResponse {
  data: {
    currencies: FinanceTaxCurrency[];
    exchange_rates: FinanceExchangeRate[];
    tax_rules: FinanceTaxRule[];
    payment_providers: FinancePaymentProviderCurrencyConfig[];
    tenant_currencies?: FinanceTenantCurrencyConfig[];
  };

  summary: FinanceTaxCurrencySummary;

  capabilities: FinanceTaxCurrencyCapabilities;
}

export interface FinanceReportPaymentCurrency {
  currency: string;
  payment_count: number;
  amount: string;
  fees: string;
}

export interface FinanceReportRefundCurrency {
  currency: string;
  refund_count: number;
  amount: string;
}

export interface FinanceReportSettlementCurrency {
  currency: string;
  settlement_count: number;
  gross_amount: string;
  fee_amount: string;
  refund_amount: string;
  net_amount: string;
}

export interface FinanceReportReconciliationCurrency {
  currency: string;
  line_count: number;
  expected_amount: string;
  reported_amount: string;
  reconciliation_difference: string;
}

export interface FinanceAuditRow {
  id: number;
  uuid: string;

  action: string;

  previous_status: string | null;
  new_status: string | null;

  amount: string | null;
  currency: string | null;

  provider_identifier: string | null;
  masked_provider_reference: string | null;

  actor_id: number | null;

  order_id: number | null;
  payment_id: number | null;
  payment_transaction_id: number | null;
  payment_refund_id: number | null;
  payment_settlement_id: number | null;

  correlation_id: string | null;

  occurred_at: string | null;
  created_at: string | null;
}

export interface FinanceReportsAuditSummary {
  payments: number;
  refunds: number;
  settlements: number;
  unresolved_reconciliation_lines: number;
  audit_events: number;
}

export interface FinanceReportsAuditCapabilities {
  read: boolean;
  reports: boolean;
  audit_history: boolean;

  import: boolean;
  export: boolean;
  audit_export: boolean;
}

export interface FinanceReportsAuditQuery {
  action?: string;
  provider?: string;

  date_from?: string;
  date_to?: string;

  page?: number;
  per_page?: number;
}

export interface FinanceExportQuery {
  type: "payments" | "refunds" | "supplier_payables" | "settlements" | "settlement_discrepancies" | "audit_events";
  date_from?: string;
  date_to?: string;
  status?: string;
}

export interface FinanceReportsAuditResponse {
  data: {
    reports: {
      payments_by_currency:
        FinanceReportPaymentCurrency[];

      refunds_by_currency:
        FinanceReportRefundCurrency[];

      settlements_by_currency:
        FinanceReportSettlementCurrency[];

      reconciliation_by_currency:
        FinanceReportReconciliationCurrency[];
    };

    audit: FinanceAuditRow[];
  };

  summary: FinanceReportsAuditSummary;

  filters: {
    actions: string[];
    providers: string[];
  };

  capabilities:
    FinanceReportsAuditCapabilities;

  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export type FinanceRevenueReceivablePaymentStatus =
  | "unpaid"
  | "partially_paid";

export interface FinanceRevenueReceivableOrder {
  id: number;
  order_number: string;
}

export interface FinanceRevenueReceivableSupplier {
  id: number;
  name: string | null;
}

export interface FinanceRevenueReceivableRow {
  id: number;
  uuid: string;
  invoice_number: string;
  invoice_date: string | null;
  due_date: string | null;
  total_amount: string;
  amount_paid: string;
  balance_due: string;
  currency: string | null;
  payment_status: FinanceRevenueReceivablePaymentStatus;
  status: string;
  order: FinanceRevenueReceivableOrder | null;
  supplier: FinanceRevenueReceivableSupplier | null;
  created_at: string | null;
}

export interface FinanceRevenueCurrencySummary {
  currency: string;
  invoice_count: number;
  invoiced_amount: string;
  collected_amount: string;
  outstanding_amount: string;
}

export interface FinanceReceivableCurrencySummary {
  currency: string;
  receivable_count: number;
  invoice_amount: string;
  amount_paid: string;
  balance_due: string;
}

export interface FinanceRevenueReceivableSummary {
  receivables: number;
  unpaid: number;
  partially_paid: number;
  revenue_by_currency: FinanceRevenueCurrencySummary[];
  receivables_by_currency: FinanceReceivableCurrencySummary[];
}

export interface FinanceRevenueReceivableCapabilities {
  read: boolean;
  manage_receivable: boolean;
  write_off: boolean;
  collection_action: boolean;
  export: boolean;
}

export interface FinanceRevenueReceivableQuery {
  search?: string;
  payment_status?: FinanceRevenueReceivablePaymentStatus | "";
  currency?: string;
  page?: number;
  per_page?: number;
}

export interface FinanceRevenueReceivablesResponse {
  data: FinanceRevenueReceivableRow[];
  summary: FinanceRevenueReceivableSummary;
  capabilities: FinanceRevenueReceivableCapabilities;
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface FinanceCommandCenterPaymentsSummary {
  total: number;
  pending: number;
  requires_action: number;
  failed: number;
}

export interface FinanceCommandCenterReceivablesSummary {
  open: number;
}

export interface FinanceCommandCenterRefundsSummary {
  total: number;
}

export interface FinanceCommandCenterSettlementsSummary {
  total: number;
}

export interface FinanceCommandCenterCommissionsSummary {
  total: number;
  pending_review: number;
  approved: number;
}

export interface FinanceCommandCenterReconciliationSummary {
  unresolved: number;
}

export interface FinanceCommandCenterSummary {
  payments: FinanceCommandCenterPaymentsSummary;
  receivables: FinanceCommandCenterReceivablesSummary;
  refunds: FinanceCommandCenterRefundsSummary;
  settlements: FinanceCommandCenterSettlementsSummary;
  commissions: FinanceCommandCenterCommissionsSummary;
  reconciliation: FinanceCommandCenterReconciliationSummary;
}

export interface FinanceCommandCenterPaymentCurrency {
  currency: string;
  payment_count: number;
  amount: string;
  fees: string;
}

export interface FinanceCommandCenterReceivableCurrency {
  currency: string;
  receivable_count: number;
  invoice_amount: string;
  amount_paid: string;
  balance_due: string;
}

export interface FinanceCommandCenterRefundCurrency {
  currency: string;
  refund_count: number;
  amount: string;
}

export interface FinanceCommandCenterSettlementCurrency {
  currency: string;
  settlement_count: number;
  gross_amount: string;
  fee_amount: string;
  refund_amount: string;
  net_amount: string;
}

export interface FinanceCommandCenterCommissionCurrency {
  currency: string;
  commission_count: number;
  base_amount: string;
  commission_amount: string;
}

export interface FinanceCommandCenterReconciliationCurrency {
  currency: string;
  discrepancy_count: number;
  expected_amount: string;
  reported_amount: string;
  difference: string;
}

export interface FinanceCommandCenterMoney {
  payments_by_currency: FinanceCommandCenterPaymentCurrency[];
  receivables_by_currency: FinanceCommandCenterReceivableCurrency[];
  refunds_by_currency: FinanceCommandCenterRefundCurrency[];
  settlements_by_currency: FinanceCommandCenterSettlementCurrency[];
  commissions_by_currency: FinanceCommandCenterCommissionCurrency[];
  reconciliation_by_currency: FinanceCommandCenterReconciliationCurrency[];
}

export interface FinanceCommandCenterNavigationItem {
  code: string;
  label: string;
  href: string;
}

export interface FinanceCommandCenterCapabilities {
  read: boolean;
  manage: boolean;
}

export interface FinanceCommandCenterResponse {
  summary: FinanceCommandCenterSummary;
  money: FinanceCommandCenterMoney;
  navigation: FinanceCommandCenterNavigationItem[];
  capabilities: FinanceCommandCenterCapabilities;
}

export const financeApi = {
  async getCommandCenter(): Promise<FinanceCommandCenterResponse> {
    return api.get(
      "/admin/finance",
    );
  },

  async getPayments(
    params: FinancePaymentQuery = {},
  ): Promise<FinancePaymentsResponse> {
    return api.get(
      withQuery(
        "/admin/finance/payments",
        params,
      ),
    );
  },

  async getPayment(
    id: number | string,
  ): Promise<FinancePaymentDetailResponse> {
    return api.get(
      `/admin/finance/payments/${id}`,
    );
  },

  async getPaymentOperations(
    params: { status?: "reserved" | "completed" | "outcome_unknown"; page?: number; per_page?: number } = {},
  ): Promise<FinancePaymentOperationsResponse> {
    return api.get(withQuery("/admin/finance/payments/operations", params));
  },

  async capturePayment(id: number | string, idempotencyKey: string): Promise<{ data: { id: number; status: string }; message?: string }> {
    return api.post(`/admin/finance/payments/${id}/capture`, { idempotency_key: idempotencyKey });
  },

  async cancelPayment(id: number | string, idempotencyKey: string): Promise<{ data: { id: number; status: string }; message?: string }> {
    return api.post(`/admin/finance/payments/${id}/cancel`, { idempotency_key: idempotencyKey });
  },

  async getSupplierPayables(
  params: { search?: string; status?: string; page?: number; per_page?: number } = {},
  ): Promise<SupplierPayablesResponse> {
    return api.get(
      withQuery(
        "/admin/finance/supplier-payables",
        params,
      ),
    );
  },

  async getSupplierPayable(
    id: number | string,
  ): Promise<SupplierPayableDetailResponse> {
    return api.get(
      `/admin/finance/supplier-payables/${id}`,
    );
  },

  async materializeSupplierPayable(invoiceId: number): Promise<SupplierPayableDetailResponse> { return api.post("/admin/finance/supplier-payables/materialize", { invoice_id: invoiceId }); },
  async holdSupplierPayable(id: number | string, reason: string): Promise<SupplierPayableDetailResponse> { return api.post(`/admin/finance/supplier-payables/${id}/hold`, { reason }); },
  async releaseSupplierPayable(id: number | string): Promise<SupplierPayableDetailResponse> { return api.post(`/admin/finance/supplier-payables/${id}/release`, {}); },
  async scheduleSupplierPayable(id: number | string, scheduledFor: string): Promise<SupplierPayableDetailResponse> { return api.post(`/admin/finance/supplier-payables/${id}/schedule`, { scheduled_for: scheduledFor }); },
  async cancelSupplierPayableSchedule(id: number | string): Promise<SupplierPayableDetailResponse> { return api.post(`/admin/finance/supplier-payables/${id}/cancel-schedule`, {}); },

  async getSettlements(
  params: FinanceSettlementQuery = {},
  ): Promise<FinanceSettlementsResponse> {
    return api.get(
      withQuery(
        "/admin/finance/settlements-payouts",
        params,
      ),
    );
  },

  async getSettlement(
  id: number | string,
  ): Promise<FinanceSettlementDetailResponse> {
    return api.get(
      `/admin/finance/settlements-payouts/${id}`,
    );
  },

  async importSettlement(
    payload: FinanceSettlementImportPayload,
  ): Promise<FinanceSettlementDetailResponse> {
    return api.post(
      "/admin/finance/settlements-payouts/import",
      payload,
    );
  },

  async finalizeSettlement(
    id: number | string,
  ): Promise<FinanceSettlementDetailResponse> {
    return api.post(
      `/admin/finance/settlements-payouts/${id}/finalize`,
      {},
    );
  },

  async getReconciliations(
  params: FinanceReconciliationQuery = {},
  ): Promise<FinanceReconciliationsResponse> {
    return api.get(
      withQuery(
        "/admin/finance/reconciliation-controls",
        params,
      ),
    );
  },

  async getReconciliation(
    settlementId: number | string,
  ): Promise<FinanceReconciliationDetailResponse> {
    return api.get(
      `/admin/finance/reconciliation-controls/${settlementId}`,
    );
  },

  async getTaxCurrencyConfiguration(
  params: FinanceTaxCurrencyQuery = {},
  ): Promise<FinanceTaxCurrencyResponse> {
    return api.get(
      withQuery(
        "/admin/finance/tax-currency-configuration",
        params,
      ),
    );
  },

  async updateTenantCurrencyConfig(
    payload: UpdateTenantCurrencyConfigPayload,
  ): Promise<FinanceTaxCurrencyResponse> {
    return api.post(
      "/admin/finance/tax-currency-configuration/tenant-currencies",
      payload,
    );
  },

  async getReportsAudit(
  params: FinanceReportsAuditQuery = {},
  ): Promise<FinanceReportsAuditResponse> {
    return api.get(
      withQuery(
        "/admin/finance/reports-import-export-audit",
        params,
      ),
    );
  },

  async downloadFinanceExport(params: FinanceExportQuery): Promise<Blob> {
    return api.download(withQuery("/admin/finance/reports-import-export-audit/export", params));
  },

  async getRefunds(
  params: FinanceRefundQuery = {},
  ): Promise<FinanceRefundsResponse> {
    return api.get(
      withQuery(
        "/admin/finance/refunds-compensation",
        params,
      ),
    );
  },

  async getRefund(id: number | string): Promise<FinanceRefundDetailResponse> {
    return api.get(`/admin/finance/refunds-compensation/${id}`);
  },

  async requestRefund(payload: FinanceRefundRequest): Promise<FinanceRefundDetailResponse> {
    return api.post("/admin/finance/refunds-compensation", payload);
  },

  async getCommissions(
  params: FinanceCommissionQuery = {},
  ): Promise<FinanceCommissionsResponse> {
    return api.get(
      withQuery(
        "/admin/finance/commissions-fees",
        params,
      ),
    );
  },

  async getCommission(
    id: number | string,
  ): Promise<FinanceCommissionDetailResponse> {
    return api.get(
      `/admin/finance/commissions-fees/${id}`,
    );
  },

  async submitCommissionForReview(
    id: number | string,
    payload: FinanceCommissionWorkflowPayload = {},
  ): Promise<FinanceCommissionDetailResponse> {
    return api.post(
      `/admin/finance/commissions-fees/${id}/submit-review`,
      payload,
    );
  },

  async approveCommission(
    id: number | string,
    payload: FinanceCommissionWorkflowPayload = {},
  ): Promise<FinanceCommissionDetailResponse> {
    return api.post(
      `/admin/finance/commissions-fees/${id}/approve`,
      payload,
    );
  },

  async settleCommission(
    id: number | string,
    payload: FinanceCommissionWorkflowPayload = {},
  ): Promise<FinanceCommissionDetailResponse> {
    return api.post(
      `/admin/finance/commissions-fees/${id}/settle`,
      payload,
    );
  },

  async cancelCommission(
    id: number | string,
    reason: string,
  ): Promise<FinanceCommissionDetailResponse> {
    return api.post(
      `/admin/finance/commissions-fees/${id}/cancel`,
      {
        reason,
      },
    );
  },

    async getInvoices(
    params: FinanceInvoiceQuery = {},
  ): Promise<FinanceInvoicesResponse> {
    return api.get(
      withQuery(
        "/admin/finance/invoices-notes",
        params,
      ),
    );
  },

  async getInvoice(
    id: number | string,
  ): Promise<FinanceInvoiceDetailResponse> {
    return api.get(
      `/admin/finance/invoices-notes/${id}`,
    );
  },

  async getRevenueReceivables(
  params: FinanceRevenueReceivableQuery = {},
  ): Promise<FinanceRevenueReceivablesResponse> {
    return api.get(
      withQuery(
        "/admin/finance/revenue-receivables",
        params,
      ),
    );
  },

  async createInvoiceFromOrder(
    orderReference: number | string,
  ): Promise<FinanceInvoiceMutationResponse> {
    const normalized = String(orderReference).trim();
    const isNumericId = /^\d+$/.test(normalized);

    return api.post(
      "/admin/finance/invoices-notes/from-order",
      isNumericId
        ? { order_id: Number(normalized) }
        : { order_number: normalized },
    );
  },

  async issueInvoice(
    id: number | string,
    payload: FinanceInvoiceWorkflowPayload = {},
  ): Promise<FinanceInvoiceMutationResponse> {
    return api.post(
      `/admin/finance/invoices-notes/${id}/issue`,
      payload,
    );
  },

  async cancelInvoice(
    id: number | string,
    reason: string,
  ): Promise<FinanceInvoiceMutationResponse> {
    return api.post(
      `/admin/finance/invoices-notes/${id}/cancel`,
      {
        reason,
      },
    );
  },

  async createInvoiceCreditNote(
  invoiceId: number | string,
  payload: FinanceInvoiceFinancialNoteCreatePayload,
  ): Promise<FinanceInvoiceFinancialNoteMutationResponse> {
    return api.post(
      `/admin/finance/invoices-notes/${invoiceId}/credit-notes`,
      payload,
    );
  },

  async createInvoiceDebitNote(
    invoiceId: number | string,
    payload: FinanceInvoiceFinancialNoteCreatePayload,
  ): Promise<FinanceInvoiceFinancialNoteMutationResponse> {
    return api.post(
      `/admin/finance/invoices-notes/${invoiceId}/debit-notes`,
      payload,
    );
  },

  async issueInvoiceFinancialNote(
    noteId: number | string,
    payload: FinanceInvoiceFinancialNoteWorkflowPayload = {},
  ): Promise<FinanceInvoiceFinancialNoteMutationResponse> {
    return api.post(
      `/admin/finance/invoices-notes/financial-notes/${noteId}/issue`,
      payload,
    );
  },

  async cancelInvoiceFinancialNote(
    noteId: number | string,
    reason: string,
  ): Promise<FinanceInvoiceFinancialNoteMutationResponse> {
    return api.post(
      `/admin/finance/invoices-notes/financial-notes/${noteId}/cancel`,
      {
        reason,
      },
    );
  },
};
