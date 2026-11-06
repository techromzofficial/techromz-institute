export interface CustomerDetailProfile {
  databaseId?: number;
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string | null;
  country?: string | null;
  avatarInitials: string;

  accountStatus?: string | null;
  lifecycleVersion?: number;
  membershipStatus?: string | null;

  registeredDate?: string | null;
  updatedAt?: string | null;

  tagline?: string | null;
  customerType?: string | null;
  lifecycleSegment?: string | null;
  verificationStatus?: string | null;
  loyaltyTier?: string | null;
  riskLevel?: string | null;
  restrictionStatus?: string | null;
  preferredChannel?: string | null;
  region?: string | null;
  owner?: string | null;
  lastActivity?: string | null;
  lastOrderDate?: string | null;
  dob?: string | null;
  gender?: string | null;
  preferredLanguage?: string | null;
  nationalId?: string | null;
  accountSource?: string | null;

  profileCompleteness?: number | null;
  verificationReadiness?: number | null;
  totalOrders?: number | null;
  lifetimeValue?: number | null;
  avgOrderValue?: number | null;
  loyaltyPoints?: number | null;
  returnRate?: number | null;
  openCasesCount?: number | null;
  activeAddressesCount?: number | null;
  consentCoverage?: number | null;
  riskScore?: number | null;
  customerHealthScore?: number | null;

  concurrencyNotice?: {
    updatedBy?: string | null;
    updatedAgo?: string | null;
  } | null;
}

export type CustomerDetailRecord =
  CustomerDetailProfile;

export interface CustomerDetailCapabilities {
  read: boolean;
  update: boolean;
  delete: boolean;
  orders: boolean;
  returns: boolean;
  loyalty: boolean;
  consent: boolean;
  verification: boolean;
  risk: boolean;
  support: boolean;
}

export interface CustomerDetailFullData {
  profile: CustomerDetailProfile;

  healthScores: Array<{
    label: string;
    value: number;
  }>;

  lifecycleMilestones: Array<{
    label: string;
    date: string;
    status: "completed" | "current" | "upcoming";
  }>;

  addresses: Array<{
    type?: string;
    address: string;
  }>;

  segments: string[];

  identity: {
    kycStatus?: string | null;
    documentType?: string | null;
    documentNumber?: string | null;
    verifiedOn?: string | null;
    expiryDate?: string | null;
    verificationSource?: string | null;
    addressMatch?: string | null;
    riskNotes?: string | null;
  } | null;

  purchaseBehaviour: {
    totalOrders?: number | null;
    completed?: number | null;
    cancelled?: number | null;
    failedPayments?: number | null;
    avgOrderValue?: number | null;
    repeatPurchaseRate?: number | null;
    favouriteCategory?: string | null;
    preferredBrand?: string | null;
    recentOrders?: unknown[];
  } | null;

  returnsDisputes: {
    openReturns?: number | null;
    completedReturns?: number | null;
    refundsPending?: number | null;
    refundsCompletedAmount?: number | null;
    activeDisputes?: number | null;
    avgResolutionTimeDays?: number | null;
    recentReturns?: unknown[];
  } | null;

  loyalty: {
    tier?: string | null;
    pointsBalance?: number | null;
    pointsEarnedYtd?: number | null;
    pointsRedeemedYtd?: number | null;
    nextTierPoints?: number | null;
    rewardLiabilityLkr?: number | null;
    pointsExpiring90Days?: number | null;
    recentTransactions?: unknown[];
  } | null;

  consentPrivacy: {
    emailConsent?: boolean | null;
    smsConsent?: boolean | null;
    pushConsent?: boolean | null;
    personalisationConsent?: boolean | null;
    dataProcessingBasis?: string | null;
    consentSource?: string | null;
    consentDate?: string | null;
    privacyRequests?: {
      access?: number | null;
      correction?: number | null;
      deletion?: number | null;
      portability?: number | null;
    };
  } | null;

  riskRestrictions: {
    overallRiskScore?: number | null;
    riskCategory?: string | null;
    chargebackRisk?: string | null;
    excessiveReturnRisk?: string | null;
    duplicateAccountRisk?: string | null;
    activeRestrictions?: string | null;
    riskOwner?: string | null;
  } | null;

  supportComms: {
    openCases?: number | null;
    resolvedCases30d?: number | null;
    avgResponseTimeHours?: number | null;
    csat30d?: number | null;
    recentInteractions?: unknown[];
  } | null;

  relatedRecords: {
    householdAccount?: string | null;
    loyaltyCard?: string | null;
    marketplaceProfile?: string | null;
    supportCaseSummary?: string | null;
    lastOrder?: string | null;
  } | null;

  recordQuality: {
    duplicateRisk?: string | null;
    missingFields?: number | null;
    dataFreshness?: string | null;
    dataAccuracyScore?: number | null;
    auditCompleteness?: number | null;
  } | null;

  recentActivities: unknown[];

  lifecycleNodes: Array<{
    id: string;
    label: string;
    status:
      | "Completed"
      | "Current"
      | "Warning"
      | "Critical"
      | "Upcoming";
    stepNumber: number;
    date?: string;
  }>;

  capabilities: CustomerDetailCapabilities;
}
