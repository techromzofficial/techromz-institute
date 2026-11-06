import React from 'react';
import { 
  ShieldCheck, 
  GitMerge, 
  AlertCircle, 
  Layers, 
  FileWarning, 
  AlertTriangle, 
  Clock, 
  Activity 
} from 'lucide-react';

interface SlaMetrics {
  sla_attainment_percent?: number | null;
  active_policies_count?: number;
  active_rules_count?: number;
  active_escalation_rules_count?: number;
  active_service_policies_count?: number;
  policy_exceptions_count?: number;
  routing_conflicts_count?: number;
  pending_approvals_count?: number;
  health_score?: number;
  breached_cases_count?: number;
  at_risk_cases_count?: number;
  completed_cases_count?: number;
}

export function SlaKpiCards({ metrics, isLoading }: { metrics: SlaMetrics | null, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  const safe = {
    active_policies: metrics?.active_policies_count ?? 0,
    active_rules: metrics?.active_rules_count ?? 0,
    active_escalations: metrics?.active_escalation_rules_count ?? 0,
    service_policies: metrics?.active_service_policies_count ?? 0,
    policy_exceptions: metrics?.policy_exceptions_count ?? 0,
    routing_conflicts: metrics?.routing_conflicts_count ?? 0,
    pending_approvals: metrics?.pending_approvals_count ?? 0,
    health_score: metrics?.health_score ?? 0,
  };

  const cards = [
    {
      title: 'Active SLA Policies',
      value: safe.active_policies,
      icon: ShieldCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Routing Rules',
      value: safe.active_rules,
      icon: GitMerge,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Active Escalation Rules',
      value: safe.active_escalations,
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      title: 'Active Service Policies',
      value: safe.service_policies,
      icon: Layers,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Policy Exceptions',
      value: safe.policy_exceptions,
      icon: FileWarning,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Routing Conflicts',
      value: safe.routing_conflicts,
      icon: AlertTriangle,
      color: safe.routing_conflicts > 0 ? 'text-red-600' : 'text-slate-500',
      bg: safe.routing_conflicts > 0 ? 'bg-red-50' : 'bg-slate-50',
    },
    {
      title: 'Pending Approvals',
      value: safe.pending_approvals,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'SLA & Routing Health',
      value: `${safe.health_score} /100`,
      icon: Activity,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div key={idx} className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-slate-500 line-clamp-1">{c.title}</span>
              <div className={`p-1 rounded ${c.bg} ${c.color} shrink-0`}>
                <Icon size={14} />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">{c.value}</div>
          </div>
        );
      })}
    </div>
  );
}
