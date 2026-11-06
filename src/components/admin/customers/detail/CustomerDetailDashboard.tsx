"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

import { CustomerDetailHeader } from "./CustomerDetailHeader";
import { CustomerConcurrencyNotice } from "./CustomerConcurrencyNotice";
import { CustomerContextStrip } from "../CustomerContextStrip";
import { CustomerProfileHero } from "./CustomerProfileHero";
import { CustomerDetailTabs } from "./CustomerDetailTabs";
import { CustomerDetailKpis } from "./CustomerDetailKpis";
import { CustomerDetailRightRail } from "./CustomerDetailRightRail";
import {
  CustomerDetailHealthScorecard,
  CustomerLifecycleTimeline,
  CustomerRelationshipSummary,
  CustomerProfileCard,
  CustomerAddressesCard,
  CustomerSegmentsCard,
  CustomerIdentityCard,
  CustomerOrdersCard,
  CustomerReturnsCard,
  CustomerLoyaltyCard,
  CustomerConsentPrivacyCard,
  CustomerRiskRestrictionsCard,
  CustomerSupportCard,
  CustomerRelatedRecordsCard,
  CustomerRecordQualityCard,
  CustomerRecentActivityTable,
} from "./CustomerSectionCards";
import { CustomerLifecycleJourney } from "../CustomerLifecycleJourney";
import { CustomerCanonicalPanel } from "./CustomerCanonicalPanel";
import { CustomerLifecycleControl } from "./CustomerLifecycleControl";

import { customerApi } from "@/lib/api/customers";
import { CustomerDetailFullData } from "@/types/customer-detail";
import { useAdminContext } from "@/contexts/AdminContext";

interface CustomerDetailDashboardProps {
  customerId: string;
}

const VALID_CUSTOMER_TABS = [
  "overview",
  "addresses",
  "preferences",
  "privacy",
  "orders",
  "activity",
  "audit",
] as const;

type CustomerTab = (typeof VALID_CUSTOMER_TABS)[number];

function isValidCustomerTab(value: string | null): value is CustomerTab {
  return (
    value !== null &&
    VALID_CUSTOMER_TABS.includes(value as CustomerTab)
  );
}

export function CustomerDetailDashboard({
  customerId,
}: CustomerDetailDashboardProps) {
  const { permissions } = useAdminContext();

  const router = useRouter();
  const searchParams = useSearchParams();

  /*
   * URL is the authoritative source for the selected Customer 360 tab.
   *
   * Examples:
   * /admin/customers/{uuid}
   * /admin/customers/{uuid}?tab=addresses
   * /admin/customers/{uuid}?tab=preferences
   * /admin/customers/{uuid}?tab=privacy
   * /admin/customers/{uuid}?tab=orders
   * /admin/customers/{uuid}?tab=activity
   * /admin/customers/{uuid}?tab=audit
   */
  const requestedTab = searchParams.get("tab");

  const activeTab: CustomerTab = isValidCustomerTab(requestedTab)
    ? requestedTab
    : "overview";

  const [data, setData] =
    useState<CustomerDetailFullData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const loadData = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response =
        await customerApi.getCustomerDetail(customerId);

      setData(response);
    } catch (error) {
      console.error(error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [customerId]);

  /*
   * Keep tab clicks and sidebar links synchronized through the URL.
   *
   * We intentionally do not keep a separate active-tab React state,
   * because that can drift out of sync with direct navigation.
   */
  const handleTabChange = (tab: string) => {
    if (!isValidCustomerTab(tab)) {
      return;
    }

    if (tab === "overview") {
      router.replace(
        `/admin/customers/${customerId}`,
        {
          scroll: false,
        },
      );

      return;
    }

    router.replace(
      `/admin/customers/${customerId}?tab=${encodeURIComponent(tab)}`,
      {
        scroll: false,
      },
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    showToast(
      "Refreshing customer detail data...",
    );

    await loadData();

    setIsRefreshing(false);

    showToast(
      "Customer detail data updated.",
    );
  };

  /*
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />

        <div className="h-10 bg-slate-200 rounded w-full" />

        <div className="h-40 bg-slate-200 rounded w-full" />

        <div className="h-12 bg-slate-200 rounded w-full" />

        <div className="grid grid-cols-6 gap-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="h-16 bg-slate-200 rounded"
            />
          ))}
        </div>
      </div>
    );
  }

  /*
   * Error state
   */
  if (isError) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />

        <h2 className="text-lg font-bold text-ink mb-1">
          Failed to load customer record
        </h2>

        <p className="text-sm text-slate-500 mb-4">
          An unexpected error occurred while fetching
          details for {customerId}.
        </p>

        <button
          type="button"
          onClick={() => {
            void loadData();
          }}
          className="px-4 py-2 bg-[#671021] text-white font-bold text-xs rounded shadow-2xs hover:bg-[#520d1a]"
        >
          Retry
        </button>
      </div>
    );
  }

  /*
   * Customer not found
   */
  if (!data || !data.profile) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />

        <h2 className="text-lg font-bold text-ink mb-1">
          Customer Not Found
        </h2>

        <p className="text-sm text-slate-500 font-mono mb-4">
          Requested ID: {customerId}
        </p>

        <Link
          href="/admin/customers/directory"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#671021] text-white font-bold text-xs rounded shadow-2xs hover:bg-[#520d1a]"
        >
          <ArrowLeft className="w-4 h-4" />

          <span>
            Back to Customer Directory
          </span>
        </Link>
      </div>
    );
  }

  const canEdit =
    permissions.includes(
      "customers.update",
    ) ||
    permissions.includes(
      "customers.manage",
    );

  const canManageLifecycle =
    permissions.includes(
      "customers.status.manage",
    ) ||
    permissions.includes(
      "customers.manage",
    );

  return (
    <div className="space-y-3.5 p-3.5 sm:p-5 max-w-[1920px] mx-auto min-w-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />

          <span>
            {toastMessage}
          </span>
        </div>
      )}

      {/* Header */}
      <CustomerDetailHeader
        customerId={customerId}
        showToast={showToast}
        canEdit={canEdit}
      />

      {/* Concurrency Notice */}
      <CustomerConcurrencyNotice
        updatedBy={
          data.profile
            .concurrencyNotice
            ?.updatedBy ??
          undefined
        }
        updatedAgo={
          data.profile
            .concurrencyNotice
            ?.updatedAgo ??
          undefined
        }
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Context Strip */}
      <CustomerContextStrip
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Customer Profile Hero */}
      <CustomerProfileHero
        profile={data.profile}
      />

      {/* Customer 360 Tabs */}
      <CustomerDetailTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Canonical Customer-owned operational sections */}
      {activeTab !== "overview" && (
        <CustomerCanonicalPanel
          customerUuid={customerId}
          section={activeTab}
          permissions={permissions}
        />
      )}

      {/* Overview */}
      {activeTab === "overview" && (
        <>
          <CustomerLifecycleControl
            customerUuid={customerId}
            currentState={
              data.profile
                .accountStatus ??
              "unknown"
            }
            lifecycleVersion={
              data.profile
                .lifecycleVersion ??
              0
            }
            onChanged={loadData}
            canManage={
              canManageLifecycle
            }
          />

          {/* KPI Metrics */}
          <CustomerDetailKpis
            profile={data.profile}
          />

          {/* Main Dashboard */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* Main Content */}
            <div className="xl:col-span-3 space-y-4 min-w-0">
              {/* Health / Lifecycle / Relationship */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <CustomerDetailHealthScorecard
                  data={data}
                />

                <CustomerLifecycleTimeline
                  data={data}
                />

                <CustomerRelationshipSummary
                  data={data}
                />
              </div>

              {/* Profile / Address / Segmentation / Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <CustomerProfileCard
                  data={data}
                  showToast={showToast}
                />

                <CustomerAddressesCard
                  data={data}
                  showToast={showToast}
                />

                <CustomerSegmentsCard
                  data={data}
                  showToast={showToast}
                />

                <CustomerIdentityCard
                  data={data}
                  showToast={showToast}
                />
              </div>

              {/* Orders / Returns / Loyalty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <CustomerOrdersCard
                  data={data}
                  showToast={showToast}
                />

                <CustomerReturnsCard
                  data={data}
                  showToast={showToast}
                />

                <CustomerLoyaltyCard
                  data={data}
                  showToast={showToast}
                />
              </div>

              {/* Consent / Risk / Support */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <CustomerConsentPrivacyCard
                  data={data}
                  showToast={showToast}
                />

                <CustomerRiskRestrictionsCard
                  data={data}
                  showToast={showToast}
                />

                <CustomerSupportCard
                  data={data}
                  showToast={showToast}
                />
              </div>

              {/* Related Records / Data Quality */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <CustomerRelatedRecordsCard
                  data={data}
                  showToast={showToast}
                />

                <CustomerRecordQualityCard
                  data={data}
                  showToast={showToast}
                />
              </div>

              {/* Recent Activity */}
              <CustomerRecentActivityTable
                data={data}
              />

              {/* Lifecycle Journey */}
              <CustomerLifecycleJourney
                nodes={
                  data.lifecycleNodes
                }
              />
            </div>

            {/* Right Summary Rail */}
            <div className="xl:col-span-1 min-w-0">
              <CustomerDetailRightRail
                data={data}
                showToast={showToast}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}