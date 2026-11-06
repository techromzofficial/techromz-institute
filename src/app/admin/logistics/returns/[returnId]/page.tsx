"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CircleSlash2,
  RotateCcw,
} from "lucide-react";

export default function LogisticsReturnDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/admin/logistics/returns"
          aria-label="Back to Returns and Reverse Logistics"
          className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Return / Reverse Logistics Detail
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Detail access is reserved for authoritative physical return records.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <RotateCcw
              size={20}
              className="text-slate-400"
            />

            <div>
              <h2 className="font-semibold text-slate-900">
                Return Record
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                No authoritative Logistics return record can currently be resolved.
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[320px] flex-col items-center justify-center p-10 text-center">
          <CircleSlash2
            size={38}
            className="text-slate-300"
          />

          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Return record unavailable
          </h3>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            The Logistics backend does not currently contain an authoritative
            physical returns domain. This page will not generate a return,
            collection, inspection, refund, or reverse-logistics record from
            unrelated shipment or Finance data.
          </p>

          <Link
            href="/admin/logistics/returns"
            className="mt-6 inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to Returns
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-900">
          Detail workflow unavailable
        </div>

        <p className="mt-1 text-sm text-slate-600">
          Return receiving, collection tracking, inspection, disposition,
          closure and refund linkage remain disabled until an authoritative
          reverse-logistics record model is implemented.
        </p>
      </div>
    </div>
  );
}