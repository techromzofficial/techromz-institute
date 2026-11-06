'use client';

import { useEffect, useState } from 'react';
import { Lock, Store, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api';
import { initials } from '@/lib/utils';
import SupplierProfileManager from '@/components/supplier/SupplierProfileManager';
import toast from 'react-hot-toast';

const BASE_TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'security', label: 'Security', icon: Lock },
];

export default function SettingsContent() {
  const { user, updateUser, isSupplier } = useAuth();
  const [tab, setTab] = useState('profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    company_name: user?.company_name || user?.company || '',
    country: user?.country || '',
  });
  const [password, setPassword] = useState({
    current: '',
    next: '',
    confirm: '',
  });

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const tabs = isSupplier
    ? [...BASE_TABS, { key: 'supplier', label: 'Supplier Profile', icon: Store }]
    : BASE_TABS;

  useEffect(() => {
    if (!user) return;

    setProfile({
      name: user.name || '',
      phone: user.phone || '',
      company_name: user.company_name || user.company || '',
      country: user.country || '',
    });
  }, [user]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);

    try {
      const response = await userApi.updateProfile(profile);
      updateUser(response.user);
      setProfile({
        name: response.user.name || '',
        phone: response.user.phone || '',
        company_name: response.user.company_name || '',
        country: response.user.country || '',
      });
      toast.success('Profile updated.');
    } catch (error) {
      toast.error(error.message || 'Could not save your profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (password.next !== password.confirm) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    if (password.next.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }

    setSavingPassword(true);

    try {
      await userApi.updatePassword({
        current_password: btoa(password.current),
        password: btoa(password.next),
        password_confirmation: btoa(password.confirm),
      });
      setPassword({ current: '', next: '', confirm: '' });
      toast.success('Password updated.');
    } catch (error) {
      toast.error(error.message || 'Could not update your password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="w-full lg:w-56 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2 lg:sticky lg:top-20 flex lg:flex-col overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors w-full text-left ${
                tab === key
                  ? 'bg-primary-50 text-primary-800'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} className={tab === key ? 'text-primary-700' : 'text-gray-400'} />
              {label}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {tab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-lg">
            <h2 className="font-semibold text-gray-800">Profile Information</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-800 text-white text-xl font-bold flex items-center justify-center flex-shrink-0">
                {initials(profile.name || 'U')}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">{user?.email}</div>
                <div className="text-xs text-gray-400 mt-0.5">Email changes are not currently supported.</div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                required
                className={inputClass}
                value={profile.name}
                onChange={(event) => setProfile((current) => ({
                  ...current,
                  name: event.target.value,
                }))}
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                className={inputClass}
                value={profile.phone}
                onChange={(event) => setProfile((current) => ({
                  ...current,
                  phone: event.target.value,
                }))}
                placeholder="+94 77 000 0000"
              />
            </div>
            <div>
              <label className={labelClass}>Company Name</label>
              <input
                className={inputClass}
                value={profile.company_name}
                onChange={(event) => setProfile((current) => ({
                  ...current,
                  company_name: event.target.value,
                }))}
              />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input
                className={inputClass}
                value={profile.country}
                onChange={(event) => setProfile((current) => ({
                  ...current,
                  country: event.target.value,
                }))}
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-primary-800 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60"
            >
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        )}

        {tab === 'security' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
            <h2 className="font-semibold text-gray-800">Change Password</h2>
            <div>
              <label className={labelClass}>Current Password</label>
              <input
                type="password"
                autoComplete="current-password"
                required
                className={inputClass}
                value={password.current}
                onChange={(event) => setPassword((current) => ({
                  ...current,
                  current: event.target.value,
                }))}
              />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className={inputClass}
                value={password.next}
                onChange={(event) => setPassword((current) => ({
                  ...current,
                  next: event.target.value,
                }))}
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                className={inputClass}
                value={password.confirm}
                onChange={(event) => setPassword((current) => ({
                  ...current,
                  confirm: event.target.value,
                }))}
              />
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 bg-primary-800 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60"
            >
              {savingPassword ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}

        {tab === 'supplier' && isSupplier && (
          <SupplierProfileManager />
        )}
      </div>
    </div>
  );
}
