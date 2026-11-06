import React from 'react';
import { 
  Star, 
  Smile, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  ClipboardList, 
  ShieldAlert, 
  Activity 
} from 'lucide-react';

interface QaMetrics {
  average_qa_score?: number;
  total_evaluations?: number;
  average_csat_score?: number;
  csat_percent?: number;
  ces_score?: number;
  qa_score?: number;
  fcr_percent?: number;
  low_csat_cases?: number;
  qa_evaluations_pending?: number;
  critical_defects?: number;
  health_score?: number;
}

export function QaKpiCards({ metrics, isLoading }: { metrics: QaMetrics | null, isLoading: boolean }) {
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
    csat: metrics?.csat_percent ?? 0,
    ces: metrics?.ces_score ?? 0,
    qa_score: metrics?.average_qa_score ?? 0,
    fcr: metrics?.fcr_percent ?? 0,
    low_csat: metrics?.low_csat_cases ?? 0,
    qa_pending: metrics?.qa_evaluations_pending ?? 0,
    critical_defects: metrics?.critical_defects ?? 0,
    health: metrics?.health_score ?? 0,
  };

  const cards = [
    {
      title: 'CSAT Score',
      value: `${safe.csat}%`,
      icon: Star,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Customer Effort (CES)',
      value: `${safe.ces} /5`,
      icon: Smile,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'QA Score',
      value: `${safe.qa_score}%`,
      icon: ShieldCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'First Contact Res. (FCR)',
      value: `${safe.fcr}%`,
      icon: CheckCircle,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Low-CSAT Cases',
      value: safe.low_csat,
      icon: AlertTriangle,
      color: safe.low_csat > 0 ? 'text-amber-600' : 'text-slate-500',
      bg: safe.low_csat > 0 ? 'bg-amber-50' : 'bg-slate-50',
    },
    {
      title: 'QA Evals Pending',
      value: safe.qa_pending,
      icon: ClipboardList,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Critical Defects',
      value: safe.critical_defects,
      icon: ShieldAlert,
      color: safe.critical_defects > 0 ? 'text-red-600' : 'text-slate-500',
      bg: safe.critical_defects > 0 ? 'bg-red-50' : 'bg-slate-50',
    },
    {
      title: 'Service Health',
      value: `${safe.health} /100`,
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
