"use client";

export function AuthorizationQueueSummary() {
  return (
    <div className="grid kpis">
      <div className="card">
        <span className="muted">Pending reviews</span>
        <div className="kpi-value">14</div>
        <small className="muted">Escalations ready for triage</small>
      </div>
      <div className="card">
        <span className="muted">Territory conflicts</span>
        <div className="kpi-value">3</div>
        <small className="muted">Requires legal sign-off</small>
      </div>
      <div className="card">
        <span className="muted">Expiring authorizations</span>
        <div className="kpi-value">6</div>
        <small className="muted">In the next 30 days</small>
      </div>
    </div>
  );
}
