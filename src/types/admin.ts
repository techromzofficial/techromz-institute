export type Tone="neutral"|"success"|"warning"|"danger";
export type PaymentStatus="Paid"|"Pending"|"Failed"|"Partially Paid"|"Refunded";
export type OrderStatus="Processing"|"On Hold"|"Shipped"|"Cancelled"|"Completed";
export type FulfilmentStatus="Awaiting Supplier"|"Partially Allocated"|"Packed"|"Completed";
export type DeliveryStatus="Not Dispatched"|"In Transit"|"Delivered"|"Delayed";
export type ReturnStatus="Requested"|"Eligibility Review"|"Approved"|"Received"|"Resolved";
export type InspectionStatus="Not Required"|"Pending"|"In Progress"|"Passed"|"Failed"|"Escalated";
export type RefundStatus="Not Required"|"Pending Review"|"Approved"|"Processing"|"Completed"|"Failed";
export type DisputeStatus="None"|"Open"|"Under Review"|"Escalated"|"Resolved";
export interface ActionCapabilities{permissions:{canApprove:boolean;canReject:boolean;canOverride:boolean;canRefund:boolean};availableActions:string[]}
export interface EntityBase{id:string;publicReference:string;status:string;risk?:string;assigned?:string}
export interface Supplier extends EntityBase{companyName:string;country:string;documents:number;brandAuthorizationId:string;supplierType:string;applicationDate:string;progress:number;capabilities:ActionCapabilities}
export interface Authorization extends EntityBase{brand:string;supplier:string;territory:string;type:string;expiry:string;conflictStatus:string;productId:string;capabilities:ActionCapabilities}
export interface Product extends EntityBase{name:string;variant:string;supplier:string;brand:string;authorizationId:string;completeness:number;compliance:string;batchId:string;capabilities:ActionCapabilities}
export interface Batch extends EntityBase{productId:string;product:string;location:string;available:number;reserved:number;quarantined:number;recalled:number;expiry:string;capabilities:ActionCapabilities}
export interface Order extends EntityBase{customer:string;paymentStatus:PaymentStatus;orderStatus:OrderStatus;fulfilmentStatus:FulfilmentStatus;allocationStatus:string;deliveryStatus:DeliveryStatus;supplier:string;returnId:string;capabilities:ActionCapabilities}
export interface ReturnCase extends EntityBase{orderId:string;orderReference:string;returnStatus:ReturnStatus;eligibilityStatus:string;inspectionStatus:InspectionStatus;refundStatus:RefundStatus;disputeStatus:DisputeStatus;sla:string;batchId:string;capabilities:ActionCapabilities}
export interface OrderDetailDto{id:string;public_reference:string;status:string;payment?:{status?:string};fulfilment_summary?:{status?:string};shipment_summary?:{delivery_status?:string};metrics?:{health_score?:number}}
export interface OrderDetailViewModel{id:string;publicReference:string;orderStatus:string;paymentStatus?:string;fulfilmentStatus?:string;deliveryStatus?:string;healthScore?:number}

export interface MarketplaceOrder {
  id: string;
  orderReference: string;
  dbOrderId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  orderDateTime: string;
  itemsCount: number;
  suppliersCount: number;
  splitOrder: boolean;
  orderTotal: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  fulfilmentStatus: string;
  batchAllocation: string;
  deliveryStatus: string;
  logisticsPartner?: string;
  riskLevel: string;
  slaStatus: string;
  assignedOfficer: string;
  supplierName?: string;
  brandName?: string;
  skuList?: string[];
  flags?: string[];
  isPriority?: boolean;
}

export interface MarketplaceOrderFilterParams {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  fulfilmentStatus?: string;
  deliveryStatus?: string;
  riskLevel?: string;
  slaStatus?: string;
  supplierId?: string;
  supplier?: string;
  brandId?: string;
  brand?: string;
  officer?: string;
  assignedOfficer?: string;
  logisticsPartner?: string;
  filterKey?: string;
  flags?: string[];
  page?: number;
  pageSize?: number;
}

export interface OrderMetricSummary {
  totalToday: number;
  pendingPayment: number;
  paymentFailed: number;
  processing: number;
  awaitingSupplier: number;
  readyForDispatch: number;
  inTransit: number;
  deliveredToday: number;
  cancelled: number;
  returnsInProgress: number;
  slaBreaches: number;
  highRiskOrders: number;
}

export interface PriorityAlertItem {
  id: string;
  type: string;
  orderReference?: string;
  orderId?: string;
  tone?: "warning" | "danger" | "info";
  shipmentReference?: string;
  severity?: "High" | "Medium" | "Low";
}

export interface PaymentSummaryMetrics {
  paidToday: string;
  pendingPayments: string;
  failedPayments: string;
  codPending: string;
  refundsPending: string;
}

export interface QuickQueueItem {
  id: string;
  label: string;
  orderReference?: string;
  orderId?: string;
  returnReference?: string;
  returnId?: string;
}

export interface AssignOrdersDto {
  orderIds: string[];
  officerId: string;
  officerName: string;
  note?: string;
}

export interface OrderCustomer {
  id: string;
  publicReference: string;
  name: string;
  email: string;
  phone: string;
  riskStatus: string;
  customerSince: string;
  totalOrders: number;
  successfulOrders: number;
  returns: number;
  openComplaints: number;
  loyaltyTier: string;
  avatarUrl: string;
}

export interface SupplierFulfilment {
  id: string;
  fulfilmentReference: string;
  supplierName: string;
  confirmationStatus: string;
  confirmedAt?: string;
  awaitingSince?: string;
  itemsAssigned: number;
  itemsReady: number;
  slaRemaining?: string;
  shipmentStatus: string;
  allocationStatus: string;
}

export interface OrderItem {
  id: string;
  sku: string;
  name: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierId: string;
  supplierName: string;
  allocationStatus: string;
  batchId?: string;
}

export interface OrderTimelineStage {
  step: number;
  label: string;
  status: "completed" | "in-progress" | "partially-complete" | "not-started";
  timestamp?: string;
  note?: string;
}

export interface DeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  deliveryInstructions?: string;
  addressType: string;
  lat?: number;
  lng?: number;
}

export interface OrderSource {
  channel: string;
  campaign?: string;
  referralSource?: string;
  device?: string;
  externalReference?: string;
  fraudScreeningStatus: string;
}

export interface OrderFinancials {
  currency: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  orderTotal: number;
  paid: number;
  refunded: number;
  outstanding: number;
  platformCommission: number;
  supplierPayable: number;
  captured: number;
}

export interface OrderBlockingIssue {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  message: string;
  timeImpact?: string;
  actionLabel: string;
  actionTab: string;
}

export interface OrderReturnSummary {
  hasActiveReturn: boolean;
  returnId?: string;
  returnReference?: string;
  returnStatus?: string;
  eligibilityStatus?: string;
  inspectionRequired?: boolean;
  inspectionStatus?: string;
  refundStatus?: string;
  disputeStatus?: string;
  reverseLogisticsStatus?: string;
  returnReason?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
  reason?: string;
}

export interface OrderPermissions {
  canViewOrder: boolean;
  canUpdateStatus: boolean;
  canHoldOrder: boolean;
  canCancelOrder: boolean;
  canContactCustomer: boolean;
  canContactSuppliers: boolean;
  canStartRefundReview: boolean;
  canStartReturnReview: boolean;
  canEscalateOrder: boolean;
  canOverrideInspection: boolean;
  canViewFinancialReconciliation: boolean;
  canViewAuditHistory: boolean;
}

export interface OrderDetail {
  id: string;
  orderReference: string;
  dbOrderId: string;
  createdAt: string;
  orderDateTime: string;
  customerReference: string;
  customer: OrderCustomer;
  channel: string;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  fulfilmentStatus: string;
  deliveryStatus: string;
  riskLevel: string;
  slaStatus: string;
  slaHoursRemaining: number;
  itemsCount: number;
  suppliersCount: number;
  splitOrder: boolean;
  assignedOfficer: string;
  healthScore: number;
  riskScore: number;
  allocationPercentage: number;
  itemsAllocated: number;
  readinessStatus: string;
  supplierSlaRemaining: string;
  items: OrderItem[];
  supplierFulfilments: SupplierFulfilment[];
  timeline: OrderTimelineStage[];
  deliveryAddress: DeliveryAddress;
  source: OrderSource;
  financials: OrderFinancials;
  blockingIssues: OrderBlockingIssue[];
  recommendations: Array<{ id: string; text: string }>;
  returnSummary: OrderReturnSummary;
  auditHistory: AuditEntry[];
  permissions: OrderPermissions;
}

export interface ReturnCaseItem {
  id: string;
  returnReference: string;
  dbReturnId: string;
  orderReference: string;
  dbOrderId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  productName: string;
  productVariant?: string;
  productSku: string;
  supplierName: string;
  quantity: number;
  returnType: string;
  reasonCategory: string;
  conditionReported: string;
  eligibilityStatus: string;
  inspectionStatus: string;
  refundStatus: string;
  disputeStatus: string;
  riskLevel: string;
  slaStatus: string;
  assignedOfficer: string;
  openedDate: string;
  dueDate?: string;
  refundAmount?: number;
  currency?: string;
  isPriority?: boolean;
  hasSafetyComplaint?: boolean;
  hasAuthenticityComplaint?: boolean;
  hasDeliveryDamage?: boolean;
  hasEvidenceRequired?: boolean;
}

export interface ReturnFilterParams {
  search?: string;
  returnStatus?: string;
  refundStatus?: string;
  inspectionStatus?: string;
  disputeStatus?: string;
  returnType?: string;
  reasonCategory?: string;
  supplier?: string;
  brand?: string;
  productCategory?: string;
  logisticsPartner?: string;
  riskLevel?: string;
  assignedOfficer?: string;
  openedDate?: string;
  dueDate?: string;
  quickFilter?: string;
  orderId?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface ReturnsMetricSummary {
  newReturnRequests: number;
  evidenceRequired: number;
  eligibilityReview: number;
  returnApproved: number;
  pickupScheduled: number;
  inspectionPending: number;
  refundApproval: number;
  refundProcessing: number;
  rejected: number;
  escalated: number;
  authenticityComplaints: number;
  safetyComplaints: number;
  slaBreaches: number;
  monthlyRefundValue: string;
}

export interface ReturnsOperationsHealth {
  avgResolutionTime: string;
  casesWithinSLA: string;
  casesBreachingSLA: number;
  inspectionBacklog: number;
  refundDecisionsPending: number;
  unassignedHighRiskCases: number;
}

export interface PriorityAlert {
  id: string;
  category: string;
  reference: string;
  targetType: "return" | "customer";
  returnId?: string;
  severity: "high" | "critical" | "medium";
}

export interface RefundPerformanceMetrics {
  avgRefundResolution: string;
  approvalRate: string;
  rejectionRate: string;
  partialRefundRate: string;
  supplierRecoveryPending: string;
  partialRefundValue: string;
}



export interface LiabilitySummary {
  supplierLiability: string;
  logisticsLiability: string;
  platformLiability: string;
  customerLiability: string;
  recoveryPending: string;
}

export interface BulkAssignReturnsDto {
  returnIds: string[];
  officerName: string;
  teamName?: string;
  reason: string;
  note?: string;
}

export interface SaveReturnViewDto {
  name: string;
  isDefault?: boolean;
  filters: ReturnFilterParams;
}

export interface CaseSummaryData {
  customerStatement: string;
  previousClaimsCount: number;
  safetyComplaint: boolean;
  claimCategory: string;
  authenticityComplaint: boolean;
  reportedCondition: string;
  deliveryDamageSuspected: string;
  productHygieneSensitivity: string;
  customerRiskProfile: string;
}

export interface LifecycleStage {
  step: number;
  title: string;
  status: "Completed" | "In Progress" | "Pending Inspection Decision" | "Not Started" | "Blocked" | "Failed";
  timestamp?: string;
  note?: string;
}

export interface OriginalOrderSummaryData {
  orderReference: string;
  dbOrderId: string;
  orderDate: string;
  orderTotal: string;
  paymentStatus: string;
  deliveryStatus: string;
  supplierName: string;
  productName: string;
  orderedQuantity: number;
  returnedQuantity: number;
}

export interface CustomerProfileData {
  customerName: string;
  customerId: string;
  email: string;
  phone: string;
  customerSince: string;
  totalOrders: number;
  successfulOrders: number;
  previousReturns: number;
  openDisputes: number;
  repeatClaimRisk: string;
}

export interface InternalHealthMetricsData {
  caseHealthScore: number;
  riskScore: number;
  riskLevel: string;
  evidenceCompleteness: number;
  eligibilityConfidence: number;
  inspectionReadiness: number;
  refundExposure: string;
}

export interface InternalCaseNoteItem {
  id: string;
  type: string;
  author: string;
  role: string;
  createdAt: string;
  visibility: string;
  content: string;
  lastUpdated: string;
}

export interface ReturnedItemDetail {
  id: string;
  productName: string;
  variant: string;
  productId: string;
  sku: string;
  batchNumber: string;
  supplierName: string;
  orderedQuantity: number;
  returnedQuantity: number;
  unitPrice: number;
  discountAllocation: number;
  taxAllocation: number;
  reportedCondition: string;
  receivedCondition: string;
  returnReason: string;
  inspectionRequirement: string;
  itemEligibility: string;
  itemRefundAmount: number;
}

export interface CustomerEvidenceItem {
  id: string;
  title: string;
  type: "image" | "video" | "document" | "statement";
  url: string;
  uploadDate: string;
  category: string;
  verificationStatus: "Verified" | "Pending" | "Insufficient" | "Rejected";
  reviewer?: string;
  notes?: string;
}

export interface EligibilityAssessmentData {
  returnWindowResult: string;
  productCategoryRules: string;
  hygieneRestrictions: string;
  usageRestrictions: string;
  productConditionCheck: string;
  orderDeliveryState: string;
  previousReturnHistoryCheck: string;
  productDefectAssessment: string;
  safetyException: string;
  authenticityException: string;
  manualReviewResult: string;
  eligibilityConfidence: number;
  eligibilityDecision: string;
  decisionReason: string;
}

export interface ProductInspectionData {
  inspectionRequirement: string;
  inspectionType: string;
  inspectionFacility: string;
  assignedInspector: string;
  scheduledDate: string;
  receivedDate: string;
  inspectionStart?: string;
  inspectionCompletion?: string;
  conditionFindings: string;
  packagingFindings: string;
  sealIntegrity: string;
  leakageFindings: string;
  productTexture: string;
  productAuthenticity: string;
  hygieneResult: string;
  batchResult: string;
  inspectorConclusion: string;
}

export interface BatchAuthenticityRecordData {
  batchNumber: string;
  productionDate: string;
  expiryDate: string;
  supplierBatchReference: string;
  inventoryBatchRecordId: string;
  fulfilmentBatchId: string;
  authenticityResult: string;
  serialQrVerification: string;
  packagingVerification: string;
  supplierResponse: string;
  otherComplaintsForBatchCount: number;
  quarantineStatus: string;
  recallStatus: string;
}

export interface RefundCalculationData {
  productSubtotal: number;
  productDiscount: number;
  tax: number;
  shipping: number;
  usedPromotionalValue: number;
  loyaltyCredits: number;
  previousRefunds: number;
  maxRefundableAmount: number;
  requestedRefund: number;
  recommendedRefund: number;
  approvedRefund: number;
  refundMethod: string;
  currency: string;
  financialExposure: string;
}

export interface LiabilityAllocation {
  responsibleParty: string;
  percentage: number;
  reason: string;
  recoverableAmount: number;
  recoveryStatus: string;
  recoveryReference: string;
  dueDate: string;
}

export interface ResponsibilityRecoveryData {
  supplierRecovery: LiabilityAllocation;
  logisticsClaim: LiabilityAllocation;
  platformLiability: LiabilityAllocation;
  customerLiability: LiabilityAllocation;
}

export interface ReturnLogisticsData {
  pickupEligibility: string;
  pickupStatus: string;
  logisticsPartner: string;
  pickupAddress: string;
  scheduledPickupDate: string;
  trackingReference: string;
  pickupCompletedDate?: string;
  itemReceivedDate?: string;
  receivingWarehouse: string;
  receivingCondition: string;
  returnShippingCost: number;
}

export interface ReturnCommunicationItem {
  id: string;
  sender: string;
  recipient: string;
  channel: string;
  subject: string;
  message: string;
  timestamp: string;
  deliveryStatus: string;
  visibility: string;
}

export interface OperationalIssueItem {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  category: string;
  title: string;
  description: string;
  targetTab: string;
  actionLabel: string;
}

export interface AuditEventItem {
  id: string;
  event: string;
  previousValue?: string;
  newValue?: string;
  actingUser: string;
  role: string;
  mandatoryReason: string;
  timestamp: string;
  source: string;
}

export interface BlockingIssue {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  targetTab: string;
  actionLabel: string;
}

export interface RecommendedDecisionData {
  decision: string;
  recommendedResolution: string;
  recommendedResponsibleParty: string;
  recommendedRecovery: string;
}

export interface CaseDecisionPanelData {
  health: InternalHealthMetricsData;
  blockingIssues: BlockingIssue[];
  recommendation: RecommendedDecisionData;
  canApproveFullRefund: boolean;
  approveFullRefundDisabledMessage?: string;
}

export interface ReturnCaseDetails extends ReturnCaseItem {
  publicReference: string;
  dbReturnId: string;
  orderReference: string;
  dbOrderId: string;
  returnType: string;
  returnStatus: string;
  productName: string;
  productId: string;
  sku: string;
  supplierName: string;
  quantity: number;
  batchNumber: string;
  batchId: string;
  assignedOfficer: string;
  reasonCategory: string;
  summary: CaseSummaryData;
  lifecycle: LifecycleStage[];
  originalOrder: OriginalOrderSummaryData;
  customerProfile: CustomerProfileData;
  healthMetrics: InternalHealthMetricsData;
  internalCaseNote: InternalCaseNoteItem;
  decisionPanel: CaseDecisionPanelData;
  returnedItems: ReturnedItemDetail[];
  evidenceList: CustomerEvidenceItem[];
  eligibilityAssessment: EligibilityAssessmentData;
  productInspection: ProductInspectionData;
  batchAuthenticity: BatchAuthenticityRecordData;
  refundCalculation: RefundCalculationData;
  responsibilityRecovery: ResponsibilityRecoveryData;
  returnLogistics: ReturnLogisticsData;
  communications: ReturnCommunicationItem[];
  operationalIssues: OperationalIssueItem[];
  auditHistory: AuditEventItem[];
}

// Logistics Operations uses a richer view model than the existing Logistics Hub.
// Both are retained because they represent separate Admin screens.
export interface LogisticsShipment {
  id: string;
  publicReference: string;
  dbShipmentId: string;
  orderReference: string;
  status: string;
  pickupStatus: string;
  deliveryStatus: string;
  packageStatus: string;
  codStatus: string;
  riskLevel: string;
  slaStatus: string;
  carrier: string;
  customerName: string;
  destination: string;
  flags?: string[];
  isPriority?: boolean;
}

export interface ShipmentFilterParams {
  search?: string;
  shipmentStatus?: string;
  pickupStatus?: string;
  deliveryStatus?: string;
  packageStatus?: string;
  codStatus?: string;
  riskLevel?: string;
  slaStatus?: string;
  carrier?: string;
  filterKey?: string;
  page?: number;
  pageSize?: number;
}

export interface ShipmentMetrics {
  totalActive: number;
  pendingPickup: number;
  inTransit: number;
  outForDelivery?: number;
  deliveredToday: number;
  exceptions: number;
  slaBreaches?: number;
  highRisk?: number;
}

export interface ShipmentLifecycleStage {
  id: string;
  name: string;
  status: "completed" | "active" | "failed" | "pending";
  timestamp?: string;
}

export interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  description: string;
  status: string;
  isException?: boolean;
}

export interface ShipmentRelatedEntities {
  orderId: string;
  orderReference: string;
  customerId: string;
  customerName: string;
  supplierId: string;
  supplierName: string;
  carrierId: string;
  carrierName: string;
  batchId: string;
  returnId?: string;
}

export interface ShipmentDecisionMetrics {
  healthScore: number;
  confidenceLevel: string;
  riskLevel: string;
  slaStatus: string;
  slaTimeRemaining: string;
}

export interface ShipmentCapabilities {
  canConfirmPickup: boolean;
  canChangeCarrier: boolean;
  canMarkException: boolean;
  canCancel: boolean;
}

export interface ShipmentDetailViewModel {
  shipment: LogisticsShipment;
  lifecycle: ShipmentLifecycleStage[];
  tracking: TrackingEvent[];
  related: ShipmentRelatedEntities;
  metrics: ShipmentDecisionMetrics;
  capabilities: ShipmentCapabilities;
}


