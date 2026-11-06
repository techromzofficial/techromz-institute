'use client';

import { CheckCircle2, Clock, AlertCircle, HelpCircle } from 'lucide-react';

const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  Approved: { label: 'Approved', className: 'pill-approved', icon: CheckCircle2 },
  'Pending Review': { label: 'Pending Review', className: 'pill-pending', icon: Clock },
  Rejected: { label: 'Correction Required', className: 'pill-rejected', icon: AlertCircle },
  Missing: { label: 'Missing', className: 'pill-missing', icon: HelpCircle },
};

export function ChecklistStatusPill({ status, note }: { status: string; note?: string }) {
  const current = config[status] || { label: status, className: 'pill-default', icon: Clock };
  const Icon = current.icon;

  return (
    <div className="status-pill-wrap">
      <span className={`checklist-status-pill ${current.className}`}>
        <Icon size={13} />
        {current.label}
      </span>
      {note && <small className="status-pill-note">{note}</small>}
    </div>
  );
}
