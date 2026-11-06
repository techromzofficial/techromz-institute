import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  loading = false,
  error = null,
  onRetry,
  actions,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-line shadow-sm p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[12px] font-bold text-ink uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>}
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="flex-1 min-h-0 w-full relative">
        {loading ? (
          <div className="w-full h-full min-h-[200px] bg-canvas rounded-lg animate-pulse flex items-center justify-center">
            <span className="text-xs text-muted">Loading chart analytics...</span>
          </div>
        ) : error ? (
          <div className="w-full h-full min-h-[200px] bg-rose-50 border border-rose-200 rounded-lg p-4 flex flex-col items-center justify-center text-center gap-2">
            <AlertCircle size={20} className="text-rose-600" />
            <div className="text-xs font-bold text-rose-700">Unable to load chart data</div>
            <div className="text-[11px] text-rose-600">{error}</div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-1 px-3 py-1 bg-rose-600 text-white text-[11px] font-semibold rounded hover:bg-rose-700 transition-colors flex items-center gap-1"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
