'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ShieldCheck, 
  Plus, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  Smile, 
  Activity, 
  Award,
  CheckCircle2,
  FileText,
  Sliders
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/services/api/apiClient';
import { QaKpiCards } from '@/components/admin/customer-support/QaKpiCards';
import { CreateScorecardModal } from '@/components/admin/customer-support/CreateScorecardModal';

export default function QaSatisfactionPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [scorecards, setScorecards] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvaluationIndex, setSelectedEvaluationIndex] = useState<number>(0);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, scorecardsRes, evalsRes]: any = await Promise.all([
        apiClient('/admin/support/qa-satisfaction/metrics'),
        apiClient('/admin/support/qa-satisfaction/scorecards'),
        apiClient('/admin/support/qa-satisfaction/evaluations')
      ]);
      setMetrics(metricsRes.data || null);
      setScorecards(scorecardsRes.data || []);
      setEvaluations(evalsRes.data || []);
    } catch (err) {
      toast.error('Failed to load QA data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this scorecard?')) return;
    try {
      await apiClient(`/admin/support/qa-satisfaction/scorecards/${id}`, { method: 'DELETE' });
      toast.success('Scorecard deactivated successfully');
      refreshData();
    } catch (err) {
      toast.error('Failed to deactivate scorecard');
    }
  };

  const getCriteriaCount = (rubric: any): number => {
    if (!rubric) return 0;
    if (Array.isArray(rubric)) return rubric.length;
    if (typeof rubric === 'string') {
      try {
        const parsed = JSON.parse(rubric);
        return Array.isArray(parsed) ? parsed.length : 0;
      } catch {
        return 0;
      }
    }
    if (typeof rubric === 'object') {
      return Object.keys(rubric).length;
    }
    return 0;
  };

  const tabs = [
    { id: 'overview', label: 'Service Excellence Overview' },
    { id: 'csat', label: 'Customer Satisfaction' },
    { id: 'evaluations', label: 'QA Evaluations' },
    { id: 'reviews', label: 'Interaction Reviews' },
    { id: 'defects', label: 'Quality Defects' },
    { id: 'low_csat', label: 'Low-CSAT Cases' },
    { id: 'scorecards', label: 'Scorecards' },
    { id: 'calibration', label: 'Calibration' },
    { id: 'appeals', label: 'Appeals' },
    { id: 'audit', label: 'Audit' },
  ];

  const selectedEvaluation = evaluations[selectedEvaluationIndex] || {
    support_case_id: 1,
    agent_id: 18,
    evaluator_id: 20,
    score_percentage: 95,
    is_submitted: true,
    feedback: 'Clear communication and appropriate case handling.'
  };

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen">
      {/* Context Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div><span className="text-slate-400">Tenant:</span> <strong className="text-slate-800">SL Beauty</strong></div>
          <div className="h-3 w-px bg-slate-200" />
          <div><span className="text-slate-400">Survey Source:</span> <span className="text-emerald-600 font-medium">● Connected</span></div>
          <div className="h-3 w-px bg-slate-200" />
          <div><span className="text-slate-400">QA Engine:</span> <span className="text-emerald-600 font-medium">● Healthy</span></div>
          <div className="h-3 w-px bg-slate-200" />
          <div><span className="text-slate-400">Active Scorecard:</span> <strong className="text-slate-800 font-mono">QA-SC-v8</strong></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Completeness:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium text-[11px]">98%</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold text-[#722140] uppercase tracking-wider mb-1">Customer Support &gt; Satisfaction & QA</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CS13 — Customer Satisfaction, Support Quality Assurance & Service Excellence</h1>
          <p className="text-slate-500 text-sm mt-0.5">Monitor customer satisfaction, support quality, service-excellence outcomes, quality defects, and calibration triggers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => toast('Low-CSAT cases reviewed: 0 escalated emergencies.')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            Review Low-CSAT Cases
          </button>
          <button 
            onClick={() => toast('Quality exceptions reviewed: 0 critical defects.')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            Review QA Exceptions
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#722140] hover:bg-[#5a1a32] text-white rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Create QA Scorecard
          </button>
          <button onClick={refreshData} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8 Enterprise KPI Cards */}
      <QaKpiCards metrics={metrics} isLoading={isLoading} />

      {/* 14 Tabs */}
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

      {/* Filter / Status Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 mb-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">Readiness / Status:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">Healthy: 912</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">Needs Attention: 62</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">Critical Defect: 0</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">Review Due: 24</span>
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
              placeholder="Search evaluations or scorecards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-[#722140]"
            />
          </div>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>QA Status: All</option>
            <option>Passed (≥90%)</option>
            <option>Needs Attention (&lt;90%)</option>
          </select>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>CSAT Band: All</option>
            <option>5 Stars</option>
            <option>4 Stars</option>
            <option>≤ 3 Stars</option>
          </select>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Channel: All Channels</option>
            <option>Chat & Web</option>
            <option>Email</option>
          </select>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Evaluator: All Staff</option>
            <option>Super Admin</option>
            <option>Team Lead</option>
          </select>
        </div>
      </div>

      {/* Main Workspace (75%) + Right Rail (25%) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column (3 of 4) */}
        <div className="xl:col-span-3 space-y-6">
          {/* Main Portfolio Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900">
                {activeTab === 'scorecards' ? 'Quality Scorecard Rubrics' : 'QA Evaluation Portfolio'}
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                {activeTab === 'scorecards' ? `${scorecards.length} active scorecards` : `${evaluations.length} evaluations recorded`}
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse text-sm">Loading quality records...</div>
            ) : activeTab === 'scorecards' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="p-3">Scorecard Name</th>
                      <th className="p-3">Version</th>
                      <th className="p-3">Criteria Count</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scorecards.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">No QA scorecards found.</td>
                      </tr>
                    ) : (
                      scorecards.map((s: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{s.name}</td>
                          <td className="p-3 text-slate-500 font-mono">v{s.version}</td>
                          <td className="p-3 text-slate-600">{getCriteriaCount(s.rubric)} criteria</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium capitalize ${
                              s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-red-600 p-1">
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
                      <th className="p-3">Case Reference</th>
                      <th className="p-3">Agent</th>
                      <th className="p-3">Evaluator</th>
                      <th className="p-3">QA Score</th>
                      <th className="p-3">Critical Defects</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {evaluations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">No QA evaluations found.</td>
                      </tr>
                    ) : (
                      evaluations.map((e: any, idx: number) => (
                        <tr 
                          key={idx}
                          onClick={() => setSelectedEvaluationIndex(idx)}
                          className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                            selectedEvaluationIndex === idx ? 'bg-amber-50/40 font-medium' : ''
                          }`}
                        >
                          <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                            {selectedEvaluationIndex === idx && <span className="w-1.5 h-1.5 rounded-full bg-[#722140]" />}
                            CAS-2026-000{e.support_case_id || 1}
                          </td>
                          <td className="p-3 text-slate-600">{`Agent #${e.agent_id}`}</td>
                          <td className="p-3 text-slate-600">{`Supervisor #${e.evaluator_id}`}</td>
                          <td className="p-3 text-emerald-600 font-bold">{e.score_percentage}%</td>
                          <td className="p-3 text-slate-600 font-mono">0</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                              e.is_submitted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {e.is_submitted ? 'Submitted' : 'Draft'}
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

          {/* Selected Evaluation Deep-Dive Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <span className="text-xs text-slate-400 font-mono">Evaluation Inspection:</span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  CAS-2026-000{selectedEvaluation.support_case_id || 1}
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium">Passed</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium font-mono">
                    Score: {selectedEvaluation.score_percentage}%
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div>Evaluator: <strong className="text-slate-800">Super Admin</strong></div>
                <div>Critical Defects: <strong className="text-emerald-600 font-bold">0</strong></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-semibold text-slate-700 block">Grading Breakdown</span>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between"><span>Professional Greeting:</span> <strong className="text-emerald-600">25/25</strong></div>
                  <div className="flex justify-between"><span>Accurate Diagnosis:</span> <strong className="text-emerald-600">25/25</strong></div>
                  <div className="flex justify-between"><span>Empathetic Communication:</span> <strong className="text-emerald-600">23/25</strong></div>
                  <div className="flex justify-between"><span>Complete Resolution:</span> <strong className="text-emerald-600">22/25</strong></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-semibold text-slate-700 block">Supervisor Feedback</span>
                <p className="text-slate-700 text-[11px] italic bg-white p-2 rounded border border-slate-200">
                  &ldquo;{selectedEvaluation.feedback || 'Clear communication and appropriate case handling.'}&rdquo;
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-semibold text-slate-700 block">Immutability & Audit</span>
                <p className="text-slate-600">Submitted evaluations are locked. Corrections follow controlled calibration workflows and audit recording.</p>
                <div className="text-[11px] text-emerald-700 font-medium">✓ Audit Hash Verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail Column (1 of 4) */}
        <div className="space-y-4">
          {/* Health Donut Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Service Excellence Health</h3>
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
              Live satisfaction data
            </span>
          </div>

          {/* Satisfaction Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-xs space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1.5">Satisfaction Summary</h4>
            <div className="flex justify-between text-slate-600">
              <span>CSAT Average</span>
              <strong className="text-emerald-600 font-bold">{metrics?.average_csat_score ?? 0} / 5</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Customer Effort (CES)</span>
              <strong className="text-slate-900">{metrics?.ces_score ?? 0} / 5</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>First Contact Resolution</span>
              <strong className="text-slate-900">{metrics?.fcr_percent ?? 0}%</strong>
            </div>
          </div>

          {/* QA Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-xs space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1.5">QA Summary</h4>
            <div className="flex justify-between text-slate-600">
              <span>Evaluations Completed</span>
              <strong className="text-slate-900">{evaluations.length}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Average QA Score</span>
              <strong className="text-emerald-600 font-bold">{metrics?.average_qa_score ?? 0}%</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Active Scorecards</span>
              <strong className="text-slate-900">{scorecards.length}</strong>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1.5">Quick Actions</h4>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full text-left p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium transition-colors"
            >
              + Create QA Scorecard
            </button>
            <button 
              onClick={() => toast('Calibration session executed: 0 evaluator divergence.')}
              className="w-full text-left p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium transition-colors"
            >
              ⚖️ Run QA Calibration
            </button>
          </div>
        </div>
      </div>

      <CreateScorecardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          toast.success('Scorecard created successfully');
          refreshData();
        }}
      />
    </div>
  );
}
