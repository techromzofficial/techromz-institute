'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MessageCircle, Mail, Phone, Clock, Send, CheckCircle2,
  MapPin, HelpCircle, ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const SUBJECT_OPTIONS = [
  { value: 'order',       label: 'Order Issue' },
  { value: 'payment',     label: 'Payment Problem' },
  { value: 'supplier',    label: 'Supplier Dispute' },
  { value: 'verification',label: 'Verification Help' },
  { value: 'trade-show',  label: 'Trade Show Inquiry' },
  { value: 'account',     label: 'Account & Settings' },
  { value: 'other',       label: 'Something Else' },
];

const CHANNELS = [
  { icon: MessageCircle, label: 'Live Chat',     value: 'Available now', color: 'bg-primary-800', href: '/messages' },
  { icon: Mail,          label: 'Email',         value: 'support@slbeauty.lk', color: 'bg-blue-600', href: 'mailto:support@slbeauty.lk' },
  { icon: Phone,         label: 'Phone',         value: '+94 11 234 5678', color: 'bg-green-600', href: 'tel:+94112345678' },
];

function ContactSupportContent() {
  const searchParams = useSearchParams();
  const prefillSubject = searchParams.get('subject') || '';

  const [form, setForm] = useState({
    name: '', email: '', orderId: '',
    subject: SUBJECT_OPTIONS.some((s) => s.value === prefillSubject) ? prefillSubject : 'other',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill in all required fields'); return; }
    setSubmitting(true);
    try {
      await api.post('/support/tickets', form);
    } catch { /* demo always succeeds */ }
    setSubmitting(false);
    setSubmitted(true);
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  if (submitted) {
    return (
      <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Ticket submitted</h1>
        <p className="text-sm text-gray-500 mb-6">
          We&apos;ve received your message and will reply to <strong>{form.email}</strong> within 1 business day. Reference ID: <span className="font-mono text-gray-700">TKT-{Date.now().toString().slice(-6)}</span>
        </p>
        <Link href="/help-center" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
          Back to Help Center
        </Link>
      </main>
      <Footer />
    </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Contact Support</h1>
        <p className="text-sm text-gray-500">Mon–Fri, 9 AM–6 PM (IST) · Usually replies within a few hours</p>
      </div>

      {/* Channel cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        {CHANNELS.map((contact) => {
          const Icon = contact['icon'];
          return (
            <Link key={contact.label} href={contact.href}
              className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className={`w-10 h-10 rounded-xl ${contact.color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">{contact.label}</p>
                <p className="text-xs text-gray-400 truncate">{contact.value}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Send size={16} className="text-primary-600" /> Submit a Support Ticket
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input type="text" required value={form.name} onChange={set('name')} className={inputCls} placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required value={form.email} onChange={set('email')} className={inputCls} placeholder="you@company.com" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select value={form.subject} onChange={set('subject')} className={inputCls}>
                  {SUBJECT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order ID (if applicable)</label>
                <input type="text" value={form.orderId} onChange={set('orderId')} className={inputCls} placeholder="e.g. ECL-20260621-001" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea required rows={5} value={form.message} onChange={set('message')} className={`${inputCls} resize-none`}
                placeholder="Describe your issue in as much detail as possible…" />
            </div>

            <button type="submit" disabled={submitting}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-60 transition-colors">
              {submitting ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
              {submitting ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Clock size={15} className="text-primary-600" /> Response Times</h3>
            <div className="space-y-2 text-sm">
              {[['Live Chat', '< 5 min'], ['Email', '< 24 hours'], ['Phone', 'Immediate (business hours)']].map(([label, time]) => (
                <div key={label} className="flex justify-between text-gray-500">
                  <span>{label}</span><span className="font-medium text-gray-700">{time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2"><MapPin size={15} className="text-primary-600" /> Office</h3>
            <p className="text-sm text-gray-600">No. 24, Export Processing Zone<br />Colombo 14, Sri Lanka</p>
          </div>

          <Link href="/help-center" className="flex items-center justify-between bg-primary-50 border border-primary-100 rounded-2xl p-4 hover:bg-primary-100 transition-colors group">
            <span className="flex items-center gap-2 text-sm font-medium text-primary-800">
              <HelpCircle size={15} /> Browse FAQs instead
            </span>
            <ChevronRight size={15} className="text-primary-600 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </main>
      <Footer />
    </>
  );
}

export default function ContactSupportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" /></div>}>
      <ContactSupportContent />
    </Suspense>
  );
}
