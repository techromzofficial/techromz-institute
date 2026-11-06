import { api, withQuery } from "@/lib/api";

export interface ComplianceCaseSummary {
  id: number;
  uuid: string;
  case_number: string;
  case_type: string;
  status: string;
  compliance_status: string;
  lock_version: number;

  subject: {
    type: string | null;
    id: number | null;
  };

  compliance_rule: {
    id: number;
    name: string | null;
    rule_key: string | null;
  } | null;

  assignee: {
    id: number;
    name: string;
    email: string;
  } | null;

  created_at: string | null;
  updated_at: string | null;
}

export interface ComplianceCaseNote {
  id: number;
  note: string;
  is_internal: boolean;

  user: {
    id: number;
    name: string;
    email: string;
  } | null;

  created_at: string | null;
}

export interface ComplianceCaseDetail
  extends ComplianceCaseSummary {
  notes: ComplianceCaseNote[];
}

export type ComplianceDecisionCommand =
  | "request_changes"
  | "pass"
  | "fail"
  | "escalate";

export interface RequirementEvaluation {
  requirement_id: number;
  requirement_code: string;
  status: string;
  satisfied: boolean;
  blocking: boolean;
  reason_codes: string[];
  warnings: string[];
  valid_until: string | null;
  evidence_ids: number[];
  rule_version: number;
}

export interface ComplianceProfile {
  status: string;
  is_eligible: boolean;

  blockers: Array<{
    requirement_code: string;
    reason_codes: string[];
  }>;

  warnings: Array<{
    requirement_code: string;
    code: string;
  }>;

  valid_until: string | null;
  subject_type: string;
  subject_id: number;
  evaluated_at: string;
  policy_version: string;
  case_reference: string;
  requirements: RequirementEvaluation[];
}

export interface ComplianceCaseListResponse {
  data: ComplianceCaseSummary[];

  summary: {
    total: number;
    open: number;
    resolved: number;
    pending_compliance: number;
  };

  capabilities: {
    read: boolean;
    resolve_case: boolean;
    escalate_case: boolean;
    update_case: boolean;
    pass: boolean;
    fail: boolean;
    request_changes: boolean;
  };

  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ComplianceCaseDetailResponse {
  case: ComplianceCaseDetail;
  data: ComplianceCaseDetail;

  capabilities: {
    read: boolean;
    resolve_case: boolean;
    escalate_case: boolean;
    update_case: boolean;
    pass: boolean;
    fail: boolean;
    request_changes: boolean;
  };
}

export interface ComplianceCaseQuery {
  search?: string;
  status?: string;
  case_type?: string;
  page?: number;
  per_page?: number;
}

export type ComplianceDocumentSource =
  | "verification_request"
  | "kyc"
  | "supplier_certificate"
  | "brand_authorization";

export interface ComplianceDocumentRecord {
  id: number;
  source: ComplianceDocumentSource;
  document_name: string | null;
  document_number: string | null;
  status: string | null;
  issued_at: string | null;
  expires_at: string | null;
  owner_name: string | null;
  file_name: string | null;
  evidence_present: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface ComplianceDocumentQuery {
  search?: string;
  source?: ComplianceDocumentSource;
  status?: string;
  page?: number;
  per_page?: number;
}

export interface ComplianceDocumentListResponse {
  data: ComplianceDocumentRecord[];

  summary: {
    total: number;
    verification_request: number;
    kyc: number;
    supplier_certificate: number;
    brand_authorization: number;
    pending_verification: number;
  };

  capabilities: {
    read: boolean;
    download: boolean;
    verify_document: boolean;
    reject_document: boolean;
    batch_approve: boolean;
    request_replacement: boolean;
    revalidate: boolean;
    audit_export: boolean;
  };

  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ProductSafetyRecord {
  id: number;

  product: {
    id: number | null;
    name: string | null;
    sku: string | null;
    status: string | null;
  };

  supplier: {
    id: number;
    name: string;
  } | null;

  ingredients: string | null;
  warnings: string | null;
  spf_value: number | null;
  expiry_required: boolean;
  batch_tracking_required: boolean;
  compliance_status: string;
  ingredient_information_present: boolean;
  warnings_present: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProductSafetyQuery {
  search?: string;
  compliance_status?: string;
  page?: number;
  per_page?: number;
}

export interface ProductSafetyListResponse {
  data: ProductSafetyRecord[];

  summary: {
    total: number;
    pending_review: number;
    approved: number;
    changes_requested: number;
    rejected: number;
    not_required: number;
    expiry_control_required: number;
    batch_tracking_required: number;
    with_warnings: number;
  };

  capabilities: {
    read: boolean;
    review_profile: boolean;
    approve_safety: boolean;
    reject_safety: boolean;
    block_publication: boolean;
    ingredient_risk_assessment: boolean;
    laboratory_evidence: boolean;
    regulatory_registration: boolean;
    claims_review: boolean;
    packaging_review: boolean;
    safety_report_export: boolean;
  };

  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export type RecallState =
  | "recalled"
  | "quarantined"
  | "recalled_or_quarantined";

export interface RecallBatchRecord {
  id: number;
  lot_number: string;
  status: string;
  is_recalled: boolean;
  is_quarantined: boolean;
  manufactured_at: string | null;
  expires_at: string | null;
  received_at: string | null;

  product: {
    id: number;
    name: string;
    sku: string | null;
    status: string | null;
  } | null;

  variant: {
    id: number;
    sku: string | null;
    status: string | null;
  } | null;

  created_at: string | null;
  updated_at: string | null;
}

export interface RecallQuery {
  search?: string;
  state?: RecallState;
  page?: number;
  per_page?: number;
}

export interface RecallListResponse {
  data: RecallBatchRecord[];

  summary: {
    recalled_batches: number;
    quarantined_batches: number;
    recalled_and_quarantined: number;
    active_batches: number;
  };

  capabilities: {
    read: boolean;
    create_recall_incident: boolean;
    update_recall_incident: boolean;
    recall_classification: boolean;
    lifecycle_management: boolean;
    criticality_assessment: boolean;
    corrective_action: boolean;
    recall_report_export: boolean;
  };

  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface GovernanceRule {
  id: number;
  uuid: string;
  rule_key: string;
  name: string;
  rule_type: string;
  severity: string;
  status: string;
  rules: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
}

export interface GovernanceQuery {
  search?: string;
  status?: "active" | "inactive";
  severity?:
    | "low"
    | "medium"
    | "high"
    | "critical";
  rule_type?: string;
  page?: number;
  per_page?: number;
}

export interface GovernanceListResponse {
  scope: {
    type: "platform_global";
    tenant_owned: false;
    description: string;
  };

  data: GovernanceRule[];

  summary: {
    total: number;
    active: number;
    inactive: number;
    low_severity: number;
    medium_severity: number;
    high_severity: number;
    critical_severity: number;
  };

  rule_types: string[];

  capabilities: {
    read: boolean;
    create_rule: boolean;
    update_rule: boolean;
    delete_rule: boolean;
    publish_rule: boolean;
    approve_rule: boolean;
    version_rule: boolean;
    import_rules: boolean;
    export_rules: boolean;
  };

  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ComplianceReportsOverview {
  generated_at: string;

  cases: ComplianceCaseListResponse["summary"];
  documents: ComplianceDocumentListResponse["summary"];
  product_safety: ProductSafetyListResponse["summary"];
  recalls: RecallListResponse["summary"];
  governance: GovernanceListResponse["summary"];

  governance_scope: GovernanceListResponse["scope"];

  capabilities: {
    read_overview: boolean;
    generate_report: boolean;
    export_report: boolean;
    schedule_report: boolean;
    saved_reports: boolean;
    report_history: boolean;
    custom_report_builder: boolean;
    sla_analytics: boolean;
    trend_analytics: boolean;
    health_score: boolean;
    risk_scoring: boolean;
    regional_analytics: boolean;
  };
}

export interface ComplianceAuditRecord {
  id: number;
  uuid: string;

  case: {
    id: number;
    uuid: string;
    status: string;
  } | null;

  subject: {
    type: string | null;
    id: string | number | null;
  };

  actor: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;

  action: string;

  before:
    | Record<string, unknown>
    | unknown[]
    | null;

  after:
    | Record<string, unknown>
    | unknown[]
    | null;

  reason: string | null;
  rule_version: string | null;
  correlation_id: string | null;
  occurred_at: string | null;
}

export interface ComplianceAuditQuery {
  search?: string;
  action?: string;
  case_id?: number;
  page?: number;
  per_page?: number;
}

export interface ComplianceAuditListResponse {
  data: ComplianceAuditRecord[];

  summary: {
    total: number;
    last_24_hours: number;
    last_30_days: number;
    cases_with_activity: number;
  };

  capabilities: {
    read: boolean;
    export: boolean;
  };

  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export const verificationComplianceApi = {

    async getComplianceProfile(
    id: string | number,
  ): Promise<ComplianceProfile> {
    const response: any =
      await api.get(
        `/admin/verification-compliance/cases/${encodeURIComponent(
          String(id),
        )}/profile`,
      );

    return response.data;
    },

    async decideCase(
      id: string | number,
      command: ComplianceDecisionCommand,
      payload: {
        expected_version: number;
        reason?: string;
        correlation_id?: string;
      },
    ) {
      return api.post(
        `/admin/verification-compliance/cases/${encodeURIComponent(
          String(id),
        )}/${command}`,
        payload,
      );
    },

    async linkEvidence(
      id: string | number,
      payload: {
        expected_version: number;
        compliance_rule_id: number;
        upload_id: number;
        evidence_type: string;
        issuer?: string;
        reference?: string;
        issued_at?: string;
        expires_at?: string;
      },
    ) {
      return api.post(
        `/admin/verification-compliance/cases/${encodeURIComponent(
          String(id),
        )}/evidence`,
        payload,
      );
    },

    async reviewEvidence(
      id: string | number,
      evidenceId: string | number,
      command:
        | "accept"
        | "reject"
        | "revoke",
      payload: {
        expected_version: number;
        reason?: string;
      },
    ) {
      return api.post(
        `/admin/verification-compliance/cases/${encodeURIComponent(
          String(id),
        )}/evidence/${encodeURIComponent(
          String(evidenceId),
        )}/${command}`,
        payload,
      );
    },

    evidenceDownloadUrl(
      id: string | number,
      evidenceId: string | number,
    ): string {
      return `/api/admin/verification-compliance/cases/${encodeURIComponent(
        String(id),
      )}/evidence/${encodeURIComponent(
        String(evidenceId),
      )}/download`;
    },

    async approveWaiver(
      id: string | number,
      payload: {
        expected_version: number;
        compliance_rule_id: number;
        scope: string;
        reason: string;
        effective_from: string;
        expires_at: string;
      },
    ) {
      return api.post(
        `/admin/verification-compliance/cases/${encodeURIComponent(
          String(id),
        )}/waivers`,
        payload,
      );
    },

  async getComplianceCases(
    query: ComplianceCaseQuery = {},
  ): Promise<ComplianceCaseListResponse> {
    const response: any = await api.get(
      withQuery(
        "/admin/verification-compliance/cases",
        {
          search: query.search,
          status:
            query.status &&
            query.status !== "all"
              ? query.status
              : undefined,
          case_type: query.case_type,
          page: query.page,
          per_page: query.per_page,
        },
      ),
    );

    return {
      data: Array.isArray(response.data)
        ? response.data
        : [],

      summary: {
        total: Number(
          response.summary?.total ?? 0,
        ),
        open: Number(
          response.summary?.open ?? 0,
        ),
        resolved: Number(
          response.summary?.resolved ?? 0,
        ),
        pending_compliance: Number(
          response.summary?.pending_compliance ?? 0,
        ),
      },

      capabilities: {
        read:
          response.capabilities?.read === true,

        resolve_case:
          response.capabilities?.resolve_case ===
          true,

        escalate_case:
          response.capabilities
            ?.escalate_case === true,

        update_case:
          response.capabilities?.update_case ===
          true,

        pass:
          response.capabilities?.pass === true,

        fail:
          response.capabilities?.fail === true,

        request_changes:
          response.capabilities
            ?.request_changes === true,
      },

      current_page: Number(
        response.current_page ?? 1,
      ),
      per_page: Number(
        response.per_page ??
          query.per_page ??
          20,
      ),
      total: Number(
        response.total ?? 0,
      ),
      last_page: Number(
        response.last_page ?? 1,
      ),
    };
  },

  async getComplianceCase(
    id: string | number,
  ): Promise<ComplianceCaseDetailResponse> {
    const response: any = await api.get(
      `/admin/verification-compliance/cases/${encodeURIComponent(
        String(id),
      )}`,
    );

    const data =
      response.case ??
      response.data?.case ??
      response.data ??
      response;

    return {
      case: data,
      data,

      capabilities: {
        read:
          response.capabilities?.read === true,

        resolve_case:
          response.capabilities?.resolve_case ===
          true,

        escalate_case:
          response.capabilities
            ?.escalate_case === true,

        update_case:
          response.capabilities?.update_case ===
          true,

        pass:
          response.capabilities?.pass === true,

        fail:
          response.capabilities?.fail === true,

        request_changes:
          response.capabilities
            ?.request_changes === true,
      },
    };
  },

  async getComplianceDocuments(
    query: ComplianceDocumentQuery = {},
  ): Promise<ComplianceDocumentListResponse> {
    const response: any = await api.get(
      withQuery(
        "/admin/verification-compliance/documents",
        {
          search: query.search,
          source: query.source,
          status: query.status,
          page: query.page,
          per_page: query.per_page,
        },
      ),
    );

    return {
      data: Array.isArray(response.data)
        ? response.data
        : [],

      summary: {
        total: Number(
          response.summary?.total ?? 0,
        ),
        verification_request: Number(
          response.summary
            ?.verification_request ?? 0,
        ),
        kyc: Number(
          response.summary?.kyc ?? 0,
        ),
        supplier_certificate: Number(
          response.summary
            ?.supplier_certificate ?? 0,
        ),
        brand_authorization: Number(
          response.summary
            ?.brand_authorization ?? 0,
        ),
        pending_verification: Number(
          response.summary
            ?.pending_verification ?? 0,
        ),
      },

      capabilities: {
        read:
          response.capabilities?.read === true,
        download:
          response.capabilities?.download === true,
        verify_document:
          response.capabilities
            ?.verify_document === true,
        reject_document:
          response.capabilities
            ?.reject_document === true,
        batch_approve:
          response.capabilities
            ?.batch_approve === true,
        request_replacement:
          response.capabilities
            ?.request_replacement === true,
        revalidate:
          response.capabilities?.revalidate === true,
        audit_export:
          response.capabilities?.audit_export === true,
      },

      current_page: Number(
        response.current_page ?? 1,
      ),
      per_page: Number(
        response.per_page ??
          query.per_page ??
          20,
      ),
      total: Number(
        response.total ?? 0,
      ),
      last_page: Number(
        response.last_page ?? 1,
      ),
    };
  },

  async getProductSafety(
    query: ProductSafetyQuery = {},
  ): Promise<ProductSafetyListResponse> {
    const response: any = await api.get(
      withQuery(
        "/admin/verification-compliance/product-safety",
        {
          search: query.search,
          compliance_status:
            query.compliance_status &&
            query.compliance_status !== "all"
              ? query.compliance_status
              : undefined,
          page: query.page,
          per_page: query.per_page,
        },
      ),
    );

    return {
      data: Array.isArray(response.data)
        ? response.data
        : [],

      summary: {
        total: Number(
          response.summary?.total ?? 0,
        ),
        pending_review: Number(
          response.summary?.pending_review ?? 0,
        ),
        approved: Number(
          response.summary?.approved ?? 0,
        ),
        changes_requested: Number(
          response.summary
            ?.changes_requested ?? 0,
        ),
        rejected: Number(
          response.summary?.rejected ?? 0,
        ),
        not_required: Number(
          response.summary?.not_required ?? 0,
        ),
        expiry_control_required: Number(
          response.summary
            ?.expiry_control_required ?? 0,
        ),
        batch_tracking_required: Number(
          response.summary
            ?.batch_tracking_required ?? 0,
        ),
        with_warnings: Number(
          response.summary?.with_warnings ?? 0,
        ),
      },

      capabilities: {
        read:
          response.capabilities?.read === true,
        review_profile:
          response.capabilities
            ?.review_profile === true,
        approve_safety:
          response.capabilities
            ?.approve_safety === true,
        reject_safety:
          response.capabilities
            ?.reject_safety === true,
        block_publication:
          response.capabilities
            ?.block_publication === true,
        ingredient_risk_assessment:
          response.capabilities
            ?.ingredient_risk_assessment === true,
        laboratory_evidence:
          response.capabilities
            ?.laboratory_evidence === true,
        regulatory_registration:
          response.capabilities
            ?.regulatory_registration === true,
        claims_review:
          response.capabilities
            ?.claims_review === true,
        packaging_review:
          response.capabilities
            ?.packaging_review === true,
        safety_report_export:
          response.capabilities
            ?.safety_report_export === true,
      },

      current_page: Number(
        response.current_page ?? 1,
      ),
      per_page: Number(
        response.per_page ??
          query.per_page ??
          20,
      ),
      total: Number(
        response.total ?? 0,
      ),
      last_page: Number(
        response.last_page ?? 1,
      ),
    };
  },

  async getRecalls(
    query: RecallQuery = {},
  ): Promise<RecallListResponse> {
    const response: any = await api.get(
      withQuery(
        "/admin/verification-compliance/recalls",
        {
          search: query.search,
          state:
            query.state ??
            "recalled_or_quarantined",
          page: query.page,
          per_page: query.per_page,
        },
      ),
    );

    return {
      data: Array.isArray(response.data)
        ? response.data
        : [],

      summary: {
        recalled_batches: Number(
          response.summary
            ?.recalled_batches ?? 0,
        ),
        quarantined_batches: Number(
          response.summary
            ?.quarantined_batches ?? 0,
        ),
        recalled_and_quarantined: Number(
          response.summary
            ?.recalled_and_quarantined ?? 0,
        ),
        active_batches: Number(
          response.summary?.active_batches ?? 0,
        ),
      },

      capabilities: {
        read:
          response.capabilities?.read === true,
        create_recall_incident:
          response.capabilities
            ?.create_recall_incident === true,
        update_recall_incident:
          response.capabilities
            ?.update_recall_incident === true,
        recall_classification:
          response.capabilities
            ?.recall_classification === true,
        lifecycle_management:
          response.capabilities
            ?.lifecycle_management === true,
        criticality_assessment:
          response.capabilities
            ?.criticality_assessment === true,
        corrective_action:
          response.capabilities
            ?.corrective_action === true,
        recall_report_export:
          response.capabilities
            ?.recall_report_export === true,
      },

      current_page: Number(
        response.current_page ?? 1,
      ),
      per_page: Number(
        response.per_page ??
          query.per_page ??
          20,
      ),
      total: Number(
        response.total ?? 0,
      ),
      last_page: Number(
        response.last_page ?? 1,
      ),
    };
  },

  async getGovernanceRules(
    query: GovernanceQuery = {},
  ): Promise<GovernanceListResponse> {
    const response: any = await api.get(
      withQuery(
        "/admin/verification-compliance/governance",
        {
          search: query.search,
          status: query.status,
          severity: query.severity,
          rule_type: query.rule_type,
          page: query.page,
          per_page: query.per_page,
        },
      ),
    );

    return {
      scope: {
        type: "platform_global",
        tenant_owned: false,

        description: String(
          response.scope?.description ??
            "Platform-wide compliance governance definitions.",
        ),
      },

      data: Array.isArray(response.data)
        ? response.data
        : [],

      summary: {
        total: Number(
          response.summary?.total ?? 0,
        ),
        active: Number(
          response.summary?.active ?? 0,
        ),
        inactive: Number(
          response.summary?.inactive ?? 0,
        ),
        low_severity: Number(
          response.summary?.low_severity ?? 0,
        ),
        medium_severity: Number(
          response.summary
            ?.medium_severity ?? 0,
        ),
        high_severity: Number(
          response.summary?.high_severity ?? 0,
        ),
        critical_severity: Number(
          response.summary
            ?.critical_severity ?? 0,
        ),
      },

      rule_types: Array.isArray(
        response.rule_types,
      )
        ? response.rule_types.map(
            (value: unknown) =>
              String(value),
          )
        : [],

      capabilities: {
        read:
          response.capabilities?.read === true,
        create_rule:
          response.capabilities
            ?.create_rule === true,
        update_rule:
          response.capabilities
            ?.update_rule === true,
        delete_rule:
          response.capabilities
            ?.delete_rule === true,
        publish_rule:
          response.capabilities
            ?.publish_rule === true,
        approve_rule:
          response.capabilities
            ?.approve_rule === true,
        version_rule:
          response.capabilities
            ?.version_rule === true,
        import_rules:
          response.capabilities
            ?.import_rules === true,
        export_rules:
          response.capabilities
            ?.export_rules === true,
      },

      current_page: Number(
        response.current_page ?? 1,
      ),
      per_page: Number(
        response.per_page ??
          query.per_page ??
          20,
      ),
      total: Number(
        response.total ?? 0,
      ),
      last_page: Number(
        response.last_page ?? 1,
      ),
    };
  },

  async getReportsOverview(): Promise<ComplianceReportsOverview> {
    const response: any =
      await api.get(
        "/admin/verification-compliance/reports/overview",
      );

    return {
      generated_at:
        String(
          response.generated_at ?? "",
        ),

      cases: {
        total: Number(
          response.cases?.total ?? 0,
        ),

        open: Number(
          response.cases?.open ?? 0,
        ),

        resolved: Number(
          response.cases?.resolved ?? 0,
        ),

        pending_compliance: Number(
          response.cases
            ?.pending_compliance ?? 0,
        ),
      },

      documents: {
        total: Number(
          response.documents?.total ?? 0,
        ),

        verification_request: Number(
          response.documents
            ?.verification_request ?? 0,
        ),

        kyc: Number(
          response.documents?.kyc ?? 0,
        ),

        supplier_certificate: Number(
          response.documents
            ?.supplier_certificate ?? 0,
        ),

        brand_authorization: Number(
          response.documents
            ?.brand_authorization ?? 0,
        ),

        pending_verification: Number(
          response.documents
            ?.pending_verification ?? 0,
        ),
      },

      product_safety: {
        total: Number(
          response.product_safety
            ?.total ?? 0,
        ),

        pending_review: Number(
          response.product_safety
            ?.pending_review ?? 0,
        ),

        approved: Number(
          response.product_safety
            ?.approved ?? 0,
        ),

        changes_requested: Number(
          response.product_safety
            ?.changes_requested ?? 0,
        ),

        rejected: Number(
          response.product_safety
            ?.rejected ?? 0,
        ),

        not_required: Number(
          response.product_safety
            ?.not_required ?? 0,
        ),

        expiry_control_required: Number(
          response.product_safety
            ?.expiry_control_required ?? 0,
        ),

        batch_tracking_required: Number(
          response.product_safety
            ?.batch_tracking_required ?? 0,
        ),

        with_warnings: Number(
          response.product_safety
            ?.with_warnings ?? 0,
        ),
      },

      recalls: {
        recalled_batches: Number(
          response.recalls
            ?.recalled_batches ?? 0,
        ),

        quarantined_batches: Number(
          response.recalls
            ?.quarantined_batches ?? 0,
        ),

        recalled_and_quarantined:
          Number(
            response.recalls
              ?.recalled_and_quarantined ??
              0,
          ),

        active_batches: Number(
          response.recalls
            ?.active_batches ?? 0,
        ),
      },

      governance: {
        total: Number(
          response.governance?.total ?? 0,
        ),

        active: Number(
          response.governance?.active ?? 0,
        ),

        inactive: Number(
          response.governance?.inactive ?? 0,
        ),

        low_severity: Number(
          response.governance
            ?.low_severity ?? 0,
        ),

        medium_severity: Number(
          response.governance
            ?.medium_severity ?? 0,
        ),

        high_severity: Number(
          response.governance
            ?.high_severity ?? 0,
        ),

        critical_severity: Number(
          response.governance
            ?.critical_severity ?? 0,
        ),
      },

      governance_scope: {
        type:
          "platform_global",

        tenant_owned:
          false,

        description:
          String(
            response.governance_scope
              ?.description ??
              "Platform-wide compliance governance definitions.",
          ),
      },

      capabilities: {
        read_overview:
          response.capabilities
            ?.read_overview === true,

        generate_report:
          response.capabilities
            ?.generate_report === true,

        export_report:
          response.capabilities
            ?.export_report === true,

        schedule_report:
          response.capabilities
            ?.schedule_report === true,

        saved_reports:
          response.capabilities
            ?.saved_reports === true,

        report_history:
          response.capabilities
            ?.report_history === true,

        custom_report_builder:
          response.capabilities
            ?.custom_report_builder === true,

        sla_analytics:
          response.capabilities
            ?.sla_analytics === true,

        trend_analytics:
          response.capabilities
            ?.trend_analytics === true,

        health_score:
          response.capabilities
            ?.health_score === true,

        risk_scoring:
          response.capabilities
            ?.risk_scoring === true,

        regional_analytics:
          response.capabilities
            ?.regional_analytics === true,
      },
    };
  },

  async getComplianceAudit(
  query: ComplianceAuditQuery = {},
): Promise<ComplianceAuditListResponse> {
  const response: any = await api.get(
    withQuery(
      "/admin/verification-compliance/audit",
      {
        search: query.search,
        action: query.action,
        case_id: query.case_id,
        page: query.page,
        per_page: query.per_page,
      },
    ),
  );

  return {
    data: Array.isArray(response.data)
      ? response.data.map(
          (record: any): ComplianceAuditRecord => ({
            id: Number(record.id),

            uuid:
              String(record.uuid ?? ""),

            case:
              record.case &&
              typeof record.case === "object"
                ? {
                    id: Number(
                      record.case.id,
                    ),

                    uuid: String(
                      record.case.uuid ?? "",
                    ),

                    status: String(
                      record.case.status ?? "",
                    ),
                  }
                : null,

            subject: {
              type:
                record.subject?.type ??
                null,

              id:
                record.subject?.id ??
                null,
            },

            actor:
              record.actor &&
              typeof record.actor === "object"
                ? {
                    id: Number(
                      record.actor.id,
                    ),

                    name:
                      record.actor.name ??
                      null,

                    email:
                      record.actor.email ??
                      null,
                  }
                : null,

            action:
              String(
                record.action ?? "",
              ),

            before:
              record.before ?? null,

            after:
              record.after ?? null,

            reason:
              record.reason ?? null,

            rule_version:
              record.rule_version ?? null,

            correlation_id:
              record.correlation_id ??
              null,

            occurred_at:
              record.occurred_at ?? null,
          }),
        )
      : [],

    summary: {
      total: Number(
        response.summary?.total ?? 0,
      ),

      last_24_hours: Number(
        response.summary
          ?.last_24_hours ?? 0,
      ),

      last_30_days: Number(
        response.summary
          ?.last_30_days ?? 0,
      ),

      cases_with_activity:
        Number(
          response.summary
            ?.cases_with_activity ?? 0,
        ),
    },

    capabilities: {
      read:
        response.capabilities
          ?.read === true,

      export:
        response.capabilities
          ?.export === true,
    },

    current_page: Number(
      response.current_page ?? 1,
    ),

    per_page: Number(
      response.per_page ??
        query.per_page ??
        20,
    ),

    total: Number(
      response.total ?? 0,
    ),

    last_page: Number(
      response.last_page ?? 1,
    ),
  };
},
};