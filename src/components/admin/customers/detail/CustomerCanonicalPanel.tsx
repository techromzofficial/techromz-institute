"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { customerApi } from "@/lib/api/customers";
import { CustomerAddressOperations } from "./CustomerAddressOperations";
import { CustomerPreferencesTagOperations } from "./CustomerPreferencesTagOperations";
import { CustomerConsentPrivacyOperations } from "./CustomerConsentPrivacyOperations";

interface CustomerCanonicalPanelProps {
  customerUuid: string;
  section: string;
  permissions?: string[];
}

interface PanelItem {
  key: string;
  title: string;
  detail: string;
  timestamp?: string | null;
}

export function CustomerCanonicalPanel({ customerUuid, section, permissions = [] }: CustomerCanonicalPanelProps) {
  const legacyManage = permissions.includes("customers.manage");
  if (section === "addresses-contacts") return <CustomerAddressOperations customerUuid={customerUuid} canManage={legacyManage || permissions.includes("customers.addresses.manage")} />;
  if (section === "preferences-tags") return <CustomerPreferencesTagOperations customerUuid={customerUuid} canManage={legacyManage || permissions.includes("customers.update")} />;
  if (section === "consent-privacy") return <CustomerConsentPrivacyOperations customerUuid={customerUuid} canUpdate={legacyManage || permissions.includes("customers.update")} canManagePrivacy={legacyManage || permissions.includes("customers.privacy.manage")} />;
  return <CustomerReadOnlyPanel customerUuid={customerUuid} section={section} />;
}

function CustomerReadOnlyPanel({ customerUuid, section }: Omit<CustomerCanonicalPanelProps, "permissions">) {
  const [items, setItems] = useState<PanelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    loadSection(customerUuid, section)
      .then((result) => active && setItems(result))
      .catch(() => active && setError("This Customer section could not be loaded."))
      .finally(() => active && setIsLoading(false));

    return () => { active = false; };
  }, [customerUuid, section]);

  if (isLoading) {
    return <div className="flex min-h-48 items-center justify-center rounded-lg border border-line bg-white"><Loader2 className="mr-2 h-5 w-5 animate-spin text-[#671021]" /><span className="text-sm text-slate-600">Loading Customer data…</span></div>;
  }

  if (error) {
    return <div role="alert" className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-6 text-center"><AlertTriangle className="mb-2 h-6 w-6 text-rose-600" /><p className="text-sm font-semibold text-rose-800">{error}</p><p className="mt-1 text-xs text-rose-700">Access failures are intentionally not expanded into existence-revealing details.</p></div>;
  }

  if (items.length === 0) {
    return <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center"><Inbox className="mb-2 h-7 w-7 text-slate-400" /><p className="text-sm font-semibold text-slate-700">No records in this Customer section</p><p className="mt-1 text-xs text-slate-500">Only authoritative tenant-scoped records are shown.</p></div>;
  }

  return <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm"><div className="divide-y divide-line">{items.map((item) => <article key={item.key} className="p-4"><div className="flex items-start justify-between gap-4"><div><h3 className="text-sm font-bold text-ink">{item.title}</h3><p className="mt-1 text-xs text-slate-600">{item.detail}</p></div>{item.timestamp && <time className="shrink-0 text-[10px] font-mono text-slate-400">{new Date(item.timestamp).toLocaleString()}</time>}</div></article>)}</div></div>;
}

async function loadSection(customerUuid: string, section: string): Promise<PanelItem[]> {
  if (section === "orders") {
    const response = await customerApi.getOrders(customerUuid);
    return response.data.map((item) => ({ key: item.uuid, title: item.order_number, detail: `${item.status} · ${item.currency} ${item.total} · ${item.item_count} item(s)`, timestamp: item.created_at }));
  }
  if (section === "activity") {
    const response = await customerApi.getActivity(customerUuid);
    return response.data.map((item) => ({ key: item.uuid, title: item.type, detail: item.summary, timestamp: item.occurred_at }));
  }
  if (section === "audit-history") {
    const response = await customerApi.getAudit(customerUuid);
    return response.data.map((item) => ({ key: item.uuid, title: item.action, detail: item.reason ?? "Customer audit event", timestamp: item.occurred_at }));
  }
  return [];
}
