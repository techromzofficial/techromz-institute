"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  RefreshCw,
  ShieldCheck,
  ArrowLeft,
  FileText,
  Package,
  Activity,
  ShieldAlert,
  Award,
  ExternalLink,
  Edit,
  Ban,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import {
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { SupplierHealthGauge } from "@/components/admin/brands-suppliers/charts/SupplierHealthGauge";
import { Tabs } from "@/components/admin/shared/Tabs";
import { useAdminContext } from "@/contexts/AdminContext";
import { BRANDS_SUPPLIERS_PERMISSIONS } from "@/features/brands-suppliers/permissions/brandsSuppliersPermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";
import type { SupplierSummary } from "@/services/api/brandsSuppliers";

const DETAIL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "Company Profile" },
  { id: "verification", label: "Verification & KYC" },
  { id: "brands", label: "Brand Authorizations" },
  { id: "contracts", label: "Contracts & Agreements" },
  { id: "products", label: "Products & Catalogue" },
  { id: "performance", label: "Performance & SLA" },
  { id: "compliance", label: "Risk & Compliance" },
  { id: "audit", label: "Audit Stream" },
];

type SupplierDetailResponse = Awaited<
  ReturnType<typeof brandsSuppliersApi.getSupplierDetail>
>;

export default function SupplierDetailPage(props: any) {
  const routeParams = useParams<{ supplierId: string }>();
  const params = props?.params ?? routeParams;
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canRead = hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.view);

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(canRead);
  const [data, setData] = useState<SupplierDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!canRead) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await brandsSuppliersApi.getSupplierDetail(params.supplierId);
      setData(response);
    } catch (reason) {
      const requestError = reason as Error & { referenceId?: string | null };
      console.error("Error fetching supplier detail:", requestError);
      setError(requestError.message || "Supplier record not found in this tenant.");
    } finally {
      setLoading(false);
    }
  }, [canRead, params.supplierId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const supplier = data?.supplier as (SupplierSummary & Record<string, any>) | undefined;
  const raw = data?.raw as Record<string, any> | undefined;
  const profile = data?.companyProfile as Record<string, any> | undefined;
  const contracts = data?.contracts ?? [];
  const brandAuthorizations = data?.brandAuthorizations ?? [];
  const products = data?.products ?? [];
  const certificates = data?.certificates ?? [];
  const improvementPlans = data?.improvementPlans ?? [];
  const verificationRequests = data?.verificationRequests ?? [];
  const complianceCases = data?.complianceCases ?? [];
  const auditLogs = data?.auditLogs ?? [];

  const contextItems = [
    { label: "Tenant", value: tenant.name },
    { label: "Ecosystem", value: ecosystem.name },
    { label: "Business Unit", value: businessUnit?.name ?? "All permitted units" },
    { label: "Channel", value: channel?.name ?? "All permitted channels" },
    { label: "Sector Pack", value: sectorPack?.name ?? "Not assigned" },
  ];

  return (
    <PermissionGuard
      permission={BRANDS_SUPPLIERS_PERMISSIONS.view}
      fallback={
        <div className="p-6" role="alert">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900">Supplier access required</h2>
            <p className="text-sm text-gray-500 mt-1">
              You do not have permission to view supplier records for the current tenant.
            </p>
          </div>
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-12">
          {/* HEADER */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
            <div>
              <Link
                href="/admin/brands-suppliers/suppliers"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
              >
                <ArrowLeft size={14} />
                Back to Supplier Management
              </Link>
              <div className="text-[11px] text-gray-500 font-medium mb-1">
                Brands &amp; Suppliers / Suppliers / Detail
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {supplier?.name || `Supplier #${params.supplierId}`}
                </h1>
                {supplier && (
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      supplier.verification_status === "verified"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : supplier.verification_status === "rejected"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {supplier.verification_status}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Tenant-scoped authoritative supplier detail and linked domain relationships.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/brands-suppliers/suppliers/${params.supplierId}/edit`}
                className="flex items-center gap-1.5 text-xs bg-rose-800 text-white px-3 py-1.5 rounded hover:bg-rose-900 shadow-sm font-bold"
              >
                <Edit size={13} />
                <span>Edit Supplier</span>
              </Link>

              <button
                type="button"
                onClick={() => void fetchDetail()}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-2.5 py-1.5 rounded text-gray-600 hover:text-gray-900 disabled:opacity-60"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </header>

          {/* CONTEXT */}
          <ContextScopeBar
            items={contextItems}
            lastSynced={new Date().toLocaleTimeString()}
            accessNote="Access is resolved from the authenticated tenant context"
          />

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="my-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-xs flex items-center justify-between gap-3"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void fetchDetail()}
                className="font-bold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* TABS */}
          <div className="my-4">
            <Tabs
              tabs={DETAIL_TABS}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {/* TAB CONTENTS */}
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-xs text-gray-400">
              Loading authoritative supplier record…
            </div>
          ) : !supplier ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-xs text-gray-500">
              Supplier record not found in the current tenant.
            </div>
          ) : (
            <div className="space-y-4">
              {/* TAB: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm md:col-span-2 space-y-4">
                    <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Identity &amp; Classification
                    </h2>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Trading Name:</span>
                        <span className="font-bold text-gray-900">{supplier.company_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Legal Entity:</span>
                        <span className="font-bold text-gray-900">{profile?.legal_name ?? supplier.company_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Business Type:</span>
                        <span className="font-semibold text-gray-700">{supplier.type ?? "Manufacturer"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Registration No:</span>
                        <span className="font-semibold text-gray-700">{profile?.registration_number ?? "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Tax Identifier:</span>
                        <span className="font-semibold text-gray-700">{profile?.tax_identifier ?? "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Established Year:</span>
                        <span className="font-semibold text-gray-700">{raw?.established_year ?? "—"}</span>
                      </div>
                    </div>

                    <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider pt-3 border-t border-gray-100">
                      Contact &amp; Location
                    </h2>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Email:</span>
                        <span className="font-semibold text-gray-700">{supplier.email ?? "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Phone:</span>
                        <span className="font-semibold text-gray-700">{supplier.phone ?? "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Website:</span>
                        <span className="font-semibold text-gray-700">{supplier.website ?? "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Country / City:</span>
                        <span className="font-semibold text-gray-700">
                          {supplier.city ? `${supplier.city}, ` : ""}{supplier.country ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
                    <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Portfolio Coverage
                    </h2>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-gray-100 pb-1.5">
                        <span className="text-gray-500">Active Products</span>
                        <span className="font-bold text-gray-900">{products.length}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1.5">
                        <span className="text-gray-500">Contracts</span>
                        <span className="font-bold text-gray-900">{contracts.length}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1.5">
                        <span className="text-gray-500">Brand Authorizations</span>
                        <span className="font-bold text-gray-900">{brandAuthorizations.length}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1.5">
                        <span className="text-gray-500">Certificates</span>
                        <span className="font-bold text-gray-900">{certificates.length}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1.5">
                        <span className="text-gray-500">Improvement Plans</span>
                        <span className="font-bold text-gray-900">{improvementPlans.length}</span>
                      </div>
                      <div className="flex justify-between pb-1.5">
                        <span className="text-gray-500">Compliance Cases</span>
                        <span className="font-bold text-gray-900">{complianceCases.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PROFILE */}
              {activeTab === "profile" && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4 text-xs">
                  <h2 className="text-sm font-bold text-gray-900">Legal Company Profile</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Legal Entity Name:</span>
                      <span className="font-bold">{profile?.legal_name ?? supplier.company_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Registration Number:</span>
                      <span className="font-semibold">{profile?.registration_number ?? "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Tax Identifier (TIN/VAT):</span>
                      <span className="font-semibold">{profile?.tax_identifier ?? "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Registered Address:</span>
                      <span className="font-semibold">{profile?.address_line_1 ?? supplier.address ?? "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Annual Revenue:</span>
                      <span className="font-semibold">{raw?.annual_revenue ? `LKR ${Number(raw.annual_revenue).toLocaleString()}` : "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Employee Count:</span>
                      <span className="font-semibold">{raw?.employee_count ?? "—"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: VERIFICATION */}
              {activeTab === "verification" && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4 text-xs">
                  <h2 className="text-sm font-bold text-gray-900">Verification &amp; KYC Requests</h2>
                  {verificationRequests.length === 0 ? (
                    <p className="text-gray-500 py-4">No formal verification cases logged for this supplier.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {verificationRequests.map((req: any) => (
                        <div key={req.id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900">{req.request_type}</div>
                            <div className="text-[11px] text-gray-500">
                              Submitted on {new Date(req.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.verification_status === "approved" || req.verification_status === "verified"
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {req.verification_status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: BRANDS */}
              {activeTab === "brands" && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-gray-900">Brand Authorizations ({brandAuthorizations.length})</h2>
                    <Link
                      href="/admin/brands-suppliers/brand-authorizations"
                      className="text-xs text-rose-800 font-bold hover:underline"
                    >
                      + Manage Authorizations
                    </Link>
                  </div>

                  {brandAuthorizations.length === 0 ? (
                    <p className="text-gray-500 py-4">No brand authorizations linked to this supplier in this tenant.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {brandAuthorizations.map((auth: any) => (
                        <div key={auth.id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900">{auth.brand?.name ?? `Brand #${auth.brand_id}`}</div>
                            <div className="text-[11px] text-gray-500">
                              Type: {auth.authorization_type} • Territory: {auth.territory}
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                auth.status === "approved" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {auth.status}
                            </span>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              Expires: {auth.expires_at ? new Date(auth.expires_at).toLocaleDateString() : "Perpetual"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: CONTRACTS */}
              {activeTab === "contracts" && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-gray-900">Contracts &amp; Commercial Agreements ({contracts.length})</h2>
                    <Link
                      href="/admin/brands-suppliers/contracts"
                      className="text-xs text-rose-800 font-bold hover:underline"
                    >
                      + New Agreement
                    </Link>
                  </div>

                  {contracts.length === 0 ? (
                    <p className="text-gray-500 py-4">No contracts currently recorded for this supplier.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {contracts.map((ctr: any) => (
                        <div key={ctr.id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900">{ctr.contract_number} — {ctr.title}</div>
                            <div className="text-[11px] text-gray-500">
                              Type: {ctr.contract_type} • Version: v{ctr.version} • Annual Value: {ctr.currency} {Number(ctr.annual_value).toLocaleString()}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ctr.status === "active" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {ctr.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PRODUCTS */}
              {activeTab === "products" && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4 text-xs">
                  <h2 className="text-sm font-bold text-gray-900">Supplied Products ({products.length})</h2>
                  {products.length === 0 ? (
                    <p className="text-gray-500 py-4">No products linked to this supplier.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {products.map((prod: any) => (
                        <div key={prod.id} className="border border-gray-100 bg-gray-50 p-3 rounded">
                          <div className="font-bold text-gray-900">{prod.name}</div>
                          <div className="text-[11px] text-gray-500 mt-1">
                            SKU: {prod.sku ?? "—"} • Category: {prod.category?.name ?? "—"}
                          </div>
                          <div className="text-[11px] font-semibold text-rose-800 mt-1">
                            Price: LKR {Number(prod.price ?? 0).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PERFORMANCE */}
              {activeTab === "performance" && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4 text-xs">
                  <h2 className="text-sm font-bold text-gray-900">Performance &amp; SLA Tracking</h2>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border border-gray-100 p-3 rounded bg-gray-50">
                      <div className="text-gray-500 text-[11px]">Rating / Score</div>
                      <div className="text-lg font-bold text-gray-900 mt-1">
                        {supplier.perf ? `${supplier.perf}%` : "95%"}
                      </div>
                    </div>
                    <div className="border border-gray-100 p-3 rounded bg-gray-50">
                      <div className="text-gray-500 text-[11px]">Fulfillment Rate</div>
                      <div className="text-lg font-bold text-green-700 mt-1">98.2%</div>
                    </div>
                    <div className="border border-gray-100 p-3 rounded bg-gray-50">
                      <div className="text-gray-500 text-[11px]">Active Improvement Plans</div>
                      <div className="text-lg font-bold text-gray-900 mt-1">{improvementPlans.length}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: COMPLIANCE */}
              {activeTab === "compliance" && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4 text-xs">
                  <h2 className="text-sm font-bold text-gray-900">Risk Profile &amp; Compliance Cases</h2>
                  {complianceCases.length === 0 ? (
                    <p className="text-gray-500 py-4">No open compliance cases recorded for this supplier.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {complianceCases.map((cs: any) => (
                        <div key={cs.id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900">{cs.case_number} — {cs.case_type}</div>
                            <div className="text-[11px] text-gray-500">Status: {cs.status}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">
                            {cs.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: AUDIT */}
              {activeTab === "audit" && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4 text-xs">
                  <h2 className="text-sm font-bold text-gray-900">Immutable Audit Stream</h2>
                  {auditLogs.length === 0 ? (
                    <p className="text-gray-500 py-4">No audit events logged for this supplier yet.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {auditLogs.map((log: any) => (
                        <div key={log.id} className="py-2.5 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-gray-900">{log.action}</span>
                            <span className="text-gray-500 ml-2">by actor {log.actor_id}</span>
                          </div>
                          <span className="text-gray-400">{new Date(log.occurred_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* RIGHT INTELLIGENCE RAIL */}
        <RightIntelligenceRail>
          <RailSection title="Domain Status">
            <SupplierHealthGauge
              score={null}
              label="Health Score"
              statusText="Not Assessed"
              metrics={[]}
            />
          </RailSection>

          <RailSection title="Quick Summary">
            {supplier && (
              <div className="text-xs space-y-2">
                <div>
                  <span className="text-gray-400 block text-[10px]">Verification:</span>
                  <span className="font-bold uppercase text-[11px]">{supplier.verification_status}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Lifecycle:</span>
                  <span className="font-bold uppercase text-[11px]">{supplier.status}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Products Count:</span>
                  <span className="font-bold">{products.length}</span>
                </div>
              </div>
            )}
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}
