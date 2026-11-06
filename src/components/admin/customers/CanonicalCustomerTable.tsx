"use client";

import Link from "next/link";
import type { CustomerRecord } from "@/types/customer";

interface CanonicalCustomerTableProps {
  customers: CustomerRecord[];
  isLoading: boolean;
}

export function CanonicalCustomerTable({ customers, isLoading }: CanonicalCustomerTableProps) {
  if (isLoading) {
    return <div className="h-56 animate-pulse rounded-lg border border-line bg-white p-5"><div className="h-5 w-48 rounded bg-slate-200" /><div className="mt-6 h-32 rounded bg-slate-100" /></div>;
  }
  if (customers.length === 0) {
    return <div className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm font-semibold text-slate-500">No Customers match the current tenant-scoped filters.</div>;
  }

  return <div className="overflow-x-auto rounded-lg border border-line bg-white shadow-sm"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Lifecycle</th><th className="px-4 py-3">Membership</th><th className="px-4 py-3">Updated</th></tr></thead><tbody className="divide-y divide-line">{customers.map((customer) => <tr key={customer.id} className="hover:bg-slate-50"><td className="px-4 py-3"><Link href={`/admin/customers/${customer.id}`} className="font-bold text-[#671021] hover:underline">{customer.name}</Link><p className="mt-1 font-mono text-[9px] text-slate-400">{customer.id}</p>{customer.email && <p className="mt-1 text-[10px] text-slate-500">{customer.email}</p>}</td><td className="px-4 py-3 text-slate-700">{customer.companyName ?? "—"}</td><td className="px-4 py-3 text-slate-700">{customer.country ?? "—"}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 font-semibold capitalize text-slate-700">{customer.accountStatus ?? "unknown"}</span></td><td className="px-4 py-3 capitalize text-slate-700">{customer.membershipStatus ?? "—"}</td><td className="px-4 py-3 font-mono text-[10px] text-slate-500">{customer.updatedAt ? new Date(customer.updatedAt).toLocaleString() : "—"}</td></tr>)}</tbody></table></div>;
}
