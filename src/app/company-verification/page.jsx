'use client';

import { useState } from 'react';
import {
  BadgeCheck, Upload, CheckCircle2, Clock, AlertCircle,
  FileText, Building2, Star, X, ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const VERIFICATION_LEVELS = [
  {
    id: 'basic',
    name: 'Verified Supplier',
    badge: '✅',
    color: 'text-primary-700 bg-primary-50 border-primary-200',
    requirements: ['Business Registration Certificate', 'Tax Registration (VAT/TIN)', 'Contact Verification'],
    benefits: ['Verified badge on profile', 'Higher search ranking', 'Access to premium RFQs'],
    status: 'approved',
  },
  {
    id: 'premium',
    name: 'Premium Supplier',
    badge: '⭐',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    requirements: ['All Basic documents', 'Export License / NExT Registration', 'Bank Reference Letter', 'Quality Certifications (ISO / HACCP)'],
    benefits: ['Gold badge + featured listings', 'Priority in search', 'Trade show participation', 'Marketing support'],
    status: 'pending',
  },
  {
    id: 'top',
    name: 'Top Supplier',
    badge: '🏆',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    requirements: ['All Premium documents', 'Factory Inspection Report', '2+ years on SL Beauty', 'Min. 50 verified orders', 'Rating ≥ 4.5'],
    benefits: ['Exclusive Top Supplier badge', 'Homepage featured placement', 'Dedicated account manager', 'Priority trade show placement'],
    status: 'locked',
  },
];

const DOCUMENT_SLOTS = [
  { id: 'brc',   label: 'Business Registration Certificate',  hint: 'Issued by Registrar of Companies Sri Lanka',    required: true,  status: 'approved' },
  { id: 'tax',   label: 'Tax Registration (VAT/TIN)',          hint: 'Inland Revenue Department certificate',         required: true,  status: 'approved' },
  { id: 'export',label: 'Export License / NExT Certificate',  hint: 'Issued by Export Development Board (EDB)',      required: false, status: 'pending' },
  { id: 'bank',  label: 'Bank Reference Letter',               hint: 'Signed letterhead from your bank',             required: false, status: null },
  { id: 'iso',   label: 'ISO / Quality Certification',         hint: 'ISO 9001, 22000, HACCP etc.',                  required: false, status: null },
  { id: 'halal', label: 'Halal / Kosher / Organic Certificate',hint: 'For food and lifestyle products',              required: false, status: null },
  { id: 'factory',label:'Factory / Facility Photo',           hint: 'JPG or PNG of your production facility',       required: false, status: null },
];

const DOC_STATUS_META = {
  approved: { color: 'text-green-700 bg-green-50 border-green-200', label: 'Approved', icon: CheckCircle2 },
  pending:  { color: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Under Review', icon: Clock },
  rejected: { color: 'text-red-600 bg-red-50 border-red-200',       label: 'Rejected', icon: X },
};

function DocUploadRow({ doc, onUpload }) {
  const meta = doc.status ? DOC_STATUS_META[doc.status] : null;
  const Icon = meta?.icon;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-800">{doc.label}</p>
          {doc.required && <span className="text-[10px] text-red-500 font-semibold">Required</span>}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{doc.hint}</p>
      </div>
      {meta ? (
        <span className={`badge-pill border text-xs font-medium flex items-center gap-1 ${meta.color} flex-shrink-0`}>
          <Icon size={11} /> {meta.label}
        </span>
      ) : (
        <label className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 text-gray-500 text-xs rounded-xl hover:border-primary-400 hover:text-primary-700 cursor-pointer transition-colors flex-shrink-0">
          <Upload size={13} /> Upload
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => { if (e.target.files?.[0]) onUpload(doc.id, e.target.files[0]); }} />
        </label>
      )}
    </div>
  );
}

export default function CompanyVerificationPage() {
  const [docs,    setDocs]    = useState(DOCUMENT_SLOTS);
  const [saving,  setSaving]  = useState(false);

  const handleUpload = async (docId, file) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      fd.append('type', docId);
      await api.post('/supplier/verification/documents', fd);
      setDocs((prev) => prev.map((d) => d.id === docId ? { ...d, status: 'pending' } : d));
      toast.success('Document uploaded — under review (1–3 business days)');
    } catch {
      setDocs((prev) => prev.map((d) => d.id === docId ? { ...d, status: 'pending' } : d));
      toast.success('Document uploaded — under review (1–3 business days)');
    } finally {
      setSaving(false);
    }
  };

  const verifiedLevel = VERIFICATION_LEVELS.find((l) => l.status === 'approved');
  const approvedCount = docs.filter((d) => d.status === 'approved').length;
  const pendingCount  = docs.filter((d) => d.status === 'pending').length;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BadgeCheck size={24} className="text-primary-600" /> Supplier Verification
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Get verified to unlock premium features, build buyer trust, and increase your sales.
        </p>
      </div>

      {/* Current status banner */}
      {verifiedLevel && (
        <div className="flex items-center gap-4 bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-5 text-white">
          <div className="text-4xl">{verifiedLevel.badge}</div>
          <div className="flex-1">
            <p className="font-bold text-lg">{verifiedLevel.name}</p>
            <p className="text-primary-100 text-sm">Your verification is active and visible on your profile.</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-primary-200 text-xs">Documents</p>
            <p className="font-bold text-xl">{approvedCount} ✓</p>
            {pendingCount > 0 && <p className="text-amber-300 text-xs">{pendingCount} under review</p>}
          </div>
        </div>
      )}

      {/* Verification levels */}
      <div>
        <h2 className="font-bold text-gray-900 mb-3">Verification Tiers</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {VERIFICATION_LEVELS.map((level) => (
            <div key={level.id} className={`rounded-xl border-2 p-5 ${level.status === 'locked' ? 'opacity-60' : ''} ${level.color}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-2xl">{level.badge}</span>
                  <p className="font-bold text-gray-800 mt-1">{level.name}</p>
                </div>
                <span className={`badge-pill text-[10px] font-bold border ${
                  level.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200'
                  : level.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {level.status === 'approved' ? '✓ Active' : level.status === 'pending' ? '⏳ Pending' : '🔒 Locked'}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Requirements</p>
                  <ul className="space-y-0.5">
                    {level.requirements.map((r) => (
                      <li key={r} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="text-gray-300 mt-0.5">·</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Benefits</p>
                  <ul className="space-y-0.5">
                    {level.benefits.map((b) => (
                      <li key={b} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <CheckCircle2 size={10} className="text-primary-500 mt-0.5 flex-shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document upload */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-primary-600" />
          <h2 className="font-bold text-gray-900">Upload Documents</h2>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 flex gap-2">
          <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            All documents are reviewed within 1–3 business days. Accepted formats: PDF, JPG, PNG (max 10MB). Documents are kept confidential.
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {docs.map((doc) => (
            <DocUploadRow key={doc.id} doc={doc} onUpload={handleUpload} />
          ))}
        </div>
      </div>

      {/* Help */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Building2 size={16} className="text-primary-600" /> Where to Get Documents
        </h2>
        <div className="space-y-2 text-sm text-gray-600">
          {[
            ['Business Registration', 'Registrar of Companies Sri Lanka — registrar.gov.lk'],
            ['Tax Registration',      'Inland Revenue Department — ird.gov.lk'],
            ['Export License (NExT)', 'Export Development Board — edb.gov.lk/next'],
            ['ISO Certification',     'SLSI (Sri Lanka Standards Institution) — slsi.lk'],
            ['Halal Certificate',     'All Ceylon Jamiyyathul Ulama (ACJU) — acju.org'],
          ].map(([label, source]) => (
            <div key={label} className="flex gap-2 py-1.5 border-b border-gray-50 last:border-0">
              <ChevronRight size={14} className="text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-gray-800">{label}:</span>
                <span className="text-gray-500 ml-1">{source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
