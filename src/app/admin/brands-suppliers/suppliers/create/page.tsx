"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Save,
  AlertTriangle,
  Building2,
  ShieldCheck,
  FileText,
  Users,
  DollarSign,
  Globe,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { useAdminContext } from "@/contexts/AdminContext";
import { BRANDS_SUPPLIERS_PERMISSIONS } from "@/features/brands-suppliers/permissions/brandsSuppliersPermissions";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";

const STEPS = [
  { step: 1, title: "Company Identity" },
  { step: 2, title: "Legal Registration" },
  { step: 3, title: "Supplier Classification" },
  { step: 4, title: "Contacts & Ownership" },
  { step: 5, title: "Business Units" },
  { step: 6, title: "Channels & Regions" },
  { step: 7, title: "Brands & Relationships" },
  { step: 8, title: "Documents & Certificates" },
  { step: 9, title: "Finance & Settlement" },
  { step: 10, title: "Contracts & Commercial" },
  { step: 11, title: "Catalogue Responsibilities" },
  { step: 12, title: "Users & Access" },
  { step: 13, title: "Review & Submit" },
];

export default function SupplierOnboardingCreatePage() {
  const router = useRouter();
  const { tenant, ecosystem, businessUnit, channel, sectorPack, hasPermission } = useAdminContext();
  const canManage = hasPermission(BRANDS_SUPPLIERS_PERMISSIONS.view);

  const [currentStep, setCurrentStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);

  // 13-step form state
  const [formData, setFormData] = useState<Record<string, any>>({
    // 1 Identity
    company_name: "",
    trading_name: "",
    description: "",
    website: "",
    // 2 Legal
    legal_name: "",
    registration_number: "",
    tax_id: "",
    country: "Sri Lanka",
    city: "Colombo",
    address: "",
    established_year: 2020,
    // 3 Classification
    business_type: "Manufacturer",
    industry: "Beauty & Personal Care",
    employee_count: 50,
    // 4 Contacts
    email: "",
    phone: "",
    primary_contact_name: "",
    primary_contact_role: "Managing Director",
    // 5 Business Units
    business_units: ["B2B Wholesale", "B2C Retail"],
    // 6 Channels & Regions
    sales_channels: ["Online Marketplace", "Direct Retail"],
    regions: ["Western Province", "Central Province"],
    // 7 Brands
    brand_relationships: "Sole Distributor",
    // 8 Documents
    business_registration_doc: "BR-verified.pdf",
    // 9 Finance
    annual_revenue: "15000000",
    currency: "LKR",
    bank_name: "Commercial Bank of Ceylon",
    account_number: "8923481234",
    // 10 Contracts
    contract_type: "standard_supply",
    initial_contract_term: "1 Year",
    // 11 Catalogue
    catalogue_readiness: "Ready for ingestion",
    // 12 Users
    initial_admin_email: "",
    initial_admin_name: "",
    // Submit options
    submit_for_verification: true,
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Duplicate detection debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.company_name || formData.registration_number || formData.tax_id || formData.email) {
        try {
          const res = await brandsSuppliersApi.checkDuplicates({
            company_name: formData.company_name,
            legal_name: formData.legal_name,
            registration_number: formData.registration_number,
            tax_id: formData.tax_id,
            email: formData.email,
          });
          if (res?.has_duplicates) {
            setDuplicates(res.matches || []);
          } else {
            setDuplicates([]);
          }
        } catch (e) {
          // ignore duplicate check errors
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.company_name, formData.registration_number, formData.tax_id, formData.email, formData.legal_name]);

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setError(null);
    try {
      const res = await brandsSuppliersApi.saveOnboardingDraft({
        draft_id: draftId || undefined,
        company_name: formData.company_name,
        current_step: currentStep,
        draft_data: formData,
      });

      if (res?.draft_id) {
        setDraftId(res.draft_id);
      }
      setDraftSavedAt(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(e.message || "Failed to save draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await brandsSuppliersApi.createSupplier({
        ...formData,
        draft_id: draftId || undefined,
      });

      const newId = res?.data?.id ?? res?.id;
      if (newId) {
        router.push(`/admin/brands-suppliers/suppliers/${newId}`);
      } else {
        router.push("/admin/brands-suppliers/suppliers");
      }
    } catch (e: any) {
      if (e?.errors && typeof e.errors === "object") {
        const errorMessages = Object.entries(e.errors)
          .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .join(" | ");
        setError(`Validation failed — ${errorMessages}`);
      } else {
        setError(e?.response?.data?.message || e.message || "Failed to submit supplier onboarding.");
      }
      setSubmitting(false);
    }
  };

  const contextItems = [
    { label: "Tenant", value: tenant.name },
    { label: "Ecosystem", value: ecosystem.name },
    { label: "Scope", value: "Supplier Onboarding Wizard" },
  ];

  return (
    <PermissionGuard
      permission={BRANDS_SUPPLIERS_PERMISSIONS.view}
      fallback={
        <div className="p-6" role="alert">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="font-bold text-gray-900">Access required</h2>
            <p className="text-sm text-gray-500 mt-1">You do not have permission to onboard suppliers.</p>
          </div>
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-16 max-w-5xl mx-auto">
          {/* HEADER */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <Link
                href="/admin/brands-suppliers/suppliers"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
              >
                <ArrowLeft size={14} />
                Back to Supplier Management
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                13-Step Supplier Onboarding Wizard
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Complete enterprise onboarding with automated duplicate intelligence and verification submission.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {draftSavedAt && (
                <span className="text-[11px] text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                  Draft saved at {draftSavedAt}
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={savingDraft}
                className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-3 py-1.5 rounded font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                <Save size={13} />
                <span>{savingDraft ? "Saving…" : "Save Draft"}</span>
              </button>
            </div>
          </header>

          <ContextScopeBar
            items={contextItems}
            lastSynced={new Date().toLocaleTimeString()}
            accessNote="Tenant isolation is server-enforced."
          />

          {/* DUPLICATES ALERT */}
          {duplicates.length > 0 && (
            <div className="my-3 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-amber-600" />
                Duplicate Intelligence Match Detected ({duplicates.length})
              </div>
              {duplicates.map((dup, i) => (
                <div key={i} className="text-[11px]">
                  • <strong>{dup.field}:</strong> {dup.message} (Supplier: #{dup.supplier_id} {dup.supplier_name})
                </div>
              ))}
            </div>
          )}

          {/* ERROR ALERT */}
          {error && (
            <div className="my-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* STEP INDICATOR */}
          <div className="my-4 overflow-x-auto pb-2">
            <div className="flex items-center gap-1 min-w-[750px]">
              {STEPS.map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(s.step)}
                  className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold border transition-colors text-center ${
                    currentStep === s.step
                      ? "bg-rose-800 text-white border-rose-800 shadow-sm"
                      : currentStep > s.step
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="block text-[9px] opacity-75">Step {s.step}</span>
                  <span className="truncate block">{s.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FORM STEP BODY */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-5">
            {/* STEP 1: COMPANY IDENTITY */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Step 1 — Company Identity
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Company Trading Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) => updateField("company_name", e.target.value)}
                      placeholder="e.g. Ceylon Natural Botanicals"
                      className="w-full text-xs border border-gray-300 rounded p-2 focus:ring-1 focus:ring-rose-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateField("website", e.target.value)}
                      placeholder="https://example.com"
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Company Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Brief description of products, operations and capabilities..."
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: LEGAL REGISTRATION */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Step 2 — Legal Registration
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Legal Entity Name *</label>
                    <input
                      type="text"
                      value={formData.legal_name}
                      onChange={(e) => updateField("legal_name", e.target.value)}
                      placeholder="Ceylon Natural Botanicals (Pvt) Ltd"
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Business Registration Number (BRN) *</label>
                    <input
                      type="text"
                      value={formData.registration_number}
                      onChange={(e) => updateField("registration_number", e.target.value)}
                      placeholder="e.g. PV-908234"
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tax ID / VAT Number</label>
                    <input
                      type="text"
                      value={formData.tax_id}
                      onChange={(e) => updateField("tax_id", e.target.value)}
                      placeholder="e.g. TIN-892134000"
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Country *</label>
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
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Registered Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CLASSIFICATION */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Step 3 — Supplier Classification
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Business Type *</label>
                    <select
                      value={formData.business_type}
                      onChange={(e) => updateField("business_type", e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    >
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Sole Distributor">Sole Distributor</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Brand Owner">Brand Owner</option>
                      <option value="Importer">Importer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Industry Sector</label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => updateField("industry", e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Employee Count</label>
                    <input
                      type="number"
                      value={formData.employee_count}
                      onChange={(e) => updateField("employee_count", Number(e.target.value))}
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CONTACTS */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Step 4 — Contacts &amp; Ownership
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Official Company Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="info@company.com"
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Primary Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+94 11 234 5678"
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Primary Contact Name</label>
                    <input
                      type="text"
                      value={formData.primary_contact_name}
                      onChange={(e) => updateField("primary_contact_name", e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Role / Designation</label>
                    <input
                      type="text"
                      value={formData.primary_contact_role}
                      onChange={(e) => updateField("primary_contact_role", e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: BUSINESS UNITS */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Step 5 — Business Unit Assignments
                </h2>
                <p className="text-xs text-gray-500">Select permitted business units in current tenant scope:</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {["Beauty & Cosmetics", "Wellness & Spa", "Professional Salon", "B2B Bulk Wholesale"].map((bu) => (
                    <label key={bu} className="flex items-center gap-2 border border-gray-200 p-2.5 rounded hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" defaultChecked />
                      <span className="font-semibold text-gray-800">{bu}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: CHANNELS & REGIONS */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Step 6 — Sales Channels &amp; Operating Regions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-2">Permitted Channels</label>
                    <div className="space-y-2">
                      {["Online Marketplace", "B2B Portal", "Direct POS Retail"].map((ch) => (
                        <label key={ch} className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <span>{ch}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-2">Operating Regions</label>
                    <div className="space-y-2">
                      {["Western Province (LK-1)", "Central Province (LK-2)", "Southern Province (LK-3)"].map((reg) => (
                        <label key={reg} className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <span>{reg}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: BRANDS */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Step 7 — Brands &amp; Relationships
                </h2>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Brand Relationship Classification</label>
                  <select
                    value={formData.brand_relationships}
                    onChange={(e) => updateField("brand_relationships", e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded p-2"
                  >
                    <option value="Sole Distributor">Sole Authorized Distributor</option>
                    <option value="Manufacturer">Direct OEM / Manufacturer</option>
                    <option value="Exclusive Agent">Exclusive Country Agent</option>
                    <option value="Authorized Reseller">Authorized Reseller</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 8: DOCUMENTS */}
            {currentStep === 8 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Step 8 — Documents &amp; Certificates
                </h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center space-y-2">
                  <FileText size={24} className="mx-auto text-gray-400" />
                  <div className="text-xs font-bold text-gray-700">Business Registration &amp; GMP Certificates</div>
                  <p className="text-[11px] text-gray-500">All uploaded compliance documents are securely tenant-scoped.</p>
                </div>
              </div>
            )}

            {/* STEP 9: FINANCE */}
            {currentStep === 9 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Step 9 — Finance &amp; Settlement
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Annual Revenue (Estimate)</label>
                    <input
                      type="number"
                      value={formData.annual_revenue}
                      onChange={(e) => updateField("annual_revenue", e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Currency</label>
                    <input
                      type="text"
                      value={formData.currency}
                      onChange={(e) => updateField("currency", e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 10: CONTRACTS */}
            {currentStep === 10 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Step 10 — Contracts &amp; Commercial Agreement
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Initial Agreement Type</label>
                    <select
                      value={formData.contract_type}
                      onChange={(e) => updateField("contract_type", e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    >
                      <option value="standard_supply">Standard Supply Agreement</option>
                      <option value="consignment">Consignment Supply</option>
                      <option value="exclusive">Exclusive Agency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Initial Term</label>
                    <input
                      type="text"
                      value={formData.initial_contract_term}
                      onChange={(e) => updateField("initial_contract_term", e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 11: CATALOGUE */}
            {currentStep === 11 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Step 11 — Catalogue Responsibilities
                </h2>
                <p className="text-xs text-gray-600">
                  Products will link to authoritative Catalogue domain upon verification approval.
                </p>
              </div>
            )}

            {/* STEP 12: USERS */}
            {currentStep === 12 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Step 12 — Users &amp; Access Assignment
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Initial User Name</label>
                    <input
                      type="text"
                      value={formData.initial_admin_name}
                      onChange={(e) => updateField("initial_admin_name", e.target.value)}
                      placeholder="e.g. John Silva"
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Initial User Email</label>
                    <input
                      type="email"
                      value={formData.initial_admin_email}
                      onChange={(e) => updateField("initial_admin_email", e.target.value)}
                      placeholder="e.g. john@supplier.com"
                      className="w-full text-xs border border-gray-300 rounded p-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 13: REVIEW & SUBMIT */}
            {currentStep === 13 && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
                  Step 13 — Review &amp; Submit Onboarding
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg text-xs space-y-2">
                  <div><strong>Company Name:</strong> {formData.company_name || "—"}</div>
                  <div><strong>Legal Entity:</strong> {formData.legal_name || formData.company_name || "—"}</div>
                  <div><strong>Business Type:</strong> {formData.business_type}</div>
                  <div><strong>Email / Phone:</strong> {formData.email} • {formData.phone}</div>
                  <div><strong>Location:</strong> {formData.city}, {formData.country}</div>
                  <div><strong>Registration / Tax:</strong> {formData.registration_number} / {formData.tax_id}</div>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={formData.submit_for_verification}
                    onChange={(e) => updateField("submit_for_verification", e.target.checked)}
                  />
                  <span>Submit immediately to Verification Queue (BS07) upon creation</span>
                </label>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-30"
              >
                Previous Step
              </button>

              <div className="flex items-center gap-2">
                {currentStep < 13 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((s) => Math.min(13, s + 1))}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-800 text-white rounded text-xs font-bold hover:bg-rose-900 shadow-sm"
                  >
                    <span>Save &amp; Continue</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting || !formData.company_name || !formData.email}
                    onClick={handleSubmit}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800 shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>{submitting ? "Submitting…" : "Complete Onboarding"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </PermissionGuard>
  );
}
