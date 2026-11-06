export type CustomerType = "Individual" | "Business" | "VIP";

export type CustomerVerificationStatus = "Verified" | "Verification Pending" | "Unverified";

export type CustomerLifecycleSegment =
  | "Active"
  | "New"
  | "Repeat"
  | "Loyalty"
  | "High-Value"
  | "Dormant"
  | "Restricted";

export type CustomerLoyaltyTier = "Gold" | "Platinum" | "Silver" | "Bronze" | "Standard";

export type CustomerConsentStatus = "Consented" | "Pending" | "Revoked";

export type CustomerRiskLevel = "Low" | "Medium" | "High";

export type CustomerRestrictionStatus = "None" | "Restricted";

export interface CustomerRecord {
  databaseId?: number;

  id: string;
  name: string;
  email: string;
  phone: string;

  companyName?: string | null;
  country?: string | null;

  accountStatus?: string | null;
  membershipStatus?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;

  /*
   * These fields belong to richer Customer 360 / cross-domain
   * projections and are intentionally optional until an
   * authoritative backend source exists.
   */
  avatarInitials?: string;
  customerType?: CustomerType;
  region?: string;
  preferredChannel?: "Mobile App" | "Website" | "B2B Portal";

  verificationStatus?: CustomerVerificationStatus;
  profileCompleteness?: number;

  lifecycleSegment?: CustomerLifecycleSegment;
  loyaltyTier?: CustomerLoyaltyTier;

  totalOrders?: number;
  lifetimeValue?: number;
  lastOrderDate?: string;

  returnsCount?: number;
  openCasesCount?: number;

  consentStatus?: CustomerConsentStatus;
  riskLevel?: CustomerRiskLevel;
  restrictionStatus?: CustomerRestrictionStatus;

  duplicateRisk?: "Low" | "Medium" | "High";
  incompleteProfile?: boolean;

  owner?: string;
  lastActivity?: string;

  notes?: string[];
}

export interface CustomerKpiCard {
  seq: number;
  id: string;
  label: string;
  value: string;
  change: string;
  changeDirection: "up" | "down" | "neutral";
  statusState: "positive" | "warning" | "critical" | "info";
  iconName: string;
}

export interface CustomerFilterState {
  searchQuery: string;
  segment: string;
  customerType: string;
  region: string;
  salesChannel: string;
  loyaltyTier: string;
  verificationStatus: string;
  consentStatus: string;
  riskLevel: string;
  owner: string;
  updatedDate: string;
  activeTab: string;
  quickChips: string[];
}

export interface PriorityCustomerAlert {
  id: string;
  text: string;
  count: number;
  severity: "High" | "Medium" | "Low";
  routeTarget?: string;
}

export interface LifecycleNode {
  id: string;
  label: string;
  status: "Completed" | "Current" | "Warning" | "Critical" | "Upcoming";
  stepNumber: number;
  date?: string;
  count?: string | number;
}

export interface CustomerStatusSummaryData {
  active: number;
  dormant: number;

  verificationPending: number | null;
  restricted: number | null;
  cases: number | null;
  returns: number | null;
}

export interface CustomerHealthMetricItem {
  label: string;
  val: number | null;
  color?: string;
  target?: string;
}

export interface CustomerTabItem {
  id: string;
  label: string;
  count?: number | string;
  badge?: string;
}

export interface CustomerRightRailSectionData {
  healthScore: number | null;
  healthGrade: string | null;

  healthTitle?: string;

  healthBars: {
    label: string;
    val: number;
  }[];

  alertsTitle?: string;

  alerts: {
    id: string;
    text: string;
    count?: number;
    severity: "High" | "Medium" | "Low";
  }[];

  summaries?: {
    title: string;
    items: {
      label: string;
      count: string;
      pct: string;
      color?: string;
    }[];
  }[];

  quickQueues: {
    label: string;
    count: string | number;
  }[];

  actions?: {
    label: string;
    primary?: boolean;
    variant?:
      | "primary"
      | "secondary"
      | "outline"
      | "danger";
    actionKey?: string;
  }[];
}

export interface CustomerOperationCard {
  id: string;
  title: string;
  seq?: string | number;
  metrics?: { label: string; value: string | number; change?: string; color?: string }[];
  donutData?: { name: string; value: number; color: string }[];
  donutTotal?: string | number;
  listItems?: { label: string; val: string | number; pct?: string; badge?: string; color?: string }[];
  progressBars?: { label: string; val: number; color?: string }[];
  viewLinkText?: string;
}

