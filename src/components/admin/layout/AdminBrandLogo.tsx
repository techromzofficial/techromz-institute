import Link from "next/link";
import { Gem } from "lucide-react";

export function AdminBrandLogo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/admin/dashboard"
      className="admin-brand"
      aria-label="Go to SL Beauty Admin Dashboard"
      onClick={onNavigate}
    >
      <span className="admin-brand-icon" aria-hidden="true">
        <Gem size={19} strokeWidth={2.2} />
      </span>
      <span className="admin-brand-text">
        <span className="admin-brand-title">SL Beauty</span>
        <span className="admin-brand-subtitle">Enterprise Admin</span>
      </span>
    </Link>
  );
}
