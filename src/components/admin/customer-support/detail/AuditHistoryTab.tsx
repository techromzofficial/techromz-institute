'use client';

import React from 'react';
import { History, Clock } from 'lucide-react';
import type { AuditEventItem } from '@/types/customerSupportDetail';

interface AuditHistoryTabProps {
  auditEvents: AuditEventItem[];
}

export function AuditHistoryTab({ auditEvents }: AuditHistoryTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[#722140]" />
          <h3 className="font-bold text-slate-800 text-sm">Chronological Audit History</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Total audit events recorded: {auditEvents.length}
        </span>
      </div>

      <div className="space-y-3">
        {auditEvents.map((evt) => (
          <div key={evt.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3 text-xs">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              <Clock size={14} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                <span className="font-bold text-slate-900">{evt.eventType}</span>
                <span className="text-[11px] text-slate-400 font-mono">{evt.timestamp}</span>
              </div>

              <p className="text-slate-700 leading-normal mb-1">{evt.details}</p>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                <span>Actor: <strong className="text-slate-800">{evt.actorName}</strong> ({evt.actorRole})</span>
                {evt.previousValue && (
                  <span className="text-slate-400">
                    Changed from <code className="bg-white px-1 py-0.5 rounded border border-slate-200">{evt.previousValue}</code> to <code className="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded border border-emerald-200 font-bold">{evt.newValue}</code>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

