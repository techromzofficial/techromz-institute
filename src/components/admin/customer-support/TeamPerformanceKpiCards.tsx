import React from 'react';
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  AlertOctagon, 
  Inbox, 
  Clock, 
  Zap, 
  CheckCircle, 
  Activity 
} from 'lucide-react';

interface TeamMetrics {
  total_teams?: number;
  active_agents?: number;
  available_agents?: number;
  at_capacity_agents?: number;
  overloaded_agents?: number;
  open_cases?: number;
  sla_at_risk?: number;
  avg_first_response?: string;
  avg_resolution?: string;
  workforce_health?: number;
  average_workload_percent?: number;
}

export function TeamPerformanceKpiCards({ metrics, isLoading }: { metrics: TeamMetrics | null, isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  const safe = {
    active_agents: metrics?.active_agents ?? 0,
    available: metrics?.available_agents ?? 0,
    at_capacity: metrics?.at_capacity_agents ?? 0,
    overloaded: metrics?.overloaded_agents ?? 0,
    open_cases: metrics?.open_cases ?? 0,
    sla_at_risk: metrics?.sla_at_risk ?? 0,
    first_response: metrics?.avg_first_response ?? '—',
    resolution: metrics?.avg_resolution ?? '—',
    health: metrics?.workforce_health ?? 0,
  };

  const cards = [
    {
      title: 'Active Agents',
      value: safe.active_agents,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Available',
      value: safe.available,
      icon: UserCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'At Capacity',
      value: safe.at_capacity,
      icon: Briefcase,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Overloaded',
      value: safe.overloaded,
      icon: AlertOctagon,
      color: safe.overloaded > 0 ? 'text-red-600' : 'text-slate-500',
      bg: safe.overloaded > 0 ? 'bg-red-50' : 'bg-slate-50',
    },
    {
      title: 'Open Cases',
      value: safe.open_cases,
      icon: Inbox,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'SLA At Risk',
      value: safe.sla_at_risk,
      icon: Clock,
      color: safe.sla_at_risk > 0 ? 'text-amber-600' : 'text-slate-500',
      bg: safe.sla_at_risk > 0 ? 'bg-amber-50' : 'bg-slate-50',
    },
    {
      title: 'Avg First Resp.',
      value: safe.first_response,
      icon: Zap,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
    },
    {
      title: 'Avg Resolution',
      value: safe.resolution,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Workforce Health',
      value: `${safe.health} /100`,
      icon: Activity,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3 mb-6">
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
