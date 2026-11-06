"use client";

import Link from "next/link";
import { ArrowLeft, Edit, History } from "lucide-react";

interface CustomerDetailHeaderProps {
  customerId: string;
  showToast: (message: string) => void;
  canEdit?: boolean;
}

export function CustomerDetailHeader({ customerId, canEdit = false }: CustomerDetailHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-3 border-b border-line/60 pb-2 sm:flex-row sm:items-center">
      <div>
        <Link href="/admin/customers" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:text-[#671021]">
          <ArrowLeft size={15} />
          <span>Back to Customers</span>
        </Link>
        <h1 className="mt-1 text-xl font-black tracking-tight text-ink">Customer Detail</h1>
        <p className="font-mono text-[10px] text-slate-500">{customerId}</p>
      </div>

      <div className="flex items-center gap-2">
        {canEdit && <Link href={`/admin/customers/${customerId}/edit`} className="inline-flex items-center gap-1.5 rounded-md bg-[#671021] px-3 py-1.5 text-[11.5px] font-bold text-white shadow-2xs transition-colors hover:bg-[#520d1a]">
          <Edit className="h-3.5 w-3.5" />
          Edit Customer
        </Link>}
        <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-[11.5px] font-bold text-slate-600 shadow-2xs">
          <History className="h-3.5 w-3.5" />
          Audit available in tab
        </span>
      </div>
    </div>
  );
}
