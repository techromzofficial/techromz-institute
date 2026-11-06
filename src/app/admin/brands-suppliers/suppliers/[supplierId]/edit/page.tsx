"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Save,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { useAdminContext } from "@/contexts/AdminContext";
import { BRANDS_SUPPLIERS_PERMISSIONS } from "@/features/brands-suppliers/permissions/brandsSuppliersPermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";

export default function SupplierEditPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = typeof params?.supplierId === "string" ? params.supplierId : "";

  const { tenant, ecosystem, businessUnit, channel, sectorPack, hasPermission } = useAdminContext();
  const canManage = hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.view);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company_name: "",
    legal_name: "",
    registration_number: "",
    tax_id: "",
    business_type: "Manufacturer",
    country: "Sri Lanka",
    city: "",
    address: "",
    email: "",
    phone: "",
    website: "",
    description: "",
    established_year: 2020,
    employee_count: 50,
    annual_revenue: "10000000",
    export_percentage: "0",
  });

  const fetchSupplier = useCallback(async () => {
    if (!canManage || !supplierId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await brandsSuppliersApi.getSupplierDetail(supplierId);
      const raw = response.raw ?? response.supplier;
      const profile = response.companyProfile;

      setExpectedUpdatedAt(raw?.updated_at ?? null);
      setFormData({
        company_name: raw?.company_name ?? "",
        legal_name: profile?.legal_name ?? raw?.company_name ?? "",
        registration_number: profile?.registration_number ?? "",
        tax_id: profile?.tax_identifier ?? "",
        business_type: raw?.business_type ?? "Manufacturer",
        country: raw?.country ?? "Sri Lanka",
        city: raw?.city ?? "",
        address: raw?.address ?? profile?.address_line_1 ?? "",
        email: raw?.email ?? "",
        phone: raw?.phone ?? "",
        website: raw?.website ?? "",
        description: raw?.description ?? "",
        established_year: raw?.established_year ?? 2020,
        employee_count: raw?.employee_count ?? 50,
        annual_revenue: String(raw?.annual_revenue ?? "0"),
        export_percentage: String(raw?.export_percentage ?? "0"),
      });
    } catch (e: any) {
      setError(e.message || "Failed to load supplier.");
    } finally {
      setLoading(false);
    }
  }, [canManage, supplierId]);

  useEffect(() => {
    void fetchSupplier();
  }, [fetchSupplier]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await brandsSuppliersApi.updateSupplier(supplierId, {
        ...formData,
        expected_updated_at: expectedUpdatedAt,
      });

      setSuccess("Supplier updated successfully.");
      setTimeout(() => {
        router.push(`/admin/brands-suppliers/suppliers/${supplierId}`);
      }, 800);
    } catch (e: any) {
      if (e?.errors && typeof e.errors === "object") {
        const errorMessages = Object.entries(e.errors)
          .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .join(" | ");
        setError(`Validation failed — ${errorMessages}`);
      } else {
        setError(e?.response?.data?.message || e.message || "Failed to update supplier.");
      }
      setSaving(false);
    }
  };

  const contextItems = [
    { label: "Tenant", value: tenant.name },
    { label: "Ecosystem", value: ecosystem.name },
    { label: "Editing", value: `Supplier #${supplierId}` },
  ];

  return (
    <PermissionGuard
      permission={BRANDS_SUPPLIERS_PERMISSIONS.view}
      fallback={
        <div className="p-6" role="alert">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900">Access required</h2>
            <p className="text-sm text-gray-500 mt-1">You do not have permission to edit suppliers.</p>
          </div>
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-16 max-w-4xl mx-auto space-y-4">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <Link
                href={`/admin/brands-suppliers/suppliers/${supplierId}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
              >
                <ArrowLeft size={14} />
                Back to Supplier Detail
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Edit Supplier Record
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Update verified supplier metadata with optimistic concurrency validation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchSupplier()}
              disabled={loading || saving}
              className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-3 py-1.5 rounded font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Reload Latest</span>
            </button>
          </header>

          <ContextScopeBar
            items={contextItems}
            lastSynced={new Date().toLocaleTimeString()}
            accessNote="Optimistic concurrency protects against overwrite conflicts."
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void fetchSupplier()}
                className="font-bold underline ml-2"
              >
                Refresh Latest
              </button>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-xs text-gray-400">
              Loading supplier record…
            </div>
          ) : (
            <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4 text-xs">
              <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                Identity &amp; Legal
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Company Trading Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => updateField("company_name", e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-rose-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Legal Entity Name</label>
                  <input
                    type="text"
                    value={formData.legal_name}
                    onChange={(e) => updateField("legal_name", e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Business Registration Number</label>
                  <input
                    type="text"
                    value={formData.registration_number}
                    onChange={(e) => updateField("registration_number", e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tax Identifier (TIN / VAT)</label>
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={(e) => updateField("tax_id", e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Business Type</label>
                  <select
                    value={formData.business_type}
                    onChange={(e) => updateField("business_type", e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  >
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Sole Distributor">Sole Distributor</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Brand Owner">Brand Owner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Link
                  href={`/admin/brands-suppliers/suppliers/${supplierId}`}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || !formData.company_name || !formData.email}
                  className="flex items-center gap-1.5 px-5 py-2 bg-rose-800 text-white rounded text-xs font-bold hover:bg-rose-900 shadow-sm disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>{saving ? "Saving…" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </PermissionGuard>
  );
}
