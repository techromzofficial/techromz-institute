'use client';

import { Check, RefreshCw, Lock } from 'lucide-react';
import { WorkflowStage } from '@/mocks/admin/caseDetail.mock';

export function WorkflowStatusCard({ stages }: { stages: WorkflowStage[] }) {
  return (
    <article className="card workflow-status-card">
      <h3 className="section-title-sm">Workflow Status</h3>
      <div className="workflow-stepper">
        {stages.map((stage, i) => {
          const isComplete = stage.state === 'complete';
          const isActive = stage.state === 'active';
          return (
            <div
              key={stage.label}
              className={`step-item ${isComplete ? 'complete' : isActive ? 'active' : 'locked'}`}
            >
              <div className="step-node">
                {isComplete ? (
                  <Check size={14} />
                ) : isActive ? (
                  <RefreshCw size={13} className="spin" />
                ) : (
                  <Lock size={12} />
                )}
              </div>
              <span className="step-label">{stage.label}</span>
              <small className="step-sub">{stage.sublabel}</small>
              {i < stages.length - 1 && <div className="step-connector" />}
            </div>
          );
        })}
      </div>
    </article>
  );
}
