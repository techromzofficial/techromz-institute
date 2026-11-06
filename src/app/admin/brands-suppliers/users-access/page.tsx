"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  KeyRound,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
  Ban,
  Edit,
} from "lucide-react";

import { PermissionGuard } from "@/components/admin/common/PermissionGuard";
import { ContextScopeBar } from "@/components/admin/shared/ContextScopeBar";
import { FilterToolbar } from "@/components/admin/shared/FilterToolbar";
import {
  HealthScoreGauge,
  RailSection,
  RightIntelligenceRail,
} from "@/components/admin/shared/RightIntelligenceRail";
import { useAdminContext } from "@/contexts/AdminContext";
import { brandsSuppliersApi } from "@/lib/api/brandsSuppliers";

const STATUS_TABS = [
  { id: "all", label: "All Memberships" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "suspended", label: "Suspended" },
];

export default function SupplierUsersAccessPage() {
  const { tenant, ecosystem, businessUnit, channel, sectorPack, hasPermission } = useAdminContext();
  const canView = true;

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<any | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Invite Modal
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    name: "",
    email: "",
    role: "supplier",
    company_name: "",
  });
  const [inviting, setInviting] = useState(false);

  // Role Edit Modal
  const [roleModal, setRoleModal] = useState<{ id: string; currentRole: string } | null>(null);
  const [newRole, setNewRole] = useState("supplier");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await brandsSuppliersApi.getUsersAccessDashboard({
        search: search || undefined,
        status: activeTab === "all" ? undefined : activeTab,
        page,
        per_page: 15,
      });

      setData(response);
      const rows = response.users?.data ?? [];
      setSelectedUser((current: any) => {
        if (!rows.length) return null;
        if (current && rows.some((r: any) => r.id === current.id)) return current;
        return rows[0];
      });
    } catch (e: any) {
      setError(e.message || "Failed to load supplier user access directory.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await brandsSuppliersApi.inviteSupplierUser(inviteData);
      setInviteModal(false);
      setInviteData({ name: "", email: "", role: "supplier", company_name: "" });
      void fetchUsers();
    } catch (e: any) {
      setError(e.message || "Failed to invite user.");
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!roleModal) return;
    try {
      await brandsSuppliersApi.updateSupplierUserRole(roleModal.id, newRole);
      setRoleModal(null);
      void fetchUsers();
    } catch (e: any) {
      setError(e.message || "Failed to update role.");
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await brandsSuppliersApi.revokeSupplierUserAccess(id);
      void fetchUsers();
    } catch (e: any) {
      setError(e.message || "Failed to revoke access.");
    }
  };

  const users = data?.users?.data ?? [];
  const meta = data?.users?.meta ?? { current_page: 1, per_page: 15, total: 0, last_page: 1 };
  const summary = data?.summary ?? {};

  const capabilities = data?.capabilities ?? {
    mfaStatus: false,
    invitations: false,
    sessionActivity: false,
    privilegedClassification: false,
  };

  const canInvite = capabilities.invitations === true;

  /*
  * The current verified backend exposes Users & Access
  * as a read-only governance view.
  *
  * Role mutation and access revocation are deliberately
  * disabled until governed backend routes exist.
  */
  const canChangeRole = false;
  const canRevokeAccess = false;

  const contextItems = [
    { label: "Tenant", value: tenant.name },
    { label: "Ecosystem", value: ecosystem.name },
    { label: "Module", value: "Supplier Users & Access Control" },
  ];

  return (
    <div className="flex w-full min-h-screen bg-[#faf8f8] text-gray-900">
      <main className="flex-grow min-w-0 px-6 py-4 pb-12">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div>
            <Link
              href="/admin/brands-suppliers"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
            >
              <ArrowLeft size={14} />
              Back to Command Center
            </Link>
            <div className="text-[11px] text-gray-500 font-medium mb-1">
              Brands &amp; Suppliers / Users &amp; Access
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Supplier Users &amp; Access Governance
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-3xl">
              Manage external partner identities, role assignments, authentication and RBAC memberships.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (canInvite) {
                  setInviteModal(true);
                }
              }}
              disabled={!canInvite}
              title={
                canInvite
                  ? "Invite supplier user"
                  : "Supplier user invitations are not enabled for this environment."
              }
              className="flex items-center gap-1.5 text-xs bg-rose-800 text-white px-3 py-1.5 rounded hover:bg-rose-900 shadow-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-rose-800"
            >
              <Plus size={14} />
              <span>Invite Supplier User</span>
            </button>

            <button
              type="button"
              onClick={() => void fetchUsers()}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 px-2.5 py-1.5 rounded text-gray-600 hover:text-gray-900 disabled:opacity-60"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {(!canInvite || !canChangeRole || !canRevokeAccess) && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-md text-[11px]">
            User access changes are currently read-only in this environment.
            Invitations, role changes and access revocation will become available
            when the corresponding governed backend capabilities are enabled.
          </div>
        )}

        <ContextScopeBar
          items={contextItems}
          lastSynced={new Date().toLocaleTimeString()}
          accessNote="Access memberships are isolated to the authenticated tenant."
        />

        {error && (
          <div className="my-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => void fetchUsers()} className="font-bold underline">Retry</button>
          </div>
        )}

        {/* KPIS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
          <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Total Members</span>
              <Users size={15} className="text-gray-400" />
            </div>
            <strong className="block text-2xl mt-3">{summary.total ?? meta.total}</strong>
            <small className="text-gray-500">Tenant memberships</small>
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Active Users</span>
              <UserCheck size={15} className="text-green-600" />
            </div>
            <strong className="block text-2xl mt-3 text-green-700">{summary.active ?? 0}</strong>
            <small className="text-gray-500">Enabled access</small>
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Supplier Roles</span>
              <ShieldCheck size={15} className="text-blue-500" />
            </div>
            <strong className="block text-2xl mt-3 text-blue-700">{summary.supplierRole ?? 0}</strong>
            <small className="text-gray-500">External supplier accounts</small>
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Suspended Accounts</span>
              <Ban size={15} className="text-rose-500" />
            </div>
            <strong className="block text-2xl mt-3 text-rose-700">{summary.suspended ?? 0}</strong>
            <small className="text-gray-500">Suspended Access</small>
          </div>
        </section>

        {/* STATUS TABS */}
        <div className="border-b border-gray-200 mb-3">
          <div className="flex flex-wrap gap-4">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={`pb-2 text-xs font-semibold border-b-2 ${
                  activeTab === tab.id
                    ? "border-rose-800 text-rose-800"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH */}
        <FilterToolbar
          searchPlaceholder="Search users by name, email, company..."
          searchValue={search}
          onSearchChange={setSearch}
          onSearchSubmit={() => {
            setPage(1);
            void fetchUsers();
          }}
          filters={[]}
          onClearAll={() => {
            setSearch("");
            setPage(1);
          }}
        />

        {/* TABLE */}
        <section className="bg-white border border-gray-200 rounded-md shadow-sm mt-3">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-bold text-gray-900">User Directory</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">{meta.total} memberships found</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] whitespace-nowrap min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Company Entity</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Auth Method</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-gray-400">Loading user directory…</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                      No users found matching current filters.
                    </td>
                  </tr>
                ) : (
                  users.map((u: any) => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-rose-50/50" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-2 font-bold text-gray-900">{u.user?.name ?? "User"}</td>
                        <td className="px-3 py-2 text-gray-600">{u.user?.email ?? "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{u.user?.company_name ?? "—"}</td>
                        <td className="px-3 py-2 font-mono capitalize">{u.role}</td>
                        <td className="px-3 py-2 text-gray-500">{u.authentication_method ?? "password"}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === "active"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={!canChangeRole}
                            title={
                              canChangeRole
                                ? "Change role"
                                : "Role changes are not currently exposed by the production backend."
                            }
                            onClick={() => {
                              if (!canChangeRole) {
                                return;
                              }

                              setNewRole(u.role);
                              setRoleModal({
                                id: String(u.id),
                                currentRole: u.role,
                              });
                            }}
                            className="text-rose-700 hover:text-rose-900 font-bold disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:text-gray-400"
                          >
                            Change Role
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            disabled={!canRevokeAccess}
                            title={
                              canRevokeAccess
                                ? "Revoke access"
                                : "Access revocation is not currently exposed by the production backend."
                            }
                            onClick={() => {
                              if (canRevokeAccess) {
                                void handleRevoke(String(u.id));
                              }
                            }}
                            className="text-red-600 hover:text-red-800 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:text-gray-400"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* RIGHT INTELLIGENCE RAIL */}
      <RightIntelligenceRail>
        <RailSection title="Domain Status">
          <HealthScoreGauge
              score={0}
              label="Health Score"
              statusText="Not Assessed"
              metrics={[]}
            />
        </RailSection>
      </RightIntelligenceRail>

      {/* INVITE MODAL */}
      {inviteModal && canInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-gray-900">Invite Supplier Partner User</h3>
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  placeholder="e.g. Ruwan Perera"
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="e.g. ruwan@supplier.lk"
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Company Entity</label>
                <input
                  type="text"
                  value={inviteData.company_name}
                  onChange={(e) => setInviteData({ ...inviteData, company_name: e.target.value })}
                  placeholder="e.g. Ceylon Botanicals Ltd"
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Role Assignment</label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="w-full border rounded p-2"
                >
                  <option value="supplier">Supplier Account Manager</option>
                  <option value="supplier_finance">Supplier Finance / Billing</option>
                  <option value="supplier_catalogue">Supplier Catalogue Admin</option>
                  <option value="supplier_logistics">Supplier Logistics Dispatcher</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setInviteModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" disabled={inviting} className="px-4 py-1.5 bg-rose-800 text-white font-bold rounded">
                  {inviting ? "Inviting…" : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE MODAL */}
      {roleModal && canChangeRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-gray-900">Update User Role</h3>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Select Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="supplier">Supplier Account Manager</option>
                <option value="supplier_finance">Supplier Finance / Billing</option>
                <option value="supplier_catalogue">Supplier Catalogue Admin</option>
                <option value="supplier_logistics">Supplier Logistics Dispatcher</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setRoleModal(null)} className="px-3 py-1.5 border rounded">Cancel</button>
              <button type="button" onClick={handleUpdateRole} className="px-4 py-1.5 bg-rose-800 text-white font-bold rounded">
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}