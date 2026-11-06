"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Barcode,
  Boxes,
  FileSearch,
  Fingerprint,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import {
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { useAdminContext } from "@/contexts/AdminContext";
import { VERIFICATION_COMPLIANCE_PERMISSIONS } from "@/features/verification-compliance/permissions/verificationCompliancePermissions";

const CAPABILITIES = [
  {
    title: "Authenticity Investigations",
    description:
      "Counterfeit and authenticity investigation workflows are not implemented in the current Admin backend.",
    icon: FileSearch,
  },
  {
    title: "Product Identity Validation",
    description:
      "No authoritative product authenticity validation service is currently exposed.",
    icon: Fingerprint,
  },
  {
    title: "Packaging Comparison",
    description:
      "Packaging image comparison and authenticity scoring are not currently available.",
    icon: PackageCheck,
  },
  {
    title: "Serial & Batch Validation",
    description:
      "Serial-number and batch authenticity verification are not implemented.",
    icon: Barcode,
  },
  {
    title: "Identifier Integrity",
    description:
      "Identifier tamper detection and integrity monitoring are not currently available.",
    icon: ShieldCheck,
  },
  {
    title: "Corrective Actions",
    description:
      "Authenticity-specific corrective-action and revalidation workflows are not implemented.",
    icon: Boxes,
  },
];

export default function ProductAuthenticityPage() {
  const {
    tenant,
    ecosystem,
    businessUnit,
    channel,
    sectorPack,
    hasPermission,
  } = useAdminContext();

  const canView = hasPermission(
    VERIFICATION_COMPLIANCE_PERMISSIONS.view,
  );

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
      label: "Authenticity Scope",
      value: "Capability Readiness",
    },
  ];

  return (
    <PermissionGuard
      permission={
        VERIFICATION_COMPLIANCE_PERMISSIONS.view
      }
      fallback={
        <div
          className="p-6"
          role="alert"
        >
          Verification &amp; Compliance
          viewing permission is required
          to view authenticity controls.
        </div>
      }
    >
      <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
        <main className="flex-grow min-w-0 px-6 py-4 pb-12">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
            <div>
              <Link
                href="/admin/verification-compliance"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
              >
                <ArrowLeft size={14} />
                Back to Verification &amp;
                Compliance
              </Link>

              <div className="text-[11px] text-gray-500 font-medium mb-1">
                Verification &amp; Compliance /
                Product Authenticity
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Product Authenticity
                &amp; Counterfeit Controls
              </h1>

              <p className="text-xs text-gray-500 mt-1 max-w-3xl">
                View the implementation
                readiness of authenticity,
                counterfeit detection,
                product identity and serial
                validation capabilities.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-2.5 py-1.5 rounded text-gray-400 cursor-not-allowed"
              title="No authenticity backend is currently available"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </header>

          <ContextScopeBar
            items={contextItems}
            lastSynced="Capability state"
            accessNote="Access is resolved from the authenticated tenant context"
          />

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 my-4">
            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Authenticity Cases
                </span>

                <FileSearch
                  size={15}
                  className="text-gray-400"
                />
              </div>

              <strong className="block text-lg mt-3 text-gray-600">
                Not Available
              </strong>

              <small className="text-gray-500">
                No Admin authenticity case API
              </small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Critical Findings
                </span>

                <AlertTriangle
                  size={15}
                  className="text-gray-400"
                />
              </div>

              <strong className="block text-lg mt-3 text-gray-600">
                Not Assessed
              </strong>

              <small className="text-gray-500">
                No authoritative finding
                service
              </small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Identity Validation
                </span>

                <Fingerprint
                  size={15}
                  className="text-gray-400"
                />
              </div>

              <strong className="block text-lg mt-3 text-gray-600">
                Not Implemented
              </strong>

              <small className="text-gray-500">
                Future backend capability
              </small>
            </div>

            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Serial / Batch Control
                </span>

                <Barcode
                  size={15}
                  className="text-gray-400"
                />
              </div>

              <strong className="block text-lg mt-3 text-gray-600">
                Not Implemented
              </strong>

              <small className="text-gray-500">
                No authenticity verification
                service
              </small>
            </div>
          </section>

          <section className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={17}
                className="text-amber-700 mt-0.5"
              />

              <div>
                <h2 className="text-xs font-bold text-amber-900">
                  Authenticity Backend Not Yet
                  Implemented
                </h2>

                <p className="text-[11px] leading-relaxed text-amber-800 mt-1 max-w-4xl">
                  The current Retail Ecosystem
                  backend does not expose an
                  authoritative authenticity
                  investigation, counterfeit
                  detection, packaging
                  comparison, identifier
                  integrity, serial validation
                  or authenticity decision
                  workflow. This screen therefore
                  reports capability readiness
                  only and does not manufacture
                  investigation data or scores.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-[13px] font-bold text-gray-900">
                Authenticity Capability Map
              </h2>

              <p className="text-[11px] text-gray-500 mt-0.5">
                Planned authenticity control
                surfaces derived from the Admin
                UX design.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {CAPABILITIES.map(
                ({
                  title,
                  description,
                  icon: Icon,
                }) => (
                  <div
                    key={title}
                    className="border border-gray-200 rounded-md p-4 bg-gray-50/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-8 h-8 rounded-md border border-gray-200 bg-white flex items-center justify-center">
                        <Icon
                          size={15}
                          className="text-gray-500"
                        />
                      </div>

                      <span className="inline-flex rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-500">
                        Not Implemented
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-gray-900 mt-3">
                      {title}
                    </h3>

                    <p className="text-[11px] text-gray-500 leading-relaxed mt-1">
                      {description}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4 min-h-[180px]">
              <h2 className="text-[13px] font-bold text-gray-900">
                Authenticity Investigation
                Trend
              </h2>

              <p className="text-[11px] text-gray-500 mt-1">
                Historical investigation
                analytics will appear here once
                an authoritative authenticity
                case service is implemented.
              </p>

              <div className="h-[110px] mt-4 border border-dashed border-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                Investigation analytics
                unavailable
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4 min-h-[180px]">
              <h2 className="text-[13px] font-bold text-gray-900">
                Authenticity Issue
                Distribution
              </h2>

              <p className="text-[11px] text-gray-500 mt-1">
                Counterfeit and authenticity
                finding classifications are not
                currently available.
              </p>

              <div className="h-[110px] mt-4 border border-dashed border-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                Distribution data unavailable
              </div>
            </div>
          </section>
        </main>

        <RightIntelligenceRail>
          <RailSection title="Authenticity Health">
            <div className="space-y-3 text-xs">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="text-[10px] uppercase tracking-wide text-gray-500">
                  Health Score
                </div>

                <div className="font-bold text-gray-700 mt-1">
                  Not Assessed
                </div>

                <p className="text-[10px] text-gray-500 mt-1">
                  No authoritative authenticity
                  scoring service exists in the
                  current backend.
                </p>
              </div>
            </div>
          </RailSection>

          <RailSection title="Control Availability">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Investigations
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Product identity
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Serial validation
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Decision workflow
                </span>

                <strong className="text-gray-400">
                  Unavailable
                </strong>
              </div>
            </div>
          </RailSection>
        </RightIntelligenceRail>
      </div>
    </PermissionGuard>
  );
}