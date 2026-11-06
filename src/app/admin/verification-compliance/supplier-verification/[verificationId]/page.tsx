"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
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
import { VERIFICATION_COMPLIANCE_PERMISSIONS } from "@/features/verification-compliance/permissions/verificationCompliancePermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";
import type { SupplierSummary } from "@/services/api/brandsSuppliers";

type SupplierDetailResponse = Awaited<
  ReturnType<typeof brandsSuppliersApi.getVerificationCase>
>;

function statusClasses(
  status: string | null | undefined,
) {
  const value = String(
    status ?? "",
  ).toLowerCase();

  if (value === "approved") {
    return "bg-green-50 text-green-700 border-green-200";
  }

  if (value === "rejected") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function SupplierVerificationCaseDetailPage() {
  const params = useParams();

  const verificationId =
    typeof params?.verificationId === "string"
      ? params.verificationId
      : "";

  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canView = hasPermission(
    VERIFICATION_COMPLIANCE_PERMISSIONS.cases.view,
  );

  const canAssign = hasPermission(VERIFICATION_COMPLIANCE_PERMISSIONS.cases.assign);
  const canReview = hasPermission(VERIFICATION_COMPLIANCE_PERMISSIONS.cases.review);
  const canPass = hasPermission(VERIFICATION_COMPLIANCE_PERMISSIONS.cases.pass);
  const canFail = hasPermission(VERIFICATION_COMPLIANCE_PERMISSIONS.cases.fail);
  const canVerify = canAssign || canReview || canPass || canFail;

  const [loading, setLoading] =
    useState(canView);

  const [mutating, setMutating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [notice, setNotice] =
    useState<string | null>(null);

  const [data, setData] =
    useState<SupplierDetailResponse | null>(
      null,
    );

  const fetchSupplier =
    useCallback(async () => {
      if (!canView || !verificationId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await brandsSuppliersApi.getVerificationCase(
            verificationId,
          );

        setData(response);
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to load supplier verification case:",
          requestError,
        );

        setError(
          requestError.message ||
            "Unable to load supplier verification case.",
        );
      } finally {
        setLoading(false);
      }
    }, [canView, verificationId]);

  useEffect(() => {
    void fetchSupplier();
  }, [fetchSupplier]);

  const runAction = async (action: "assign" | "request-information" | "approve" | "reject") => {
      if (!canVerify || !verificationId) {
        return;
      }

      setMutating(true);
      setError(null);
      setNotice(null);

      try {
        const expected = data?.updated_at ?? undefined;
        let response: any;

        if (action === "assign") {
          response = await brandsSuppliersApi.assignVerificationReviewer(verificationId, expected);
        } else if (action === "request-information") {
          const notes = window.prompt("Information required from the supplier");
          if (!notes) return;
          response = await brandsSuppliersApi.requestVerificationInformation(verificationId, notes, expected);
        } else if (action === "approve") {
          response = await brandsSuppliersApi.approveVerification(verificationId, undefined, expected);
        } else {
          const reason = window.prompt("Reason for rejection");
          if (!reason) return;
          response = await brandsSuppliersApi.rejectVerification(verificationId, reason, expected);
        }

        setNotice(response.message);

        await fetchSupplier();
      } catch (reason) {
        const requestError =
          reason as Error;

        console.error(
          "Failed to update supplier verification:",
          requestError,
        );

        setError(
          requestError.message ||
            "Unable to update supplier verification.",
        );
      } finally {
        setMutating(false);
      }
    };

  const supplier =
    data?.supplier as
      | (SupplierSummary &
          Record<string, any>)
      | undefined;

  const contextItems = [
    {
      label: "Tenant",
      value: tenant.name,
    },
    {
      label: "Ecosystem",
      value: ecosystem.name,
    },
    {
      label: "Business Unit",
      value:
        businessUnit?.name ??
        "All permitted units",
    },
    {
      label: "Channel",
      value:
        channel?.name ??
        "All permitted channels",
    },
    {
      label: "Sector Pack",
      value:
        sectorPack?.name ??
        "Not assigned",
    },
    {
      label: "Supplier",
      value: verificationId,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f8]">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw
            size={16}
            className="animate-spin"
          />

          Loading verification case…
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f8] p-6">
        <div className="max-w-md rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle
            size={32}
            className="mx-auto mb-3 text-amber-500"
          />

          <h2 className="text-lg font-bold text-gray-900">
            Verification Case Not Found
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            No supplier matched case reference{" "}
            <span className="font-mono">
              {verificationId}
            </span>
            .
          </p>

          {error && (
            <p className="mt-3 text-xs text-rose-600">
              {error}
            </p>
          )}

          <Link
            href="/admin/verification-compliance/supplier-verification"
            className="mt-4 inline-block rounded bg-[#7a0023] px-4 py-2 text-xs font-semibold text-white hover:bg-[#a0002b]"
          >
            Return to Verification Queue
          </Link>
        </div>
      </div>
    );
  }

  const verificationStatus = data?.verification_status ?? "unknown";

  return (
    <PermissionGuard
      permission={
        VERIFICATION_COMPLIANCE_PERMISSIONS.cases.view
      }
      fallback={
        <div className="p-6">
          Supplier access required.
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-12 space-y-4">
          {/* HEADER */}
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/verification-compliance/supplier-verification"
                className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50"
                aria-label="Back to supplier verification"
              >
                <ArrowLeft size={16} />
              </Link>

              <div>
                <div className="text-[11px] text-gray-500 font-medium">
                  Verification &amp; Compliance /
                  Supplier Verification / Supplier{" "}
                  {verificationId}
                </div>

                <h1 className="text-xl font-bold text-gray-900">
                  Supplier Verification Case Review
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  void fetchSupplier()
                }
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={13} />
                Refresh
              </button>

              {canAssign && ["pending", "information_requested", "under_review"].includes(verificationStatus) && (
                  <button type="button" disabled={mutating} onClick={() => void runAction("assign")} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded disabled:opacity-50">
                    Assign to Me
                  </button>
                )}

              {canReview && ["pending", "information_requested", "under_review"].includes(verificationStatus) && (
                  <button type="button" disabled={mutating} onClick={() => void runAction("request-information")} className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded disabled:opacity-50">
                    Request Information
                  </button>
                )}

              {canPass && verificationStatus !== "approved" && (
                  <button
                    type="button"
                    disabled={mutating}
                    onClick={() =>
                      void runAction("approve")
                    }
                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2
                      size={14}
                    />
                    Approve Verification
                  </button>
                )}

              {canFail &&
                verificationStatus !==
                  "rejected" && (
                  <button
                    type="button"
                    disabled={mutating}
                    onClick={() =>
                      void runAction("reject")
                    }
                    className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded hover:bg-rose-700 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    Reject Verification
                  </button>
                )}
            </div>
          </header>

          <ContextScopeBar
            items={contextItems}
            lastSynced="On request"
            accessNote="Supplier verification is resolved within the authenticated tenant context"
          />

          {error && (
            <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          {notice && (
            <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
              {notice}
            </div>
          )}

          {/* SUPPLIER IDENTITY */}
          <section className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                <Building2 size={24} />
              </div>

              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">
                    {supplier.company_name ||
                      supplier.name}
                  </h2>

                  <span
                    className={`border px-2 py-0.5 rounded text-[10px] font-bold capitalize ${statusClasses(
                      verificationStatus,
                    )}`}
                  >
                    {verificationStatus}
                  </span>
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  Supplier ID:{" "}
                  {supplier.id}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-xs">
              <div>
                <div className="text-gray-400">
                  Business Type
                </div>
                <strong>
                  {supplier.business_type ||
                    supplier.type ||
                    "—"}
                </strong>
              </div>

              <div>
                <div className="text-gray-400">
                  Country
                </div>
                <strong>
                  {supplier.country ?? "—"}
                </strong>
              </div>

              <div>
                <div className="text-gray-400">
                  Email
                </div>
                <strong className="break-all">
                  {supplier.email ?? "—"}
                </strong>
              </div>

              <div>
                <div className="text-gray-400">
                  Phone
                </div>
                <strong>
                  {supplier.phone ?? "—"}
                </strong>
              </div>
            </div>
          </section>

          {/* VERIFICATION DOSSIER */}
          <section className="bg-white border border-gray-200 rounded-md p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Verification Dossier
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Current Admin backend exposes
                the supplier profile and
                verification decision state.
                Document-level KYC evidence is
                not currently exposed by this
                endpoint.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="border border-gray-100 rounded p-3">
                <div className="text-gray-400">
                  Supplier Profile
                </div>
                <div className="font-bold text-green-700 mt-1">
                  Available
                </div>
              </div>

              <div className="border border-gray-100 rounded p-3">
                <div className="text-gray-400">
                  Verification Status
                </div>
                <div className="font-bold text-gray-900 mt-1 capitalize">
                  {verificationStatus}
                </div>
              </div>

              <div className="border border-gray-100 rounded p-3">
                <div className="text-gray-400">
                  Business Registration
                  Documents
                </div>
                <div className="font-semibold text-gray-400 mt-1">
                  Unavailable
                </div>
              </div>

              <div className="border border-gray-100 rounded p-3">
                <div className="text-gray-400">
                  Tax / TIN Documentation
                </div>
                <div className="font-semibold text-gray-400 mt-1">
                  Unavailable
                </div>
              </div>

              <div className="border border-gray-100 rounded p-3">
                <div className="text-gray-400">
                  Bank Verification
                </div>
                <div className="font-semibold text-gray-400 mt-1">
                  Unavailable
                </div>
              </div>

              <div className="border border-gray-100 rounded p-3">
                <div className="text-gray-400">
                  Director Identity Evidence
                </div>
                <div className="font-semibold text-gray-400 mt-1">
                  Unavailable
                </div>
              </div>
            </div>
          </section>
        </main>

        <RightIntelligenceRail>
          <RailSection title="Verification Status">
            <HealthScoreGauge
              score={0}
              label="Verification"
              statusText={
                verificationStatus ===
                "approved"
                  ? "Approved"
                  : verificationStatus ===
                      "rejected"
                    ? "Rejected"
                    : "Pending"
              }
              statusColor={
                verificationStatus ===
                "approved"
                  ? "#16a34a"
                  : verificationStatus ===
                      "rejected"
                    ? "#dc2626"
                    : "#d97706"
              }
              metrics={[]}
            />
          </RailSection>

          <RailSection title="Decision Authority">
            {canVerify ? (
              <div className="text-xs rounded border border-green-100 bg-green-50 p-2.5 text-green-700">
                You can update this supplier verification status.
              </div>
            ) : (
              <div className="text-xs rounded border border-gray-100 bg-gray-50 p-2.5 text-gray-500">
                This verification case is
                read-only in your current
                administrator context.
              </div>
            )}
          </RailSection>

          <RailSection title="Verification Workflow">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Pending</span>
                <strong>Supported</strong>
              </div>

              <div className="flex justify-between">
                <span>Verified</span>
                <strong>Supported</strong>
              </div>

              <div className="flex justify-between">
                <span>Rejected</span>
                <strong>Supported</strong>
              </div>
            </div>
          </RailSection>

          <RailSection title="Unavailable Evidence">
            <div className="space-y-1 text-[11px] text-gray-500">
              <div>KYC documents</div>
              <div>Legal-review stages</div>
              <div>Assigned reviewer</div>
              <div>SLA timer</div>
              <div>Risk score</div>
            </div>
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}
