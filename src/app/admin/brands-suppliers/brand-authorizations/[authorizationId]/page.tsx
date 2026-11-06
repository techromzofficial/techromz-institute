"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Ban,
  CheckCircle2,
  RefreshCw,
  RotateCw,
  XCircle,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { useAdminContext } from "@/contexts/AdminContext";
import { BRANDS_SUPPLIERS_PERMISSIONS } from "@/features/brands-suppliers/permissions/brandsSuppliersPermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString();
}

function statusClasses(
  status?: string | null,
) {
  const value = String(
    status ?? "unknown",
  ).toLowerCase();

  if (value === "approved") {
    return "bg-green-50 text-green-700 border-green-200";
  }

  if (value === "submitted") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (value === "rejected") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (value === "suspended") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  if (value === "expired") {
    return "bg-gray-100 text-gray-700 border-gray-300";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function BrandAuthorizationDetailPage() {
  const params = useParams();

  const authorizationId =
    typeof params?.authorizationId === "string"
      ? params.authorizationId
      : "";

  const {
    tenant,
    ecosystem,
    hasPermission,
  } = useAdminContext();

  const canView = hasPermission(
    BRANDS_SUPPLIERS_PERMISSIONS.view,
  );

  const canManage = hasPermission(
    BRANDS_SUPPLIERS_PERMISSIONS.verify,
  );

  const [loading, setLoading] =
    useState(canView);

  const [mutating, setMutating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [notice, setNotice] =
    useState<string | null>(null);

  const [
    authorization,
    setAuthorization,
  ] = useState<any | null>(null);

  /*
   * Existing donor modal structure is preserved.
   *
   * Internally we keep revokeModal/handleRevoke naming
   * to avoid unnecessary component churn, but the
   * production action is canonical "suspend".
   */
  const [renewModal, setRenewModal] =
    useState(false);

  const [
    newExpiryDate,
    setNewExpiryDate,
  ] = useState("");

  const [rejectModal, setRejectModal] =
    useState(false);

  const [revokeModal, setRevokeModal] =
    useState(false);

  const [actionReason, setActionReason] =
    useState("");

  const fetchAuthorization =
    useCallback(async () => {
      if (
        !canView ||
        !authorizationId
      ) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response =
          await brandsSuppliersApi
            .getBrandAuthorization(
              authorizationId,
            );

        setAuthorization(response);
      } catch (e: any) {
        setError(
          e.message ||
            "Failed to load brand authorization.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      canView,
      authorizationId,
    ]);

  useEffect(() => {
    void fetchAuthorization();
  }, [fetchAuthorization]);

  const handleApprove = async () => {
    setMutating(true);
    setError(null);
    setNotice(null);

    try {
      await brandsSuppliersApi
        .approveBrandAuthorization(
          authorizationId,
          authorization?.updated_at,

        );

      setNotice(
        "Brand authorization approved successfully.",
      );

      await fetchAuthorization();
    } catch (e: any) {
      setError(
        e.message ||
          "Approval failed.",
      );
    } finally {
      setMutating(false);
    }
  };

  const handleReject = async () => {
    if (!actionReason.trim()) {
      return;
    }

    setMutating(true);
    setError(null);
    setNotice(null);

    try {
      await brandsSuppliersApi
        .rejectBrandAuthorization(
          authorizationId,
          actionReason.trim(),
          authorization?.updated_at,
        );

      setRejectModal(false);
      setActionReason("");

      setNotice(
        "Brand authorization rejected.",
      );

      await fetchAuthorization();
    } catch (e: any) {
      setError(
        e.message ||
          "Rejection failed.",
      );
    } finally {
      setMutating(false);
    }
  };

  const handleRenew = async () => {
    if (!newExpiryDate) {
      return;
    }

    setMutating(true);
    setError(null);
    setNotice(null);

    try {
      await brandsSuppliersApi
        .renewBrandAuthorization(
          authorizationId,
          newExpiryDate,
          authorization?.updated_at,
        );

      setRenewModal(false);
      setNewExpiryDate("");

      setNotice(
        "Brand authorization renewed successfully.",
      );

      await fetchAuthorization();
    } catch (e: any) {
      setError(
        e.message ||
          "Renewal failed.",
      );
    } finally {
      setMutating(false);
    }
  };

  /*
   * Compatibility name retained.
   *
   * brandsSuppliersApi.revokeBrandAuthorization()
   * now calls the canonical backend /suspend route.
   */
  const handleRevoke = async () => {
    if (!actionReason.trim()) {
      return;
    }

    setMutating(true);
    setError(null);
    setNotice(null);

    try {
      await brandsSuppliersApi
        .revokeBrandAuthorization(
          authorizationId,
          actionReason.trim(),
          authorization?.updated_at,

        );

      setRevokeModal(false);
      setActionReason("");

      setNotice(
        "Brand authorization suspended successfully.",
      );

      await fetchAuthorization();
    } catch (e: any) {
      setError(
        e.message ||
          "Suspension failed.",
      );
    } finally {
      setMutating(false);
    }
  };

  const status =
    authorization?.status ??
    "unknown";

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
      label: "Authorization Ref",
      value: `#${authorizationId}`,
    },
  ];

  return (
    <PermissionGuard
      permission={
        BRANDS_SUPPLIERS_PERMISSIONS.view
      }
      fallback={
        <div
          className="p-6"
          role="alert"
        >
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900">
              Access required
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              You do not have permission to
              view brand authorizations.
            </p>
          </div>
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-16 max-w-5xl mx-auto space-y-4">
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/brands-suppliers/authorizations"
                className="p-1.5 bg-white border border-gray-200 rounded hover:bg-gray-50"
                aria-label="Back to brand authorizations"
              >
                <ArrowLeft size={16} />
              </Link>

              <div>
                <div className="text-[11px] text-gray-500 font-medium">
                  Brands &amp; Suppliers /
                  Brand Authorizations / #
                  {authorizationId}
                </div>

                <h1 className="text-xl font-bold text-gray-900">
                  Brand Authorization Review
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void fetchAuthorization()
              }
              disabled={
                loading || mutating
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              <span>Refresh</span>
            </button>
          </header>

          <ContextScopeBar
            items={contextItems}
            lastSynced={new Date().toLocaleTimeString()}
            accessNote="Authorization scope is authoritatively enforced per tenant."
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">
              {error}
            </div>
          )}

          {notice && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2
                size={16}
              />

              <span>{notice}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-xs text-gray-400">
              Loading authorization…
            </div>
          ) : !authorization ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-xs text-gray-500">
              Authorization record not
              found.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* STATUS HEADER */}
              <section className="bg-white border border-gray-200 rounded-md p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-800">
                      <Award size={24} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">
                          {authorization
                            .brand
                            ?.name ??
                            "Brand Authorization"}
                        </h2>

                        <span
                          className={`border px-2 py-0.5 rounded text-[10px] font-bold capitalize ${statusClasses(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        Supplier:{" "}
                        <strong>
                          {authorization
                            .supplier
                            ?.company_name ??
                            "—"}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex flex-wrap gap-2">
                      {/*
                       * Canonical review lifecycle:
                       * submitted -> approved/rejected
                       */}
                      {status ===
                        "submitted" && (
                        <>
                          <button
                            type="button"
                            disabled={
                              mutating
                            }
                            onClick={
                              handleApprove
                            }
                            className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white font-bold px-3 py-1.5 rounded shadow-sm disabled:opacity-40"
                          >
                            <CheckCircle2
                              size={13}
                            />

                            <span>
                              Approve
                              Authorization
                            </span>
                          </button>

                          <button
                            type="button"
                            disabled={
                              mutating
                            }
                            onClick={() => {
                              setActionReason(
                                "",
                              );
                              setRejectModal(
                                true,
                              );
                            }}
                            className="flex items-center gap-1 bg-red-50 text-red-800 hover:bg-red-100 border border-red-200 font-bold px-3 py-1.5 rounded disabled:opacity-40"
                          >
                            <XCircle
                              size={13}
                            />

                            <span>
                              Reject
                            </span>
                          </button>
                        </>
                      )}

                      {/*
                       * Approved authorizations can
                       * be renewed or suspended.
                       */}
                      {status ===
                        "approved" && (
                        <>
                          <button
                            type="button"
                            disabled={
                              mutating
                            }
                            onClick={() =>
                              setRenewModal(
                                true,
                              )
                            }
                            className="flex items-center gap-1 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 font-bold px-3 py-1.5 rounded disabled:opacity-40"
                          >
                            <RotateCw
                              size={13}
                            />

                            <span>
                              Renew Term
                            </span>
                          </button>

                          <button
                            type="button"
                            disabled={
                              mutating
                            }
                            onClick={() => {
                              setActionReason(
                                "",
                              );
                              setRevokeModal(
                                true,
                              );
                            }}
                            className="flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 font-bold px-3 py-1.5 rounded disabled:opacity-40"
                          >
                            <Ban
                              size={13}
                            />

                            <span>
                              Suspend
                            </span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* SCOPE DETAILS */}
              <section className="bg-white border border-gray-200 rounded-md p-5 shadow-sm space-y-3">
                <h2 className="text-sm font-bold text-gray-900">
                  Authorization Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border border-gray-100 rounded p-3 bg-gray-50">
                    <span className="text-gray-400 block text-[11px]">
                      Type:
                    </span>

                    <span className="font-bold text-gray-900">
                      {authorization
                        .authorization_type ??
                        "Direct"}
                    </span>
                  </div>

                  <div className="border border-gray-100 rounded p-3 bg-gray-50">
                    <span className="text-gray-400 block text-[11px]">
                      Territory:
                    </span>

                    <span className="font-bold text-gray-900">
                      {authorization
                        .territory ??
                        "National"}
                    </span>
                  </div>

                  <div className="border border-gray-100 rounded p-3 bg-gray-50">
                    <span className="text-gray-400 block text-[11px]">
                      Starts At:
                    </span>

                    <span className="font-bold text-gray-900">
                      {formatDate(
                        authorization.starts_at,
                      )}
                    </span>
                  </div>

                  <div className="border border-gray-100 rounded p-3 bg-gray-50">
                    <span className="text-gray-400 block text-[11px]">
                      Expires At:
                    </span>

                    <span className="font-bold text-gray-900">
                      {formatDate(
                        authorization.expires_at,
                      )}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* RENEW MODAL */}
          {renewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 space-y-3 text-xs">
                <h3 className="text-sm font-bold text-gray-900">
                  Renew Brand Authorization
                </h3>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    New Expiry Date *
                  </label>

                  <input
                    type="date"
                    required
                    value={
                      newExpiryDate
                    }
                    onChange={(e) =>
                      setNewExpiryDate(
                        e.target.value,
                      )
                    }
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={
                      mutating
                    }
                    onClick={() => {
                      setRenewModal(
                        false,
                      );
                      setNewExpiryDate(
                        "",
                      );
                    }}
                    className="px-3 py-1.5 border rounded disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      mutating ||
                      !newExpiryDate
                    }
                    onClick={
                      handleRenew
                    }
                    className="px-3 py-1.5 bg-blue-700 text-white font-bold rounded disabled:opacity-40"
                  >
                    Confirm Renewal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REJECT MODAL */}
          {rejectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 space-y-3 text-xs">
                <h3 className="text-sm font-bold text-gray-900">
                  Reject Brand
                  Authorization
                </h3>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Reason for Rejection *
                  </label>

                  <textarea
                    rows={3}
                    value={
                      actionReason
                    }
                    onChange={(e) =>
                      setActionReason(
                        e.target.value,
                      )
                    }
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={
                      mutating
                    }
                    onClick={() => {
                      setRejectModal(
                        false,
                      );
                      setActionReason(
                        "",
                      );
                    }}
                    className="px-3 py-1.5 border rounded disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      mutating ||
                      !actionReason.trim()
                    }
                    onClick={
                      handleReject
                    }
                    className="px-3 py-1.5 bg-red-700 text-white font-bold rounded disabled:opacity-40"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUSPEND MODAL */}
          {revokeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 space-y-3 text-xs">
                <h3 className="text-sm font-bold text-gray-900">
                  Suspend Brand
                  Authorization
                </h3>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Reason for Suspension *
                  </label>

                  <textarea
                    rows={3}
                    value={
                      actionReason
                    }
                    onChange={(e) =>
                      setActionReason(
                        e.target.value,
                      )
                    }
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={
                      mutating
                    }
                    onClick={() => {
                      setRevokeModal(
                        false,
                      );
                      setActionReason(
                        "",
                      );
                    }}
                    className="px-3 py-1.5 border rounded disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      mutating ||
                      !actionReason.trim()
                    }
                    onClick={
                      handleRevoke
                    }
                    className="px-3 py-1.5 bg-gray-800 text-white font-bold rounded disabled:opacity-40"
                  >
                    Confirm Suspension
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </PermissionGuard>
  );
}