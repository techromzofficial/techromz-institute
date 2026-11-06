import {
  CustomerFormFullData,
  CustomerWorkflowStep,
} from "@/types/customer-form";

export const CU04_WORKFLOW_STEPS: CustomerWorkflowStep[] = [
  {
    stepNumber: 1,
    id: "customer-type",
    label: "Customer Type",
    status: "Upcoming",
    completionPct: null,
    statusText: null,
  },
  {
    stepNumber: 2,
    id: "basic-identity",
    label: "Basic Identity",
    status: "Current",
    completionPct: null,
    statusText: null,
  },
  {
    stepNumber: 3,
    id: "contact-info",
    label: "Contact Information",
    status: "Upcoming",
    completionPct: null,
    statusText: null,
  },
  {
    stepNumber: 4,
    id: "addresses",
    label: "Addresses",
    status: "Upcoming",
    completionPct: null,
    statusText: null,
  },
  {
    stepNumber: 5,
    id: "business-context",
    label: "Business Context",
    status: "Upcoming",
    completionPct: null,
    statusText: null,
  },
  {
    stepNumber: 6,
    id: "verification-requirements",
    label: "Verification Requirements",
    status: "Upcoming",
    completionPct: null,
    statusText: null,
  },
  {
    stepNumber: 7,
    id: "communication-preferences",
    label: "Communication Preferences",
    status: "Upcoming",
    completionPct: null,
    statusText: null,
  },
  {
    stepNumber: 8,
    id: "consent-privacy",
    label: "Consent & Privacy",
    status: "Upcoming",
    completionPct: null,
    statusText: null,
  },
  {
    stepNumber: 9,
    id: "loyalty-membership",
    label: "Loyalty & Membership",
    status: "Upcoming",
    completionPct: null,
    statusText: null,
  },
  {
    stepNumber: 10,
    id: "segments",
    label: "Segments",
    status: "Upcoming",
    completionPct: null,
    statusText: null,
  },
  {
    stepNumber: 11,
    id: "customer-ownership",
    label: "Customer Ownership",
    status: "Upcoming",
    completionPct: null,
    statusText: null,
  },
  {
    stepNumber: 12,
    id: "validation-risk",
    label: "Validation & Risk",
    status: "Upcoming",
    completionPct: null,
    statusText: null,
  },
  {
    stepNumber: 13,
    id: "review-save",
    label: "Review & Save",
    status: "Upcoming",
    completionPct: null,
    statusText: null,
  },
];

export const INITIAL_FORM_DATA: CustomerFormFullData = {
  mode: "create",

  customerId: null,
  draftId: null,
  version: null,
  createdBy: null,
  lastAutosave: null,

  basicIdentity: {
    title: "",
    firstName: "",
    middleName: "",
    lastName: "",
    displayName: "",
    dob: "",
    gender: "",
    preferredLanguage: "",
    nationality: "",
    occupation: "",
    customerNotes: "",
  },

  contactInformation: {
    email: "",
    phone: "",
    companyName: "",
    country: "",
  },

  workflowSteps: CU04_WORKFLOW_STEPS,

  completenessMetrics: {
    overallCompleteness: null,
    requiredCompleted: null,
    totalRequired: null,
    optionalCompleted: null,
    totalOptional: null,
    openValidationIssues: null,
    blockingIssues: null,
    warnings: null,
    duplicateCandidates: null,
    autosaveStatus: null,
    currentStepLabel: "Basic Identity",
    approvalRequired: null,
  },

  businessContext: null,

  duplicateIntelligence: null,

  correctiveActions: [],

  onboardingHealth: null,
};