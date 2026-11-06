export const VERIFICATION_COMPLIANCE_PERMISSIONS = {
  view: "compliance.view",

  cases: {
    view: "compliance.cases.view",
    assign: "compliance.cases.assign",
    review: "compliance.cases.review",
    pass: "compliance.cases.pass",
    fail: "compliance.cases.fail",
    requestChanges:
      "compliance.cases.request_changes",
    escalate: "compliance.cases.escalate",
  },

  evidence: {
    view: "compliance.evidence.view",
    manage: "compliance.evidence.manage",
  },

  rules: {
    view: "compliance.rules.view",
    manage: "compliance.rules.manage",
  },

  exceptions: {
    view: "compliance.exceptions.view",
    approve: "compliance.exceptions.approve",
  },

  blocked: {
    view: "compliance.blocked.view",
  },

  reports: {
    view: "compliance.reports.view",
  },

  audit: {
    view: "compliance.audit.view",
  },
} as const;