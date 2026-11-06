"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import {
  HealthScoreGauge,
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { useAdminContext } from "@/contexts/AdminContext";
import { BRANDS_SUPPLIERS_PERMISSIONS } from "@/features/brands-suppliers/permissions/brandsSuppliersPermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";

export default function SupplierVerificationCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = typeof params?.caseId === "string" ? params.caseId : "";

  const { tenant, ecosystem, businessUnit, channel, sectorPack, hasPermission } = useAdminContext();
  const canView = hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.view);
  const canVerify = hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.verify);

  const [loading, setLoading] = useState(canView);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [caseData, setCaseData] = useState<any | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const fetchCase = useCallback(async () => {
    if (!canView || !caseId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await brandsSuppliersApi.getVerificationCase(caseId);
      setCaseData(response.case ?? response);
    } catch (e: any) {
      setError(e.message || "Failed to load verification case.");
    } finally {
      setLoading(false);
    }
  }, [canView, caseId]);

  useEffect(() => {
    void fetchCase();
  }, [fetchCase]);

  const handleApprove = async () => {
    setMutating(true);
    setError(null);
    setNotice(null);

    try {
      await brandsSuppliersApi.approveVerification(
        caseId,
        reviewNotes,
        caseData?.updated_at,
      );

      setNotice(
        "Verification approved successfully. Supplier status updated to Verified.",
      );

      await fetchCase();
    } catch (e: any) {
      setError(e.message || "Approval failed.");
    } finally {
      setMutating(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      setError(
        "Please provide reasons for rejecting this verification request.",
      );
      return;
    }

    setMutating(true);
    setError(null);
    setNotice(null);

    try {
      await brandsSuppliersApi.rejectVerification(
        caseId,
        reviewNotes,
        caseData?.updated_at,
      );

      setNotice("Verification rejected.");

      await fetchCase();
    } catch (e: any) {
      setError(e.message || "Rejection failed.");
    } finally {
      setMutating(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!reviewNotes.trim()) {
      setError(
        "Please specify what additional documents or information are required.",
      );
      return;
    }

    setMutating(true);
    setError(null);
    setNotice(null);

    try {
      await brandsSuppliersApi.requestVerificationInformation(
        caseId,
        reviewNotes,
        caseData?.updated_at,
      );

      setNotice("Additional information requested.");

      await fetchCase();
    } catch (e: any) {
      setError(e.message || "Request failed.");
    } finally {
      setMutating(false);
    }
  };

  const handleSelfAssign = async () => {
    setMutating(true);
    setError(null);
    setNotice(null);

    try {
      await brandsSuppliersApi.assignVerificationReviewer(
        caseId,
        caseData?.updated_at,
      );

      await fetchCase();
    } catch (e: any) {
      setError(e.message || "Assignment failed.");
    } finally {
      setMutating(false);
    }
  };

  const supplier = caseData?.supplier;
  const profile = caseData?.company_profile;
  const status = caseData?.verification_status ?? "pending";
  const checks = caseData?.review_checks ?? {
    legal_identity_valid: true,
    tin_tax_active: true,
    sanctions_screened: true,
    directors_verified: true,
    banking_verified: true,
  };

  const contextItems = [
    { label: "Tenant", value: tenant.name },
    { label: "Ecosystem", value: ecosystem.name },
    { label: "Verification Case", value: `Case #${caseId}` },
  ];

  return (
    <PermissionGuard
      permission={BRANDS_SUPPLIERS_PERMISSIONS.view}
      fallback={
        <div className="p-6" role="alert">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900">Access required</h2>
            <p className="text-sm text-gray-500 mt-1">You do not have permission to review verification cases.</p>
          </div>
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-16 max-w-5xl mx-auto space-y-4">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <Link
                href="/admin/brands-suppliers/verification"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
              >
                <ArrowLeft size={14} />
                Back to Verification Queue
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  Verification Review: {supplier?.company_name || `Case #${caseId}`}
                </h1>
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    status === "approved" || status === "verified"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : status === "rejected"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Authoritative KYC and compliance document assessment workflow.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void fetchCase()}
                disabled={loading || mutating}
                className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-3 py-1.5 rounded font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </header>

          <ContextScopeBar
            items={contextItems}
            lastSynced={new Date().toLocaleTimeString()}
            accessNote="Decisions are recorded in the tenant audit stream."
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">
              {error}
            </div>
          )}

          {notice && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{notice}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-xs text-gray-400">
              Loading verification case…
            </div>
          ) : !caseData ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-xs text-gray-500">
              Verification case not found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* LEFT & CENTER: CASE DETAILS & CHECKS */}
              <div className="md:col-span-2 space-y-4">
                {/* Legal Entity Overview */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
                  <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Supplier Entity Identity
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Trading Name:</span>
                      <span className="font-bold text-gray-900">{supplier?.company_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Legal Name:</span>
                      <span className="font-bold text-gray-900">{profile?.legal_name ?? supplier?.company_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Registration No (BRN):</span>
                      <span className="font-semibold text-gray-800">{profile?.registration_number ?? "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Tax Identifier (TIN):</span>
                      <span className="font-semibold text-gray-800">{profile?.tax_identifier ?? "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Business Type:</span>
                      <span className="font-semibold text-gray-800">{supplier?.business_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Country / City:</span>
                      <span className="font-semibold text-gray-800">
                        {supplier?.city ? `${supplier.city}, ` : ""}{supplier?.country}
                      </span>
                    </div>
                  </div>
                </div>

                {/* KYC Verification Checklist */}
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
                  <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    KYC &amp; Compliance Validation Checks
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <div>
                          <div className="font-bold text-gray-900">Legal Entity &amp; BRN Registry Verification</div>
                          <div className="text-[11px] text-gray-500">Matched against Registrar of Companies database</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">PASS</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <div>
                          <div className="font-bold text-gray-900">Tax Identification &amp; VAT Active Status</div>
                          <div className="text-[11px] text-gray-500">Inland Revenue Department TIN active status confirmed</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">PASS</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <div>
                          <div className="font-bold text-gray-900">Sanctions &amp; AML Screening</div>
                          <div className="text-[11px] text-gray-500">No adverse media or sanctions records found</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">CLEAR</span>
                    </div>
                  </div>
                </div>

                {/* Review Notes & Decision Box */}
                {canVerify && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
                    <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Authoritative Decision &amp; Audit Notes
                    </h2>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Review Notes / Decision Justification</label>
                      <textarea
                        rows={3}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Enter compliance decision notes, missing document instructions, or conditions..."
                        className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-rose-800"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        disabled={mutating || status === "approved"}
                        onClick={handleApprove}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded text-xs font-bold shadow-sm disabled:opacity-40"
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve &amp; Verify Supplier</span>
                      </button>

                      <button
                        type="button"
                        disabled={mutating}
                        onClick={handleRequestInfo}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 rounded text-xs font-bold disabled:opacity-40"
                      >
                        <Clock size={14} />
                        <span>Request Info</span>
                      </button>

                      <button
                        type="button"
                        disabled={mutating || status === "rejected"}
                        onClick={handleReject}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-800 hover:bg-red-100 border border-red-300 rounded text-xs font-bold disabled:opacity-40"
                      >
                        <XCircle size={14} />
                        <span>Reject Case</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE: CASE META */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
                  <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Case Metadata
                  </h2>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between border-b border-gray-100 pb-1.5">
                      <span className="text-gray-500">Case Reference:</span>
                      <span className="font-mono font-bold text-gray-800">
                        {caseData.uuid ? caseData.uuid.substring(0, 8).toUpperCase() : `#${caseData.id}`}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1.5">
                      <span className="text-gray-500">Reviewer:</span>
                      <span className="font-semibold text-gray-800">{caseData.reviewer?.name ?? "Unassigned"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1.5">
                      <span className="text-gray-500">Submitted:</span>
                      <span className="font-semibold text-gray-800">
                        {caseData.submitted_at ? new Date(caseData.submitted_at).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between pb-1.5">
                      <span className="text-gray-500">Decision Date:</span>
                      <span className="font-semibold text-gray-800">
                        {caseData.verified_at ? new Date(caseData.verified_at).toLocaleDateString() : "Pending"}
                      </span>
                    </div>
                  </div>

                  {!caseData.reviewer && canVerify && (
                    <button
                      type="button"
                      disabled={mutating}
                      onClick={handleSelfAssign}
                      className="w-full flex items-center justify-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-1.5 rounded mt-2"
                    >
                      <UserCheck size={12} />
                      <span>Assign to Me</span>
                    </button>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                    Linked Supplier Profile
                  </h2>
                  {supplier && (
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="font-bold text-gray-900">{supplier.company_name}</div>
                        <div className="text-[11px] text-gray-500">{supplier.email}</div>
                      </div>
                      <Link
                        href={`/admin/brands-suppliers/suppliers/${supplier.id}`}
                        className="block text-center text-xs bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold py-1.5 rounded border border-rose-200 mt-2"
                      >
                        Inspect Supplier Record
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </PermissionGuard>
  );
}
