export type CustomerFormMode =
  | "create"
  | "edit";

export interface CustomerBasicIdentityFormState {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  displayName: string;
  dob: string;
  gender: string;
  preferredLanguage: string;
  nationality: string;
  occupation: string;
  customerNotes: string;
}

export interface CustomerContactInformationFormState {
  email: string;
  phone: string;
  companyName: string;
  country: string;
}

export interface CustomerWorkflowStep {
  stepNumber: number;
  id: string;
  label: string;
  status:
    | "Completed"
    | "Current"
    | "Warning"
    | "Blocked"
    | "Upcoming";

  completionPct?: number | null;
  statusText?: string | null;
}

export interface CustomerFormFullData {
  mode: CustomerFormMode;

  customerId?: string | null;
  draftId?: string | null;
  version?: string | null;
  createdBy?: string | null;
  lastAutosave?: string | null;

  basicIdentity: CustomerBasicIdentityFormState;

  contactInformation: CustomerContactInformationFormState;

  workflowSteps: CustomerWorkflowStep[];

  completenessMetrics: {
    overallCompleteness?: number | null;

    requiredCompleted?: number | null;
    totalRequired?: number | null;

    optionalCompleted?: number | null;
    totalOptional?: number | null;

    openValidationIssues?: number | null;
    blockingIssues?: number | null;
    warnings?: number | null;
    duplicateCandidates?: number | null;

    autosaveStatus?: string | null;
    currentStepLabel?: string | null;
    approvalRequired?: string | null;
  };

  businessContext: {
    businessUnit?: string | null;
    salesChannels?: string | null;
    region?: string | null;
    eligiblePrograms?: string[];
  } | null;

  duplicateIntelligence: {
    matchScore?: number | null;

    legalNameMatch?:
      | "Exact"
      | "Partial"
      | "None"
      | null;

    emailMatch?:
      | "Exact"
      | "Partial"
      | "None"
      | null;

    phoneMatch?:
      | "Exact"
      | "Partial"
      | "None"
      | null;

    riskLevel?:
      | "Low Risk"
      | "Medium Risk"
      | "High Risk"
      | null;

    validationFindingsPassed?: number | null;
    validationFindingsTotal?: number | null;
  } | null;

  correctiveActions: Array<{
    id: number;
    description: string;
  }>;

  onboardingHealth: {
    score?: number | null;
    statusText?: string | null;

    progressList?: Array<{
      label: string;
      pct: number;
    }>;

    requiredCompleted?: number | null;
    requiredRemaining?: number | null;
    requiredMissing?: number | null;

    blockingIssuesList?: string[];
    warningsList?: string[];

    duplicateRisk?: string | null;

    approvalReadiness?: {
      status?: string | null;
      reviewer?: string | null;
      approvalPath?: string | null;
      estimatedSla?: string | null;
      requiredDocumentsMissing?: number | null;
    } | null;
  } | null;
}