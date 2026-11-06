"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import CreateShipmentDialog from "@/features/admin/logistics/components/CreateShipmentDialog";

import { useRouter, useSearchParams } from "next/navigation";

import { ShipmentFilters } from "@/components/admin/logistics/ShipmentFilters";
import { ShipmentPagination } from "@/components/admin/logistics/ShipmentPagination";
import { ShipmentTable } from "@/components/admin/logistics/ShipmentTable";

import {
  logisticsApi,
  type LogisticsShipmentListResponse,
} from "@/lib/api/logistics";
import { LogisticsStatusCharts, statusData } from "@/features/admin/logistics/components/LogisticsStatusCharts";

function LogisticsShipmentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] =
    useState<LogisticsShipmentListResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );
  const [createOpen,setCreateOpen]=useState(false);
  const [reloadKey,setReloadKey]=useState(0);

  const currentSearch =
    searchParams.get("search") ?? "";

  const currentStatus =
    searchParams.get("status") ?? "";

  const currentPage =
    Math.max(
      Number(
        searchParams.get("page"),
      ) || 1,
      1,
    );

  const currentPerPage =
    Math.max(
      Number(
        searchParams.get(
          "per_page",
        ),
      ) || 10,
      1,
    );

  const updateUrl =
    useCallback(
      (next: {
        search?: string;
        status?: string;
        page?: number;
        per_page?: number;
      }) => {
        const params =
          new URLSearchParams(
            searchParams.toString(),
          );

        const merged = {
          search: currentSearch,
          status: currentStatus,
          page: currentPage,
          per_page:
            currentPerPage,
          ...next,
        };

        if (merged.search) {
          params.set(
            "search",
            merged.search,
          );
        } else {
          params.delete(
            "search",
          );
        }

        if (merged.status) {
          params.set(
            "status",
            merged.status,
          );
        } else {
          params.delete(
            "status",
          );
        }

        if (
          merged.page &&
          merged.page > 1
        ) {
          params.set(
            "page",
            String(merged.page),
          );
        } else {
          params.delete(
            "page",
          );
        }

        if (
          merged.per_page &&
          merged.per_page !== 10
        ) {
          params.set(
            "per_page",
            String(
              merged.per_page,
            ),
          );
        } else {
          params.delete(
            "per_page",
          );
        }

        const query =
          params.toString();

        router.push(
          query
            ? `/admin/logistics/shipments?${query}`
            : "/admin/logistics/shipments",
        );
      },
      [
        router,
        searchParams,
        currentSearch,
        currentStatus,
        currentPage,
        currentPerPage,
      ],
    );

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await logisticsApi.getShipments({
            search:
              currentSearch ||
              undefined,

            status:
              currentStatus ||
              undefined,

            page:
              currentPage,

            per_page:
              currentPerPage,
          });

        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        console.error(
          "Failed to load Logistics shipments:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to load shipment data.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [
    currentSearch,
    currentStatus,
    currentPage,
    currentPerPage,
    reloadKey,
  ]);

  const handleFilterChange =
    useCallback(
      (filters: {
        search: string;
        status: string;
      }) => {
        updateUrl({
          search:
            filters.search,
          status:
            filters.status,
          page: 1,
        });
      },
      [updateUrl],
    );

  return (
    <div className="logistics-operations-page">
      <div className="flex items-start gap-3">
      <Link
        href="/admin/logistics"
        aria-label="Back to Logistics overview"
        className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
      >
        <ArrowLeft size={18} />
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Shipment Operations
        </h1>

        <p className="text-sm text-slate-500">
          Review tenant-scoped shipment records using persisted Logistics data.
        </p>
      </div>
      <div className="ml-auto flex flex-col items-end gap-1"><button onClick={()=>setCreateOpen(true)} disabled={!data?.capabilities.create} title={!data?.capabilities.create?"Logistics manage permission is required":undefined} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16}/>Create Shipment</button>{data&&!data.capabilities.create?<span className="text-xs text-amber-700">Logistics manage permission required</span>:null}</div>
    </div>
      <CreateShipmentDialog open={createOpen} onClose={()=>setCreateOpen(false)} onCreated={()=>setReloadKey(x=>x+1)}/>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm text-slate-500">
            Total Shipments
          </div>

          <div className="text-2xl font-bold text-slate-900 mt-1">
            {data?.summary.total ??
              0}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm text-slate-500">
            Pending Shipments
          </div>

          <div className="text-2xl font-bold text-slate-900 mt-1">
            {data?.summary.pending ??
              0}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-sm text-slate-500">
            Delivered Today
          </div>

          <div className="text-2xl font-bold text-slate-900 mt-1">
            {data?.summary
              .delivered_today ??
              0}
          </div>
        </div>
      </div>

      {data ? <LogisticsStatusCharts data={statusData(data.status_counts)} noun="Shipments" distributionTitle="Shipment Status Distribution" summaryTitle="Delivery Status Summary" /> : null}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <ShipmentFilters
          search={currentSearch}
          status={currentStatus}
          statuses={
            data?.filters
              .statuses ?? []
          }
          onChange={
            handleFilterChange
          }
        />

        <div className="relative min-h-[300px]">
          {loading ? (
            <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
            </div>
          ) : null}

          {error ? (
            <div className="p-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Shipment data unavailable
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                {error}
              </p>
            </div>
          ) : (
            <ShipmentTable
              shipments={
                data?.data ?? []
              }
            />
          )}
        </div>

        {!error &&
        data &&
        data.total > 0 ? (
          <ShipmentPagination
            currentPage={
              data.current_page
            }
            totalPages={
              data.last_page
            }
            pageSize={
              data.per_page
            }
            totalItems={
              data.total
            }
            onPageChange={(
              page,
            ) =>
              updateUrl({
                page,
              })
            }
            onPageSizeChange={(
              perPage,
            ) =>
              updateUrl({
                page: 1,
                per_page:
                  perPage,
              })
            }
          />
        ) : null}
      </div>
    </div>
  );
}

export default function LogisticsShipmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-500">
          Loading Shipment Operations...
        </div>
      }
    >
      <LogisticsShipmentsContent />
    </Suspense>
  );
}
