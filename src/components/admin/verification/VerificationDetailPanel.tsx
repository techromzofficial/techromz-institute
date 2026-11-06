"use client";
import Link from "next/link";
import {AlertTriangle, FileText, ShieldCheck} from "lucide-react";

export function VerificationDetailPanel({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <section className="card">
      <div className="card-heading">
        <p className="eyebrow">Integrated review panel</p>
        <ShieldCheck size={16} className="muted" />
      </div>
      <h3>{title}</h3>
      <p className="muted" style={{ marginTop: 6 }}>{description}</p>
      <div className="dashboard-alert-row" style={{ marginTop: 12 }}>
        <AlertTriangle size={16} className="muted" />
        <div>
          <strong>Verification follow-up required</strong>
          <small>Use the existing case workflow to complete the pending actions.</small>
        </div>
      </div>
      <Link href={href} className="text-link" style={{ marginTop: 12, display: "inline-flex" }}>
        <FileText size={14} style={{ marginRight: 6 }} />
        Open full review flow →
      </Link>
    </section>
  );
}
