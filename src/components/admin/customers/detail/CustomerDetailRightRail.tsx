"use client";

import React from "react";
import { CustomerDetailFullData } from "@/types/customer-detail";
import {
  AlertCircle,
  Lock,
} from "lucide-react";

interface CustomerDetailRightRailProps {
  data: CustomerDetailFullData;
  showToast: (msg: string) => void;
}

interface UnavailableSummaryProps {
  message?: string;
}

function UnavailableSummary({
  message = "Data is not available from an authoritative source yet.",
}: UnavailableSummaryProps) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5">
      <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />

      <span className="text-[10px] leading-relaxed text-slate-500">
        {message}
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="text-right font-mono font-bold text-slate-800">
        {value}
      </span>
    </div>
  );
}

export function CustomerDetailRightRail({
  data,
  showToast,
}: CustomerDetailRightRailProps) {
  const {
    profile,
    purchaseBehaviour,
    loyalty,
    supportComms,
    returnsDisputes,
    consentPrivacy,
    riskRestrictions,
  } = data;

  const unavailableAction = (
    message: string,
  ) => {
    showToast(message);
  };

  const healthScore =
    typeof profile.customerHealthScore === "number"
      ? profile.customerHealthScore
      : null;

  return (
    <div className="flex w-full flex-col gap-3.5 text-[11px]">
      {/* A. Customer Operations Health */}
      <div className="rounded-lg border border-line bg-white p-3.5 shadow-2xs">
        <h4 className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
          A. Customer Operations Health
        </h4>

        {healthScore !== null ? (
          <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 border-slate-200">
              <span className="text-[13px] font-black text-ink font-mono">
                {healthScore}
              </span>
            </div>

            <div className="flex flex-col text-[10px]">
              <span className="text-[11.5px] font-bold text-slate-800">
                {healthScore} / 100
              </span>

              <span className="font-medium text-slate-500">
                Customer Operations Health Score
              </span>
            </div>
          </div>
        ) : (
          <UnavailableSummary />
        )}
      </div>

      {/* B. Current Customer State */}
      <div className="rounded-lg border border-line bg-white p-3.5 shadow-2xs">
        <h4 className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
          B. Current Customer State
        </h4>

        <div className="flex flex-wrap gap-1.5 text-[9.5px] font-bold">
          {profile.accountStatus ? (
            <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-slate-700">
              Account: {profile.accountStatus}
            </span>
          ) : null}

          {profile.membershipStatus ? (
            <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-slate-700">
              Membership: {profile.membershipStatus}
            </span>
          ) : null}

          {profile.verificationStatus ? (
            <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-slate-700">
              Verification: {profile.verificationStatus}
            </span>
          ) : null}

          {profile.loyaltyTier ? (
            <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-slate-700">
              Loyalty: {profile.loyaltyTier}
            </span>
          ) : null}

          {profile.riskLevel ? (
            <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-slate-700">
              Risk: {profile.riskLevel}
            </span>
          ) : null}
        </div>

        {!profile.verificationStatus &&
          !profile.loyaltyTier &&
          !profile.riskLevel && (
            <div className="mt-2">
              <UnavailableSummary message="Verification, loyalty and risk state are not available from their authoritative modules yet." />
            </div>
          )}
      </div>

      {/* C. Priority Customer Alerts */}
      <div className="rounded-lg border border-line bg-white p-3.5 shadow-2xs">
        <h4 className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
          C. Priority Customer Alerts
        </h4>

        <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />

          <span className="text-[10px] leading-relaxed text-slate-500">
            No authoritative customer alert feed is connected yet.
          </span>
        </div>
      </div>

      {/* D. Order & Value Summary */}
      <div className="rounded-lg border border-line bg-white p-3.5 shadow-2xs">
        <h4 className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
          D. Order & Value Summary
        </h4>

        {purchaseBehaviour ? (
          <div className="space-y-1 text-[10px]">
            <SummaryRow
              label="Total Orders"
              value={
                typeof purchaseBehaviour.totalOrders === "number"
                  ? purchaseBehaviour.totalOrders
                  : "—"
              }
            />

            <SummaryRow
              label="Average Order Value"
              value={
                typeof purchaseBehaviour.avgOrderValue === "number"
                  ? `LKR ${purchaseBehaviour.avgOrderValue.toLocaleString()}`
                  : "—"
              }
            />

            <SummaryRow
              label="Repeat Purchase Rate"
              value={
                typeof purchaseBehaviour.repeatPurchaseRate === "number"
                  ? `${purchaseBehaviour.repeatPurchaseRate}%`
                  : "—"
              }
            />

            <SummaryRow
              label="Preferred Channel"
              value={profile.preferredChannel ?? "—"}
            />

            <SummaryRow
              label="Customer Since"
              value={
                profile.registeredDate
                  ? new Date(
                      profile.registeredDate,
                    ).toLocaleDateString()
                  : "—"
              }
            />
          </div>
        ) : (
          <UnavailableSummary message="Authoritative order records are available in the Orders tab; aggregate purchase metrics are not yet projected here." />
        )}
      </div>

      {/* E. Loyalty Summary */}
      <div className="rounded-lg border border-line bg-white p-3.5 shadow-2xs">
        <h4 className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
          E. Loyalty Summary
        </h4>

        {loyalty ? (
          <div className="space-y-1 text-[10px]">
            <SummaryRow
              label="Tier"
              value={loyalty.tier ?? "—"}
            />

            <SummaryRow
              label="Points Balance"
              value={
                typeof loyalty.pointsBalance === "number"
                  ? loyalty.pointsBalance.toLocaleString()
                  : "—"
              }
            />

            <SummaryRow
              label="Points Expiring (90 days)"
              value={
                typeof loyalty.pointsExpiring90Days === "number"
                  ? loyalty.pointsExpiring90Days.toLocaleString()
                  : "—"
              }
            />

            <SummaryRow
              label="Next Tier Threshold"
              value={
                typeof loyalty.nextTierPoints === "number"
                  ? `${loyalty.nextTierPoints.toLocaleString()} pts`
                  : "—"
              }
            />
          </div>
        ) : (
          <UnavailableSummary message="Loyalty data is not connected to an authoritative loyalty source yet." />
        )}
      </div>

      {/* F. Service & Dispute Summary */}
      <div className="rounded-lg border border-line bg-white p-3.5 shadow-2xs">
        <h4 className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
          F. Service & Dispute Summary
        </h4>

        {supportComms || returnsDisputes ? (
          <div className="space-y-1 text-[10px]">
            <SummaryRow
              label="Open Cases"
              value={
                typeof supportComms?.openCases === "number"
                  ? supportComms.openCases
                  : "—"
              }
            />

            <SummaryRow
              label="Avg Response Time"
              value={
                typeof supportComms?.avgResponseTimeHours === "number"
                  ? `${supportComms.avgResponseTimeHours} hrs`
                  : "—"
              }
            />

            <SummaryRow
              label="Open Returns"
              value={
                typeof returnsDisputes?.openReturns === "number"
                  ? returnsDisputes.openReturns
                  : "—"
              }
            />

            <SummaryRow
              label="Active Disputes"
              value={
                typeof returnsDisputes?.activeDisputes === "number"
                  ? returnsDisputes.activeDisputes
                  : "—"
              }
            />
          </div>
        ) : (
          <UnavailableSummary message="Support, returns and dispute information is not connected from the authoritative modules yet." />
        )}
      </div>

      {/* G. Privacy & Consent Summary */}
      <div className="rounded-lg border border-line bg-white p-3.5 shadow-2xs">
        <h4 className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
          G. Privacy & Consent Summary
        </h4>

        {consentPrivacy ? (
          <div className="space-y-1 text-[10px]">
            <SummaryRow
              label="Email Consent"
              value={
                typeof consentPrivacy.emailConsent === "boolean"
                  ? consentPrivacy.emailConsent
                    ? "Yes"
                    : "No"
                  : "—"
              }
            />

            <SummaryRow
              label="SMS Consent"
              value={
                typeof consentPrivacy.smsConsent === "boolean"
                  ? consentPrivacy.smsConsent
                    ? "Yes"
                    : "No"
                  : "—"
              }
            />

            <SummaryRow
              label="Open Privacy Requests"
              value={
                typeof consentPrivacy.privacyRequests
                  ?.portability === "number"
                  ? consentPrivacy.privacyRequests.portability
                  : "—"
              }
            />
          </div>
        ) : (
          <UnavailableSummary message="Authoritative consent and privacy records are available in the Consent & Privacy tab." />
        )}
      </div>

      {/* H. Risk & Restrictions Summary */}
      <div className="rounded-lg border border-line bg-white p-3.5 shadow-2xs">
        <h4 className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
          H. Risk & Restrictions Summary
        </h4>

        {riskRestrictions ? (
          <div className="space-y-1 text-[10px]">
            <SummaryRow
              label="Risk Score"
              value={
                typeof riskRestrictions.overallRiskScore === "number"
                  ? riskRestrictions.overallRiskScore
                  : "—"
              }
            />

            <SummaryRow
              label="Fraud / Chargeback Risk"
              value={
                riskRestrictions.chargebackRisk ??
                "—"
              }
            />

            <SummaryRow
              label="Restriction State"
              value={
                riskRestrictions.activeRestrictions ??
                "—"
              }
            />
          </div>
        ) : (
          <UnavailableSummary message="Risk and restriction information is not connected from the authoritative compliance source yet." />
        )}
      </div>

      {/* I. Final Customer Actions */}
      <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-white p-3.5 shadow-2xs">
        <h4 className="mb-1 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
          I. Final Customer Actions
        </h4>

        <button
          type="button"
          onClick={() =>
            unavailableAction(
              "Customer editing is not enabled from Customer 360 yet.",
            )
          }
          className="w-full rounded bg-[#671021] py-1.5 text-center text-[11px] font-bold text-white transition-colors hover:bg-[#520d1a]"
        >
          Edit Customer
        </button>

        <button
          type="button"
          onClick={() =>
            unavailableAction(
              "Verification review is managed by Verification & Compliance.",
            )
          }
          className="w-full rounded border border-line bg-white py-1.5 text-center text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Start Verification Review
        </button>

        <button
          type="button"
          onClick={() =>
            unavailableAction(
              "Customer Support case creation is not connected here yet.",
            )
          }
          className="w-full rounded border border-line bg-white py-1.5 text-center text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Open Support Case
        </button>

        <button
          type="button"
          onClick={() =>
            unavailableAction(
              "Open Consent & Privacy above to review authoritative privacy requests.",
            )
          }
          className="w-full rounded border border-line bg-white py-1.5 text-center text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Review Privacy Requests
        </button>

        <button
          type="button"
          onClick={() =>
            unavailableAction(
              "The authoritative customer timeline is not available yet.",
            )
          }
          className="w-full rounded border border-line bg-white py-1.5 text-center text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          View Customer Timeline
        </button>
      </div>
    </div>
  );
}
