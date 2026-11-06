import type { CaseDetailFullData } from '@/types/customerSupportDetail';

export const mockCaseDetail8241: CaseDetailFullData = {
  caseInfo: {
    id: '8241',
    caseReference: 'CS-2026-008241',
    dbCaseId: '8241',
    priority: 'High',
    caseStatus: 'In Progress',
    customerName: 'Elena Rodriguez',
    customerId: 'CUS-2026-01842',
    caseCategory: 'Delivery Issue',
    issueType: 'Shipment Not Dispatched',
    channel: 'In-App Chat',
    subject: 'Order has not been dispatched',
    relatedOrderReference: 'ORD-2026-009021',
    relatedOrderId: '009021',
    relatedShipmentReference: 'SHP-2026-010293',
    relatedShipmentId: '010293',
    relatedReturnReference: undefined,
    relatedReturnId: undefined,
    relatedProductName: 'Radiance Vitamin C Serum — 30 ml',
    relatedProductId: 'PRD-8842',
    supplierName: 'Luxe Distribution Pvt Ltd',
    supplierId: 'SUP-401',
    sentiment: 'Concerned',
    riskLevel: 'Medium',
    slaStatus: '4 Hours Remaining',
    firstResponseDue: 'Completed in 9 Minutes',
    resolutionDue: 'Jul 22, 2026 — 6:00 PM',
    assignedAgentName: 'Amaya Perera',
    assignedAgentId: 'AGT-102',
    assignedTeam: 'Customer Operations',
    lastCustomerMessage: "It's been 5 days and my order still shows 'Awaiting Fulfilment'.",
    lastUpdated: 'Jul 22, 2026 — 2:15 PM',
    createdAt: 'Jul 22, 2026 — 10:05 AM',
  },
  customerStatement:
    "It's been 5 days and my order still shows 'Awaiting Fulfilment'. I haven't received any updates or tracking information. Please check what's happening and let me know when I can expect my order.",

  lifecycleStages: [
    { stageNumber: 1, label: 'Case Created', status: 'completed', timestamp: 'Jul 22, 2026 — 10:05 AM', actor: 'System' },
    { stageNumber: 2, label: 'First Response Sent', status: 'completed', timestamp: 'Jul 22, 2026 — 10:14 AM', actor: 'Amaya Perera' },
    { stageNumber: 3, label: 'Agent Assigned', status: 'completed', timestamp: 'Jul 22, 2026 — 10:15 AM', actor: 'System Auto-Assign' },
    { stageNumber: 4, label: 'Investigation Started', status: 'active', timestamp: 'Jul 22, 2026 — 10:20 AM', actor: 'Amaya Perera' },
    { stageNumber: 5, label: 'External Team Contacted', status: 'pending' },
    { stageNumber: 6, label: 'Resolution Proposed', status: 'pending' },
    { stageNumber: 7, label: 'Customer Confirmation', status: 'pending' },
    { stageNumber: 8, label: 'Resolved', status: 'pending' },
    { stageNumber: 9, label: 'Closed', status: 'pending' },
  ],

  orderContext: {
    orderId: '009021',
    orderReference: 'ORD-2026-009021',
    orderStatus: 'Processing',
    paymentStatus: 'Paid',
    orderTotal: 'LKR 12,450.00',
    fulfilmentStatus: 'Awaiting Supplier Confirmation',
  },

  shipmentContext: {
    shipmentId: '010293',
    shipmentReference: 'SHP-2026-010293',
    shipmentStatus: 'Pickup Scheduled',
    pickupStatus: 'Scheduled',
    deliveryStatus: 'Not Dispatched',
    carrierName: 'Koombiyo Delivery',
  },

  supplierContext: {
    supplierId: 'SUP-401',
    supplierName: 'Luxe Distribution Pvt Ltd',
    fulfilmentReference: 'FUL-2026-004501',
    supplierStatus: 'Confirmed',
    operationalIssue: 'Driver not assigned',
  },

  checklistOwner: 'Amaya Perera',
  checklistStarted: 'Jul 22, 2026 — 10:20 AM',
  checklistDue: 'Before Jul 22, 2026 — 4:00 PM',

  checklist: [
    { id: 1, task: 'Confirm order payment', status: 'Completed', completedAt: 'Jul 22, 10:22 AM', completedBy: 'Amaya Perera' },
    { id: 2, task: 'Confirm supplier fulfilment', status: 'Completed', completedAt: 'Jul 22, 10:25 AM', completedBy: 'Amaya Perera' },
    { id: 3, task: 'Confirm package readiness', status: 'Completed', completedAt: 'Jul 22, 10:30 AM', completedBy: 'Amaya Perera' },
    { id: 4, task: 'Confirm carrier assignment', status: 'Completed', completedAt: 'Jul 22, 10:35 AM', completedBy: 'Amaya Perera' },
    { id: 5, task: 'Confirm driver assignment', status: 'Pending' },
    { id: 6, task: 'Confirm pickup window', status: 'Completed', completedAt: 'Jul 22, 10:40 AM', completedBy: 'Amaya Perera' },
    { id: 7, task: 'Send customer update', status: 'Pending' },
  ],

  messages: [
    {
      id: 'msg-1',
      senderName: 'Elena Rodriguez',
      senderRole: 'Customer',
      channel: 'In-App Chat',
      timestamp: 'Jul 22, 2026 — 10:05 AM',
      messageBody: "It's been 5 days and my order still shows 'Awaiting Fulfilment'. I haven't received any updates or tracking information. Please check what's happening and let me know when I can expect my order.",
      isCustomerVisible: true,
      deliveryStatus: 'Read',
    },
    {
      id: 'msg-2',
      senderName: 'Amaya Perera',
      senderRole: 'Support Agent',
      channel: 'In-App Chat',
      timestamp: 'Jul 22, 2026 — 10:14 AM',
      messageBody: "Hello Elena, thank you for reaching out to SL Beauty Customer Support. I am reviewing your order ORD-2026-009021 with our logistics team and supplier right now. I will update you as soon as I get the pickup timeline.",
      isCustomerVisible: true,
      deliveryStatus: 'Delivered',
    },
    {
      id: 'msg-3',
      senderName: 'System Bot',
      senderRole: 'System',
      channel: 'In-App Chat',
      timestamp: 'Jul 22, 2026 — 10:35 AM',
      messageBody: "Automated status check: Carrier Koombiyo Delivery confirmed package readiness for SHP-2026-010293. Awaiting driver dispatch assignment from carrier hub.",
      isCustomerVisible: false,
      deliveryStatus: 'Delivered',
    },
  ],

  internalNotes: [
    {
      id: 'note-1',
      authorName: 'Amaya Perera',
      authorRole: 'Senior Support Specialist',
      createdAt: 'Jul 22, 2026 — 10:25 AM',
      content: 'Contacted Luxe Distribution Pvt Ltd hub. Package is packed and ready. Koombiyo dispatch team informed. Waiting for driver assignment before 3:00 PM.',
      visibility: 'Internal Only',
      isPinned: true,
    },
    {
      id: 'note-2',
      authorName: 'Dilan Perera',
      authorRole: 'Logistics Liaison',
      createdAt: 'Jul 22, 2026 — 11:10 AM',
      content: 'Koombiyo central warehouse reports driver vehicle maintenance delay. Backup driver requested.',
      visibility: 'Internal Only',
    },
  ],

  attachments: [
    {
      id: 'att-1',
      fileName: 'Customer_Order_Receipt_ORD-009021.pdf',
      fileType: 'PDF Document',
      fileSize: '245 KB',
      uploadedBy: 'Elena Rodriguez',
      uploadedRole: 'Customer',
      uploadedAt: 'Jul 22, 2026 — 10:05 AM',
      isCustomerVisible: true,
      fileUrl: '#',
    },
    {
      id: 'att-2',
      fileName: 'Supplier_Dispatch_Manifest_FUL-004501.png',
      fileType: 'PNG Image',
      fileSize: '1.2 MB',
      uploadedBy: 'Amaya Perera',
      uploadedRole: 'Support Agent',
      uploadedAt: 'Jul 22, 2026 — 10:30 AM',
      isCustomerVisible: false,
      fileUrl: '#',
    },
  ],

  slaEvents: [
    { id: 'sla-1', eventType: 'Case Created', timestamp: 'Jul 22, 2026 — 10:05 AM', description: 'SLA 15-min First Response timer started.', status: 'Within Target' },
    { id: 'sla-2', eventType: 'First Response Sent', timestamp: 'Jul 22, 2026 — 10:14 AM', description: 'Agent responded in 9 minutes (Target: 15 mins).', status: 'Completed' },
    { id: 'sla-3', eventType: 'Resolution Due Warning', timestamp: 'Jul 22, 2026 — 2:00 PM', description: 'Resolution SLA remaining: 4 hours (Target: Jul 22, 6:00 PM).', status: '4 Hours Remaining' },
  ],

  escalationEvents: [],

  blockingIssues: [
    { id: 'blk-1', title: 'Driver not assigned', description: 'Carrier Koombiyo Delivery has not assigned a driver to pickup SHP-2026-010293.', severity: 'High', suggestedAction: 'Contact Carrier', actionType: 'contact-carrier', status: 'Active', createdAt: 'Jul 22, 10:35 AM' },
    { id: 'blk-2', title: 'Update not yet sent', description: 'Customer Elena Rodriguez is awaiting promised dispatch confirmation update.', severity: 'Medium', suggestedAction: 'Send Update', actionType: 'send-update', status: 'Active', createdAt: 'Jul 22, 11:30 AM' },
    { id: 'blk-3', title: 'Tracking scan missing', description: 'First origin warehouse barcode scan is pending.', severity: 'Medium', suggestedAction: 'Check Tracking', actionType: 'check-tracking', status: 'Active', createdAt: 'Jul 22, 12:00 PM' },
  ],

  auditEvents: [
    { id: 'aud-1', eventType: 'Case Created', actorName: 'Elena Rodriguez', actorRole: 'Customer', timestamp: 'Jul 22, 2026 — 10:05 AM', details: 'Case CS-2026-008241 created via In-App Chat.' },
    { id: 'aud-2', eventType: 'Agent Assigned', actorName: 'System Auto-Assign', actorRole: 'System', timestamp: 'Jul 22, 2026 — 10:10 AM', details: 'Assigned to Amaya Perera (Customer Operations team).' },
    { id: 'aud-3', eventType: 'First Response Sent', actorName: 'Amaya Perera', actorRole: 'Support Agent', timestamp: 'Jul 22, 2026 — 10:14 AM', details: 'First response message sent to customer.' },
    { id: 'aud-4', eventType: 'Internal Note Added', actorName: 'Amaya Perera', actorRole: 'Support Agent', timestamp: 'Jul 22, 2026 — 10:25 AM', details: 'Added note regarding supplier readiness.' },
    { id: 'aud-5', eventType: 'Checklist Task Completed', actorName: 'Amaya Perera', actorRole: 'Support Agent', timestamp: 'Jul 22, 2026 — 10:40 AM', details: 'Completed "Confirm pickup window" checklist task.' },
  ],

  metrics: {
    healthScore: 86,
    riskScore: 42,
    slaRemaining: '4 Hours',
    resolutionConfidencePercent: 74,
    evidenceCompletenessPercent: 65,
    customerSentiment: 'Concerned',
    repeatContactRisk: 'Low',
    escalationRisk: 'Medium',
  },

  recommendedAction: {
    text: 'Contact the carrier to confirm driver assignment and scheduled pickup. Once confirmed, send the customer an updated dispatch estimate.',
    recommendedOwner: 'Amaya Perera',
    dueBy: 'Before Jul 22, 2026 — 4:00 PM',
    disclaimer: 'Operational decision support — final action requires an authorized agent.',
  },
};

export function getMockCaseDetail(caseId: string): CaseDetailFullData | null {
  if (caseId === '8241' || caseId === 'CS-2026-008241') {
    return mockCaseDetail8241;
  }

  return null;
}
