export type SupportPriority = "Low" | "Normal" | "High" | "Urgent" | "Critical";
export type SupportCaseStatus =
  | "Open"
  | "In Progress"
  | "Waiting for Customer"
  | "Waiting for Supplier"
  | "Waiting for Logistics"
  | "Waiting for Finance"
  | "Escalated"
  | "Resolved"
  | "Closed"
  | "Reopened";

export type CustomerSentiment = "Positive" | "Neutral" | "Concerned" | "Frustrated" | "Distressed";
export type CaseRiskLevel = "Low" | "Medium" | "High" | "Critical";
export type SlaStatus = "Within Target" | "4 Hours Remaining" | "At Risk" | "Breached" | "Completed";

export type SupportChannel = "In-App Chat" | "Email" | "Phone" | "WhatsApp" | "Web Portal" | "Social Media";

export interface SupportCaseItem {
  id: string; // Database internal ID (e.g. "8241")
  caseReference: string; // Public case reference (e.g. "CS-2026-008241")
  dbCaseId: string; // Same as id or DB reference string
  priority: SupportPriority;
  caseStatus: SupportCaseStatus;
  customerName: string;
  customerId: string; // e.g. "CUS-2026-01842"
  caseCategory: string; // e.g. "Delivery Issue", "Payment Issue", "Product Safety", "Return & Refund", "Authenticity"
  issueType: string; // e.g. "Shipment Not Dispatched", "Payment Deducted but Order Failed", "Skin Irritation", "Wrong Shade"
  channel: SupportChannel;
  subject: string;
  relatedOrderReference?: string;
  relatedOrderId?: string;
  relatedReturnReference?: string;
  relatedReturnId?: string;
  relatedShipmentReference?: string;
  relatedShipmentId?: string;
  relatedProductName?: string;
  relatedProductId?: string;
  supplierName?: string;
  supplierId?: string;
  sentiment: CustomerSentiment;
  riskLevel: CaseRiskLevel;
  slaStatus: SlaStatus;
  firstResponseDue: string;
  resolutionDue: string;
  assignedAgentName?: string;
  assignedAgentId?: string;
  assignedTeam?: string;
  lastCustomerMessage: string;
  lastUpdated: string;
  createdAt: string;
  isPriorityCase?: boolean;
  isSafetyComplaint?: boolean;
  isAuthenticityComplaint?: boolean;
}

export interface SupportCaseFilterParams {
  search?: string;
  status?: string;
  priority?: string;
  sla?: string;
  escalation?: string;
  category?: string;
  issueType?: string;
  channel?: string;
  customer?: string;
  assignedAgent?: string;
  assignedTeam?: string;
  supplier?: string;
  product?: string;
  orderStatus?: string;
  returnStatus?: string;
  shipmentStatus?: string;
  sentiment?: string;
  risk?: string;
  createdDate?: string;
  updatedDate?: string;
  slaDueDate?: string;
  quickFilter?: string;
  context?: string;
  orderId?: string;
  returnId?: string;
  shipmentId?: string;
  savedView?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface SupportCaseMetricSummary {
  totalOpenCases: number;
  newCasesToday: number;
  newCasesTodayTrendPercent?: number;
  unassignedCases: number;
  inProgress: number;
  waitingForCustomer: number;
  waitingForSupplier: number;
  waitingForLogistics: number;
  waitingForFinance: number;
  slaAtRisk: number;
  slaBreaches: number;
  escalatedCases: number;
  safetyComplaints: number;
  resolvedToday: number;
  customerSatisfaction: number; // percentage e.g. 91
}

export interface SupportOperationsHealthData {
  avgFirstResponseMinutes: number;
  avgResolutionHours: number;
  casesWithinSlaPercent: number;
  activeSlaBreaches: number;
  unassignedCases: number;
  escalatedCases: number;
  safetyCasesOpen: number;
  customerSatisfactionPercent: number;
}

export interface PriorityAlertData {
  id: string;
  type: string;
  alertTitle: string;
  caseReference: string;
  caseId: string;
  recommendedAction: string;
  actionLabel: string;
  tone: "danger" | "warning" | "info";
}

export interface AgentWorkloadItem {
  id: string;
  agentName: string;
  openCases: number;
  atRiskOrCritical: number;
  resolvedToday: number;
}

export interface QuickQueueItemData {
  id: string;
  label: string;
  caseReference: string;
  caseId: string;
}

export interface CustomerSentimentDistribution {
  positivePercent: number;
  neutralPercent: number;
  concernedPercent: number;
  frustratedPercent: number;
  distressedPercent: number;
}

export interface CaseMixCategory {
  label: string;
  percent: number;
}

export interface CreateSupportCaseDto {
  customerName: string;
  customerId?: string;
  caseCategory: string;
  issueType: string;
  channel: SupportChannel;
  subject: string;
  description: string;
  priority: SupportPriority;
  relatedOrderId?: string;
  relatedReturnId?: string;
  relatedShipmentId?: string;
  relatedProductName?: string;
  supplierName?: string;
  assignedAgentId?: string;
  assignedAgent?: string;
  assignedTeam?: string;
  slaTarget?: string;
}

export interface BulkAssignSupportCasesDto {
  caseIds: string[];
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedTeam?: string;
  reason?: string;
}

export interface BulkResponseDto {
  caseIds: string[];
  templateId?: string;
  message: string;
  internalNote?: string;
}

export interface SaveSupportViewDto {
  name: string;
  filters: SupportCaseFilterParams;
}

