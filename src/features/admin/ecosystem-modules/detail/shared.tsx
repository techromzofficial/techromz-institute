import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { StatusTone } from "../types";
import shared from "../ecosystem-modules.module.css";
import styles from "./moduleDetail.module.css";

const toneClass = (tone: StatusTone) => shared[`tone${tone[0].toUpperCase()}${tone.slice(1)}`];

export function StatusPill({ value, tone }: { value: string; tone: StatusTone }) {
  return <span className={`${shared.statusPill} ${toneClass(tone)}`}>{value}</span>;
}

export function ProgressBar({ value, tone = "success" as const }: { value: number; tone?: "success" | "warning" }) {
  return (
    <span className={shared.metricTrack}>
      <i className={tone === "warning" ? shared.metricWarning : shared.metricSuccess} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </span>
  );
}

export function SectionCard({
  title,
  description,
  aside,
  children,
  scroll = true,
}: {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
}) {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeading}>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {aside}
      </div>
      <div className={styles.sectionBody}>
        {scroll ? <div className={styles.tableScroll}>{children}</div> : children}
      </div>
    </section>
  );
}

export function ViewDetailsLink({ onClick, label = "View details" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className={styles.viewDetailsLink} onClick={onClick}>
      {label} <ChevronRight size={12} />
    </button>
  );
}

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ textAlign: "center", color: "#8a919c", padding: "18px 10px" }}>
        {message}
      </td>
    </tr>
  );
}

