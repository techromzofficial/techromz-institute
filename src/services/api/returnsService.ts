import {
  mockReturnCases,
  mockReturnsMetrics,
  mockOperationsHealth,
  mockPriorityAlerts,
  mockRefundPerformance,
  mockQuickQueue,
  mockLiabilitySummary,
  mockReturnCaseDetailsMap,
} from "@/mocks/admin/returns.mock";
import type {
  ReturnCaseItem,
  ReturnFilterParams,
  ReturnsMetricSummary,
  ReturnsOperationsHealth,
  PriorityAlert,
  RefundPerformanceMetrics,
  QuickQueueItem,
  LiabilitySummary,
  BulkAssignReturnsDto,
  SaveReturnViewDto,
  ReturnCaseDetails,
} from "@/types/admin";

export async function fetchReturnCases(filters: ReturnFilterParams = {}): Promise<{
  data: ReturnCaseItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  let filtered = [...mockReturnCases];

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        r.returnReference.toLowerCase().includes(q) ||
        r.dbReturnId.toLowerCase().includes(q) ||
        r.orderReference.toLowerCase().includes(q) ||
        r.dbOrderId.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        (r.customerEmail && r.customerEmail.toLowerCase().includes(q)) ||
        r.productName.toLowerCase().includes(q) ||
        r.productSku.toLowerCase().includes(q) ||
        r.supplierName.toLowerCase().includes(q) ||
        r.assignedOfficer.toLowerCase().includes(q)
    );
  }

  if (filters.orderId) {
    const ord = filters.orderId.toLowerCase().trim();
    filtered = filtered.filter(
      (r) => r.orderReference.toLowerCase() === ord || r.dbOrderId.toLowerCase() === ord
    );
  }

  if (filters.returnStatus) {
    filtered = filtered.filter((r) =>
      r.returnType.toLowerCase().includes(filters.returnStatus!.toLowerCase()) ||
      r.eligibilityStatus.toLowerCase().includes(filters.returnStatus!.toLowerCase())
    );
  }

  if (filters.refundStatus) {
    filtered = filtered.filter((r) =>
      r.refundStatus.toLowerCase() === filters.refundStatus!.toLowerCase()
    );
  }

  if (filters.inspectionStatus) {
    filtered = filtered.filter((r) =>
      r.inspectionStatus.toLowerCase() === filters.inspectionStatus!.toLowerCase()
    );
  }

  if (filters.disputeStatus) {
    filtered = filtered.filter((r) =>
      r.disputeStatus.toLowerCase() === filters.disputeStatus!.toLowerCase()
    );
  }

  if (filters.riskLevel) {
    filtered = filtered.filter((r) =>
      r.riskLevel.toLowerCase() === filters.riskLevel!.toLowerCase()
    );
  }

  if (filters.assignedOfficer) {
    if (filters.assignedOfficer === "unassigned") {
      filtered = filtered.filter((r) => r.assignedOfficer === "Unassigned");
    } else if (filters.assignedOfficer === "me") {
      filtered = filtered.filter((r) => r.assignedOfficer === "Elena Vance");
    } else {
      filtered = filtered.filter((r) =>
        r.assignedOfficer.toLowerCase().includes(filters.assignedOfficer!.toLowerCase())
      );
    }
  }

  if (filters.quickFilter) {
    const qf = filters.quickFilter.toLowerCase();
    if (qf.includes("sla breach")) {
      filtered = filtered.filter((r) => r.slaStatus.toLowerCase().includes("breach") || r.riskLevel === "High");
    } else if (qf.includes("authenticity")) {
      filtered = filtered.filter((r) => r.reasonCategory.toLowerCase().includes("authenticity"));
    } else if (qf.includes("safety")) {
      filtered = filtered.filter((r) => r.reasonCategory.toLowerCase().includes("safety"));
    } else if (qf.includes("evidence")) {
      filtered = filtered.filter((r) => r.hasEvidenceRequired);
    }
  }

  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const startIdx = (page - 1) * pageSize;
  const data = filtered.slice(startIdx, startIdx + pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function fetchReturnsMetrics(): Promise<ReturnsMetricSummary> {
  return mockReturnsMetrics;
}

export async function fetchReturnsOperationsHealth(): Promise<ReturnsOperationsHealth> {
  return mockOperationsHealth;
}

export async function fetchPriorityAlerts(): Promise<PriorityAlert[]> {
  return mockPriorityAlerts;
}

export async function fetchRefundPerformance(): Promise<RefundPerformanceMetrics> {
  return mockRefundPerformance;
}

export async function fetchQuickQueue(): Promise<QuickQueueItem[]> {
  return mockQuickQueue;
}

export async function fetchLiabilitySummary(): Promise<LiabilitySummary> {
  return mockLiabilitySummary;
}

export async function bulkAssignReturns(dto: BulkAssignReturnsDto): Promise<{ success: boolean; message: string }> {
  if (!dto.officerName) {
    throw new Error("Officer selection is required.");
  }
  if (!dto.reason.trim()) {
    throw new Error("Reason is required for bulk case assignment.");
  }

  mockReturnCases.forEach((item) => {
    if (dto.returnIds.includes(item.id)) {
      item.assignedOfficer = dto.officerName;
    }
  });

  return {
    success: true,
    message: `Assigned ${dto.returnIds.length} return cases to ${dto.officerName} successfully.`,
  };
}

export { bulkAssignReturns as bulkAssignReturnCases };

export async function exportReturnsCsv(filters: ReturnFilterParams = {}): Promise<string> {
  const result = await fetchReturnCases({ ...filters, page: 1, pageSize: 1000 });
  const headers = [
    "Return Reference",
    "DB Return ID",
    "Order Reference",
    "Customer Name",
    "Product",
    "Supplier",
    "Qty",
    "Return Type",
    "Reason Category",
    "Eligibility Status",
    "Inspection Status",
    "Refund Status",
    "Dispute Status",
    "Risk Level",
    "SLA Status",
    "Assigned Officer",
    "Opened Date",
  ];
  const rows = result.data.map((r) => [
    r.returnReference,
    r.dbReturnId,
    r.orderReference,
    `"${r.customerName}"`,
    `"${r.productName}"`,
    `"${r.supplierName}"`,
    r.quantity,
    `"${r.returnType}"`,
    `"${r.reasonCategory}"`,
    `"${r.eligibilityStatus}"`,
    `"${r.inspectionStatus}"`,
    `"${r.refundStatus}"`,
    `"${r.disputeStatus}"`,
    r.riskLevel,
    `"${r.slaStatus}"`,
    `"${r.assignedOfficer}"`,
    `"${r.openedDate}"`,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export async function saveReturnsView(dto: SaveReturnViewDto): Promise<{ success: boolean; message: string }> {
  if (!dto.name.trim()) {
    throw new Error("View name is required.");
  }
  return {
    success: true,
    message: `Saved view '${dto.name}' successfully.`,
  };
}

export async function fetchReturnCaseDetails(returnId: string): Promise<ReturnCaseDetails | null> {
  const normId = returnId.trim().toUpperCase();
  const directMatch = mockReturnCaseDetailsMap[normId] || mockReturnCaseDetailsMap[returnId];
  if (directMatch) {
    return directMatch;
  }

  // Fallback: check basic mockReturnCases and construct typed detail
  const baseCase = mockReturnCases.find(
    (r) => r.id.toUpperCase() === normId || r.returnReference.toUpperCase() === normId
  );
  if (!baseCase) {
    return null;
  }

  const refAmt = baseCase.refundAmount || 4500.0;

  const defaultDetail: ReturnCaseDetails = {
    ...baseCase,
    publicReference: baseCase.returnReference,
    dbReturnId: baseCase.dbReturnId,
    orderReference: baseCase.orderReference,
    dbOrderId: baseCase.dbOrderId || "9021",
    returnType: baseCase.returnType,
    returnStatus: baseCase.eligibilityStatus || "Eligibility Review",
    productName: baseCase.productName,
    productId: "421",
    sku: baseCase.productSku,
    supplierName: baseCase.supplierName,
    quantity: baseCase.quantity,
    batchNumber: "BT-2024-0098",
    batchId: "BT-2024-0098",
    assignedOfficer: baseCase.assignedOfficer,
    reasonCategory: baseCase.reasonCategory,
    summary: {
      customerStatement: `${baseCase.conditionReported}. Requesting inspection & refund for ${baseCase.productName}.`,
      previousClaimsCount: 1,
      safetyComplaint: baseCase.reasonCategory.toLowerCase().includes("safety"),
      claimCategory: baseCase.reasonCategory,
      authenticityComplaint: baseCase.reasonCategory.toLowerCase().includes("authenticity"),
      reportedCondition: baseCase.conditionReported,
      deliveryDamageSuspected: "Possible",
      productHygieneSensitivity: "High",
      customerRiskProfile: baseCase.riskLevel,
    },
    lifecycle: [
      { step: 1, title: "Return Requested", status: "Completed", timestamp: baseCase.openedDate },
      { step: 2, title: "Eligibility Screening", status: "Completed", timestamp: baseCase.openedDate },
      { step: 3, title: "Evidence Submitted", status: "Completed", timestamp: baseCase.openedDate },
      { step: 4, title: "Return Approved", status: baseCase.inspectionStatus === "PENDING" ? "Pending Inspection Decision" : "Completed" },
      { step: 5, title: "Pickup Scheduled", status: "Not Started" },
      { step: 6, title: "Item Received", status: "Not Started" },
      { step: 7, title: "Inspection Started", status: "Not Started" },
      { step: 8, title: "Inspection Completed", status: "Not Started" },
      { step: 9, title: "Refund Decision", status: "Not Started" },
      { step: 10, title: "Refund Processed", status: "Not Started" },
      { step: 11, title: "Case Resolved", status: "Not Started" },
    ],
    originalOrder: {
      orderReference: baseCase.orderReference,
      dbOrderId: baseCase.dbOrderId || "9021",
      orderDate: "Jul 21, 2026 – 10:42 AM",
      orderTotal: `LKR ${(refAmt * 2).toLocaleString()}`,
      paymentStatus: "Paid",
      deliveryStatus: "Pending Delivery Exception",
      supplierName: baseCase.supplierName,
      productName: baseCase.productName,
      orderedQuantity: baseCase.quantity + 1,
      returnedQuantity: baseCase.quantity,
    },
    customerProfile: {
      customerName: baseCase.customerName,
      customerId: "CUS-2026-01842",
      email: baseCase.customerEmail || "customer@example.com",
      phone: baseCase.customerPhone || "+94771234567",
      customerSince: "Mar 2025",
      totalOrders: 14,
      successfulOrders: 13,
      previousReturns: 1,
      openDisputes: 0,
      repeatClaimRisk: baseCase.riskLevel,
    },
    healthMetrics: {
      caseHealthScore: baseCase.riskLevel === "High" ? 64 : 88,
      riskScore: baseCase.riskLevel === "High" ? 36 : 12,
      riskLevel: baseCase.riskLevel,
      evidenceCompleteness: 80,
      eligibilityConfidence: 92,
      inspectionReadiness: 70,
      refundExposure: `LKR ${refAmt.toLocaleString()}`,
    },
    internalCaseNote: {
      id: "note-01",
      type: "Internal Case Note",
      author: baseCase.assignedOfficer || "Elena Vance",
      role: "Compliance Lead",
      createdAt: baseCase.openedDate,
      visibility: "Internal Only",
      content: "Eligibility review completed. Awaiting inspection decision.",
      lastUpdated: baseCase.openedDate,
    },
    decisionPanel: {
      health: {
        caseHealthScore: baseCase.riskLevel === "High" ? 64 : 88,
        riskScore: baseCase.riskLevel === "High" ? 36 : 12,
        riskLevel: baseCase.riskLevel,
        evidenceCompleteness: 80,
        eligibilityConfidence: 92,
        inspectionReadiness: 70,
        refundExposure: `LKR ${refAmt.toLocaleString()}`,
      },
      blockingIssues: [
        {
          id: "block-1",
          severity: "High",
          title: "Physical inspection not completed",
          targetTab: "inspection",
          actionLabel: "Review Inspection",
        },
      ],
      recommendation: {
        decision: `Approve refund after physical inspection verification for ${baseCase.productName}.`,
        recommendedResolution: "Full Refund",
        recommendedResponsibleParty: "Supplier",
        recommendedRecovery: `LKR ${refAmt.toLocaleString()} supplier recovery`,
      },
      canApproveFullRefund: baseCase.inspectionStatus !== "PENDING" && baseCase.inspectionStatus !== "Pending",
      approveFullRefundDisabledMessage: "Available after inspection completion or through an authorized override.",
    },
    returnedItems: [
      {
        id: "item-1",
        productName: baseCase.productName,
        variant: baseCase.productVariant || "Standard",
        productId: "421",
        sku: baseCase.productSku,
        batchNumber: "BT-2024-0098",
        supplierName: baseCase.supplierName,
        orderedQuantity: baseCase.quantity,
        returnedQuantity: baseCase.quantity,
        unitPrice: refAmt,
        discountAllocation: 0,
        taxAllocation: 350.0,
        reportedCondition: baseCase.conditionReported,
        receivedCondition: "Pending Inspection",
        returnReason: baseCase.reasonCategory,
        inspectionRequirement: "Mandatory Inspection",
        itemEligibility: baseCase.eligibilityStatus,
        itemRefundAmount: refAmt,
      },
    ],
    evidenceList: [
      {
        id: "ev-1",
        title: "Product Defect Photo",
        type: "image",
        url: "/images/evidence/defect-photo.jpg",
        uploadDate: baseCase.openedDate,
        category: "Product Condition",
        verificationStatus: "Verified",
        reviewer: baseCase.assignedOfficer,
        notes: "Evidence uploaded by customer.",
      },
    ],
    eligibilityAssessment: {
      returnWindowResult: "Within 14-day policy window",
      productCategoryRules: "Cosmetics - Returnable if defective",
      hygieneRestrictions: "Seal check mandatory",
      usageRestrictions: "Unused",
      productConditionCheck: baseCase.conditionReported,
      orderDeliveryState: "Delivered",
      previousReturnHistoryCheck: "Low Risk",
      productDefectAssessment: "Pending Inspection",
      safetyException: "None",
      authenticityException: "None",
      manualReviewResult: "Passed initial screening",
      eligibilityConfidence: 92,
      eligibilityDecision: baseCase.eligibilityStatus,
      decisionReason: "Standard policy rules apply.",
    },
    productInspection: {
      inspectionRequirement: "Mandatory Physical Inspection",
      inspectionType: "Visual & Integrity Inspection",
      inspectionFacility: "Colombo Central Fulfillment Facility #2",
      assignedInspector: "Kamal Perera (Senior QC Inspector)",
      scheduledDate: "Jul 23, 2026 - 10:00 AM",
      receivedDate: "Pending Transit",
      conditionFindings: "Awaiting physical arrival at warehouse",
      packagingFindings: "Packaging photos verified",
      sealIntegrity: "Reported Broken / Unverified",
      leakageFindings: "Reported Leaking / Unverified",
      productTexture: "Pending Lab Check",
      productAuthenticity: "Genuine Batch Markings",
      hygieneResult: "Pending Inspection",
      batchResult: "Valid Active Batch",
      inspectorConclusion: "Pending Physical Inspection",
    },
    batchAuthenticity: {
      batchNumber: "BT-2024-0098",
      productionDate: "Jan 15, 2026",
      expiryDate: "Jan 14, 2028",
      supplierBatchReference: "SUP-BT-88402",
      inventoryBatchRecordId: "BT-2024-0098",
      fulfilmentBatchId: "FUL-BT-9021",
      authenticityResult: "Verified Authentic Brand Product",
      serialQrVerification: "Passed",
      packagingVerification: "Hologram Seal Matching Official Spec",
      supplierResponse: "Supplier notified",
      otherComplaintsForBatchCount: 0,
      quarantineStatus: "Normal Operations",
      recallStatus: "No Active Recall",
    },
    refundCalculation: {
      productSubtotal: refAmt - 350,
      productDiscount: 0,
      tax: 350.0,
      shipping: 0,
      usedPromotionalValue: 0,
      loyaltyCredits: 0,
      previousRefunds: 0,
      maxRefundableAmount: refAmt,
      requestedRefund: refAmt,
      recommendedRefund: refAmt,
      approvedRefund: baseCase.refundStatus === "APPROVED" ? refAmt : 0,
      refundMethod: "Original Payment Method",
      currency: baseCase.currency || "LKR",
      financialExposure: `LKR ${refAmt.toLocaleString()}`,
    },
    responsibilityRecovery: {
      supplierRecovery: {
        responsibleParty: baseCase.supplierName,
        percentage: 90,
        reason: "Defect Claim",
        recoverableAmount: refAmt * 0.9,
        recoveryStatus: "Pending Approval",
        recoveryReference: "REC-SUP-9021",
        dueDate: "Aug 05, 2026",
      },
      logisticsClaim: {
        responsibleParty: "SL Express Courier Services",
        percentage: 10,
        reason: "Handling In Transit",
        recoverableAmount: refAmt * 0.1,
        recoveryStatus: "Pending Submission",
        recoveryReference: "REC-LOG-9021",
        dueDate: "Aug 10, 2026",
      },
      platformLiability: {
        responsibleParty: "SL Beauty Platform",
        percentage: 0,
        reason: "N/A",
        recoverableAmount: 0,
        recoveryStatus: "N/A",
        recoveryReference: "-",
        dueDate: "-",
      },
      customerLiability: {
        responsibleParty: "Customer",
        percentage: 0,
        reason: "N/A",
        recoverableAmount: 0,
        recoveryStatus: "N/A",
        recoveryReference: "-",
        dueDate: "-",
      },
    },
    returnLogistics: {
      pickupEligibility: "Eligible for Free Pickup",
      pickupStatus: "Scheduled for Pickup",
      logisticsPartner: "SL Express Courier Services",
      pickupAddress: "Customer Registered Address",
      scheduledPickupDate: "Jul 23, 2026 - 09:00 AM",
      trackingReference: "RET-TRK-7718290",
      receivingWarehouse: "Colombo Central Fulfillment Facility #2",
      receivingCondition: "In Transit",
      returnShippingCost: 350.0,
    },
    communications: [
      {
        id: "comm-1",
        sender: `${baseCase.customerName} (Customer)`,
        recipient: "Support Team",
        channel: "Customer Portal",
        subject: "Return Request Submitted",
        message: baseCase.conditionReported,
        timestamp: baseCase.openedDate,
        deliveryStatus: "Received",
        visibility: "Public & Internal",
      },
    ],
    operationalIssues: [
      {
        id: "issue-1",
        severity: "High",
        category: "Inspection Delay",
        title: "Physical inspection not completed",
        description: "Warehouse item arrival pending transit completion.",
        targetTab: "inspection",
        actionLabel: "Review Inspection",
      },
    ],
    auditHistory: [
      {
        id: "audit-1",
        event: "Return Request Created",
        newValue: baseCase.eligibilityStatus,
        actingUser: baseCase.customerName,
        role: "Customer",
        mandatoryReason: "Claim submitted via portal",
        timestamp: baseCase.openedDate,
        source: "Customer Portal",
      },
    ],
  };

  return defaultDetail;
}

export async function overrideInspection(
  returnId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  if (!reason.trim()) {
    throw new Error("A mandatory reason is required to override physical inspection.");
  }
  const item = mockReturnCases.find((r) => r.id === returnId || r.returnReference === returnId);
  if (item) {
    item.inspectionStatus = "OVERRIDDEN";
  }
  const detail = mockReturnCaseDetailsMap[returnId];
  if (detail) {
    detail.inspectionStatus = "Overridden";
    detail.decisionPanel.canApproveFullRefund = true;
    detail.decisionPanel.approveFullRefundDisabledMessage = undefined;
    detail.auditHistory.unshift({
      id: `audit-${Date.now()}`,
      event: "Inspection Override Granted",
      previousValue: "Pending",
      newValue: "Overridden",
      actingUser: "Elena Vance",
      role: "Compliance Lead",
      mandatoryReason: reason,
      timestamp: new Date().toLocaleString(),
      source: "Admin Decision Panel",
    });
  }
  return {
    success: true,
    message: `Inspection requirement overridden for case ${returnId}.`,
  };
}

export async function approveRefund(
  returnId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const item = mockReturnCases.find((r) => r.id === returnId || r.returnReference === returnId);
  const detail = mockReturnCaseDetailsMap[returnId];
  const canOverride = detail ? detail.decisionPanel.canApproveFullRefund : true;

  if (item && (item.inspectionStatus === "PENDING" || item.inspectionStatus === "REQUIRED") && !canOverride) {
    throw new Error("Full refund approval is blocked while mandatory physical inspection is pending. Override permission required.");
  }
  if (!reason.trim()) {
    throw new Error("A mandatory reason is required to approve refund.");
  }
  if (item) {
    item.refundStatus = "APPROVED";
  }
  if (detail) {
    detail.refundStatus = "Approved";
    detail.auditHistory.unshift({
      id: `audit-${Date.now()}`,
      event: "Full Refund Approved",
      previousValue: "Pending Review",
      newValue: "Approved",
      actingUser: "Elena Vance",
      role: "Compliance Lead",
      mandatoryReason: reason,
      timestamp: new Date().toLocaleString(),
      source: "Admin Decision Panel",
    });
  }
  return {
    success: true,
    message: `Refund approved for case ${returnId}.`,
  };
}

export async function submitReplacementApproval(
  returnId: string,
  reason: string,
  shippingMethod?: string
): Promise<{ success: boolean; message: string }> {
  if (!reason.trim()) {
    throw new Error("A mandatory reason is required to approve product replacement.");
  }
  const detail = mockReturnCaseDetailsMap[returnId];
  if (detail) {
    detail.returnStatus = "Replacement Approved";
    detail.auditHistory.unshift({
      id: `audit-${Date.now()}`,
      event: "Replacement Order Approved",
      newValue: "Approved",
      actingUser: "Elena Vance",
      role: "Compliance Lead",
      mandatoryReason: `${reason}${shippingMethod ? ` (Shipping: ${shippingMethod})` : ""}`,
      timestamp: new Date().toLocaleString(),
      source: "Admin Decision Panel",
    });
  }
  return {
    success: true,
    message: `Replacement order approved for case ${returnId}.`,
  };
}

export async function submitPartialRefund(
  returnId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; message: string }> {
  if (amount <= 0) {
    throw new Error("Partial refund amount must be greater than LKR 0.");
  }
  if (!reason.trim()) {
    throw new Error("A mandatory reason is required to process partial refund.");
  }
  const detail = mockReturnCaseDetailsMap[returnId];
  if (detail) {
    detail.refundStatus = "Partial Refund Approved";
    detail.refundCalculation.approvedRefund = amount;
    detail.auditHistory.unshift({
      id: `audit-${Date.now()}`,
      event: "Partial Refund Approved",
      newValue: `LKR ${amount.toLocaleString()}`,
      actingUser: "Elena Vance",
      role: "Compliance Lead",
      mandatoryReason: reason,
      timestamp: new Date().toLocaleString(),
      source: "Admin Decision Panel",
    });
  }
  return {
    success: true,
    message: `Partial refund of LKR ${amount.toLocaleString()} approved for case ${returnId}.`,
  };
}

export async function submitEvidenceRequest(
  returnId: string,
  recipient: string,
  evidenceType: string,
  instructions: string,
  dueDate: string
): Promise<{ success: boolean; message: string }> {
  if (!instructions.trim()) {
    throw new Error("Instructions are required when requesting additional evidence.");
  }
  const detail = mockReturnCaseDetailsMap[returnId];
  if (detail) {
    detail.hasEvidenceRequired = true;
    detail.auditHistory.unshift({
      id: `audit-${Date.now()}`,
      event: `Additional Evidence Requested (${evidenceType})`,
      newValue: `Recipient: ${recipient}, Due: ${dueDate}`,
      actingUser: "Elena Vance",
      role: "Compliance Lead",
      mandatoryReason: instructions,
      timestamp: new Date().toLocaleString(),
      source: "Admin Decision Panel",
    });
  }
  return {
    success: true,
    message: `Evidence request sent to ${recipient} for case ${returnId}.`,
  };
}

export async function submitScheduleInspection(
  returnId: string,
  facility: string,
  inspector: string,
  scheduledDate: string,
  notes: string
): Promise<{ success: boolean; message: string }> {
  if (!scheduledDate) {
    throw new Error("Scheduled date and time are required.");
  }
  const detail = mockReturnCaseDetailsMap[returnId];
  if (detail) {
    detail.inspectionStatus = "Scheduled";
    detail.productInspection.inspectionFacility = facility;
    detail.productInspection.assignedInspector = inspector;
    detail.productInspection.scheduledDate = scheduledDate;
    detail.auditHistory.unshift({
      id: `audit-${Date.now()}`,
      event: "Inspection Scheduled",
      newValue: `${facility} - ${scheduledDate}`,
      actingUser: "Elena Vance",
      role: "Compliance Lead",
      mandatoryReason: notes || "Scheduled routine return inspection",
      timestamp: new Date().toLocaleString(),
      source: "Admin Decision Panel",
    });
  }
  return {
    success: true,
    message: `Inspection scheduled at ${facility} for case ${returnId}.`,
  };
}

export async function submitRejectReturn(
  returnId: string,
  category: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  if (!reason.trim()) {
    throw new Error("A mandatory reason is required to reject a return case.");
  }
  const detail = mockReturnCaseDetailsMap[returnId];
  if (detail) {
    detail.returnStatus = "Rejected";
    detail.eligibilityStatus = "Not Eligible";
    detail.auditHistory.unshift({
      id: `audit-${Date.now()}`,
      event: `Return Rejected (${category})`,
      previousValue: "Eligibility Review",
      newValue: "Rejected",
      actingUser: "Elena Vance",
      role: "Compliance Lead",
      mandatoryReason: reason,
      timestamp: new Date().toLocaleString(),
      source: "Admin Decision Panel",
    });
  }
  return {
    success: true,
    message: `Return case ${returnId} rejected.`,
  };
}

export async function submitEscalateCase(
  returnId: string,
  priority: string,
  targetTeam: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  if (!reason.trim()) {
    throw new Error("A mandatory reason is required to escalate a return case.");
  }
  const detail = mockReturnCaseDetailsMap[returnId];
  if (detail) {
    detail.returnStatus = "Escalated";
    detail.riskLevel = priority;
    detail.auditHistory.unshift({
      id: `audit-${Date.now()}`,
      event: `Case Escalated to ${targetTeam}`,
      newValue: `Priority: ${priority}`,
      actingUser: "Elena Vance",
      role: "Compliance Lead",
      mandatoryReason: reason,
      timestamp: new Date().toLocaleString(),
      source: "Admin Decision Panel",
    });
  }
  return {
    success: true,
    message: `Case ${returnId} escalated to ${targetTeam} with ${priority} priority.`,
  };
}

export async function submitSuspendDecision(
  returnId: string,
  dependency: string,
  reviewDate: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  if (!reason.trim()) {
    throw new Error("A mandatory reason is required to suspend a decision.");
  }
  const detail = mockReturnCaseDetailsMap[returnId];
  if (detail) {
    detail.returnStatus = "Decision Suspended";
    detail.auditHistory.unshift({
      id: `audit-${Date.now()}`,
      event: `Decision Suspended (Blocker: ${dependency})`,
      newValue: `Review Date: ${reviewDate}`,
      actingUser: "Elena Vance",
      role: "Compliance Lead",
      mandatoryReason: reason,
      timestamp: new Date().toLocaleString(),
      source: "Admin Decision Panel",
    });
  }
  return {
    success: true,
    message: `Decision suspended for case ${returnId} until ${reviewDate}.`,
  };
}

export async function submitInternalNote(
  returnId: string,
  content: string
): Promise<{ success: boolean; message: string }> {
  if (!content.trim()) {
    throw new Error("Note content cannot be empty.");
  }
  const detail = mockReturnCaseDetailsMap[returnId];
  if (detail) {
    detail.internalCaseNote.content = content;
    detail.internalCaseNote.lastUpdated = new Date().toLocaleString();
    detail.auditHistory.unshift({
      id: `audit-${Date.now()}`,
      event: "Internal Case Note Updated",
      actingUser: "Elena Vance",
      role: "Compliance Lead",
      mandatoryReason: "Internal note content modified",
      timestamp: new Date().toLocaleString(),
      source: "Admin Portal",
    });
  }
  return {
    success: true,
    message: "Internal case note saved successfully.",
  };
}
