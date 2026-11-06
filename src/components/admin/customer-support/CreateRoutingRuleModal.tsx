import React, { useState } from 'react';
import { X, Check, Plus, Trash2 } from 'lucide-react';
import { apiClient } from '@/services/api/apiClient';

interface CreateRoutingRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRoutingRuleModal({ isOpen, onClose, onSuccess }: CreateRoutingRuleModalProps) {
  const [name, setName] = useState('');
  const [conditions, setConditions] = useState<{ field: string, operator: string, value: string }[]>([
    { field: 'category', operator: 'equals', value: '' }
  ]);
  const [targetTeamId, setTargetTeamId] = useState<number | ''>('');
  const [priorityOrder, setPriorityOrder] = useState<number>(0);
  const [status, setStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const addCondition = () => {
    setConditions([...conditions, { field: 'category', operator: 'equals', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, key: string, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [key]: value };
    setConditions(newConditions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Convert conditions array to object mapping
    const conditionsObj = conditions.reduce((acc, curr) => {
      if (curr.field && curr.value) {
        acc[curr.field] = curr.value;
      }
      return acc;
    }, {} as Record<string, string>);

    try {
      await apiClient('/admin/support/sla-routing/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          conditions: conditionsObj,
          target_team_id: targetTeamId || null,
          priority_order: priorityOrder,
          status,
        }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create routing rule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Create Routing Rule</h2>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#722140]/20 focus:border-[#722140]"
                  placeholder="e.g. High Priority Billing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority Order</label>
                <input
                  type="number"
                  min="0"
                  value={priorityOrder}
                  onChange={(e) => setPriorityOrder(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#722140]/20 focus:border-[#722140]"
                  placeholder="0 (Highest priority)"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-900">Conditions (ALL must match)</h3>
                <button 
                  type="button" 
                  onClick={addCondition}
                  className="text-xs font-medium text-[#722140] hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Condition
                </button>
              </div>
              
              <div className="space-y-3">
                {conditions.map((condition, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={condition.field}
                      onChange={(e) => updateCondition(idx, 'field', e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-[#722140]"
                    >
                      <option value="category">Category</option>
                      <option value="priority">Priority</option>
                      <option value="channel">Channel</option>
                    </select>
                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(idx, 'operator', e.target.value)}
                      className="w-32 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-[#722140]"
                    >
                      <option value="equals">Equals</option>
                    </select>
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:border-[#722140]"
                      placeholder="Value"
                      required
                    />
                    {conditions.length > 1 && (
                      <button type="button" onClick={() => removeCondition(idx)} className="p-2 text-slate-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Team ID</label>
                <input
                  type="number"
                  value={targetTeamId}
                  onChange={(e) => setTargetTeamId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#722140]/20 focus:border-[#722140]"
                  placeholder="Leave empty for unassigned"
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
              disabled={isSubmitting || !name || conditions.some(c => !c.value)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#722140] rounded-lg hover:bg-[#5a1a32] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : (
                <>
                  <Check size={16} /> Create Rule
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
