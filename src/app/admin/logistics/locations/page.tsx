"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Plus,
  Search,
  X,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  logisticsApi,
  type LogisticsLocationListResponse,
  type LogisticsWarehouseLocation,
  type LogisticsWarehousePayload,
  type LogisticsWarehouseRow,
} from "@/lib/api/logistics";
import { LogisticsStatusCharts, statusData } from "@/features/admin/logistics/components/LogisticsStatusCharts";

const emptyWarehouse: LogisticsWarehousePayload = { code: "", name: "", address_line_1: "", city: "", country_code: "LK", contact_name: "", contact_phone: "", timezone: "Asia/Colombo", opens_at: "08:00", closes_at: "18:00", dispatch_cutoff_at: "16:00", capabilities: ["storage", "packing", "dispatch"] };
type LocationForm = { code: string; name: string; status: "active" | "inactive" };
const emptyLocation: LocationForm = { code: "", name: "", status: "active" };

function formatValue(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function statusTone(
  status: string | null,
) {
  if (status === "active") {
    return "success";
  }

  if (status === "inactive") {
    return "neutral";
  }

  return "warning";
}

export default function LogisticsLocationsPage() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const [data, setData] =
    useState<LogisticsLocationListResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );
  const [warehouseForm, setWarehouseForm] = useState<LogisticsWarehousePayload>(emptyWarehouse);
  const [editingWarehouseId, setEditingWarehouseId] = useState<number | null>(null);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [locationModalWarehouseId, setLocationModalWarehouseId] = useState<number | null>(null);
  const [locationForm, setLocationForm] = useState(emptyLocation);
  const [editingLocation, setEditingLocation] = useState<{ warehouseId: number; locationId: number } | null>(null);
  const [viewing, setViewing] = useState<{ kind: "warehouse" | "location"; warehouse: LogisticsWarehouseRow; location?: LogisticsWarehouseLocation } | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [searchTerm, setSearchTerm] =
    useState(
      searchParams.get("search") ??
        "",
    );

  const currentSearch =
    searchParams.get("search") ??
    "";

  const currentStatus =
    searchParams.get("status") ??
    "";

  const updateUrl =
    useCallback(
      (next: {
        search?: string;
        status?: string;
      }) => {
        const params =
          new URLSearchParams(
            searchParams.toString(),
          );

        const merged = {
          search:
            currentSearch,
          status:
            currentStatus,
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

        const query =
          params.toString();

        router.push(
          query
            ? `/admin/logistics/locations?${query}`
            : "/admin/logistics/locations",
        );
      },
      [
        router,
        searchParams,
        currentSearch,
        currentStatus,
      ],
    );

  useEffect(() => {
    setSearchTerm(
      currentSearch,
    );
  }, [currentSearch]);

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          if (
            searchTerm !==
            currentSearch
          ) {
            updateUrl({
              search:
                searchTerm,
            });
          }
        },
        500,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    searchTerm,
    currentSearch,
    updateUrl,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await logisticsApi.getLocations(
            {
              search:
                currentSearch ||
                undefined,

              status:
                currentStatus ||
                undefined,
            },
          );

        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        console.error(
          "Failed to load Logistics locations:",
          err,
        );

        if (!cancelled) {
          setError(
            "Unable to load warehouses and locations.",
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
  }, [
    currentSearch,
    currentStatus,
    reloadKey,
  ]);

  const saveWarehouse = async () => {
    setSaving(true); setError(null);
    try {
      if (editingWarehouseId === null) {
        const created = await logisticsApi.createWarehouse(warehouseForm);
        setLocationModalWarehouseId(created.warehouse.id);
        setLocationForm(emptyLocation);
      } else await logisticsApi.updateWarehouse(editingWarehouseId, warehouseForm);
      setWarehouseForm(emptyWarehouse); setEditingWarehouseId(null); setWarehouseModalOpen(false); setReloadKey((value) => value + 1);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save warehouse."); }
    finally { setSaving(false); }
  };

  const editWarehouse = (warehouse: LogisticsWarehouseRow) => {
    setEditingWarehouseId(warehouse.id);
    setWarehouseForm({ code: warehouse.code, name: warehouse.name, address_line_1: warehouse.address_line_1 ?? "", address_line_2: warehouse.address_line_2, city: warehouse.city ?? "", region: warehouse.region, postal_code: warehouse.postal_code, country_code: warehouse.country_code ?? "LK", contact_name: warehouse.contact_name ?? "", contact_phone: warehouse.contact_phone ?? "", contact_email: warehouse.contact_email, timezone: warehouse.timezone || "Asia/Colombo", opens_at: warehouse.opens_at?.slice(0, 5), closes_at: warehouse.closes_at?.slice(0, 5), dispatch_cutoff_at: warehouse.dispatch_cutoff_at?.slice(0, 5), capabilities: warehouse.capabilities });
    setWarehouseModalOpen(true);
  };

  const toggleWarehouse = async (warehouse: LogisticsWarehouseRow) => {
    setActionLoading(`warehouse-status-${warehouse.id}`); setError(null);
    try { await logisticsApi.setWarehouseStatus(warehouse.id, warehouse.status === "active" ? "inactive" : "active"); setReloadKey((value) => value + 1); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to update warehouse status."); }
    finally { setActionLoading(null); }
  };

  const archiveWarehouse = async (warehouse: LogisticsWarehouseRow) => {
    const reason = window.prompt(`Why are you archiving ${warehouse.name}?`); if (!reason?.trim()) return;
    setActionLoading(`warehouse-archive-${warehouse.id}`); setError(null);
    try { await logisticsApi.archiveWarehouse(warehouse.id, reason.trim()); setEditingWarehouseId(null); setWarehouseForm(emptyWarehouse); setWarehouseModalOpen(false); setReloadKey((value) => value + 1); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to archive warehouse."); }
    finally { setActionLoading(null); }
  };

  const openCreateWarehouse = () => { setEditingWarehouseId(null); setWarehouseForm(emptyWarehouse); setWarehouseModalOpen(true); };
  const openCreateLocation = (warehouseId?: number) => { setEditingLocation(null); setLocationModalWarehouseId(warehouseId ?? data?.data.find((warehouse) => warehouse.status === "active")?.id ?? null); setLocationForm(emptyLocation); };
  const editLocation = (warehouseId: number, location: LogisticsWarehouseLocation) => { setEditingLocation({ warehouseId, locationId: location.id }); setLocationModalWarehouseId(warehouseId); setLocationForm({ code: location.code, name: location.name ?? "", status: location.status === "inactive" ? "inactive" : "active" }); };

  const saveLocation = async () => {
    if (!locationModalWarehouseId || !locationForm.code.trim()) { setError("Location code is required."); return; }
    setSaving(true); setError(null);
    try {
      const payload = { ...locationForm, code: locationForm.code.trim(), name: locationForm.name.trim() || null };
      if (editingLocation) await logisticsApi.updateWarehouseLocation(editingLocation.warehouseId, editingLocation.locationId, payload);
      else await logisticsApi.createWarehouseLocation(locationModalWarehouseId, payload);
      setLocationModalWarehouseId(null); setEditingLocation(null); setLocationForm(emptyLocation); setReloadKey((value) => value + 1);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save location."); }
    finally { setSaving(false); }
  };

  const toggleLocation = async (warehouseId: number, location: LogisticsWarehouseLocation) => {
    setActionLoading(`location-status-${location.id}`); setError(null);
    try { await logisticsApi.setWarehouseLocationStatus(warehouseId, location.id, location.status === "active" ? "inactive" : "active"); setReloadKey((value) => value + 1); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to update location status."); }
    finally { setActionLoading(null); }
  };

  const archiveLocation = async (warehouseId: number, location: LogisticsWarehouseLocation) => {
    const reason = window.prompt(`Why are you archiving ${location.code}?`); if (!reason?.trim()) return;
    setActionLoading(`location-archive-${location.id}`); setError(null);
    try { await logisticsApi.archiveWarehouseLocation(warehouseId, location.id, reason.trim()); setReloadKey((value) => value + 1); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to archive location."); }
    finally { setActionLoading(null); }
  };

  const clearFilters = () => {
    setSearchTerm("");

    updateUrl({
      search: "",
      status: "",
    });
  };

  const hasActiveFilters =
    currentSearch !== "" ||
    currentStatus !== "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
            Warehouses & Locations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review tenant-owned warehouses and their persisted storage locations.
          </p>
        </div>
        </div>

        {data ? (
          <div className="flex flex-col items-start gap-1 sm:items-end">
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button type="button" onClick={openCreateWarehouse} disabled={!data.capabilities.manage} title={!data.capabilities.manage ? "Logistics manage permission is required" : undefined} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Plus size={16} /> Add location &amp; warehouse
            </button>
            <button type="button" onClick={() => openCreateLocation()} disabled={!data.capabilities.manage || !data.data.some((warehouse) => warehouse.status === "active")} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              <Plus size={16} /> Add Location
            </button>
          </div>
          {!data.capabilities.manage ? <p className="text-xs text-amber-700">Logistics manage permission is required to add or edit facilities.</p> : null}
          </div>
        ) : null}
      </div>

      {data ? <LogisticsStatusCharts data={statusData(data.status_counts)} noun="Facilities" distributionTitle="Warehouse Status Distribution" summaryTitle="Facility Operational Status Summary" /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">
            Warehouses
          </div>

          <div className="mt-1 text-2xl font-bold text-slate-900">
            {data?.summary.warehouses ??
              0}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">
            Active Warehouses
          </div>

          <div className="mt-1 text-2xl font-bold text-slate-900">
            {data?.summary.active ??
              0}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-sm text-slate-500">
            Locations
          </div>

          <div className="mt-1 text-2xl font-bold text-slate-900">
            {data?.summary.locations ??
              0}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={
                    searchTerm
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearchTerm(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Search warehouse code, name or supplier..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400"
                />
              </div>
            </div>

            <div className="w-full lg:w-64">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={
                  currentStatus
                }
                onChange={(
                  event,
                ) =>
                  updateUrl({
                    status:
                      event
                        .target
                        .value,
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400"
              >
                <option value="">
                  All Persisted Statuses
                </option>

                {data?.filters.statuses.map(
                  (status) => (
                    <option
                      key={
                        status
                      }
                      value={
                        status
                      }
                    >
                      {formatValue(
                        status,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <X size={15} />
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="relative min-h-[300px] overflow-x-auto">
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-b-slate-900" />
            </div>
          ) : null}

          {error ? (
            <div className="p-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Location data unavailable
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>
            </div>
          ) : data &&
            data.data.length >
              0 ? (
            <div className="divide-y divide-slate-100">
              {data.data.map(
                (warehouse) => (
                  <div
                    key={
                      warehouse.id
                    }
                    className="p-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-semibold text-slate-900">
                            {
                              warehouse.name
                            }
                          </h2>

                          <span
                            className={`status-badge-rich ${statusTone(
                              warehouse.status,
                            )}`}
                          >
                            {formatValue(
                              warehouse.status,
                            )}
                          </span>
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          Code:{" "}
                          {
                            warehouse.code
                          }
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          Supplier:{" "}
                          {warehouse
                            .supplier
                            ?.company_name ??
                            "Not assigned"}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <button type="button" onClick={() => setViewing({ kind: "warehouse", warehouse })} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"><Eye size={14} /> View</button>
                        {data.capabilities.update_warehouse && warehouse.status !== "archived" ? <><button type="button" onClick={() => editWarehouse(warehouse)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50">Edit</button><button type="button" disabled={actionLoading === `warehouse-status-${warehouse.id}`} onClick={() => void toggleWarehouse(warehouse)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50">{actionLoading === `warehouse-status-${warehouse.id}` ? "Updating..." : warehouse.status === "active" ? "Deactivate" : "Activate"}</button>{warehouse.status === "active" && data.capabilities.create_location ? <button type="button" onClick={() => openCreateLocation(warehouse.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50">Add location</button> : null}{data.capabilities.archive_warehouse ? <button type="button" disabled={actionLoading === `warehouse-archive-${warehouse.id}`} onClick={() => void archiveWarehouse(warehouse)} className="rounded-lg border border-amber-200 px-3 py-1.5 text-amber-700 hover:bg-amber-50 disabled:opacity-50">{actionLoading === `warehouse-archive-${warehouse.id}` ? "Archiving..." : "Archive"}</button> : null}</> : null}
                        {
                          warehouse
                            .locations
                            .length
                        }{" "}
                        location
                        {warehouse
                          .locations
                          .length ===
                        1
                          ? ""
                          : "s"}
                      </div>
                    </div>

                    <div className="mt-5">
                      {warehouse
                        .locations
                        .length >
                      0 ? (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {warehouse.locations.map(
                            (
                              location,
                            ) => (
                              <div
                                key={
                                  location.id
                                }
                                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="font-medium text-slate-900">
                                      {
                                        location.code
                                      }
                                    </div>

                                    <div className="mt-1 text-sm text-slate-500">
                                      {location.name ??
                                        "Unnamed location"}
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-2">
                                  <span
                                    className={`status-badge-rich ${statusTone(
                                      location.status,
                                    )}`}
                                  >
                                    {formatValue(
                                      location.status,
                                    )}
                                  </span>
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setViewing({ kind: "location", warehouse, location })} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-white">View</button>{data.capabilities.update_location && location.status !== "archived" ? <><button type="button" onClick={() => editLocation(warehouse.id, location)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-white">Edit</button><button type="button" disabled={actionLoading === `location-status-${location.id}`} onClick={() => void toggleLocation(warehouse.id, location)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-white disabled:opacity-50">{location.status === "active" ? "Deactivate" : "Activate"}</button><button type="button" disabled={actionLoading === `location-archive-${location.id}`} onClick={() => void archiveLocation(warehouse.id, location)} className="rounded-lg border border-amber-200 px-2.5 py-1 text-xs text-amber-700 hover:bg-amber-50 disabled:opacity-50">Archive</button></> : null}</div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                          No warehouse locations are defined.
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="p-10 text-center">
              <h2 className="text-base font-semibold text-slate-900">
                No warehouses found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                No tenant-owned warehouse records match the current filters.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-900">
          Operational warehouse directory
        </div>

        <p className="mt-1 text-sm text-slate-600">
          Authorized logistics managers can create and edit tenant-owned fulfilment warehouses. Historical records are retired through controlled archive operations rather than hard deletion.
        </p>
      </div>

      {warehouseModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="warehouse-dialog-title">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between"><div><h2 id="warehouse-dialog-title" className="text-lg font-semibold text-slate-900">{editingWarehouseId === null ? "Add location & warehouse" : "Edit Warehouse"}</h2><p className="mt-1 text-sm text-slate-500">Configure the warehouse first; the location form opens next.</p></div><button type="button" aria-label="Close warehouse form" onClick={() => setWarehouseModalOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
            {error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {([["Warehouse code", "code"], ["Warehouse name", "name"], ["Address line 1", "address_line_1"], ["Address line 2", "address_line_2"], ["City", "city"], ["Region / Province", "region"], ["Postal code", "postal_code"], ["Country code", "country_code"], ["Timezone", "timezone"], ["Contact name", "contact_name"], ["Contact phone", "contact_phone"], ["Contact email", "contact_email"]] as const).map(([label, field]) => <label key={field} className="text-sm font-medium text-slate-700">{label}<input aria-label={label} type={field === "contact_email" ? "email" : "text"} required={!['contact_email','address_line_2','region','postal_code'].includes(field)} maxLength={field === "country_code" ? 2 : undefined} value={warehouseForm[field] ?? ""} onChange={(event) => setWarehouseForm({ ...warehouseForm, [field]: field === "country_code" ? event.target.value.toUpperCase() : event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label>)}
              <label className="text-sm font-medium text-slate-700">Opens at<input aria-label="Opens at" type="time" value={warehouseForm.opens_at ?? ""} onChange={(event) => setWarehouseForm({ ...warehouseForm, opens_at: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label>
              <label className="text-sm font-medium text-slate-700">Closes at<input aria-label="Closes at" type="time" value={warehouseForm.closes_at ?? ""} onChange={(event) => setWarehouseForm({ ...warehouseForm, closes_at: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label>
              <label className="text-sm font-medium text-slate-700">Dispatch cutoff<input aria-label="Dispatch cutoff" type="time" value={warehouseForm.dispatch_cutoff_at ?? ""} onChange={(event) => setWarehouseForm({ ...warehouseForm, dispatch_cutoff_at: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label>
            </div>
            <fieldset className="mt-5"><legend className="text-sm font-medium text-slate-700">Capabilities</legend><div className="mt-2 flex flex-wrap gap-4">{["storage","packing","dispatch","returns","cold_storage","hazmat"].map((capability)=><label key={capability} className="inline-flex items-center gap-2 text-sm capitalize text-slate-700"><input type="checkbox" checked={warehouseForm.capabilities?.includes(capability) ?? false} onChange={(event)=>setWarehouseForm({...warehouseForm,capabilities:event.target.checked?[...(warehouseForm.capabilities??[]),capability]:(warehouseForm.capabilities??[]).filter((item)=>item!==capability)})}/>{capability.replaceAll("_"," ")}</label>)}</div></fieldset>
            <p className="mt-4 text-xs text-slate-500">New warehouses start active. Use the row action after creation to deactivate or reactivate them. Delete is implemented as Archive to preserve fulfilment history.</p>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setWarehouseModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancel</button><button type="button" disabled={saving} onClick={() => void saveWarehouse()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving..." : editingWarehouseId === null ? "Save & add location" : "Update Warehouse"}</button></div>
          </div>
        </div>
      ) : null}

      {locationModalWarehouseId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="location-dialog-title">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"><div className="flex items-center justify-between"><h2 id="location-dialog-title" className="text-lg font-semibold text-slate-900">{editingLocation ? "Edit Location" : "Add Location"}</h2><button type="button" aria-label="Close location form" onClick={() => setLocationModalWarehouseId(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>{error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}<div className="mt-5 space-y-4"><label className="block text-sm font-medium text-slate-700">Parent warehouse<select aria-label="Parent warehouse" disabled={Boolean(editingLocation)} value={locationModalWarehouseId} onChange={(event) => setLocationModalWarehouseId(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">{data?.data.filter((warehouse) => warehouse.status === "active" || warehouse.id === locationModalWarehouseId).map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name} ({warehouse.code})</option>)}</select></label><label className="block text-sm font-medium text-slate-700">Location code<input aria-label="Location code" required value={locationForm.code} onChange={(event) => setLocationForm({ ...locationForm, code: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="block text-sm font-medium text-slate-700">Location name<input aria-label="Location name" value={locationForm.name} onChange={(event) => setLocationForm({ ...locationForm, name: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label>{editingLocation ? <label className="block text-sm font-medium text-slate-700">Status<select aria-label="Location status" value={locationForm.status} onChange={(event) => setLocationForm({ ...locationForm, status: event.target.value as "active" | "inactive" })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select></label> : null}</div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setLocationModalWarehouseId(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Cancel</button><button type="button" disabled={saving || !locationForm.code.trim()} onClick={() => void saveLocation()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving..." : editingLocation ? "Update Location" : "Save Location"}</button></div></div>
        </div>
      ) : null}

      {viewing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="view-dialog-title"><div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"><div className="flex items-center justify-between"><h2 id="view-dialog-title" className="text-lg font-semibold text-slate-900">{viewing.kind === "warehouse" ? "View Warehouse" : "View Location"}</h2><button type="button" aria-label="Close details" onClick={() => setViewing(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div><dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-500">Code</dt><dd className="font-medium text-slate-900">{viewing.location?.code ?? viewing.warehouse.code}</dd></div><div><dt className="text-slate-500">Name</dt><dd className="font-medium text-slate-900">{viewing.location?.name ?? viewing.warehouse.name}</dd></div><div><dt className="text-slate-500">Status</dt><dd className="font-medium text-slate-900">{formatValue(viewing.location?.status ?? viewing.warehouse.status)}</dd></div><div><dt className="text-slate-500">Warehouse</dt><dd className="font-medium text-slate-900">{viewing.warehouse.name}</dd></div></dl></div></div>
      ) : null}
    </div>
  );
}
