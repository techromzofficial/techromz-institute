import type { Authorization } from "@/types/admin";
import type { BrandAuthorizationDetail } from "@/types/authorizationDetail";

const baseWorkflow: BrandAuthorizationDetail["workflow"] = [
  { label: "Submitted", date: "Oct 24", state: "complete" },
  { label: "Due Diligence", date: "Oct 24", state: "complete" },
  { label: "Territory", date: "Oct 24", state: "complete" },
  { label: "Category", date: "Oct 25", state: "complete" },
  { label: "Conflict", date: "In Progress", state: "current" },
  { label: "Compliance", date: "Pending", state: "pending" },
];

const baseChecklist: BrandAuthorizationDetail["checklist"] = [
  {
    title: "Document Validation",
    items: [
      { label: "Signature Authentication", status: "complete" },
      { label: "Digital Watermark", status: "complete" },
      { label: "Notary / Registry Check", status: "complete" },
    ],
  },
  {
    title: "Territory Validation",
    items: [
      { label: "Exclusive Rights Check", status: "complete" },
      { label: "Region Code Match", status: "complete" },
      { label: "Jurisdictional Match", status: "complete" },
    ],
  },
  {
    title: "Category Scope",
    items: [
      { label: "Product List Match", status: "complete" },
      { label: "Pricing Compliance", status: "complete" },
      { label: "Brand Compliance", status: "complete" },
    ],
  },
  {
    title: "Conflict Analysis",
    items: [
      { label: "Existing Authorizations", status: "complete" },
      { label: "Territory Overlap", status: "complete" },
      { label: "Risk Assessment", status: "complete" },
    ],
  },
];

function createDetail(record: Authorization): BrandAuthorizationDetail {
  const hasConflict = record.conflictStatus !== "Clear";
  const brandOwner = record.brand === "LumiÃ¨re Labs" ? "LumiÃ¨re Labs" : "Aurora Skin Laboratories";

  return {
    authorizationId: record.id,
    reference: record.publicReference,
    status: record.status === "Pending Review" ? "Under Review" : record.status,
    riskScore: hasConflict ? 32 : 18,
    riskLabel: hasConflict ? "Medium Risk" : "Low Risk",
    requestingEntity: record.supplier,
    brandOwner,
    brandLicense: `${record.brand} Authorized Distributor (Level 1)`,
    authorizationType: `${record.type} Brand Licensing (Wholesale / Non-Retail)`,
    submittedBy: "CA_8821",
    submittedDate: "Oct 24, 2023",
    lastUpdated: "2 hrs ago",
    assignedTo: "Alisha Joseph",
    territory: record.territory === "South Asia" ? "South Asia â€” Sri Lanka" : `${record.territory} â€” Islandwide`,
    channels: [
      { label: "E-commerce Marketplace", status: "Approved" },
      { label: "Retail Storefronts", status: "Approved" },
      { label: "Third-Party Resellers", status: hasConflict ? "Restricted" : "Approved" },
    ],
    workflow: baseWorkflow,
    validationScore: hasConflict ? 78 : 92,
    validations: [
      { label: "Document Validation", score: 90, tone: "success" },
      { label: "Territory Validation", score: hasConflict ? 85 : 95, tone: "success" },
      { label: "Category Validation", score: 80, tone: "success" },
      { label: "Conflict Resolution", score: hasConflict ? 40 : 90, tone: hasConflict ? "warning" : "success" },
    ],
    conflicts: hasConflict
      ? [
          {
            title: "Critical conflict found",
            entity: "Paramount Beauty Imports Ltd",
            rightType: "Exclusive Territory Overlap (Sri Lanka - Western Province)",
            severity: "Critical",
            detail: "An active exclusive territory authorization overlaps the requested coverage. Legal confirmation or a documented carve-out is required before approval.",
          },
        ]
      : [],
    blockingIssues: hasConflict
      ? ["Missing trademark confirmation", "Overlapping exclusive territory claim"]
      : ["Final compliance officer sign-off is pending"],
    recommendation: {
      officer: "Alisha Joseph",
      role: "Compliance Officer",
      initials: "AJ",
      note: hasConflict
        ? "Based on initial document verification, the applicant has provided authentic LOA and trademark clearance. The Western Province exclusivity overlap with an existing agreement requires conditional approval pending a carve-out for the overlapping area."
        : "The document set is complete and the authorization scope has passed the required validation checks. Approval can proceed after final compliance sign-off.",
    },
    documents: [
      { id: "letter-of-authority", name: "Letter_of_Authority.pdf", status: "Approved", issuer: `${record.brand} Companies`, issuedOn: "Oct 1, 2023", expiry: record.expiry },
      { id: "trademark-consent", name: "Trademark_Consent.pdf", status: hasConflict ? "Pending Review" : "Approved", issuer: "Legal Dept (IP)", issuedOn: "Oct 8, 2023", expiry: "Dec 31, 2025" },
    ],
    checklist: baseChecklist,
    auditHistory: [
      { id: "audit-1", date: "Oct 24, 2023 Â· 09:14", actor: "System", action: "Authorization submitted", detail: "Brand authorization request received for review." },
      { id: "audit-2", date: "Oct 25, 2023 Â· 14:30", actor: "Alisha Joseph", action: "Territory validation completed", detail: "Requested territory and sales channels were checked against active authorizations." },
    ],
  };
}

export function getAuthorizationDetailMock(record: Authorization): BrandAuthorizationDetail {
  return createDetail(record);
}

