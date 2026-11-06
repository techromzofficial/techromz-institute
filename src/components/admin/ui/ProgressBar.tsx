import React from 'react';

export function ProgressBar({
  value,
  max = 100,
  barColor = 'var(--burgundy)',
  style,
}: {
  value: number;
  max?: number;
  barColor?: string;
  style?: React.CSSProperties;
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <span className="progress-track" style={style}>
      <i style={{ width: `${percent}%`, backgroundColor: barColor }} />
    </span>
  );
}
