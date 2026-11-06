export interface SupplierSummary {
  id: string;
  raw_id?: string;

  name: string;
  company_name?: string;

  legalName?: string | null;

  type?: string | null;
  business_type?: string | null;

  country?: string | null;
  city?: string | null;
  address?: string | null;

  email?: string | null;
  phone?: string | null;
  website?: string | null;

  verification?: string | null;
  verification_status?: string | null;

  status?: string | null;

  activeProducts?: number | null;
  products_count?: number | null;

  bu?: string | null;
  activeBrands?: number | null;
  compliance: string;
  coverage?: string | null;
  catalogue?: string | null;
  channel?: string | null;
  region?: string | null;
  perf?: number | string | null;
  risk?: string | null;
  owner?: string | null;

  updated?: string | null;

  updatedAt: string;
  verificationStatus: string;
  authorizationCoverage: string;
  contractStatus: string;
  catalogueReadiness: string;
  channelEligibility: string;
  regionCoverage: string;
  performanceScore: string;
  riskLevel: string;
}