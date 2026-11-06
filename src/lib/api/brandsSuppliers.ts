import { api, withQuery } from "@/lib/api";

type Raw = Record<string, any>;

type SupplierDashboardQuery = {
  days?: number;
  search?: string;
  status?: string;
  business_type?: string;
  verification_status?: string;
  page?: number;
  per_page?: number;
  contract_type?: string;
  supplier_id?: number | string;
};

type VerificationQuery = SupplierDashboardQuery & {
  verification_status?: string;
};

const unsupported = (message: string): never => {
  throw new Error(message);
};

const adaptSupplier = (raw: Raw) => ({
  ...raw,

  id: String(raw.id),
  raw_id: Number(raw.id),

  name: String(
    raw.company_name ??
      raw.name ??
      "",
  ),

  company_name: String(
    raw.company_name ??
      raw.name ??
      "",
  ),

  legalName:
    raw.legal_name ??
    raw.company_name ??
    null,

  type:
    raw.business_type ??
    null,

  business_type:
    raw.business_type ??
    null,

  country:
    raw.country ??
    null,

  city:
    raw.city ??
    null,

  address:
    raw.address ??
    raw.address_line_1 ??
    null,

  email:
    raw.email ??
    null,

  phone:
    raw.phone ??
    null,

  website:
    raw.website ??
    null,

  verification:
    raw.verification_status ??
    "unknown",

  verification_status:
    raw.verification_status ??
    "unknown",

  verificationStatus:
    raw.verification_status ??
    "unknown",

  compliance_status:
    raw.compliance_status ??
    null,

  status:
    raw.status ??
    "unknown",

  risk_score:
    raw.risk_score ??
    null,

  riskLevel:
    raw.risk_level ??
    null,

  products_count: Number(
    raw.products_count ??
      raw.productsCount ??
      0,
  ),

  activeProducts: Number(
    raw.products_count ??
      raw.productsCount ??
      0,
  ),

  contracts_count: Number(
    raw.contracts_count ??
      0,
  ),

  updated:
    raw.updated_at ??
    null,

  updated_at:
    raw.updated_at ??
    null,

  updatedAt:
    raw.updated_at ??
    "",

  created_at:
    raw.created_at ??
    null,
});

const adaptVerificationRequest = (raw: Raw) => ({
  ...adaptSupplier(raw.supplier ?? {}),
  ...raw,
  id: String(raw.id),
  raw_id: Number(raw.id),
  verification_request_id: Number(raw.id),
  verification: raw.verification_status ?? "unknown",
  verificationStatus: raw.verification_status ?? "unknown",
  supplier: raw.supplier ? adaptSupplier(raw.supplier) : null,
});

const pagination = (
  response: any,
  fallbackPerPage = 15,
) => ({
  current_page: Number(
    response?.current_page ??
      response?.meta?.current_page ??
      1,
  ),

  per_page: Number(
    response?.per_page ??
      response?.meta?.per_page ??
      fallbackPerPage,
  ),

  total: Number(
    response?.total ??
      response?.meta?.total ??
      0,
  ),

  last_page: Number(
    response?.last_page ??
      response?.meta?.last_page ??
      1,
  ),
});

export const brandsSuppliersApi = {
  /*
  |--------------------------------------------------------------------------
  | Command Center
  |--------------------------------------------------------------------------
  */

  async getCommandCenter(days = 30) {
    const response: any = await api.get(
      withQuery("/admin/brands-suppliers/command-center", { days }),
    );

    return (
      response.data ??
      response
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Suppliers
  |--------------------------------------------------------------------------
  */

  async getSuppliersDashboard(
    query: SupplierDashboardQuery = {},
  ) {
    const response: any = await api.get(
      withQuery(
        "/admin/brands-suppliers/suppliers",
        {
          days: query.days,
          search:
            query.search,

          status:
            query.status &&
            query.status !== "all"
              ? query.status
              : undefined,

          business_type:
            query.business_type,

          verification_status:
            query.verification_status,

          page:
            query.page,

          per_page:
            query.per_page,
        },
      ),
    );

    const rows = Array.isArray(response.data)
      ? response.data
      : [];

    const suppliers =
      rows.map(adaptSupplier);

    return {
      suppliers: {
        data: suppliers,

        meta: pagination(
          response,
          query.per_page ?? 15,
        ),
      },

      summary:
        response.summary ??
        {},

      statusSummary:
        response.summary ??
        {},

      analytics: response.analytics,

      capabilities:
        response.capabilities ??
        {},

      lastSynced:
        response.generated_at ??
        null,
    };
  },

  async getSupplierDetail(
    id: string | number,
  ) {
    const response: any =
      await api.get(
        `/admin/brands-suppliers/suppliers/${encodeURIComponent(
          String(id),
        )}`,
      );

    const payload =
      response.data ??
      response;

    const raw =
      payload.supplier ??
      payload;

    return {
      ...payload,

      supplier:
        adaptSupplier(raw),

      contracts:
        payload.contracts ??
        raw.contracts ??
        [],

      certificates:
        payload.certificates ??
        raw.certificates ??
        [],

      brandAuthorizations:
        payload.brand_authorizations ??
        payload.brandAuthorizations ??
        raw.brand_authorizations ??
        raw.authorizations ??
        [],

      verificationRequests:
        payload.verification_requests ??
        payload.verificationRequests ??
        raw.verification_requests ??
        [],

      complianceCases:
        payload.compliance_cases ??
        payload.complianceCases ??
        raw.compliance_cases ??
        [],

      improvementPlans:
        payload.improvement_plans ??
        payload.improvementPlans ??
        raw.improvement_plans ??
        [],

      products:
        payload.products ??
        raw.products ??
        raw.latest_products ??
        [],

      companyProfile:
        payload.company_profile ??
        payload.companyProfile ??
        raw.company_profile ??
        null,
    };
  },

  async verifySupplier(
    id: string | number,
    verificationStatus:
      | "pending"
      | "verified"
      | "rejected",
  ) {
    const response: any =
      await api.put(
        `/admin/suppliers/${encodeURIComponent(
          String(id),
        )}/verify`,
        {
          verification_status:
            verificationStatus,
        },
      );

    const raw =
      response.supplier ??
      response.data?.supplier ??
      response.data ??
      null;

    return {
      ...response,

      supplier:
        raw
          ? adaptSupplier(raw)
          : null,

      message:
        response.message ??
        "Supplier verification updated successfully.",
    };
  },

  async createSupplier(
    input: unknown,
  ) {
    const response: any =
      await api.post(
        "/admin/brands-suppliers/suppliers",
        input,
      );

    return {
      ...response,

      supplier:
        response.data?.supplier
          ? adaptSupplier(
              response.data.supplier,
            )
          : response.supplier
            ? adaptSupplier(
                response.supplier,
              )
            : response.data
              ? adaptSupplier(
                  response.data,
                )
              : null,
    };
  },

  async updateSupplier(
    id: string | number,
    input: unknown,
  ) {
    const response: any =
      await api.put(
        `/admin/brands-suppliers/suppliers/${encodeURIComponent(
          String(id),
        )}`,
        input,
      );

    return response;
  },

  async checkDuplicates(
    input: unknown,
  ) {
    return api.post(
      "/admin/brands-suppliers/suppliers/check-duplicates",
      input,
    );
  },

  async saveOnboardingDraft(
    input: unknown,
  ) {
    return api.post(
      "/admin/brands-suppliers/suppliers/draft",
      input,
    );
  },

  async getOnboardingDraft(
    id: string | number,
  ) {
    return api.get(
      `/admin/brands-suppliers/suppliers/draft/${encodeURIComponent(
        String(id),
      )}`,
    );
  },

  async getSupplierImpact(
    id: string | number,
  ) {
    const response: any =
      await api.get(
        `/admin/brands-suppliers/suppliers/${encodeURIComponent(
          String(id),
        )}/impact`,
      );

    return (
      response.data ??
      response
    );
  },

  async suspendSupplier(
    id: string | number,
    input: unknown = {},
  ) {
    return api.post(
      `/admin/brands-suppliers/suppliers/${encodeURIComponent(
        String(id),
      )}/suspend`,
      input,
    );
  },

  async reinstateSupplier(
    id: string | number,
    input: unknown = {},
  ) {
    return api.post(
      `/admin/brands-suppliers/suppliers/${encodeURIComponent(
        String(id),
      )}/reinstate`,
      input,
    );
  },

  async archiveSupplier(
    id: string | number,
    input: unknown = {},
  ) {
    return api.post(
      `/admin/brands-suppliers/suppliers/${encodeURIComponent(
        String(id),
      )}/archive`,
      input,
    );
  },

  async restrictSupplier(
    id: string | number,
    reason: string,
  ) {
    return api.post(
      `/admin/brands-suppliers/suppliers/${encodeURIComponent(
        String(id),
      )}/restrict`,
      {
        reason,
      },
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Verification
  |--------------------------------------------------------------------------
  */

  async getVerificationQueue(
    query: VerificationQuery = {},
  ) {
    const response: any =
      await api.get(
        withQuery(
          "/admin/brands-suppliers/verification",
          {
            search:
              query.search,

            status:
              query.verification_status ??
              (
                query.status &&
                query.status !== "all"
                  ? query.status
                  : undefined
              ),

            page:
              query.page,

            per_page:
              query.per_page,
          },
        ),
      );

    const rows = Array.isArray(
      response.data,
    )
      ? response.data.map(adaptVerificationRequest)
      : [];

    const meta = pagination(
      response,
      query.per_page ?? 15,
    );

    return {
      // Compatibility with the existing verification queue screen.
      data: rows,

      // Normalized Brands & Suppliers structure.
      cases: {
        data: rows,
        meta,
      },

      meta,

      summary:
        response.summary ??
        {},
    };
  },

  async getVerificationCase(
    id: string | number,
  ) {
    const response: any =
      await api.get(
        `/admin/brands-suppliers/verification/${encodeURIComponent(
          String(id),
        )}`,
      );

    const verificationCase = adaptVerificationRequest(response.data ?? response);

    return {
      ...verificationCase,
      case: verificationCase,
      data: verificationCase,
    };
  },

  async assignVerificationReviewer(
    id: string | number,
    expectedUpdatedAt?: string,
  ) {
    return api.post(
      `/admin/brands-suppliers/verification/${encodeURIComponent(
        String(id),
      )}/assign`,
      {
        expected_updated_at:
          expectedUpdatedAt || undefined,
      },
    );
  },

  async approveVerification(
    id: string | number,
    reviewNotes?: string,
    expectedUpdatedAt?: string,
  ) {
    return api.post(
      `/admin/brands-suppliers/verification/${encodeURIComponent(
        String(id),
      )}/approve`,
      {
        notes:
          reviewNotes || undefined,
        expected_updated_at:
          expectedUpdatedAt || undefined,
      },
    );
  },

  async rejectVerification(
    id: string | number,
    reviewNotes: string,
    expectedUpdatedAt?: string,
  ) {
    return api.post(
      `/admin/brands-suppliers/verification/${encodeURIComponent(
        String(id),
      )}/reject`,
      {
        reason: reviewNotes,
        expected_updated_at:
          expectedUpdatedAt || undefined,
      },
    );
  },

  async requestVerificationInformation(
    id: string | number,
    reviewNotes: string,
    expectedUpdatedAt?: string,
  ) {
    return api.post(
      `/admin/brands-suppliers/verification/${encodeURIComponent(
        String(id),
      )}/request-information`,
      {
        notes: reviewNotes,
        expected_updated_at:
          expectedUpdatedAt || undefined,
      },
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Brand Authorizations
  |--------------------------------------------------------------------------
  */

  async getBrandAuthorizations(
    query: SupplierDashboardQuery = {},
  ) {
    const response: any =
      await api.get(
        withQuery(
          "/admin/brands-suppliers/brand-authorizations",
          {
            days: query.days,
            search:
              query.search,

            status:
              query.status &&
              query.status !== "all"
                ? query.status
                : undefined,

            page:
              query.page,

            per_page:
              query.per_page,
          },
        ),
      );

    return {
      data: Array.isArray(
        response.data,
      )
        ? response.data
        : [],

      summary:
        response.summary ??
        {},

      analytics: response.analytics,

      meta: pagination(
        response,
        query.per_page ?? 20,
      ),
    };
  },

  async getBrandAuthorization(
    id: string | number,
  ) {
    const response: any =
      await api.get(
        `/admin/brands-suppliers/brand-authorizations/${encodeURIComponent(
          String(id),
        )}`,
      );

    return (
      response.authorization ??
      response.data?.authorization ??
      response.data ??
      response
    );
  },

  async approveBrandAuthorization(
    id: string | number,
    expectedUpdatedAt?: string,
  ) {
    return api.post(
      `/admin/brands-suppliers/brand-authorizations/${encodeURIComponent(
        String(id),
      )}/approve`,
      {
        expected_updated_at:
          expectedUpdatedAt || undefined,
      },
    );
  },


  async rejectBrandAuthorization(
    id: string | number,
    reason: string,
    expectedUpdatedAt?: string,
  ) {
    return api.post(
      `/admin/brands-suppliers/brand-authorizations/${encodeURIComponent(
        String(id),
      )}/reject`,
      {
        reason,
        expected_updated_at:
          expectedUpdatedAt || undefined,
      },
    );
  },

  async renewBrandAuthorization(
    id: string | number,
    expiryDate: string,
    expectedUpdatedAt?: string,
  ) {
    return api.post(
      `/admin/brands-suppliers/brand-authorizations/${encodeURIComponent(
        String(id),
      )}/renew`,
      {
        expires_at: expiryDate,
        expected_updated_at:
          expectedUpdatedAt || undefined,
      },
    );
  },

  async revokeBrandAuthorization(
    id: string | number,
    reason: string,
    expectedUpdatedAt?: string,
  ) {
    return api.post(
      `/admin/brands-suppliers/brand-authorizations/${encodeURIComponent(
        String(id),
      )}/suspend`,
      {
        reason,
        expected_updated_at:
          expectedUpdatedAt || undefined,
      },
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Contracts
  |--------------------------------------------------------------------------
  */

  async getContractsDashboard(
    query: SupplierDashboardQuery = {},
  ) {
    const response: any =
      await api.get(
        withQuery(
          "/admin/brands-suppliers/contracts",
          {
            days: query.days,
            search:
              query.search,

            status:
              query.status &&
              query.status !== "all"
                ? query.status
                : undefined,

            contract_type:
              query.contract_type,

            supplier_id:
              query.supplier_id,

            page:
              query.page,

            per_page:
              query.per_page,
          },
        ),
      );

    return {
      contracts: {
        data: Array.isArray(
          response.data,
        )
          ? response.data
          : [],

        meta:
          response.meta ??
          pagination(
            response,
            query.per_page ?? 15,
          ),
      },

      summary:
        response.summary ??
        {},

      analytics: response.analytics,
    };
  },

  async getContract(
    id: string | number,
  ) {
    const response: any =
      await api.get(
        `/admin/brands-suppliers/contracts/${encodeURIComponent(
          String(id),
        )}`,
      );

    return (
      response.data ??
      response
    );
  },

  async createContract(
    input: unknown,
  ) {
    return api.post(
      "/admin/brands-suppliers/contracts",
      input,
    );
  },

  async submitContract(
    id: string | number,
    input: unknown = {},
  ) {
    return api.post(
      `/admin/brands-suppliers/contracts/${encodeURIComponent(
        String(id),
      )}/submit`,
      input,
    );
  },

  async approveContract(
    id: string | number,
    input: unknown = {},
  ) {
    return api.post(
      `/admin/brands-suppliers/contracts/${encodeURIComponent(
        String(id),
      )}/approve`,
      input,
    );
  },

  async signContract(
    id: string | number,
    input: unknown = {},
  ) {
    return api.post(
      `/admin/brands-suppliers/contracts/${encodeURIComponent(
        String(id),
      )}/sign`,
      input,
    );
  },

  async amendContract(
    id: string | number,
    input: unknown,
  ) {
    return api.post(
      `/admin/brands-suppliers/contracts/${encodeURIComponent(
        String(id),
      )}/amend`,
      input,
    );
  },

  async renewContract(
    id: string | number,
    input: unknown = {},
  ) {
    return api.post(
      `/admin/brands-suppliers/contracts/${encodeURIComponent(
        String(id),
      )}/renew`,
      input,
    );
  },

  async terminateContract(
    id: string | number,
    input: unknown = {},
  ) {
    return api.post(
      `/admin/brands-suppliers/contracts/${encodeURIComponent(
        String(id),
      )}/terminate`,
      input,
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Performance
  |--------------------------------------------------------------------------
  */

  async getPerformanceDashboard(
    query: SupplierDashboardQuery = {},
  ) {
    const response: any =
      await api.get(
        withQuery(
          "/admin/brands-suppliers/performance",
          {
            search:
              query.search,

            status:
              query.status &&
              query.status !== "all"
                ? query.status
                : undefined,

            page:
              query.page,

            per_page:
              query.per_page,
          },
        ),
      );

    const payload =
      response.data ??
      {};

    return {
      suppliers: {
        data: Array.isArray(
          payload.suppliers,
        )
          ? payload.suppliers.map(
              adaptSupplier,
            )
          : [],

        meta:
          response.meta ??
          pagination(
            response,
            query.per_page ?? 15,
          ),
      },

      summary:
        payload.summary ??
        {},

      recentImprovementPlans:
        Array.isArray(
          payload.recent_improvement_plans,
        )
          ? payload.recent_improvement_plans
          : [],
    };
  },

  async createImprovementPlan(
    input: unknown,
  ) {
    return api.post(
      "/admin/brands-suppliers/performance/improvement-plans",
      input,
    );
  },

  async updateImprovementPlan(
    id: string | number,
    input: unknown,
  ) {
    return api.put(
      `/admin/brands-suppliers/performance/improvement-plans/${encodeURIComponent(
        String(id),
      )}`,
      input,
    );
  },

  async closeImprovementPlan(
    id: string | number,
    input: unknown = {},
  ) {
    return api.post(
      `/admin/brands-suppliers/performance/improvement-plans/${encodeURIComponent(
        String(id),
      )}/close`,
      input,
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Risk & Compliance
  |--------------------------------------------------------------------------
  */

  async getRiskComplianceDashboard(
    query: SupplierDashboardQuery = {},
  ) {
    const response: any =
      await api.get(
        withQuery(
          "/admin/brands-suppliers/risk-compliance",
          {
            search:
              query.search,

            status:
              query.status &&
              query.status !== "all"
                ? query.status
                : undefined,

            page:
              query.page,

            per_page:
              query.per_page,
          },
        ),
      );

    const payload =
      response.data ??
      {};

    return {
      cases: {
        data: Array.isArray(
          payload.cases,
        )
          ? payload.cases
          : [],

        meta:
          response.meta ??
          pagination(
            response,
            query.per_page ?? 15,
          ),
      },

      riskProfiles:
        Array.isArray(
          payload.risk_profiles,
        )
          ? payload.risk_profiles
          : [],

      summary:
        payload.summary ??
        {},
    };
  },

  async createComplianceCase(
    input: unknown,
  ) {
    return api.post(
      "/admin/brands-suppliers/risk-compliance/cases",
      input,
    );
  },

  async runRiskAssessment(
    supplierId: string | number,
  ) {
    return api.post(
      "/admin/brands-suppliers/risk-compliance/assessments",
      {
        supplier_id:
          Number(supplierId),
      },
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Catalogue Reference
  |--------------------------------------------------------------------------
  */

  async getCatalogueCoverageDashboard(
    query: SupplierDashboardQuery = {},
  ) {
    const [
      productsResponse,
      commandCenterResponse,
    ]: any[] =
      await Promise.all([
        api.get(
          withQuery(
            "/admin/products",
            {
              search:
                query.search,

              page:
                query.page,

              per_page:
                query.per_page,
            },
          ),
        ),

        api.get(
          "/admin/catalogue/command-center",
        ),
      ]);

    const commandCenter =
      commandCenterResponse.data ??
      commandCenterResponse;

    return {
      products: {
        data: Array.isArray(
          productsResponse.data,
        )
          ? productsResponse.data
          : [],

        meta: pagination(
          productsResponse,
          query.per_page ?? 15,
        ),
      },

      catalogue: {
        metrics:
          Array.isArray(
            commandCenter.metrics,
          )
            ? commandCenter.metrics
            : [],

        readiness:
          Array.isArray(
            commandCenter.readiness,
          )
            ? commandCenter.readiness
            : [],

        approvalQueue: {
          total: Number(
            commandCenter
              .approval_queue
              ?.total ??
              0,
          ),

          highRisk:
            commandCenter
              .approval_queue
              ?.high_risk ??
            null,
        },

        inventory: {
          referenceOnly:
            commandCenter.inventory
              ?.reference_only ===
            true,

          lowStock:
            commandCenter.inventory
              ?.low_stock ??
            null,

          expiring:
            commandCenter.inventory
              ?.expiring ??
            null,
        },
      },
    };
  },

  /*
  |--------------------------------------------------------------------------
  | Users & Access
  |--------------------------------------------------------------------------
  */

  async getUsersAccessDashboard(
    query: SupplierDashboardQuery = {},
  ) {
    const response: any =
      await api.get(
        withQuery(
          "/admin/brands-suppliers/users-access",
          {
            search:
              query.search,

            status:
              query.status &&
              query.status !== "all"
                ? query.status
                : undefined,

            page:
              query.page,

            per_page:
              query.per_page,
          },
        ),
      );

    return {
      users: {
        data: Array.isArray(
          response.data,
        )
          ? response.data
          : [],

        meta: pagination(
          response,
          query.per_page ?? 15,
        ),
      },

      summary: {
        total:
          Number(
            response.summary
              ?.total ??
            0,
          ),

        active:
          Number(
            response.summary
              ?.active ??
            0,
          ),

        inactive:
          Number(
            response.summary
              ?.inactive ??
            0,
          ),

        suspended:
          Number(
            response.summary
              ?.suspended ??
            0,
          ),

        supplierRole:
          Number(
            response.summary
              ?.supplier_role ??
            0,
          ),
      },

      capabilities: {
        mfaStatus:
          response.capabilities
            ?.mfa_status ===
          true,

        invitations:
          response.capabilities
            ?.invitations ===
          true,

        sessionActivity:
          response.capabilities
            ?.session_activity ===
          true,

        privilegedClassification:
          response.capabilities
            ?.privileged_classification ===
          true,
      },
    };
  },

  async inviteSupplierUser(
    _input?: unknown,
  ) {
    return unsupported(
      "Supplier user invitations are not currently exposed by the verified backend routes.",
    );
  },

  async updateSupplierUserRole(
    _id: string | number,
    _role?: string,
  ) {
    return unsupported(
      "Supplier user role changes are not currently exposed by the verified backend routes.",
    );
  },

  async revokeSupplierUserAccess(
    _id: string | number,
  ) {
    return unsupported(
      "Supplier access revocation is not currently exposed by the verified backend routes.",
    );
  },

  /*
  |--------------------------------------------------------------------------
  | Import / Export / Audit
  |--------------------------------------------------------------------------
  */

  async getImportExportAuditDashboard(
    query: SupplierDashboardQuery = {},
  ) {
    const response: any =
      await api.get(
        withQuery(
          "/admin/brands-suppliers/data-audit",
          {
            search:
              query.search,

            page:
              query.page,

            per_page:
              query.per_page,
          },
        ),
      );

    return {
      audits: {
        data: Array.isArray(
          response.data,
        )
          ? response.data
          : [],

        meta: pagination(
          response,
          query.per_page ?? 15,
        ),
      },

      summary: {
        total:
          Number(
            response.summary
              ?.total ??
            0,
          ),

        last24Hours:
          Number(
            response.summary
              ?.last_24_hours ??
            0,
          ),

        last30Days:
          Number(
            response.summary
              ?.last_30_days ??
            0,
          ),

        suppliersWithActivity:
          Number(
            response.summary
              ?.suppliers_with_activity ??
            0,
          ),
      },

      capabilities: {
        supplierImport:
          response.capabilities
            ?.supplier_import ===
          true,

        supplierExport:
          response.capabilities
            ?.supplier_export ===
          true,

        scheduledExports:
          response.capabilities
            ?.scheduled_exports ===
          true,

        jobTracking:
          response.capabilities
            ?.job_tracking ===
          true,

        auditHistory:
          response.capabilities
            ?.audit_history ===
          true,
      },
    };
  },

  async importSuppliers(
    records: unknown[],
  ) {
    return api.post(
      "/admin/brands-suppliers/data-audit/import",
      {
        records,
      },
    );
  },

  async exportSuppliers(
    query: SupplierDashboardQuery = {},
  ) {
    return api.get(
      withQuery(
        "/admin/brands-suppliers/data-audit/export",
        {
          search:
            query.search,

          status:
            query.status &&
            query.status !== "all"
              ? query.status
              : undefined,
        },
      ),
    );
  },

  async getImportTemplate() {
    const template = {
      fields: [
        "company_name",
        "email",
        "country",
        "business_type",
        "city",
        "phone",
        "website",
      ],

      required: [
        "company_name",
        "email",
        "country",
      ],
    };

    return {
      // Existing donor page expects template.data.
      data: template,

      // Also expose normalized fields directly.
      ...template,
    };
  },
};
