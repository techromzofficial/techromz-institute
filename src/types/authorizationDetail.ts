export type AuthorizationDocumentStatus = "Approved" | "Pending Review" | "Missing";

export type AuthorizationDocument = {
  id: string;
  name: string;
  status: AuthorizationDocumentStatus;
  issuer: string;
  issuedOn: string;
  expiry: string;
};

export type AuthorizationChecklistItem = {
  label: string;
  status: "complete" | "in-progress";
};

export type AuthorizationChecklistGroup = {
  title: string;
  items: AuthorizationChecklistItem[];
};

export type AuthorizationWorkflowStep = {
  label: string;
  date: string;
  state: "complete" | "current" | "pending";
};

export type AuthorizationValidation = {
  label: string;
  score: number;
  tone: "success" | "warning";
};

export type AuthorizationAuditEntry = {
  id: string;
  date: string;
  actor: string;
  action: string;
  detail: string;
};

export type BrandAuthorizationDetail = {
  authorizationId: string;
  reference: string;
  status: string;
  riskScore: number;
  riskLabel: string;
  requestingEntity: string;
  brandOwner: string;
  brandLicense: string;
  authorizationType: string;
  submittedBy: string;
  submittedDate: string;
  lastUpdated: string;
  assignedTo: string;
  territory: string;
  channels: { label: string; status: "Approved" | "Restricted" }[];
  workflow: AuthorizationWorkflowStep[];
  validationScore: number;
  validations: AuthorizationValidation[];
  conflicts: {
    title: string;
    entity: string;
    rightType: string;
    severity: string;
    detail: string;
  }[];
  blockingIssues: string[];
  recommendation: {
    officer: string;
    role: string;
    initials: string;
    note: string;
  };
  documents: AuthorizationDocument[];
  checklist: AuthorizationChecklistGroup[];
  auditHistory: AuthorizationAuditEntry[];
};

