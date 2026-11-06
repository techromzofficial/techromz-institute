import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { apiClient } from '@/services/api/apiClient';

interface CreateSlaPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSlaPolicyModal({ isOpen, onClose, onSuccess }: CreateSlaPolicyModalProps) {
  const [name, setName] = useState('');
  const [firstResponseTarget, setFirstResponseTarget] = useState<number | ''>('');
  const [resolutionTarget, setResolutionTarget] = useState<number | ''>('');
  const [status, setStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient('/admin/support/sla-routing/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          first_response_target_minutes: firstResponseTarget || null,
          resolution_target_minutes: resolutionTarget || null,
          status,
        }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create SLA policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Create SLA Policy</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 space-y-4 overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Policy Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#722140]/20 focus:border-[#722140]"
                placeholder="e.g. VIP Customer SLA"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Response Target (Mins)</label>
                <input
                  type="number"
                  min="0"
                  value={firstResponseTarget}
                  onChange={(e) => setFirstResponseTarget(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#722140]/20 focus:border-[#722140]"
                  placeholder="e.g. 60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resolution Target (Mins)</label>
                <input
                  type="number"
                  min="0"
                  value={resolutionTarget}
                  onChange={(e) => setResolutionTarget(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#722140]/20 focus:border-[#722140]"
                  placeholder="e.g. 1440"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#722140]/20 focus:border-[#722140]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#722140] rounded-lg hover:bg-[#5a1a32] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : (
                <>
                  <Check size={16} /> Create Policy
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
