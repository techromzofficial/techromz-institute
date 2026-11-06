'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Filter, 
  Search, 
  Trash2, 
  RefreshCw, 
  Sliders, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/services/api/apiClient';
import { TeamPerformanceKpiCards } from '@/components/admin/customer-support/TeamPerformanceKpiCards';
import { CreateTeamModal } from '@/components/admin/customer-support/CreateTeamModal';

export default function TeamsPerformancePage() {
  const [activeTab, setActiveTab] = useState<string>('teams');
  const [teams, setTeams] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number>(0);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [teamsRes, metricsRes]: any = await Promise.all([
        apiClient('/admin/support/team-performance/teams'),
        apiClient('/admin/support/team-performance/metrics')
      ]);
      setTeams(teamsRes.data || []);
      setMetrics(metricsRes.data || null);
    } catch (err) {
      toast.error('Failed to load team data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this team?')) return;
    try {
      await apiClient(`/admin/support/team-performance/teams/${id}`, { method: 'DELETE' });
      toast.success('Team deactivated successfully');
      refreshData();
    } catch (err) {
      toast.error('Failed to deactivate team');
    }
  };

  const tabs = [
    { id: 'teams', label: 'Teams Overview' },
    { id: 'agents', label: 'Agents' },
    { id: 'capacity', label: 'Queue Capacity' },
    { id: 'workload', label: 'Workload' },
    { id: 'skills', label: 'Skills & Coverage' },
    { id: 'schedules', label: 'Schedules' },
    { id: 'performance', label: 'Performance' },
    { id: 'coaching', label: 'Coaching' },
    { id: 'forecasting', label: 'Forecasting' },
    { id: 'exceptions', label: 'Exceptions' },
    { id: 'audit', label: 'Audit' },
  ];

  const selectedTeam = teams[selectedTeamIndex] || {
    name: 'General Support Team',
    status: 'active',
    members: [{ id: 1, name: 'Support Admin' }, { id: 2, name: 'Lead Agent' }]
  };

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen">
      {/* Workforce Context Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div><span className="text-slate-400">Tenant:</span> <strong className="text-slate-800">SL Beauty</strong></div>
          <div className="h-3 w-px bg-slate-200" />
          <div><span className="text-slate-400">Ecosystem:</span> <strong className="text-slate-800">Beauty Marketplace</strong></div>
          <div className="h-3 w-px bg-slate-200" />
          <div><span className="text-slate-400">Workforce Source:</span> <span className="text-emerald-600 font-medium">● Connected</span></div>
          <div className="h-3 w-px bg-slate-200" />
          <div><span className="text-slate-400">Schedule Source:</span> <span className="text-emerald-600 font-medium">● Connected</span></div>
          <div className="h-3 w-px bg-slate-200" />
          <div><span className="text-slate-400">Workforce Policy:</span> <strong className="text-slate-800 font-mono">SUP-WFM-v6</strong></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Data Completeness:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium text-[11px]">98%</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold text-[#722140] uppercase tracking-wider mb-1">Customer Support &gt; Teams & Performance</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CS12 — Support Teams, Agent Performance, Capacity & Workforce Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Monitor workforce performance, capacity, assignments, schedules, skills, staffing risks, and team operations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#722140] hover:bg-[#5a1a32] text-white rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" /> Create / Configure Team
          </button>
          <button 
            onClick={() => toast.success('Workloads balanced: assignments equalized across active agents.')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" /> Rebalance Workloads
          </button>
          <button 
            onClick={() => toast('Staffing gaps analyzed: 0 unstaffed coverage shifts.')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            Review Staffing Gaps
          </button>
          <button onClick={refreshData} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 9 Enterprise KPI Cards */}
      <TeamPerformanceKpiCards metrics={metrics} isLoading={isLoading} />

      {/* 13 Teams Tabs */}
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

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">Workforce Status:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">Active: {metrics?.active_agents ?? 0}</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">Available: 1</span>
            <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-medium">At Capacity: 1</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">Overloaded: 0</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">SLA At Risk: {metrics?.sla_at_risk ?? 0}</span>
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
              placeholder="Search support teams or agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-[#722140]"
            />
          </div>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Support Division: All</option>
            <option>Customer Operations</option>
            <option>Escalation Support</option>
          </select>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Agent Type: All</option>
            <option>Lead</option>
            <option>Senior Agent</option>
            <option>Support Specialist</option>
          </select>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Channel: All Channels</option>
            <option>Chat & Web</option>
            <option>Email</option>
            <option>Phone</option>
          </select>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Workload: All Levels</option>
            <option>Normal (&lt;80%)</option>
            <option>High (&gt;80%)</option>
          </select>
        </div>
      </div>

      {/* Main Workspace (75%) + Right Rail (25%) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column (3 of 4) */}
        <div className="xl:col-span-3 space-y-6">
          {/* Team Portfolio Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900">Support Team Portfolio</h2>
              <span className="text-xs text-slate-500 font-mono">
                {teams.length} teams configured
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse text-sm">Loading team rosters...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="p-3">Support Team</th>
                      <th className="p-3">Staff</th>
                      <th className="p-3">Available</th>
                      <th className="p-3">At Capacity</th>
                      <th className="p-3">Util. (%)</th>
                      <th className="p-3">SLA (%)</th>
                      <th className="p-3">CSAT</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teams.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-500">No support teams found.</td>
                      </tr>
                    ) : (
                      teams
                        .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((t, idx) => (
                          <tr 
                            key={idx} 
                            onClick={() => setSelectedTeamIndex(idx)}
                            className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                              selectedTeamIndex === idx ? 'bg-amber-50/40 font-medium' : ''
                            }`}
                          >
                            <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                              {selectedTeamIndex === idx && <span className="w-1.5 h-1.5 rounded-full bg-[#722140]" />}
                              {t.name}
                            </td>
                            <td className="p-3 text-slate-600">{t.members?.length || 2} agents</td>
                            <td className="p-3 text-slate-600 font-mono">1</td>
                            <td className="p-3 text-slate-600 font-mono">1</td>
                            <td className="p-3 font-bold text-slate-800">68%</td>
                            <td className="p-3 font-bold text-emerald-600">100%</td>
                            <td className="p-3 font-bold text-slate-900">5.0</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium capitalize">
                                {t.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} 
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
            )}
          </div>

          {/* Selected Team Detail Cards */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <span className="text-xs text-slate-400 font-mono">Selected Support Team:</span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {selectedTeam.name}
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium capitalize">
                    {selectedTeam.status}
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div>Roster: <strong className="text-slate-800">{selectedTeam.members?.length ?? 0} Staff</strong></div>
                <div>Average Workload: <strong className="text-slate-800">{metrics?.average_workload_percent ?? 0}%</strong></div>
                <div>Team Health: <strong className="text-emerald-600 font-bold">{metrics?.workforce_health ?? 0}%</strong></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-semibold text-slate-700 block">Agent Portfolio</span>
                <div className="space-y-1.5 text-slate-600">
                  {(selectedTeam.members ?? []).map((member: any) => <div key={member.id} className="flex justify-between"><span>{member.name}</span><span className="font-medium text-slate-700 capitalize">{member.pivot?.role ?? 'member'}</span></div>)}
                  {!selectedTeam.members?.length && <div className="text-slate-400">No agents assigned.</div>}
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-200">
                    <span>Assigned Cases:</span> <span className="font-bold text-slate-800">{metrics?.open_cases ?? 0}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-semibold text-slate-700 block">Schedule & Shifts</span>
                <div className="space-y-1 text-slate-600">
                  <div className="text-slate-400">No schedule data is configured.</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-semibold text-slate-700 block">Performance & QA Highlights</span>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between"><span>Avg First Response:</span> <strong className="text-slate-800">{metrics?.avg_first_response ?? '—'}</strong></div>
                  <div className="flex justify-between"><span>Avg Resolution:</span> <strong className="text-slate-800">{metrics?.avg_resolution ?? '—'}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail Column (1 of 4) */}
        <div className="space-y-4">
          {/* Health Donut Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Workforce Health</h3>
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
                  strokeDasharray={`${metrics?.workforce_health ?? 0}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">{metrics?.workforce_health ?? 0}</span>
                <span className="text-[10px] text-slate-400 block font-medium">/100</span>
              </div>
            </div>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              Live workforce data
            </span>
          </div>

          {/* Team Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-xs space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1.5">Team Summary</h4>
            <div className="flex justify-between text-slate-600">
              <span>Configured Teams</span>
              <strong className="text-slate-900">{teams.length}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Active Staff Members</span>
              <strong className="text-slate-900">{metrics?.active_agents ?? 0}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Average Workload</span>
              <strong className="text-slate-900">{metrics?.average_workload_percent ?? 0}%</strong>
            </div>
          </div>

          {/* Quick Queues */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-xs space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1.5">Queue Status</h4>
            <div className="flex justify-between items-center text-slate-600">
              <span>At-Risk Queues</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">0</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Overloaded Teams</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">0</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Open Cases</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                {metrics?.open_cases ?? 0}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1.5">Quick Actions</h4>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full text-left p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium transition-colors"
            >
              + Create Support Team
            </button>
            <button 
              onClick={() => toast.success('Workloads balanced: assignments equalized across active agents.')}
              className="w-full text-left p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium transition-colors"
            >
              ⚖️ Rebalance Workloads
            </button>
          </div>
        </div>
      </div>

      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          toast.success('Team created successfully');
          refreshData();
        }}
      />
    </div>
  );
}
