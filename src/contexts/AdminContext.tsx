"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

export type AdminScope = { id: string; code?: string; name: string; type?: string };
export type SectorPack = { id: string; version: string; name: string; capabilities: string[] };
export type AdminContextValue = {
  ecosystem: AdminScope;
  tenant: AdminScope & { slug?: string };
  businessUnit: AdminScope | null;
  channel: AdminScope | null;
  sectorPack: SectorPack | null;
  permissions: string[];
  correlationId: string | null;
  hasPermission: (permission: string) => boolean;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminContextError({ referenceId }: { referenceId?: string | null }) {
  return <div role="alert">
    <p>Unable to load administrator context.</p>
    {referenceId && <p>Reference: {referenceId}</p>}
  </div>;
}

export function AdminContextProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<Omit<AdminContextValue, "hasPermission"> | null>(null);
  const [error, setError] = useState<{ message: string; referenceId: string | null } | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response: any = await api.get("/internal/tenant-context");
        if (!active) return;
        const data = response.data;
        setContext({
          ecosystem: data.ecosystem,
          tenant: data.tenant,
          businessUnit: data.business_unit,
          channel: data.channel,
          sectorPack: data.sector_pack,
          permissions: Array.isArray(data.permissions) ? data.permissions : [],
          correlationId: data.correlation_id ?? null,
        });
      } catch (reason) {
        const apiError = reason as Error & { referenceId?: string | null };
        if (active) setError({ message: apiError.message, referenceId: apiError.referenceId ?? null });
      }
    })();
    return () => { active = false; };
  }, []);

  const value = useMemo<AdminContextValue | null>(() => context && ({
    ...context,
    hasPermission: (permission) => context.permissions.includes(permission),
  }), [context]);

  if (error) {
    return <AdminContextError referenceId={error.referenceId} />;
  }
  if (!value) {
    return <div className="min-h-screen flex items-center justify-center" role="status"><span>Loading administrator context…</span></div>;
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminContext(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdminContext must be used inside <AdminContextProvider>");
  return context;
}
