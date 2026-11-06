import type {
  SupportCaseItem,
  SupportPriority,
  SupportCaseStatus,
  CustomerSentiment,
  CaseRiskLevel,
  SlaStatus,
  SupportChannel,
} from './customerSupport';

export type CaseTabType =
  | 'overview'
  | 'conversation'
  | 'customer-context'
  | 'related-records'
  | 'evidence'
  | 'investigation'
  | 'sla-escalation'
  | 'resolution'
  | 'internal-notes'
  | 'communications'
  | 'operational-issues'
  | 'audit-history';

export interface LifecycleStage {
  stageNumber: number;
  label: string;
  status: 'completed' | 'active' | 'pending';
  timestamp?: string;
  actor?: string;
}

export interface OrderContextData {
  orderId: string;
  orderReference: string;
  orderStatus: string;
  paymentStatus: string;
  orderTotal: string;
  fulfilmentStatus: string;
}

export interface ShipmentContextData {
  shipmentId: string;
  shipmentReference: string;
  shipmentStatus: string;
  pickupStatus: string;
  deliveryStatus: string;
  carrierName: string;
}

export interface ReturnContextData {
  returnId: string;
  returnReference: string;
  returnStatus: string;
  refundStatus: string;
  reason: string;
}

export interface SupplierContextData {
  supplierId: string;
  supplierName: string;
  fulfilmentReference: string;
  supplierStatus: string;
  operationalIssue: string;
}

export interface ChecklistItem {
  id: number;
  task: string;
  status: 'Completed' | 'Pending' | 'In Progress' | 'Blocked' | 'N/A';
  completedAt?: string;
  completedBy?: string;
}

export interface ConversationMessage {
  id: string;
  senderName: string;
  senderRole: 'Customer' | 'Support Agent' | 'System' | 'Supplier';
  senderAvatar?: string;
  channel: SupportChannel;
  timestamp: string;
  messageBody: string;
  isCustomerVisible: boolean;
  attachments?: { name: string; url: string; size: string }[];
  deliveryStatus?: 'Delivered' | 'Read' | 'Sent';
}

export interface InternalNoteItem {
  id: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  content: string;
  visibility: 'Internal Only' | 'Team Leads Only';
  isPinned?: boolean;
}

export interface AttachmentItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  uploadedBy: string;
  uploadedRole: string;
  uploadedAt: string;
  isCustomerVisible: boolean;
  fileUrl: string;
}

export interface SlaEventItem {
  id: string;
  eventType: string;
  timestamp: string;
  description: string;
  status: 'Within Target' | '4 Hours Remaining' | 'At Risk' | 'Breached' | 'Completed' | 'Paused';
}

export interface EscalationEventItem {
  id: string;
  timestamp: string;
  level: string;
  escalatedBy: string;
  escalatedTo: string;
  reason: string;
  status: 'Active' | 'Resolved';
}

export interface BlockingIssueItem {
  id: string;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Critical';
  suggestedAction: string;
  actionType: 'contact-carrier' | 'send-update' | 'check-tracking' | 'other';
  status: 'Active' | 'Resolved';
  createdAt: string;
}

export interface AuditEventItem {
  id: string;
  eventType: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface CaseHealthMetrics {
  healthScore: number;
  riskScore: number;
  slaRemaining: string;
  resolutionConfidencePercent: number;
  evidenceCompletenessPercent: number;
  customerSentiment: CustomerSentiment;
  repeatContactRisk: 'Low' | 'Medium' | 'High';
  escalationRisk: 'Low' | 'Medium' | 'High';
}

export interface CaseDetailFullData {
  caseInfo: SupportCaseItem;
  customerStatement: string;
  lifecycleStages: LifecycleStage[];
  orderContext?: OrderContextData;
  shipmentContext?: ShipmentContextData;
  returnContext?: ReturnContextData;
  supplierContext?: SupplierContextData;
  checklist: ChecklistItem[];
  checklistOwner: string;
  checklistStarted: string;
  checklistDue: string;
  messages: ConversationMessage[];
  internalNotes: InternalNoteItem[];
  attachments: AttachmentItem[];
  slaEvents: SlaEventItem[];
  escalationEvents: EscalationEventItem[];
  blockingIssues: BlockingIssueItem[];
  auditEvents: AuditEventItem[];
  metrics: CaseHealthMetrics;
  recommendedAction: {
    text: string;
    recommendedOwner: string;
    dueBy: string;
    disclaimer: string;
  };
}

