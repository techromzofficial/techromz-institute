"use client";

import React from "react";
import {
  CustomerDetailFullData,
} from "@/types/customer-detail";
import {
  Lock,
} from "lucide-react";

interface CardProps {
  data: CustomerDetailFullData;
  showToast: (msg: string) => void;
}

function UnavailableState({
  message = "Data is not available from an authoritative source yet.",
}: {
  message?: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5">
      <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />

      <span className="text-[10px] leading-relaxed text-slate-500">
        {message}
      </span>
    </div>
  );
}

function InfoRow({
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

      <span className="text-right font-semibold text-slate-800">
        {value ?? "—"}
      </span>
    </div>
  );
}

/* 1. Customer Health Scorecard */
export function CustomerDetailHealthScorecard({
  data,
}: {
  data: CustomerDetailFullData;
}) {
  const { healthScores } = data;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <h3 className="mb-2.5 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
        Customer Health Scorecard
      </h3>

      {healthScores.length > 0 ? (
        <div className="space-y-2 text-[10px]">
          {healthScores.map((item) => (
            <div key={item.label}>
              <div className="mb-0.5 flex justify-between">
                <span className="font-medium text-slate-600">
                  {item.label}
                </span>

                <span className="font-mono font-bold text-slate-800">
                  {item.value}%
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-400"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, item.value),
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <UnavailableState message="Customer health scoring is not connected to an authoritative source yet." />
      )}
    </div>
  );
}

/* 2. Customer Lifecycle Timeline */
export function CustomerLifecycleTimeline({
  data,
}: {
  data: CustomerDetailFullData;
}) {
  const { lifecycleMilestones } = data;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <h3 className="mb-2.5 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
        Customer Lifecycle Timeline
      </h3>

      {lifecycleMilestones.length > 0 ? (
        <div className="relative flex items-center justify-between overflow-x-auto py-2 scrollbar-thin">
          <div className="absolute left-4 right-4 top-[18px] z-0 h-0.5 bg-slate-200" />

          {lifecycleMilestones.map(
            (milestone, index) => (
              <div
                key={milestone.label}
                className="relative z-10 flex min-w-[70px] flex-col items-center text-center"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-[9px] font-bold text-slate-700">
                  {index + 1}
                </div>

                <span className="mt-1.5 text-[9.5px] font-bold leading-tight text-slate-800">
                  {milestone.label}
                </span>

                <span className="mt-0.5 text-[8.5px] text-slate-400 font-mono">
                  {milestone.date}
                </span>
              </div>
            ),
          )}
        </div>
      ) : (
        <UnavailableState message="Authoritative customer lifecycle milestones are not available yet." />
      )}
    </div>
  );
}

/* 3. Customer Relationship Summary */
export function CustomerRelationshipSummary({
  data,
}: {
  data: CustomerDetailFullData;
}) {
  const {
    profile,
    purchaseBehaviour,
  } = data;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <h3 className="mb-2.5 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
        Customer Relationship Summary
      </h3>

      <div className="space-y-1.5 text-[10px]">
        <InfoRow
          label="Total Orders"
          value={
            typeof purchaseBehaviour?.totalOrders ===
            "number"
              ? purchaseBehaviour.totalOrders
              : "—"
          }
        />

        <InfoRow
          label="Average Order Value"
          value={
            typeof purchaseBehaviour?.avgOrderValue ===
            "number"
              ? `LKR ${purchaseBehaviour.avgOrderValue.toLocaleString()}`
              : "—"
          }
        />

        <InfoRow
          label="Repeat Purchase Rate"
          value={
            typeof purchaseBehaviour?.repeatPurchaseRate ===
            "number"
              ? `${purchaseBehaviour.repeatPurchaseRate}%`
              : "—"
          }
        />

        <InfoRow
          label="Customer Since"
          value={
            profile.registeredDate
              ? new Date(
                  profile.registeredDate,
                ).toLocaleDateString()
              : "—"
          }
        />

        <InfoRow
          label="Preferred Channel"
          value={profile.preferredChannel ?? "—"}
        />

        <InfoRow
          label="Engagement Score"
          value="—"
        />

        <InfoRow
          label="Relationship Health"
          value="—"
        />
      </div>
    </div>
  );
}

/* 4. Customer Profile Card */
export function CustomerProfileCard({
  data,
}: CardProps) {
  const { profile } = data;

  return (
    <div className="h-full rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <h3 className="mb-2.5 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
        Customer Profile
      </h3>

      <div className="space-y-1.5 text-[10px]">
        <InfoRow
          label="Full Name"
          value={profile.name}
        />

        <InfoRow
          label="Email"
          value={profile.email}
        />

        <InfoRow
          label="Phone"
          value={profile.phone || "—"}
        />

        <InfoRow
          label="Company"
          value={profile.companyName ?? "—"}
        />

        <InfoRow
          label="Country"
          value={profile.country ?? "—"}
        />

        <InfoRow
          label="Date of Birth"
          value={profile.dob ?? "—"}
        />

        <InfoRow
          label="Gender"
          value={profile.gender ?? "—"}
        />

        <InfoRow
          label="Preferred Language"
          value={profile.preferredLanguage ?? "—"}
        />

        <InfoRow
          label="National ID / Passport"
          value={profile.nationalId ?? "—"}
        />

        <InfoRow
          label="Account Source"
          value={profile.accountSource ?? "—"}
        />
      </div>
    </div>
  );
}

/* 5. Addresses & Contacts */
export function CustomerAddressesCard({
  data,
  showToast,
}: CardProps) {
  const { addresses } = data;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
            Addresses & Contacts
          </h3>

          <button
            type="button"
            onClick={() =>
              showToast(
                "Open Addresses & Contacts above to manage authoritative Customer addresses.",
              )
            }
            className="text-[9.5px] font-bold text-[#671021] hover:underline"
          >
            View All
          </button>
        </div>

        {addresses.length > 0 ? (
          <div className="space-y-2 text-[10px]">
            {addresses.map((item, index) => (
              <div
                key={`${item.type ?? "address"}-${index}`}
                className="rounded border border-slate-100 bg-slate-50 p-1.5"
              >
                <span className="mb-0.5 block text-[9.5px] font-bold text-slate-800">
                  {item.type ?? "Address"}
                </span>

                <span className="block leading-tight text-slate-600">
                  {item.address}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <UnavailableState message="Open Addresses & Contacts above to view and manage authoritative records." />
        )}
      </div>
    </div>
  );
}

/* 6. Customer Segments */
export function CustomerSegmentsCard({
  data,
}: CardProps) {
  const { segments } = data;

  return (
    <div className="h-full rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <h3 className="mb-2.5 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
        Customer Segments
      </h3>

      {segments.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
          {segments.map((segment) => (
            <span
              key={segment}
              className="rounded border border-slate-200 bg-slate-100 px-2 py-1 text-slate-700"
            >
              {segment}
            </span>
          ))}
        </div>
      ) : (
        <UnavailableState message="Customer segmentation data is not available yet." />
      )}
    </div>
  );
}

/* 7. Identity & Verification */
export function CustomerIdentityCard({
  data,
}: CardProps) {
  const { identity } = data;

  return (
    <div className="h-full rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <h3 className="mb-2.5 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
        Identity & Verification
      </h3>

      {identity ? (
        <div className="space-y-1.5 text-[10px]">
          <InfoRow
            label="KYC Status"
            value={identity.kycStatus ?? "—"}
          />

          <InfoRow
            label="Document Type"
            value={identity.documentType ?? "—"}
          />

          <InfoRow
            label="Document Number"
            value={identity.documentNumber ?? "—"}
          />

          <InfoRow
            label="Verified On"
            value={identity.verifiedOn ?? "—"}
          />

          <InfoRow
            label="Expiry Date"
            value={identity.expiryDate ?? "—"}
          />

          <InfoRow
            label="Verification Source"
            value={
              identity.verificationSource ??
              "—"
            }
          />

          <InfoRow
            label="Address Match"
            value={identity.addressMatch ?? "—"}
          />

          <InfoRow
            label="Risk Notes"
            value={identity.riskNotes ?? "—"}
          />
        </div>
      ) : (
        <UnavailableState message="Identity verification is managed by Verification & Compliance and is not projected here yet." />
      )}
    </div>
  );
}

/* 8. Orders & Purchase Behaviour */
export function CustomerOrdersCard({
  data,
  showToast,
}: CardProps) {
  const { purchaseBehaviour } = data;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
            Orders & Purchase Behaviour
          </h3>

          <button
            type="button"
            onClick={() =>
              showToast(
                "Open Orders above to view authoritative Customer order history.",
              )
            }
            className="text-[9.5px] font-bold text-[#671021] hover:underline"
          >
            View All Orders
          </button>
        </div>

        {purchaseBehaviour ? (
          <>
            <div className="mb-2.5 grid grid-cols-4 gap-1.5 text-[9.5px]">
              {[
                [
                  "Total Orders",
                  purchaseBehaviour.totalOrders,
                ],
                [
                  "Completed",
                  purchaseBehaviour.completed,
                ],
                [
                  "Cancelled",
                  purchaseBehaviour.cancelled,
                ],
                [
                  "Failed Payments",
                  purchaseBehaviour.failedPayments,
                ],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded bg-slate-50 p-1 text-center"
                >
                  <span className="block text-slate-400">
                    {label}
                  </span>

                  <span className="font-mono font-bold text-slate-800">
                    {typeof value === "number"
                      ? value
                      : "—"}
                  </span>
                </div>
              ))}
            </div>

            <UnavailableState message="Detailed order history is available in the Orders tab above." />
          </>
        ) : (
          <UnavailableState message="Authoritative order records are available in the Orders tab above; aggregate purchase metrics are not yet projected here." />
        )}
      </div>
    </div>
  );
}

/* 9. Returns, Refunds & Disputes */
export function CustomerReturnsCard({
  data,
  showToast,
}: CardProps) {
  const { returnsDisputes } = data;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
            Returns, Refunds & Disputes
          </h3>

          <button
            type="button"
            onClick={() =>
              showToast(
                "Returns and refunds are managed by their authoritative modules.",
              )
            }
            className="text-[9.5px] font-bold text-[#671021] hover:underline"
          >
            View All Returns
          </button>
        </div>

        {returnsDisputes ? (
          <>
            <div className="mb-2.5 grid grid-cols-4 gap-1.5 text-[9.5px]">
              {[
                [
                  "Open Returns",
                  returnsDisputes.openReturns,
                ],
                [
                  "Completed",
                  returnsDisputes.completedReturns,
                ],
                [
                  "Pending Refund",
                  returnsDisputes.refundsPending,
                ],
                [
                  "Disputes",
                  returnsDisputes.activeDisputes,
                ],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded bg-slate-50 p-1 text-center"
                >
                  <span className="block text-slate-400">
                    {label}
                  </span>

                  <span className="font-mono font-bold text-slate-800">
                    {typeof value === "number"
                      ? value
                      : "—"}
                  </span>
                </div>
              ))}
            </div>

            <UnavailableState message="Detailed return/refund history is not projected into Customer 360 yet." />
          </>
        ) : (
          <UnavailableState message="Returns, refunds and dispute information is not connected yet." />
        )}
      </div>
    </div>
  );
}

/* 10. Loyalty, Rewards & Membership */
export function CustomerLoyaltyCard({
  data,
  showToast,
}: CardProps) {
  const { loyalty } = data;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
            Loyalty, Rewards & Membership
          </h3>

          <button
            type="button"
            onClick={() =>
              showToast(
                "Loyalty history is not connected to an authoritative source yet.",
              )
            }
            className="text-[9.5px] font-bold text-[#671021] hover:underline"
          >
            View All Loyalty History
          </button>
        </div>

        {loyalty ? (
          <div className="grid grid-cols-4 gap-1.5 text-[9.5px]">
            <div className="rounded bg-slate-50 p-1 text-center">
              <span className="block text-slate-400">
                Tier
              </span>

              <span className="font-bold text-slate-800">
                {loyalty.tier ?? "—"}
              </span>
            </div>

            <div className="rounded bg-slate-50 p-1 text-center">
              <span className="block text-slate-400">
                Balance
              </span>

              <span className="font-mono font-bold text-slate-800">
                {typeof loyalty.pointsBalance ===
                "number"
                  ? loyalty.pointsBalance.toLocaleString()
                  : "—"}
              </span>
            </div>

            <div className="rounded bg-slate-50 p-1 text-center">
              <span className="block text-slate-400">
                Earned YTD
              </span>

              <span className="font-mono font-bold text-slate-800">
                {typeof loyalty.pointsEarnedYtd ===
                "number"
                  ? loyalty.pointsEarnedYtd.toLocaleString()
                  : "—"}
              </span>
            </div>

            <div className="rounded bg-slate-50 p-1 text-center">
              <span className="block text-slate-400">
                Redeemed YTD
              </span>

              <span className="font-mono font-bold text-slate-800">
                {typeof loyalty.pointsRedeemedYtd ===
                "number"
                  ? loyalty.pointsRedeemedYtd.toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>
        ) : (
          <UnavailableState message="Loyalty and rewards data is not connected yet." />
        )}
      </div>
    </div>
  );
}

/* 11. Consent & Privacy */
export function CustomerConsentPrivacyCard({
  data,
  showToast,
}: CardProps) {
  const { consentPrivacy } = data;

  const consentLabel = (
    value?: boolean | null,
  ) => {
    if (typeof value !== "boolean") {
      return "—";
    }

    return value ? "Consented" : "Not Consented";
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
            Consent & Privacy
          </h3>

          <button
            type="button"
            onClick={() =>
              showToast(
                "Open Consent & Privacy above to manage authoritative records.",
              )
            }
            className="text-[9.5px] font-bold text-[#671021] hover:underline"
          >
            View Privacy Center
          </button>
        </div>

        {consentPrivacy ? (
          <div className="space-y-1.5 text-[10px]">
            <InfoRow
              label="Email Consent"
              value={consentLabel(
                consentPrivacy.emailConsent,
              )}
            />

            <InfoRow
              label="SMS Consent"
              value={consentLabel(
                consentPrivacy.smsConsent,
              )}
            />

            <InfoRow
              label="Push Consent"
              value={consentLabel(
                consentPrivacy.pushConsent,
              )}
            />

            <InfoRow
              label="Personalisation Consent"
              value={consentLabel(
                consentPrivacy.personalisationConsent,
              )}
            />

            <InfoRow
              label="Data Processing Basis"
              value={
                consentPrivacy.dataProcessingBasis ??
                "—"
              }
            />

            <InfoRow
              label="Consent Source"
              value={
                consentPrivacy.consentSource ??
                "—"
              }
            />
          </div>
        ) : (
          <UnavailableState message="Authoritative consent and privacy records are available in the Consent & Privacy tab above." />
        )}
      </div>
    </div>
  );
}

/* 12. Customer Risk & Restrictions */
export function CustomerRiskRestrictionsCard({
  data,
  showToast,
}: CardProps) {
  const { riskRestrictions } = data;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
            Customer Risk & Restrictions
          </h3>

          <button
            type="button"
            onClick={() =>
              showToast(
                "Risk assessment is managed by the authoritative compliance source.",
              )
            }
            className="text-[9.5px] font-bold text-[#671021] hover:underline"
          >
            View Risk Assessment
          </button>
        </div>

        {riskRestrictions ? (
          <div className="space-y-1.5 text-[10px]">
            <InfoRow
              label="Overall Risk Score"
              value={
                typeof riskRestrictions.overallRiskScore ===
                "number"
                  ? riskRestrictions.overallRiskScore
                  : "—"
              }
            />

            <InfoRow
              label="Chargeback Risk"
              value={
                riskRestrictions.chargebackRisk ??
                "—"
              }
            />

            <InfoRow
              label="Excessive Return Risk"
              value={
                riskRestrictions.excessiveReturnRisk ??
                "—"
              }
            />

            <InfoRow
              label="Duplicate Account Risk"
              value={
                riskRestrictions.duplicateAccountRisk ??
                "—"
              }
            />

            <InfoRow
              label="Active Restrictions"
              value={
                riskRestrictions.activeRestrictions ??
                "—"
              }
            />

            <InfoRow
              label="Risk Owner"
              value={
                riskRestrictions.riskOwner ?? "—"
              }
            />
          </div>
        ) : (
          <UnavailableState message="Risk and restriction information is not connected yet." />
        )}
      </div>
    </div>
  );
}

/* 13. Support & Communications */
export function CustomerSupportCard({
  data,
  showToast,
}: CardProps) {
  const { supportComms } = data;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
            Support & Communications
          </h3>

          <button
            type="button"
            onClick={() =>
              showToast(
                "Customer Support records are not connected here yet.",
              )
            }
            className="text-[9.5px] font-bold text-[#671021] hover:underline"
          >
            View All Cases
          </button>
        </div>

        {supportComms ? (
          <div className="grid grid-cols-4 gap-1.5 text-[9.5px]">
            {[
              [
                "Open Cases",
                supportComms.openCases,
              ],
              [
                "Resolved (30D)",
                supportComms.resolvedCases30d,
              ],
              [
                "Avg Response",
                typeof supportComms.avgResponseTimeHours ===
                "number"
                  ? `${supportComms.avgResponseTimeHours}h`
                  : undefined,
              ],
              [
                "CSAT (30D)",
                typeof supportComms.csat30d ===
                "number"
                  ? `${supportComms.csat30d} / 5`
                  : undefined,
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded bg-slate-50 p-1 text-center"
              >
                <span className="block text-slate-400">
                  {label}
                </span>

                <span className="font-mono font-bold text-slate-800">
                  {value ?? "—"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <UnavailableState message="Support and communication data is not connected yet." />
        )}
      </div>
    </div>
  );
}

/* 14. Related Records */
export function CustomerRelatedRecordsCard({
  data,
  showToast,
}: CardProps) {
  const { relatedRecords } = data;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <div>
        <h3 className="mb-2.5 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
          Related Records
        </h3>

        {relatedRecords ? (
          <div className="space-y-1.5 text-[10px]">
            <InfoRow
              label="Household Account"
              value={
                relatedRecords.householdAccount ??
                "—"
              }
            />

            <InfoRow
              label="Loyalty Card"
              value={
                relatedRecords.loyaltyCard ?? "—"
              }
            />

            <InfoRow
              label="Marketplace Profile"
              value={
                relatedRecords.marketplaceProfile ??
                "—"
              }
            />

            <InfoRow
              label="Support Case IDs"
              value={
                relatedRecords.supportCaseSummary ??
                "—"
              }
            />

            <InfoRow
              label="Last Order"
              value={
                relatedRecords.lastOrder ?? "—"
              }
            />

            <button
              type="button"
              onClick={() =>
                showToast(
                  "Related-record navigation is not enabled from Customer 360 yet.",
                )
              }
              className="pt-1 text-[9.5px] font-bold text-[#671021] hover:underline"
            >
              View Related Records
            </button>
          </div>
        ) : (
          <UnavailableState message="Related cross-domain records are not projected here yet." />
        )}
      </div>
    </div>
  );
}

/* 15. Customer Record Quality */
export function CustomerRecordQualityCard({
  data,
  showToast,
}: CardProps) {
  const { recordQuality } = data;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
            Customer Record Quality
          </h3>

          <button
            type="button"
            onClick={() =>
              showToast(
                "Customer data-quality scoring is not available yet.",
              )
            }
            className="text-[9.5px] font-bold text-[#671021] hover:underline"
          >
            View Data Quality Details
          </button>
        </div>

        {recordQuality ? (
          <div className="space-y-1.5 text-[10px]">
            <InfoRow
              label="Duplicate Risk"
              value={
                recordQuality.duplicateRisk ?? "—"
              }
            />

            <InfoRow
              label="Missing Fields"
              value={
                typeof recordQuality.missingFields ===
                "number"
                  ? recordQuality.missingFields
                  : "—"
              }
            />

            <InfoRow
              label="Data Freshness"
              value={
                recordQuality.dataFreshness ?? "—"
              }
            />

            <InfoRow
              label="Data Accuracy Score"
              value={
                typeof recordQuality.dataAccuracyScore ===
                "number"
                  ? `${recordQuality.dataAccuracyScore}%`
                  : "—"
              }
            />

            <InfoRow
              label="Audit Completeness"
              value={
                typeof recordQuality.auditCompleteness ===
                "number"
                  ? `${recordQuality.auditCompleteness}%`
                  : "—"
              }
            />
          </div>
        ) : (
          <UnavailableState message="Record-quality metrics are not available from an authoritative source yet." />
        )}
      </div>
    </div>
  );
}

/* 16. Recent Customer Activity Table */
export function CustomerRecentActivityTable({
  data,
}: {
  data: CustomerDetailFullData;
}) {
  const { recentActivities } = data;

  return (
    <div className="w-full overflow-hidden rounded-lg border border-line bg-white p-3.5 shadow-2xs">
      <h3 className="mb-2.5 text-[10.5px] font-bold uppercase tracking-wider text-ink font-mono">
        Recent Customer Activity
      </h3>

      {recentActivities.length > 0 ? (
        <UnavailableState message="Authoritative activity records are available in the Activity tab above." />
      ) : (
        <UnavailableState message="Open Activity above to view the authoritative Customer activity feed." />
      )}
    </div>
  );
}
