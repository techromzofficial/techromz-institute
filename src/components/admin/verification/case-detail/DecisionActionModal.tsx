'use client';

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export interface ActionConfig {
  key: string;
  title: string;
  description: string;
  confirmLabel: string;
  destructive: boolean;
}

export function DecisionActionModal({
  open,
  action,
  onClose,
  onConfirm,
}: {
  open: boolean;
  action: ActionConfig | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!open || !action) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a justification or reason for this decision.');
      return;
    }
    setError('');
    onConfirm(reason);
    setReason('');
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>{action.title}</h3>
          <button onClick={onClose} className="icon-button" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <p className="muted" style={{ fontSize: 14 }}>
            {action.description}
          </p>

          <label className="modal-field-label">
            Justification / Decision Reason <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="Provide detail for the audit log..."
            rows={4}
          />
          {error && (
            <p className="field-error flex-center" style={{ gap: 4 }}>
              <AlertCircle size={14} /> {error}
            </p>
          )}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="button">
              Cancel
            </button>
            <button
              type="submit"
              className={`button ${action.destructive ? 'danger' : 'primary'}`}
            >
              {action.confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
