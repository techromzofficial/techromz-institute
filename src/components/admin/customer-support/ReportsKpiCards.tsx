import React from 'react';
import { 
  FileText, 
  Calendar, 
  UploadCloud, 
  DownloadCloud, 
  Database, 
  HardDrive, 
  AlertTriangle, 
  Activity 
} from 'lucide-react';

interface ReportMetrics {
  total_reports?: number;
  generated_today?: number;
  scheduled_reports?: number;
  reports_generated?: number;
  export_jobs?: number;
  import_jobs?: number;
  records_exported?: number;
  records_imported?: number;
  transfer_exceptions?: number;
  health_score?: number;
}

export function ReportsKpiCards({ metrics, isLoading }: { metrics: ReportMetrics | null, isLoading: boolean }) {
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
    reports_gen: metrics?.reports_generated ?? 0,
    scheduled: metrics?.scheduled_reports ?? 0,
    exports: metrics?.export_jobs ?? 0,
    imports: metrics?.import_jobs ?? 0,
    records_exp: metrics?.records_exported ?? 0,
    records_imp: metrics?.records_imported ?? 0,
    transfers: metrics?.transfer_exceptions ?? 0,
    health: metrics?.health_score ?? 0,
  };

  const cards = [
    {
      title: 'Reports Generated',
      value: safe.reports_gen,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Scheduled Reports',
      value: safe.scheduled,
      icon: Calendar,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Export Jobs',
      value: safe.exports,
      icon: UploadCloud,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Import Jobs',
      value: safe.imports,
      icon: DownloadCloud,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Records Exported',
      value: safe.records_exp,
      icon: Database,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
    },
    {
      title: 'Records Imported',
      value: safe.records_imp,
      icon: HardDrive,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      title: 'Transfer Exceptions',
      value: safe.transfers,
      icon: AlertTriangle,
      color: safe.transfers > 0 ? 'text-red-600' : 'text-slate-500',
      bg: safe.transfers > 0 ? 'bg-red-50' : 'bg-slate-50',
    },
    {
      title: 'Reporting Health',
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
