import "../admin-integrated.css";
import "../admin-analytics.css";
import "../authorization-detail.css";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { AdminRouteGuard } from "@/components/admin/layout/AdminRouteGuard";
import { AdminContextProvider } from "@/contexts/AdminContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRouteGuard>
      <AdminContextProvider>
        <AdminShell>{children}</AdminShell>
      </AdminContextProvider>
    </AdminRouteGuard>
  );
}
