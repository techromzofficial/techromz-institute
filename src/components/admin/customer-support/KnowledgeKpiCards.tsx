import React from 'react';
import { 
  BookOpen, 
  Compass, 
  GitPullRequest, 
  AlertCircle, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';

interface KnowledgeMetrics {
  total_articles?: number;
  published_articles?: number;
  active_playbooks?: number;
  guided_flows?: number;
  knowledge_gaps?: number;
  articles_needing_review?: number;
  low_confidence?: number;
  pending_approvals?: number;
  health_score?: number;
  total_views?: number;
}

export function KnowledgeKpiCards({ metrics, isLoading }: { metrics: KnowledgeMetrics | null, isLoading: boolean }) {
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
    published: metrics?.published_articles ?? 0,
    playbooks: metrics?.active_playbooks ?? 0,
    guided_flows: metrics?.guided_flows ?? 0,
    gaps: metrics?.knowledge_gaps ?? 0,
    review_due: metrics?.articles_needing_review ?? 0,
    low_confidence: metrics?.low_confidence ?? 0,
    pending_approvals: metrics?.pending_approvals ?? 0,
    health: metrics?.health_score ?? 0,
  };

  const cards = [
    {
      title: 'Published Articles',
      value: safe.published,
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Playbooks',
      value: safe.playbooks,
      icon: Compass,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Guided Flows',
      value: safe.guided_flows,
      icon: GitPullRequest,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Knowledge Gaps',
      value: safe.gaps,
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Articles Needing Review',
      value: safe.review_due,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Low Confidence',
      value: safe.low_confidence,
      icon: AlertTriangle,
      color: safe.low_confidence > 0 ? 'text-red-600' : 'text-slate-500',
      bg: safe.low_confidence > 0 ? 'bg-red-50' : 'bg-slate-50',
    },
    {
      title: 'Pending Approvals',
      value: safe.pending_approvals,
      icon: CheckCircle2,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Knowledge Health',
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
