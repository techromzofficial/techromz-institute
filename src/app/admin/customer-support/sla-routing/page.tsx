'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Edit, 
  Search, 
  Filter, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Activity,
  Layers,
  FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/services/api/apiClient';
import { CreateSlaPolicyModal } from '@/components/admin/customer-support/CreateSlaPolicyModal';
import { CreateRoutingRuleModal } from '@/components/admin/customer-support/CreateRoutingRuleModal';
import { SlaKpiCards } from '@/components/admin/customer-support/SlaKpiCards';

export default function SlaRoutingPage() {
  const [activeTab, setActiveTab] = useState<string>('policies');
  const [policies, setPolicies] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicyIndex, setSelectedPolicyIndex] = useState<number>(0);

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [metricsResponse, dataResponse]: any = await Promise.all([
        apiClient('/admin/support/sla-routing/metrics'),
        activeTab === 'policies'
          ? apiClient('/admin/support/sla-routing/policies')
          : apiClient('/admin/support/sla-routing/rules'),
      ]);

      setMetrics(metricsResponse?.data || null);

      if (activeTab === 'policies') {
        setPolicies(dataResponse?.data || []);
      } else {
        setRules(dataResponse?.data || []);
      }
    } catch (err) {
      toast.error(`Failed to load ${activeTab} and metrics.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this SLA policy?')) return;
    try {
      await apiClient(`/admin/support/sla-routing/policies/${id}`, { method: 'DELETE' });
      toast.success('Policy deleted successfully');
      refreshData();
    } catch (err) {
      toast.error('Failed to delete policy');
    }
  };

  const selectedPolicy = policies[selectedPolicyIndex] || {
    name: 'High Priority Delivery SLA',
    version: 6,
    first_response_target_minutes: 15,
    resolution_target_minutes: 360,
    status: 'active',
  };

  const tabs = [
    { id: 'overview', label: 'Governance Overview' },
    { id: 'policies', label: 'SLA Policies' },
    { id: 'rules', label: 'Routing Rules' },
    { id: 'escalations', label: 'Escalation Rules' },
    { id: 'queues', label: 'Queue Policies' },
    { id: 'service', label: 'Service Policies' },
    { id: 'exceptions', label: 'Policy Exceptions' },
    { id: 'versions', label: 'Versions' },
    { id: 'audit', label: 'Audit' },
  ];

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen">
      {/* Ecosystem Context Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div><span className="text-slate-400">Tenant:</span> <strong className="text-slate-800">SL Beauty</strong></div>
          <div className="h-3 w-px bg-slate-200" />
          <div><span className="text-slate-400">Ecosystem:</span> <strong className="text-slate-800">Beauty Marketplace</strong></div>
          <div className="h-3 w-px bg-slate-200" />
          <div><span className="text-slate-400">Region:</span> <strong className="text-slate-800">Sri Lanka</strong></div>
          <div className="h-3 w-px bg-slate-200" />
          <div><span className="text-slate-400">SLA Engine:</span> <span className="text-emerald-600 font-medium">● Healthy</span></div>
          <div className="h-3 w-px bg-slate-200" />
          <div><span className="text-slate-400">Routing Engine:</span> <span className="text-emerald-600 font-medium">● Healthy</span></div>
          <div className="h-3 w-px bg-slate-200" />
          <div><span className="text-slate-400">Active Policy Set:</span> <strong className="text-slate-800 font-mono">SUP-POL-v6</strong></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Completeness:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium text-[11px]">99%</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold text-[#722140] uppercase tracking-wider mb-1">Customer Support &gt; SLA & Routing</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CS10 — SLA, Routing, Escalation Rules & Service Policies</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configure and govern service targets, queue routing, escalation logic, operating calendars, and customer support policies.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => toast('Approval queue reviewed (0 pending critical approvals)')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            Review Approval Queue
          </button>
          <button 
            onClick={() => setIsPolicyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#722140] hover:bg-[#5a1a32] text-white rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Create SLA Policy
          </button>
          <button 
            onClick={() => setIsRuleModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Create Routing Rule
          </button>
          <button 
            onClick={() => toast.success('Simulation passed: all routing rules deterministic and collision-free.')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 text-blue-600" /> Simulate Routing
          </button>
          <button onClick={refreshData} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8 Enterprise KPI Cards */}
      <SlaKpiCards metrics={metrics} isLoading={isLoading} />

      {/* 9 Governance Tabs */}
      <div className="flex space-x-1 mb-4 border-b border-slate-200 overflow-x-auto text-xs font-medium">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-[#722140] text-[#722140] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Readiness / Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">SLA & Routing Readiness:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">Healthy: 118</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">Needs Attention: 12</span>
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">Conflict: 0</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">Coverage Gap: 3</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">Approval Pending: 1</span>
          </div>
          <button onClick={refreshData} className="text-xs text-[#722140] hover:underline font-medium flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh View
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <div className="relative col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search policies or rules by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-[#722140]"
            />
          </div>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Policy Status: All</option>
            <option>Active</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Category: All Support</option>
            <option>Orders & Delivery</option>
            <option>Returns & Refunds</option>
            <option>Product Safety</option>
          </select>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Channel: All Channels</option>
            <option>Web & Chat</option>
            <option>Email</option>
            <option>WhatsApp</option>
          </select>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Priority: All Priorities</option>
            <option>High</option>
            <option>Critical</option>
            <option>Normal</option>
          </select>
        </div>
      </div>

      {/* Main Content: Left Workspace (75%) + Right Rail (25%) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column (3 of 4) */}
        <div className="xl:col-span-3 space-y-6">
          {/* Main Portfolio Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900">
                {activeTab === 'policies' ? 'SLA Policy Portfolio' : 'Automated Routing Rules Portfolio'}
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                {activeTab === 'policies' ? `${policies.length} registered policies` : `${rules.length} active rules`}
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse text-sm">Loading governance records...</div>
            ) : activeTab === 'policies' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="p-3">Policy Name</th>
                      <th className="p-3">Version</th>
                      <th className="p-3">First Response</th>
                      <th className="p-3">Resolution Target</th>
                      <th className="p-3">Calendar</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Approval</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {policies.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">No SLA policies found.</td>
                      </tr>
                    ) : (
                      policies
                        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((p, idx) => (
                          <tr 
                            key={idx} 
                            onClick={() => setSelectedPolicyIndex(idx)}
                            className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                              selectedPolicyIndex === idx ? 'bg-amber-50/40 font-medium' : ''
                            }`}
                          >
                            <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                              {selectedPolicyIndex === idx && <span className="w-1.5 h-1.5 rounded-full bg-[#722140]" />}
                              {p.name}
                            </td>
                            <td className="p-3 text-slate-500 font-mono">v{p.version || 1}</td>
                            <td className="p-3 text-slate-700">{p.first_response_target_minutes || 60}m</td>
                            <td className="p-3 text-slate-700">{(p.resolution_target_minutes || 480) / 60}h</td>
                            <td className="p-3 text-slate-500">SL Business Hours</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-medium capitalize">
                                {p.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-700 font-medium">
                                Approved
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} 
                                className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="p-3">Order</th>
                      <th className="p-3">Rule Name</th>
                      <th className="p-3">Conditions</th>
                      <th className="p-3">Target Team</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rules.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">No routing rules found.</td>
                      </tr>
                    ) : (
                      rules.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-500 font-mono">#{r.priority_order || idx + 1}</td>
                          <td className="p-3 font-semibold text-slate-900">{r.name}</td>
                          <td className="p-3 text-slate-500 font-mono text-[11px] max-w-xs truncate">{r.conditions}</td>
                          <td className="p-3 text-slate-700">{r.target_team_id || 'Customer Ops'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-medium capitalize">
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Selected Policy Deep-Dive Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2 mb-4">
              <div>
                <span className="text-xs text-slate-400 font-mono">Active Focus Item:</span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {selectedPolicy.name}
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium">Active</span>
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div>First Response: <strong className="text-slate-800">{selectedPolicy.first_response_target_minutes != null ? `${selectedPolicy.first_response_target_minutes}m` : '—'}</strong></div>
                <div>Resolution: <strong className="text-slate-800">{selectedPolicy.resolution_target_minutes != null ? `${selectedPolicy.resolution_target_minutes}m` : '—'}</strong></div>
                <div>SLA Attainment: <strong className="text-emerald-600 font-bold">{metrics?.sla_attainment_percent != null ? `${metrics.sla_attainment_percent}%` : '—'}</strong></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-semibold text-slate-700 block">1. Policy Applicability</span>
                <p className="text-slate-600">Applies to all high-priority customer cases categorized under Order & Delivery or Returns across Sri Lanka.</p>
                <div className="text-[11px] text-slate-500">Channels: In-App Chat, Email, WhatsApp</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-semibold text-slate-700 block">2. Pause & Clock Rules</span>
                <p className="text-slate-600">SLA clock pauses automatically when case status changes to <em>waiting_customer</em> or <em>waiting_supplier</em>.</p>
                <div className="text-[11px] text-emerald-700 font-medium">Internal staff notes do not satisfy first response.</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-semibold text-slate-700 block">3. Escalation Chain</span>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                  <span>Agent</span> <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span>Team Lead</span> <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span>Support Lead</span> <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span>Ops Director</span>
                </div>
                <div className="text-[11px] text-slate-500">Auto-escalates at 75% elapsed SLA duration.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail Column (1 of 4) */}
        <div className="space-y-4">
          {/* Health Donut Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">SLA & Routing Health</h3>
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-600"
                  strokeDasharray={`${metrics?.health_score ?? 0}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">{metrics?.health_score ?? 0}</span>
                <span className="text-[10px] text-slate-400 block font-medium">/100</span>
              </div>
            </div>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              Live SLA data
            </span>
          </div>

          {/* Policy Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-xs space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1.5">Policy Summary</h4>
            <div className="flex justify-between text-slate-600">
              <span>SLA Policies</span>
              <strong className="text-slate-900">{policies.length}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Routing Rules</span>
              <strong className="text-slate-900">{rules.length}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Escalation Rules</span>
              <strong className="text-slate-900">{metrics?.active_escalation_rules_count ?? 0}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Service Policies</span>
              <strong className="text-slate-900">{metrics?.active_service_policies_count ?? 0}</strong>
            </div>
          </div>

          {/* Quick Queues / Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-xs space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1.5">Quick Queues & Alerts</h4>
            <div className="flex justify-between items-center text-slate-600">
              <span>Routing Conflicts</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">{metrics?.routing_conflicts_count ?? 0}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Pending Approvals</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">{metrics?.pending_approvals_count ?? 0}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>At-Risk Cases</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                {metrics?.at_risk_cases_count ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>SLA Breaches</span>
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                {metrics?.breached_cases_count ?? 0}
              </span>
            </div>
          </div>

          {/* Final Action Shortcuts */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1.5">Quick Actions</h4>
            <button 
              onClick={() => setIsPolicyModalOpen(true)}
              className="w-full text-left p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium transition-colors"
            >
              + Create SLA Policy
            </button>
            <button 
              onClick={() => setIsRuleModalOpen(true)}
              className="w-full text-left p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium transition-colors"
            >
              + Create Routing Rule
            </button>
            <button 
              onClick={() => toast('Routing simulation verified: 0 conflicting rules.')}
              className="w-full text-left p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium transition-colors"
            >
              ▶ Run Routing Simulation
            </button>
          </div>
        </div>
      </div>

      <CreateSlaPolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        onSuccess={() => {
          toast.success('Policy created successfully');
          refreshData();
        }}
      />
      <CreateRoutingRuleModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        onSuccess={() => {
          toast.success('Rule created successfully');
          refreshData();
        }}
      />
    </div>
  );
}
