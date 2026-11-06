import React from "react";

export function RightIntelligenceRail({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <aside className="w-[300px] flex-shrink-0 flex flex-col gap-4 border-l border-gray-200 pl-4 py-4 min-h-screen">
      {children}
    </aside>
  );
}

export function RailSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col mb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {action}
      </div>

      {children}
    </section>
  );
}

interface HealthMetric {
  label: string;
  value: string;
  progress: number;
}

interface HealthScoreGaugeProps {
  score: number;
  label: string;
  statusText: string;
  statusColor?: string;
  metrics: HealthMetric[];
}

const clampPercentage = (value: number) =>
  Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

export function HealthScoreGauge({
  score,
  label,
  statusText,
  statusColor = "#22c55e",
  metrics,
}: HealthScoreGaugeProps) {
  const safeScore = clampPercentage(score);

  return (
    <div className="flex items-start gap-4 mb-2">
      <div className="w-20 flex-shrink-0 flex flex-col items-center">
        <div
          className="w-20 h-20 rounded-full p-[7px]"
          style={{
            background: `conic-gradient(${statusColor} ${safeScore * 3.6}deg, #f3f4f6 0deg)`,
          }}
          role="img"
          aria-label={`${label}: ${safeScore}`}
        >
          <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-gray-900 leading-none">
              {safeScore}
            </span>

            <span className="text-[9px] text-gray-400 mt-1">/ 100</span>
          </div>
        </div>

        <div
          className="mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full border border-gray-200 bg-white shadow-sm text-center"
          style={{ color: statusColor }}
        >
          {statusText}
        </div>

        {label ? (
          <div className="text-[9px] text-gray-500 text-center mt-1">
            {label}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col w-full gap-2 mt-1">
        {metrics.length === 0 ? (
          <div className="text-[10px] text-gray-400 border border-dashed border-gray-200 rounded p-2 text-center">
            Detailed health metrics are not available.
          </div>
        ) : (
          metrics.map((metric, index) => {
            const progress = clampPercentage(metric.progress);

            return (
              <div
                key={`${metric.label}-${index}`}
                className="flex flex-col gap-0.5"
              >
                <div className="flex justify-between items-center gap-2 text-[10px]">
                  <span className="font-medium text-gray-600">
                    {metric.label}
                  </span>

                  <span className="font-bold text-gray-900">
                    {metric.value}
                  </span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: statusColor,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}