"use client";

import React, {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import {
  ArrowLeft,
  BadgeDollarSign,
  FileWarning,
  Scale,
  Truck,
} from "lucide-react";

import {
  logisticsApi,
  type LogisticsClaimsCostResponse,
} from "@/lib/api/logistics";

export default function LogisticsClaimsCostPage() {
  const [data, setData] =
    useState<LogisticsClaimsCostResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await logisticsApi.getClaimsCostReconciliation();

        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        console.error(
          "Failed to load Logistics claims/cost/reconciliation:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to load Logistics claims, cost and reconciliation information.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/admin/logistics"
          aria-label="Back to Logistics overview"
          className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Claims, Cost & Reconciliation
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review Logistics domain capability boundaries without duplicating Finance-owned reconciliation or inventing unsupported carrier cost records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">
                Total Shipments
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {data?.summary.total_shipments ?? 0}
              </div>
            </div>

            <Truck
              size={22}
              className="text-slate-400"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">
                Logistics Claims
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {data?.summary.logistics_claims ?? 0}
              </div>
            </div>

            <FileWarning
              size={22}
              className="text-slate-400"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">
                Logistics Cost Records
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {data?.summary.logistics_cost_records ?? 0}
              </div>
            </div>

            <BadgeDollarSign
              size={22}
              className="text-slate-400"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">
                Reconciliation Records
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {data?.summary.logistics_reconciliation_records ??
                  0}
              </div>
            </div>

            <Scale
              size={22}
              className="text-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Logistics Claims
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Carrier or shipment claim records appear here only when backed by an authoritative Logistics claims domain.
          </p>
        </div>

        <div className="relative min-h-[220px]">
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-b-slate-900" />
            </div>
          ) : null}

          {error ? (
            <div className="p-8">
              <h3 className="font-semibold text-slate-900">
                Claims data unavailable
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>
            </div>
          ) : data &&
            data.claims.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">
                      Claim
                    </th>
                    <th className="px-5 py-3">
                      Shipment
                    </th>
                    <th className="px-5 py-3">
                      Carrier
                    </th>
                    <th className="px-5 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody />
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <FileWarning
                size={32}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-900">
                No Logistics claim records available
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
                The authoritative Logistics backend does not currently contain carrier-claim or shipment-claim records.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">
            Logistics Cost Domain
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Shipment cost, freight cost and carrier charge records are not currently represented by an authoritative Logistics-owned record source.
          </p>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-600">
              Logistics cost records
            </span>

            <span className="font-semibold text-slate-900">
              {data?.domains.costs.available
                ? "Available"
                : "Unavailable"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">
            Reconciliation Ownership
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Payment settlement and reconciliation remain Finance-owned. Logistics does not duplicate or mutate Finance reconciliation records.
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
              <span className="text-slate-600">
                Logistics reconciliation records
              </span>

              <span className="font-semibold text-slate-900">
                {data?.domains.reconciliation.available
                  ? "Available"
                  : "Unavailable"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm">
              <span className="text-slate-600">
                Finance authoritative
              </span>

              <span className="font-semibold text-slate-900">
                {data?.domains.reconciliation.finance_authoritative
                  ? "Yes"
                  : "No"}
              </span>
            </div>
          </div>

          {data?.domains.reconciliation.finance_authoritative ? (
            <Link
              href={data.domains.reconciliation.finance_route}
              className="mt-4 inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Open Finance Reconciliation
            </Link>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-900">
          Claims and Logistics financial workflows unavailable
        </div>

        <p className="mt-1 text-sm text-slate-600">
          Claim creation, assignment, resolution, carrier-cost recording, carrier-charge reconciliation, approval and settlement remain disabled until authoritative Logistics-owned claim and cost domains are implemented.
        </p>
      </div>
    </div>
  );
}