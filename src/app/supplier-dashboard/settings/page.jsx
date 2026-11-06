'use client';

import { useState } from 'react';
import { Save, Building2, Globe, Bell, Shield, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { initials } from '@/lib/utils';
import toast from 'react-hot-toast';

const TABS = ['Company Profile', 'Notifications', 'Security'];

export default function SupplierSettingsPage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('Company Profile');
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    company_name:       user?.company       || 'Lanka Exports (Pvt) Ltd.',
    business_type:      user?.business_type || 'Manufacturer',
    year_established:   '2012',
    employees:          '51-200',
    website:            'https://lankaexports.lk',
    description:        'We are a leading exporter of premium Sri Lankan products...',
    address:            'No. 45, Export Zone, Katunayake, Sri Lanka',
    phone:              '+94 11 234 5678',
    export_markets:     ['Japan', 'Germany', 'USA', 'UAE'],
    main_products:      'Ceylon Tea, Cinnamon, Coconut Products',
    annual_revenue:     '$1M–$5M',
  });

  const [notifs, setNotifs] = useState({
    new_rfq:         true,
    order_placed:    true,
    message:         true,
    payment_received:true,
    review_posted:   false,
    weekly_summary:  true,
  });

  const [security, setSecurity] = useState({
    current_password: '', new_password: '', confirm_password: '',
  });

  const setP = (field) => (e) => setProfile((f) => ({ ...f, [field]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/supplier/profile', profile);
      updateUser({ company: profile.company_name });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (security.new_password !== security.confirm_password) {
      toast.error('Passwords do not match'); return;
    }
    setSaving(true);
    try {
      await api.post('/auth/change-password', security);
      setSecurity({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Password changed!');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Supplier Settings</h1>
        <p className="text-sm text-gray-500">Manage your supplier profile and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-primary-700 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Company Profile Tab */}
      {tab === 'Company Profile' && (
        <form onSubmit={saveProfile} className="space-y-4">
          {/* Avatar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Building2 size={15} className="text-primary-600" /> Company Identity</h2>
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-primary-100 text-primary-800 font-bold text-2xl flex items-center justify-center">
                  {initials(profile.company_name)}
                </div>
                <button type="button" className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-800 text-white rounded-full flex items-center justify-center shadow">
                  <Camera size={11} />
                </button>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{profile.company_name}</p>
                <p className="text-xs text-gray-400">Click the camera to upload your logo</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                ['Company Name', 'company_name'], ['Business Type', 'business_type'],
                ['Year Established', 'year_established'], ['Employees', 'employees'],
                ['Website', 'website'], ['Phone', 'phone'],
                ['Annual Revenue', 'annual_revenue'], ['Main Products', 'main_products'],
              ].map(([label, field]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" value={profile[field]} onChange={setP(field)} className={inputCls} />
                </div>
              ))}

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                <input type="text" value={profile.address} onChange={setP('address')} className={inputCls} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                <textarea value={profile.description} onChange={setP('description')} rows={3} className={`${inputCls} resize-none`} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      )}

      {/* Notifications Tab */}
      {tab === 'Notifications' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Bell size={15} className="text-primary-600" /> Email Notifications</h2>
          <div className="space-y-4">
            {[
              ['new_rfq',          'New RFQ Received',     'Alert when a buyer sends you a sourcing request'],
              ['order_placed',     'Order Placed',         'Notify when a buyer places an order'],
              ['message',          'New Message',          'Alert when you receive a buyer message'],
              ['payment_received', 'Payment Received',     'Notify when payment is confirmed'],
              ['review_posted',    'Review Posted',        'Alert when a buyer leaves a review'],
              ['weekly_summary',   'Weekly Summary',       'Weekly performance report every Monday'],
            ].map(([key, label, desc]) => (
              <div key={key} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={notifs[key]}
                    onChange={(e) => setNotifs((n) => ({ ...n, [key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={() => { api.put('/supplier/notifications', notifs).catch(() => {}); toast.success('Preferences saved!'); }}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save size={14} /> Save Preferences
          </button>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'Security' && (
        <form onSubmit={savePassword} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Shield size={15} className="text-primary-600" /> Change Password</h2>
          {[
            ['current_password', 'Current Password'],
            ['new_password',     'New Password'],
            ['confirm_password', 'Confirm New Password'],
          ].map(([field, label]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="password"
                required
                value={security[field]}
                onChange={(e) => setSecurity((s) => ({ ...s, [field]: e.target.value }))}
                className={inputCls}
              />
            </div>
          ))}
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Shield size={14} />}
            {saving ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}
