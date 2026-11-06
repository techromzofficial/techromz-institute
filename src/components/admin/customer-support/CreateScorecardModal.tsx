import React, { useState } from 'react';
import { X, Check, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/services/api/apiClient';

interface CreateScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateScorecardModal({ isOpen, onClose, onSuccess }: CreateScorecardModalProps) {
  const [name, setName] = useState('');
  const [rubric, setRubric] = useState<{ criterion: string, maxScore: number }[]>([
    { criterion: 'Empathy and Tone', maxScore: 20 }
  ]);
  const [status, setStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const addCriterion = () => {
    setRubric([...rubric, { criterion: '', maxScore: 10 }]);
  };

  const removeCriterion = (index: number) => {
    setRubric(rubric.filter((_, i) => i !== index));
  };

  const updateCriterion = (index: number, key: 'criterion' | 'maxScore', value: string | number) => {
    const newRubric = [...rubric];
    newRubric[index] = { ...newRubric[index], [key]: value };
    setRubric(newRubric);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient('/admin/support/qa-satisfaction/scorecards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          rubric,
          status,
        }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create scorecard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Create QA Scorecard</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 max-h-[80vh]">
          <div className="p-6 space-y-6 overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Scorecard Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#722140]/20 focus:border-[#722140]"
                  placeholder="e.g. Standard Email QA"
                />
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

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-900">Grading Rubric</h3>
                <button 
                  type="button" 
                  onClick={addCriterion}
                  className="text-xs font-medium text-[#722140] hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Criterion
                </button>
              </div>
              
              <div className="space-y-3">
                {rubric.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.criterion}
                      onChange={(e) => updateCriterion(idx, 'criterion', e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-[#722140]"
                      placeholder="e.g. Resolution accuracy"
                      required
                    />
                    <input
                      type="number"
                      value={item.maxScore}
                      onChange={(e) => updateCriterion(idx, 'maxScore', parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-[#722140]"
                      placeholder="Max Score"
                      required
                    />
                    {rubric.length > 1 && (
                      <button type="button" onClick={() => removeCriterion(idx)} className="p-2 text-slate-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
              disabled={isSubmitting || !name || rubric.some(r => !r.criterion)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#722140] rounded-lg hover:bg-[#5a1a32] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (
                <>
                  <Check size={16} /> Save Scorecard
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
