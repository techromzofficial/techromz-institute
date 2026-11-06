// Case detail mock data for the Velvet Botanics (supplier-uuid-003) rich case detail view
// Mirrors the caseDetailOverrides from _merge_source/lib/mockData.js, adapted to the
// frontend supplier IDs from fixtures.ts

export interface WorkflowStage {
  label: string;
  sublabel: string;
  state: 'complete' | 'active' | 'locked';
}

export interface ChecklistItem {
  name: string;
  shortLabel: string;
  status: 'Approved' | 'Pending Review' | 'Rejected' | 'Missing';
  note?: string;
}

export interface ChecklistGroup {
  category: string;
  items: ChecklistItem[];
}

export interface BlockingIssue {
  id: number;
  title: string;
  detail: string | null;
  severity: 'high' | 'low';
}

export interface CommunicationEntry {
  id: number;
  from: string;
  date: string;
  subject: string;
  preview: string;
}

export interface AuditEntry {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

export interface OfficerRecommendation {
  quote: string;
  officerName: string;
  date: string;
}

export interface CaseDetail {
  internalId: string;
  publicReference: string;
  name: string;
  type: string;
  date: string;
  progress: number;
  status: string;
  riskLevel: string;
  legalName: string;
  tradingName: string;
  registrationNumber: string;
  taxId: string;
  registeredAddress: string;
  directors: string[];
  classification: string;
  processingDays: number;
  riskScore: number;
  checklist: ChecklistGroup[];
  workflow: WorkflowStage[];
  blockingIssues: BlockingIssue[];
  approvalConditions: string[];
  communicationHistory: CommunicationEntry[];
  auditHistory: AuditEntry[];
  officerRecommendation: OfficerRecommendation | null;
  mediaAsset: { title: string; subtitle: string } | null;
}

export type CurrentUser = {
  name: string;
  role: string;
  capabilities: string[];
};

export const currentUser: CurrentUser = {
  name: 'Elena Vance',
  role: 'Lead Compliance Officer',
  capabilities: [
    'approve_supplier',
    'approve_with_conditions',
    'request_info',
    'reject_supplier',
    'suspend_review',
  ],
};

const genericChecklistTemplate: { category: string; items: { name: string; shortLabel: string }[] }[] = [
  {
    category: 'Company Documents',
    items: [
      { name: 'Business Registration', shortLabel: 'Business Reg' },
      { name: 'Tax Certificate', shortLabel: 'Tax Cert' },
      { name: 'ID Verification', shortLabel: 'ID' },
    ],
  },
  {
    category: 'Commercial Verification',
    items: [
      { name: 'Warehouse Lease', shortLabel: 'Warehouse Lease' },
      { name: 'Utility Bills', shortLabel: 'Utility Bills' },
      { name: 'Insurance Certificate', shortLabel: 'Insurance Cert' },
    ],
  },
  {
    category: 'Brand Verification',
    items: [
      { name: 'Trademark Certificate', shortLabel: 'Trademark Cert' },
      { name: 'Brand Authorization Letter', shortLabel: 'Brand Auth Letter' },
    ],
  },
  {
    category: 'Product Compliance',
    items: [
      { name: 'MSDS', shortLabel: 'MSDS' },
      { name: 'Lab Results', shortLabel: 'Lab Results' },
      { name: 'Ingredients Declaration', shortLabel: 'Ingredients' },
    ],
  },
  {
    category: 'Finance Verification',
    items: [
      { name: 'Bank Verification', shortLabel: 'Bank Verification' },
      { name: 'Settlement Details', shortLabel: 'Settlement Details' },
      { name: 'Tax Compliance', shortLabel: 'Tax Compliance' },
    ],
  },
  {
    category: 'Risk Assessment',
    items: [
      { name: 'Risk Questionnaire', shortLabel: 'Risk Questionnaire' },
      { name: 'Background Check', shortLabel: 'Background Check' },
    ],
  },
];

const workflowStageLabels = [
  'Application Submitted',
  'Initial Business Review',
  'Document Verification',
  'Brand Auth Review',
  'Risk Assessment',
  'Final Approval',
  'Marketplace Activation',
];

function deriveRiskScore(riskLevel: string): number {
  if (riskLevel === 'Low') return 18;
  if (riskLevel === 'Medium') return 46;
  return 78;
}

function buildDefaultCaseDetail(supplier: {
  internalId: string;
  publicReference: string;
  name: string;
  type: string;
  date: string;
  progress: number;
  status: string;
  riskLevel: string;
}): CaseDetail {
  const totalItems = genericChecklistTemplate.reduce(
    (sum, group) => sum + group.items.length,
    0
  );
  const approvedCount = Math.min(
    totalItems - 1,
    Math.max(1, Math.round((supplier.progress / 100) * totalItems))
  );

  let seen = 0;
  const blockingIssues: BlockingIssue[] = [];
  const checklist: ChecklistGroup[] = genericChecklistTemplate.map((group) => ({
    category: group.category,
    items: group.items.map((item) => {
      seen += 1;
      const status: ChecklistItem['status'] =
        seen <= approvedCount
          ? 'Approved'
          : seen === approvedCount + 1
          ? 'Pending Review'
          : 'Missing';
      const entry: ChecklistItem = { ...item, status };
      if (status === 'Missing') {
        blockingIssues.push({
          id: blockingIssues.length + 1,
          title: `${item.name} not yet submitted.`,
          detail: `Required for ${group.category.toLowerCase()}.`,
          severity: 'high',
        });
      }
      return entry;
    }),
  }));

  const workflow: WorkflowStage[] = workflowStageLabels.map((label, index) => {
    const stageThreshold = ((index + 1) / workflowStageLabels.length) * 100;
    const prevThreshold = (index / workflowStageLabels.length) * 100;
    let state: WorkflowStage['state'] = 'locked';
    if (supplier.progress >= stageThreshold) state = 'complete';
    else if (supplier.progress >= prevThreshold) state = 'active';
    return {
      label,
      sublabel:
        state === 'complete'
          ? 'Completed'
          : state === 'active'
          ? 'In Progress'
          : 'Pending',
      state,
    };
  });

  return {
    internalId: supplier.internalId,
    publicReference: supplier.publicReference,
    name: supplier.name,
    type: supplier.type,
    date: supplier.date,
    progress: supplier.progress,
    status: supplier.status,
    riskLevel: supplier.riskLevel,
    legalName: supplier.name,
    tradingName: supplier.name,
    registrationNumber: 'On file',
    taxId: 'On file',
    registeredAddress: 'Address on file',
    directors: ['On file'],
    classification: supplier.type,
    processingDays: Math.max(1, Math.round((100 - supplier.progress) / 15)),
    riskScore: deriveRiskScore(supplier.riskLevel),
    checklist,
    workflow,
    blockingIssues,
    approvalConditions: [],
    communicationHistory: [],
    auditHistory: [
      {
        id: 1,
        timestamp: supplier.date,
        actor: 'System',
        action: 'Application submitted',
        detail: 'Initial application received via supplier portal.',
      },
    ],
    officerRecommendation: null,
    mediaAsset: null,
  };
}

// Supplier list (mirrors _merge_source mockData.js suppliers,
// using the same internalId keys for case detail lookups)
export const verificationSuppliers = [
  { internalId: 'sup_1001', publicReference: 'SUP-9821-V', name: 'Velvet Botanics Ltd.', type: 'Brand Owner', date: 'Oct 24, 2023', progress: 75, status: 'Under Review', riskLevel: 'Low' },
  { internalId: 'sup_1002', publicReference: 'SUP-1044-P', name: 'Pacific Global Dist.', type: 'Auth. Distributor', date: 'Oct 26, 2023', progress: 40, status: 'Additional Info Required', riskLevel: 'Low' },
  { internalId: 'sup_1003', publicReference: 'SUP-7743-A', name: 'Aura Beauty', type: 'Brand Owner', date: 'Oct 20, 2023', progress: 100, status: 'Approved', riskLevel: 'Low' },
  { internalId: 'sup_1004', publicReference: 'SUP-6650-N', name: "Nature's Secret", type: 'Brand Owner', date: 'Oct 18, 2023', progress: 65, status: 'Under Review', riskLevel: 'Medium' },
  { internalId: 'sup_1005', publicReference: 'SUP-3321-S', name: 'Spa Ceylon', type: 'Brand Owner', date: 'Oct 15, 2023', progress: 100, status: 'Approved', riskLevel: 'Low' },
  { internalId: 'sup_1006', publicReference: 'SUP-2290-L', name: 'LuxeSkin Wholesale', type: 'Wholesaler', date: 'Nov 2, 2023', progress: 90, status: 'Approved', riskLevel: 'High' },
  { internalId: 'sup_1007', publicReference: 'SUP-5567-T', name: 'Tokyo Beauty Co.', type: 'Auth. Distributor', date: 'Nov 5, 2023', progress: 75, status: 'Under Review', riskLevel: 'Medium' },
  { internalId: 'sup_1008', publicReference: 'SUP-8812-C', name: 'Ceylon Botanicals', type: 'Manufacturer', date: 'Oct 30, 2023', progress: 20, status: 'Rejected', riskLevel: 'High' },
  { internalId: 'sup_1009', publicReference: 'SUP-4471-W', name: 'Ceylon Wellness Co.', type: 'Brand Owner', date: 'Nov 8, 2023', progress: 10, status: 'New', riskLevel: 'Low' },
  { internalId: 'sup_1010', publicReference: 'SUP-9902-H', name: 'Herbal Lanka', type: 'Manufacturer', date: 'Sep 12, 2023', progress: 55, status: 'Suspended', riskLevel: 'High' },
];

// Hand-authored rich detail for the Velvet Botanics case (matches the screenshots)
const caseDetailOverrides: Record<string, Partial<CaseDetail>> = {
  sup_1001: {
    legalName: 'Velvet Botanics International Ltd.',
    tradingName: 'Velvet Botanics',
    registrationNumber: 'UK-882931-B',
    taxId: 'GB 921 003 442',
    registeredAddress: '14-16 Mayfair Square, London, W1J 8HT, United Kingdom',
    directors: ['Marcus Thorne', 'Sarah Jenkins'],
    classification: 'Brand Owner',
    processingDays: 5,
    riskScore: 12,
    checklist: [
      {
        category: 'Company Documents',
        items: [
          { name: 'Business Registration', shortLabel: 'Business Reg.', status: 'Approved' },
          { name: 'Tax Certificate', shortLabel: 'Tax Cert', status: 'Approved' },
          { name: 'ID Verification', shortLabel: 'ID', status: 'Approved' },
        ],
      },
      {
        category: 'Commercial Verification',
        items: [
          { name: 'Warehouse Lease', shortLabel: 'Warehouse Lease', status: 'Pending Review' },
          { name: 'Utility Bills', shortLabel: 'Utility Bills', status: 'Pending Review' },
          { name: 'Insurance Certificate', shortLabel: 'Insurance Cert', status: 'Pending Review' },
        ],
      },
      {
        category: 'Brand Verification',
        items: [
          { name: 'Trademark Certificate', shortLabel: 'Trademark Cert', status: 'Approved' },
          { name: 'Brand Authorization Letter', shortLabel: 'Brand Auth Letter', status: 'Approved' },
        ],
      },
      {
        category: 'Product Compliance',
        items: [
          { name: 'MSDS - Rosehip Glow Serum', shortLabel: 'MSDS', status: 'Rejected', note: 'Safety data sheet is required for all skincare products.' },
          { name: 'Lab Results', shortLabel: 'Lab Results', status: 'Approved' },
          { name: 'Ingredients Declaration', shortLabel: 'Ingredients', status: 'Approved' },
        ],
      },
      {
        category: 'Finance Verification',
        items: [
          { name: 'Bank Verification', shortLabel: 'Bank Verification', status: 'Approved' },
          { name: 'Settlement Details', shortLabel: 'Settlement Details', status: 'Approved' },
          { name: 'Tax Compliance', shortLabel: 'Tax Compliance', status: 'Approved' },
        ],
      },
      {
        category: 'Risk Assessment',
        items: [
          { name: 'Risk Questionnaire', shortLabel: 'Risk Questionnaire', status: 'Approved' },
          { name: 'Background Check', shortLabel: 'Background Check', status: 'Approved' },
        ],
      },
    ],
    workflow: [
      { label: 'Application Submitted', sublabel: 'Oct 24, 09:12 AM', state: 'complete' },
      { label: 'Initial Business Review', sublabel: 'Oct 25, 14:30 PM', state: 'complete' },
      { label: 'Document Verification', sublabel: 'In Progress', state: 'active' },
      { label: 'Brand Auth Review', sublabel: 'Pending', state: 'locked' },
      { label: 'Risk Assessment', sublabel: 'Pending', state: 'locked' },
      { label: 'Final Approval', sublabel: 'Pending', state: 'locked' },
      { label: 'Marketplace Activation', sublabel: 'Pending', state: 'locked' },
    ],
    blockingIssues: [
      { id: 1, title: 'MSDS for "Rosehip Glow Serum" missing.', detail: 'Safety data sheet is required for all skincare products.', severity: 'high' },
      { id: 2, title: 'Lease agreement expiry is within 90 days.', detail: null, severity: 'low' },
    ],
    approvalConditions: [
      'Post-dated safety certificates required.',
      'Quarterly warehouse audits (Remote).',
    ],
    officerRecommendation: {
      quote: 'Supplier has provided valid business registration and brand authorization. Pending updated MSDS for serum line. Recommend approval with conditions once MSDS is received.',
      officerName: 'Elena Vance',
      date: 'Oct 28, 2023',
    },
    mediaAsset: {
      title: 'Velvet Botanics Official Media',
      subtitle: 'View Marketing Assets Portfolio',
    },
    communicationHistory: [
      {
        id: 1,
        from: 'Elena Vance (Compliance)',
        date: 'Oct 26, 2023',
        subject: 'MSDS documentation required',
        preview: 'We need an updated safety data sheet for the Rosehip Glow Serum line before brand authorization can proceed.',
      },
      {
        id: 2,
        from: 'Velvet Botanics Ltd.',
        date: 'Oct 27, 2023',
        subject: 'Re: MSDS documentation required',
        preview: 'Thank you for the update — our lab is finalizing the revised MSDS and will send it across shortly.',
      },
    ],
    auditHistory: [
      { id: 1, timestamp: 'Oct 24, 2023 · 09:12 AM', actor: 'System', action: 'Application submitted', detail: 'Initial application received via supplier portal.' },
      { id: 2, timestamp: 'Oct 25, 2023 · 02:30 PM', actor: 'Elena Vance', action: 'Initial business review completed', detail: 'Business registration and trading address verified.' },
      { id: 3, timestamp: 'Oct 28, 2023 · 11:00 AM', actor: 'Elena Vance', action: 'Recommendation submitted', detail: 'Recommended for approval with conditions, pending updated MSDS.' },
    ],
  },
};

function simulate<T>(data: T, delay = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

export const verificationCaseService = {
  getSuppliers: () => simulate(verificationSuppliers, 650),
  getStats: () =>
    simulate(
      [
        { id: 'new', label: 'New Apps', value: '42', trend: '+12%', tone: 'default' },
        { id: 'underReview', label: 'Under Review', value: '128', tone: 'default' },
        { id: 'addInfo', label: 'Add. Info Req.', value: '15', tone: 'default' },
        { id: 'approved', label: 'Approved (Mo)', value: '312', tone: 'default' },
        { id: 'rejected', label: 'Rejected', value: '8', tone: 'default' },
        { id: 'expiring', label: 'Expiring Docs', value: '24', tone: 'warning' },
        { id: 'suspended', label: 'Suspended', value: '4', tone: 'default' },
        { id: 'highRisk', label: 'High Risk', value: '12', tone: 'alert' },
      ] as const,
      500
    ),
  getCurrentUser: () => simulate(currentUser, 300),
  getCaseDetail: (supplierId: string): Promise<CaseDetail | null> => {
    const supplier = verificationSuppliers.find((s) => s.internalId === supplierId);
    if (!supplier) return simulate(null, 400);
    const base = buildDefaultCaseDetail(supplier);
    const override = caseDetailOverrides[supplierId] || {};
    return simulate({ ...base, ...override } as CaseDetail, 700);
  },
};
