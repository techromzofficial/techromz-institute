"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, RefreshCw, ShieldAlert, PauseCircle, Send, CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/admin/layout/PageHeader";
import {
  fetchMarketplacePolicyViolation,
  transitionMarketplacePolicyViolation,
  appealMarketplacePolicyViolation,
  emergencyPauseMarketplacePolicyViolation,
  type MarketplacePolicyDetailResponse,
} from "@/lib/api/marketplace";

type PolicyAction = "review" | "resolve" | "dismiss";

export default function MarketplacePolicyViolationDetailPage() {
  const { violationId } = useParams<{ violationId: string }>();
  const [data, setData] = useState<MarketplacePolicyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<PolicyAction | null>(null);
  const [isPausing, setIsPausing] = useState(false);
  const [appealText, setAppealText] = useState("");
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");

      try {
        setData(await fetchMarketplacePolicyViolation(violationId, signal));
      } catch (reason) {
        if (signal?.aborted) return;
        setData(null);
        setError(errorMessage(reason, "Marketplace policy violation could not be loaded."));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [violationId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load, requestVersion]);

  async function transition(action: PolicyAction) {
    if (
      (action === "resolve" || action === "dismiss") &&
      !window.confirm(`${formatStatus(action)} this policy violation?`)
    ) {
      return;
    }

    setMutationError("");
    setSuccessMessage("");
    setPendingAction(action);

    try {
      await transitionMarketplacePolicyViolation(violationId, action);
      setSuccessMessage(`Policy violation successfully ${action}ed.`);
      await load();
    } catch (reason) {
      setMutationError(errorMessage(reason, `Policy violation could not be ${action}ed.`));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleEmergencyPause() {
    if (!window.confirm("Apply emergency listing pause for this violation?")) return;

    setMutationError("");
    setSuccessMessage("");
    setIsPausing(true);

    try {
      const res = await emergencyPauseMarketplacePolicyViolation(violationId);
      setSuccessMessage(res.message || "Emergency listing pause applied successfully.");
      await load();
    } catch (reason) {
      setMutationError(errorMessage(reason, "Could not apply emergency pause."));
    } finally {
      setIsPausing(false);
    }
  }

  async function handleAppealSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!appealText.trim()) return;

    setMutationError("");
    setSuccessMessage("");
    setIsSubmittingAppeal(true);

    try {
      const res = await appealMarketplacePolicyViolation(violationId, appealText.trim());
      setSuccessMessage(res.message || "Seller appeal submitted successfully.");
      setAppealText("");
      await load();
    } catch (reason) {
      setMutationError(errorMessage(reason, "Could not submit seller appeal."));
    } finally {
      setIsSubmittingAppeal(false);
    }
  }

  if (loading && !data) return <StatePanel>Loading Marketplace policy violation…</StatePanel>;

  if (error && !data) {
    return (
      <StatePanel tone="error">
        <AlertTriangle className="mx-auto mb-3 h-6 w-6" />
        <p>{error}</p>
        <button
          type="button"
          onClick={() => setRequestVersion((value) => value + 1)}
          className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 font-semibold"
        >
          Try again
        </button>
      </StatePanel>
    );
  }

  if (!data) return null;

  const { violation, capabilities } = data;
  const hasActions = capabilities.review || capabilities.resolve || capabilities.dismiss;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/marketplace/policy-violations"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#741d35] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Policy Violations
      </Link>

      <PageHeader
        crumbs={["Marketplace", "Policy Violations", violation.policy_code]}
        title={violation.title}
        description="Review the authoritative Marketplace governance case and its related domain context."
        actions={
          <button
            type="button"
            onClick={() => setRequestVersion((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      {mutationError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {mutationError}
        </div>
      )}

      {successMessage && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {violation.action_taken && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-900">
          <PauseCircle className="h-4 w-4 text-amber-700" />
          Sanction Action Applied: {formatStatus(violation.action_taken)}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Policy code</p>
              <p className="mt-1 font-mono text-sm text-slate-900">{violation.policy_code}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge value={violation.severity} />
              <StatusBadge value={violation.status} />
            </div>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold text-slate-950">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {violation.description || "No description recorded."}
            </p>
          </div>

          <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
            <Detail label="Detected" value={formatDateTime(violation.detected_at)} />
            <Detail label="Resolved" value={formatDateTime(violation.resolved_at)} />
            <Detail label="Created" value={formatDateTime(violation.created_at)} />
            {violation.updated_at !== undefined && (
              <Detail label="Updated" value={formatDateTime(violation.updated_at)} />
            )}
          </dl>

          {/* Seller Appeal Section */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h2 className="font-semibold text-slate-950 mb-2">Seller Appeal & Evidence</h2>
            {violation.seller_appeal_text ? (
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Appeal Submission</span>
                  <span>{formatDateTime(violation.seller_appeal_at ?? null)}</span>
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{violation.seller_appeal_text}</p>
                {violation.appeal_status && (
                  <span className="inline-block rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                    Status: {formatStatus(violation.appeal_status)}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 mb-3">No seller appeal has been submitted.</p>
            )}

            {capabilities.appeal && (
              <form onSubmit={handleAppealSubmit} className="mt-4 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Record / Update Seller Appeal
                </label>
                <textarea
                  rows={3}
                  value={appealText}
                  onChange={(e) => setAppealText(e.target.value)}
                  placeholder="Record seller's justification, licensing documentation, or appeal notes..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-[#741d35] focus:outline-none focus:ring-1 focus:ring-[#741d35]"
                />
                <button
                  type="submit"
                  disabled={isSubmittingAppeal || !appealText.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSubmittingAppeal ? "Submitting..." : "Submit Appeal"}
                </button>
              </form>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-950">Workflow</h2>
          {hasActions ? (
            <div className="flex flex-wrap gap-2">
              {capabilities.review && <ActionButton action="review" pending={pendingAction} onClick={transition} />}
              {capabilities.resolve && <ActionButton action="resolve" pending={pendingAction} onClick={transition} />}
              {capabilities.dismiss && <ActionButton action="dismiss" pending={pendingAction} onClick={transition} />}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No workflow actions are available.</p>
          )}

          {capabilities.emergency_pause && violation.action_taken !== "listing_paused" && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 mb-2">Emergency Intervention</p>
              <button
                type="button"
                disabled={isPausing}
                onClick={handleEmergencyPause}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 hover:bg-red-800 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition"
              >
                <PauseCircle className="h-4 w-4" />
                {isPausing ? "Applying Pause…" : "Emergency Pause Listing"}
              </button>
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ProjectionCard title="Supplier">
          {violation.supplier ? (
            <>
              <ProjectionValue label="Company" value={violation.supplier.company_name} />
              <ProjectionValue label="Observed status" value={violation.supplier.status} />
              <ProjectionValue label="Verification status" value={violation.supplier.verification_status} />
            </>
          ) : <Unavailable />}
        </ProjectionCard>
        <ProjectionCard title="Product">
          {violation.product ? (
            <>
              <ProjectionValue label="Name" value={violation.product.name} />
              <ProjectionValue label="SKU" value={violation.product.sku} />
              <ProjectionValue label="Observed status" value={violation.product.status} />
            </>
          ) : <Unavailable />}
        </ProjectionCard>
        <ProjectionCard title="Channel">
          {violation.channel ? (
            <>
              <ProjectionValue label="Name" value={violation.channel.name} />
              <ProjectionValue label="Code" value={violation.channel.code} />
              <ProjectionValue label="Type" value={violation.channel.type} />
              <ProjectionValue label="Observed status" value={violation.channel.status} />
            </>
          ) : <Unavailable />}
        </ProjectionCard>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <p className="text-sm leading-6 text-amber-800">
            Marketplace Policy Violations records governance cases and their review and closure lifecycle. Supplier verification, Catalogue Product state, and Channel administration remain owned by their respective domains.
          </p>
        </div>
      </section>
    </div>
  );
}

function ActionButton({ action, pending, onClick }: {
  action: PolicyAction;
  pending: PolicyAction | null;
  onClick: (action: PolicyAction) => void;
}) {
  return (
    <button
      type="button"
      disabled={pending !== null}
      onClick={() => onClick(action)}
      className="rounded-lg bg-[#741d35] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5b1629] disabled:opacity-50"
    >
      {pending === action ? "Updating…" : formatStatus(action)}
    </button>
  );
}

function ProjectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </article>
  );
}

function ProjectionValue({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value ? formatStatus(value) : "Unavailable"}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {formatStatus(value)}
    </span>
  );
}

function Unavailable() {
  return <p className="text-sm text-slate-400">Unavailable</p>;
}

function StatePanel({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "error" }) {
  return (
    <div
      className={`rounded-xl border p-12 text-center text-sm shadow-sm ${
        tone === "error" ? "border-red-200 bg-red-50 text-red-900" : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {children}
    </div>
  );
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value: string | null) {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Unavailable";
}

function errorMessage(reason: unknown, fallback: string) {
  return reason instanceof Error && reason.message ? reason.message : fallback;
}
