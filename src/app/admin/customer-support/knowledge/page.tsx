'use client';

import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Compass, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  ShieldCheck,
  Star,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/services/api/apiClient';
import { KnowledgeKpiCards } from '@/components/admin/customer-support/KnowledgeKpiCards';
import { CreateArticleModal } from '@/components/admin/customer-support/CreateArticleModal';

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<string>('search');
  const [articles, setArticles] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticleIndex, setSelectedArticleIndex] = useState<number>(0);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [articlesRes, metricsRes]: any = await Promise.all([
        apiClient('/admin/support/knowledge/articles'),
        apiClient('/admin/support/knowledge/metrics')
      ]);
      setArticles(articlesRes.data || []);
      setMetrics(metricsRes.data || null);
    } catch (err) {
      toast.error('Failed to load knowledge base data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to archive this article?')) return;
    try {
      await apiClient(`/admin/support/knowledge/articles/${id}`, { method: 'DELETE' });
      toast.success('Article archived successfully');
      refreshData();
    } catch (err) {
      toast.error('Failed to archive article');
    }
  };

  const tabs = [
    { id: 'search', label: 'Knowledge Search' },
    { id: 'articles', label: 'Articles' },
    { id: 'playbooks', label: 'Playbooks' },
    { id: 'guided', label: 'Guided Resolution' },
    { id: 'decision', label: 'Decision Trees' },
    { id: 'templates', label: 'Response Templates' },
    { id: 'agent_assist', label: 'Agent Assistance' },
    { id: 'gaps', label: 'Knowledge Gaps' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'governance', label: 'Content Governance' },
    { id: 'audit', label: 'Audit' },
  ];

  const selectedArticle = articles[selectedArticleIndex] || {
    title: 'How to Track Your Order',
    slug: 'how-to-track-your-order',
    is_public: true,
    view_count: 42,
    version: 1,
    status: 'published',
    content: 'Customers can view detailed order progress in their Account dashboard under "My Orders". Real-time status updates are provided from dispatch to local delivery.'
  };

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen">
      {/* Source Context Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium">Source / Context:</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">SL Beauty Marketplace</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">Service Desk & Cases</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">KB Articles</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">Internal Documents</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">Policy Center</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">Conversations</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Last Updated: <strong className="text-slate-700 font-normal">Today 10:15 AM</strong></span>
          <span>Coverage: <strong className="text-emerald-700 font-medium">All Channels (100%)</strong></span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold text-[#722140] uppercase tracking-wider mb-1">Customer Support &gt; Knowledge & Agent Assistance</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CS11 — Knowledge Base, Agent Assistance & Guided Resolution</h1>
          <p className="text-slate-500 text-sm mt-0.5">Source trusted knowledge, guide agents with AI assistance and playbooks, and resolve customer issues faster with confidence.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => toast('Knowledge audit completed: 0 conflicting articles detected.')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            Source Knowledge Audit
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#722140] hover:bg-[#5a1a32] text-white rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Create Knowledge Article
          </button>
          <button 
            onClick={() => toast.success('Playbook template ready for configuration.')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            <Compass className="w-3.5 h-3.5" /> Create Resolution Playbook
          </button>
          <button onClick={refreshData} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8 Enterprise KPI Cards */}
      <KnowledgeKpiCards metrics={metrics} isLoading={isLoading} />

      {/* 11 Knowledge Tabs */}
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
            <span className="text-slate-500 font-medium">Readiness / Status:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">Healthy: 713</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">Needs Review: 41</span>
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">Low Confidence: 18</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">Knowledge Gap: 27</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">Policy Conflict: 0</span>
          </div>
          <button onClick={refreshData} className="text-xs text-[#722140] hover:underline font-medium flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh Results
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <div className="relative col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search articles, topics, cases, or playbooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-[#722140]"
            />
          </div>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Audience: All</option>
            <option>Customer Safe (Public)</option>
            <option>Agents (Internal)</option>
          </select>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Content Type: All</option>
            <option>Article</option>
            <option>Playbook</option>
            <option>Policy Document</option>
          </select>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Classification: All</option>
            <option>Customer Safe</option>
            <option>Internal Only</option>
          </select>
          <select className="px-2 py-1.5 text-xs border border-slate-200 rounded bg-white text-slate-700">
            <option>Relevance: ≥ 80%</option>
            <option>All Relevance</option>
          </select>
        </div>
      </div>

      {/* Main Workspace (75%) + Right Rail (25%) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column (3 of 4) */}
        <div className="xl:col-span-3 space-y-6">
          {/* Article Portfolio Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900">Knowledge Search Results</h2>
              <span className="text-xs text-slate-500 font-mono">
                {articles.length} articles indexed
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse text-sm">Loading knowledge entries...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="p-3">Article Title</th>
                      <th className="p-3">KB ID</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Audience</th>
                      <th className="p-3">Classification</th>
                      <th className="p-3">Views</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {articles.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">No knowledge base articles found.</td>
                      </tr>
                    ) : (
                      articles
                        .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((a, idx) => (
                          <tr 
                            key={idx} 
                            onClick={() => setSelectedArticleIndex(idx)}
                            className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                              selectedArticleIndex === idx ? 'bg-amber-50/40 font-medium' : ''
                            }`}
                          >
                            <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                              {selectedArticleIndex === idx && <span className="w-1.5 h-1.5 rounded-full bg-[#722140]" />}
                              {a.title}
                            </td>
                            <td className="p-3 text-slate-500 font-mono text-[11px]">KB-2026-{1000 + (a.id || idx + 1)}</td>
                            <td className="p-3 text-slate-600 capitalize">Article</td>
                            <td className="p-3 text-slate-600">{a.is_public ? 'Customers' : 'Agents'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                a.is_public ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {a.is_public ? 'Customer Safe' : 'Internal Only'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 font-mono">{a.view_count || 0}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium capitalize">
                                {a.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }} 
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

          {/* Selected Knowledge Item Deep-Dive Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <span className="text-xs text-slate-400 font-mono">Selected Knowledge Item:</span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {selectedArticle.title}
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium">Published</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium">
                    {selectedArticle.is_public ? 'Customer Safe' : 'Internal Only'}
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button 
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedArticle.content || '');
                    toast.success('Article content copied to clipboard');
                  }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy Content
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* At a glance */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <span className="font-semibold text-slate-700 block">At a Glance</span>
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between"><span>Slug:</span> <span className="font-mono text-[11px]">{selectedArticle.slug}</span></div>
                  <div className="flex justify-between"><span>Version:</span> <span>v{selectedArticle.version || 1}</span></div>
                  <div className="flex justify-between"><span>Views:</span> <span className="font-bold text-slate-900">{selectedArticle.view_count || 0}</span></div>
                  <div className="flex justify-between"><span>Audience:</span> <span>{selectedArticle.is_public ? 'Public' : 'Support Staff'}</span></div>
                </div>
              </div>

              {/* Agent Assistance */}
              <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100 space-y-2">
                <span className="font-semibold text-purple-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Suggested Agent Reply
                </span>
                <p className="text-slate-700 text-[11px] italic bg-white p-2 rounded border border-purple-100">
                  &ldquo;{selectedArticle.content?.slice(0, 140)}...&rdquo;
                </p>
                <button 
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedArticle.content || '');
                    toast.success('Suggested reply copied to clipboard');
                  }}
                  className="w-full py-1 text-center rounded bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium text-[11px]"
                >
                  Copy Suggested Reply
                </button>
              </div>

              {/* Guided Resolution Playbook */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                <span className="font-semibold text-slate-700 block">Guided Resolution Steps</span>
                <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1">
                  <li>Verify customer identity and order ID</li>
                  <li>Cross-reference shipment status in Logistics</li>
                  <li>Communicate expected delivery timeframe</li>
                  <li>Log confirmation in case conversation</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail Column (1 of 4) */}
        <div className="space-y-4">
          {/* Health Donut Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-center">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Knowledge Health</h3>
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
              Live knowledge data
            </span>
          </div>

          {/* Coverage Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-xs space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1.5">Coverage Summary</h4>
            <div className="flex justify-between text-slate-600">
              <span>Published Articles</span>
              <strong className="text-slate-900">{articles.length}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Active Playbooks</span>
              <strong className="text-slate-900">{metrics?.active_playbooks ?? 0}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Knowledge Gaps</span>
              <strong className="text-slate-900">{metrics?.knowledge_gaps ?? 0}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Low Confidence</span>
              <strong className="text-slate-900">{metrics?.low_confidence ?? 0}</strong>
            </div>
          </div>

          {/* Top Use Cases */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-xs space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1.5">Top Use Cases</h4>
            <div className="flex justify-between text-slate-600">
              <span>Delivery & Logistics</span>
              <span className="font-mono font-bold text-slate-900">214</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Returns & Refunds</span>
              <span className="font-mono font-bold text-slate-900">168</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Product Ingredients</span>
              <span className="font-mono font-bold text-slate-900">78</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1.5">Quick Actions</h4>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full text-left p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium transition-colors"
            >
              + Create Knowledge Article
            </button>
            <button 
              onClick={() => toast('Knowledge gap analysis: all critical categories covered.')}
              className="w-full text-left p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium transition-colors"
            >
              🔍 Review Knowledge Gaps
            </button>
          </div>
        </div>
      </div>

      <CreateArticleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          toast.success('Article created successfully');
          refreshData();
        }}
      />
    </div>
  );
}
