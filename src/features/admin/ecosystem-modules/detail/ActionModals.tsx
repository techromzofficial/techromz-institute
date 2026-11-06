"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { X } from "lucide-react";
import shared from "../ecosystem-modules.module.css";
import styles from "./moduleDetail.module.css";
import {
  requestModuleReview,
  requestProductionEnablement,
  retireModule,
  rotateSecret,
  scheduleRelease,
  suspendModule,
  updateFeatureFlagRollout,
} from "@/services/api/ecosystemModuleDetail";
import type { AuditHistoryEntry, FeatureFlagRow } from "../types";

function ModalFrame({
  eyebrow,
  title,
  intro,
  onClose,
  onSubmit,
  busy,
  error,
  submitLabel,
  destructive = false,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  error: string;
  submitLabel: string;
  destructive?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={shared.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className={shared.modal} onSubmit={onSubmit} aria-labelledby="action-modal-title">
        <div className={shared.modalHeader}>
          <div>
            <p className={shared.modalEyebrow}>{eyebrow}</p>
            <h2 id="action-modal-title">{title}</h2>
          </div>
          <button className={shared.iconButton} type="button" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <p className={shared.modalIntro}>{intro}</p>
        {children}
        {error && <p className={shared.formError} role="alert">{error}</p>}
        <div className={shared.modalActions}>
          <button className={shared.secondaryButton} type="button" onClick={onClose} disabled={busy}>Cancel</button>
          <button
            className={shared.primaryButton}
            type="submit"
            disabled={busy}
            style={destructive ? { background: "#b91c1c", borderColor: "#b91c1c" } : undefined}
          >
            {busy ? "Submitting..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

type SuccessHandler = (entry: AuditHistoryEntry, notice: string) => void;

export function ProductionEnablementModal({ moduleKey, onClose, onSuccess }: { moduleKey: string; onClose: () => void; onSuccess: SuccessHandler }) {
  const [reason, setReason] = useState("");
  const [evidenceLink, setEvidenceLink] = useState("");
  const [securityApproved, setSecurityApproved] = useState(false);
  const [complianceApproved, setComplianceApproved] = useState(false);
  const [pilotMetricsReviewed, setPilotMetricsReviewed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const entry = await requestProductionEnablement(moduleKey, { reason, evidenceLink, securityApproved, complianceApproved, pilotMetricsReviewed });
      onSuccess(entry, "Production enablement requested. Production stays disabled until final sign-off is recorded.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The request could not be submitted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalFrame
      eyebrow="Controlled frontend workflow"
      title="Request production enablement"
      intro="This submits a request only. Production is not enabled by this form — security review, compliance review and pilot metrics all need confirmed sign-off first."
      onClose={onClose}
      onSubmit={submit}
      busy={busy}
      error={error}
      submitLabel="Submit request"
    >
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Reason for this request
          <textarea className={styles.formTextarea} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain why this module is ready for production enablement..." />
        </label>
        <label className={styles.fieldLabel}>
          Evidence link
          <input value={evidenceLink} onChange={(event) => setEvidenceLink(event.target.value)} placeholder="Link to pilot report, dashboard, or review doc" />
        </label>
        <label className={styles.formCheckRow}>
          <input type="checkbox" checked={securityApproved} onChange={(event) => setSecurityApproved(event.target.checked)} />
          Security review is approved for this release
        </label>
        <label className={styles.formCheckRow}>
          <input type="checkbox" checked={complianceApproved} onChange={(event) => setComplianceApproved(event.target.checked)} />
          Compliance review is approved for this release
        </label>
        <label className={styles.formCheckRow}>
          <input type="checkbox" checked={pilotMetricsReviewed} onChange={(event) => setPilotMetricsReviewed(event.target.checked)} />
          Pilot metrics have been reviewed and meet the release bar
        </label>
      </div>
    </ModalFrame>
  );
}

export function ScheduleReleaseModal({ moduleKey, targetVersion, onClose, onSuccess }: { moduleKey: string; targetVersion: string; onClose: () => void; onSuccess: SuccessHandler }) {
  const [reason, setReason] = useState("");
  const [version, setVersion] = useState(targetVersion);
  const [scheduledDate, setScheduledDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const entry = await scheduleRelease(moduleKey, { reason, version, scheduledDate });
      onSuccess(entry, `${version} scheduled for ${scheduledDate}.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The release could not be scheduled.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalFrame
      eyebrow="Controlled frontend workflow"
      title="Schedule release"
      intro="Scheduling adds a candidate entry to Versions & Releases. It does not deploy or enable anything by itself."
      onClose={onClose}
      onSubmit={submit}
      busy={busy}
      error={error}
      submitLabel="Schedule release"
    >
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Target version
          <input value={version} onChange={(event) => setVersion(event.target.value)} placeholder="v1.0.0" />
        </label>
        <label className={styles.fieldLabel}>
          Scheduled date
          <input type="date" value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} />
        </label>
        <label className={styles.fieldLabel}>
          Reason
          <textarea className={styles.formTextarea} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="What's included in this release?" />
        </label>
      </div>
    </ModalFrame>
  );
}

export function SuspendModuleModal({ moduleKey, moduleName, onClose, onSuccess }: { moduleKey: string; moduleName: string; onClose: () => void; onSuccess: SuccessHandler }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const entry = await suspendModule(moduleKey, reason);
      onSuccess(entry, `Suspension requested for ${moduleName}. It remains operational until the review is complete.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The request could not be submitted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalFrame
      eyebrow="Controlled frontend workflow — high impact"
      title={`Suspend ${moduleName}`}
      intro="This records a suspension request for review. The module is not taken offline immediately — a separate approval completes the state change."
      onClose={onClose}
      onSubmit={submit}
      busy={busy}
      error={error}
      submitLabel="Request suspension"
      destructive
    >
      <label className={styles.fieldLabel}>
        Reason (required for the audit record)
        <textarea className={styles.formTextarea} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why does this module need to be suspended?" />
      </label>
    </ModalFrame>
  );
}

export function RetireModuleModal({ moduleKey, moduleName, onClose, onSuccess }: { moduleKey: string; moduleName: string; onClose: () => void; onSuccess: SuccessHandler }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const entry = await retireModule(moduleKey, reason);
      onSuccess(entry, `Retirement requested for ${moduleName}. It stays active until the retirement plan is approved.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The request could not be submitted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalFrame
      eyebrow="Controlled frontend workflow — high impact"
      title={`Retire ${moduleName}`}
      intro="This records a retirement request for review, including a migration or sunset plan. The module stays active until that plan is approved."
      onClose={onClose}
      onSubmit={submit}
      busy={busy}
      error={error}
      submitLabel="Request retirement"
      destructive
    >
      <label className={styles.fieldLabel}>
        Reason and sunset plan (required for the audit record)
        <textarea className={styles.formTextarea} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why is this module being retired, and what replaces it?" />
      </label>
    </ModalFrame>
  );
}

export function ReviewRequestModal({
  moduleKey,
  kind,
  onClose,
  onSuccess,
}: {
  moduleKey: string;
  kind: "security" | "compliance";
  onClose: () => void;
  onSuccess: SuccessHandler;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const label = kind === "security" ? "security" : "compliance";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const entry = await requestModuleReview(moduleKey, kind, reason);
      onSuccess(entry, `${label[0].toUpperCase()}${label.slice(1)} review requested.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The request could not be submitted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalFrame
      eyebrow="Controlled frontend workflow"
      title={`Request ${label} review`}
      intro={`This notifies the ${label} team and moves the ${label} status to review pending.`}
      onClose={onClose}
      onSubmit={submit}
      busy={busy}
      error={error}
      submitLabel="Send request"
    >
      <label className={styles.fieldLabel}>
        Reason
        <textarea className={styles.formTextarea} value={reason} onChange={(event) => setReason(event.target.value)} placeholder={`What should the ${label} team look at?`} />
      </label>
    </ModalFrame>
  );
}

export function RotateSecretModal({ moduleKey, parameter, onClose, onSuccess }: { moduleKey: string; parameter: { id: string; configKey: string }; onClose: () => void; onSuccess: SuccessHandler }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const entry = await rotateSecret(moduleKey, parameter.id, reason);
      onSuccess(entry, `${parameter.configKey} secret rotated.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The secret could not be rotated.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalFrame
      eyebrow="Controlled frontend workflow — secret handling"
      title={`Rotate secret: ${parameter.configKey}`}
      intro="The secret value itself is never shown, entered, or stored in the frontend. Confirming this action instructs the secrets manager to issue a new value."
      onClose={onClose}
      onSubmit={submit}
      busy={busy}
      error={error}
      submitLabel="Rotate secret"
    >
      <label className={styles.fieldLabel}>
        Reason
        <textarea className={styles.formTextarea} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why is this secret being rotated?" />
      </label>
    </ModalFrame>
  );
}

export function EditFeatureFlagModal({ moduleKey, flag, onClose, onSuccess }: { moduleKey: string; flag: FeatureFlagRow; onClose: () => void; onSuccess: SuccessHandler }) {
  const [rollout, setRollout] = useState(flag.rollout);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const entry = await updateFeatureFlagRollout(moduleKey, flag.id, rollout, reason);
      onSuccess(entry, `${flag.flagKey} rollout updated to ${rollout}%.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The flag could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ModalFrame
      eyebrow="Controlled frontend workflow"
      title={`Edit flag: ${flag.flagKey}`}
      intro="Rollout changes are recorded to the audit history immediately."
      onClose={onClose}
      onSubmit={submit}
      busy={busy}
      error={error}
      submitLabel="Save changes"
    >
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Rollout percentage
          <input type="number" min={0} max={100} value={rollout} onChange={(event) => setRollout(Number(event.target.value))} />
        </label>
        <label className={styles.fieldLabel}>
          Reason
          <textarea className={styles.formTextarea} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why is the rollout changing?" />
        </label>
      </div>
    </ModalFrame>
  );
}

