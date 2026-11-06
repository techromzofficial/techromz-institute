'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { authApi } from '@/lib/api';
import { firstFieldError, withoutFieldError } from '@/lib/formErrors';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [form, setForm] = useState({ password: '', confirmation: '' });
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!token || !email) {
      setError('This reset link is incomplete. Please request a new one.');
      return;
    }

    if (form.password !== form.confirmation) {
      setFieldErrors({ password: ['Passwords do not match.'] });
      return;
    }

    if (form.password.length < 8) {
      setFieldErrors({ password: ['Password must be at least 8 characters.'] });
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await authApi.resetPassword({
        email,
        token,
        password: form.password,
        password_confirmation: form.confirmation,
      });
      setComplete(true);
    } catch (requestError) {
      setFieldErrors(requestError.errors || {});
      setError(requestError.message || 'Could not reset your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">SL</span>
            </div>
            <span className="text-xl font-bold text-primary-800">SL Beauty</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          {complete ? (
            <div className="text-center py-4">
              <CheckCircle className="w-14 h-14 text-primary-600 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-800 mb-2">Password Updated</h1>
              <p className="text-gray-500 text-sm mb-6">
                Your password has been reset successfully. Sign in with your new password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-700 font-medium hover:underline"
              >
                <ArrowLeft size={14} /> Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-800">Reset Password</h1>
              <p className="text-gray-500 text-sm mt-1 mb-6">
                Choose a new password for <strong>{email || 'your account'}</strong>.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="reset-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={form.password}
                      onChange={(event) => {
                        setError('');
                        setFieldErrors((current) => withoutFieldError(current, 'password'));
                        setForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }));
                      }}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none"
                    />
                  </div>
                  {firstFieldError(fieldErrors, 'password') && (
                    <p className="mt-1 text-xs text-red-600">
                      {firstFieldError(fieldErrors, 'password')}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="reset-confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="reset-confirmation"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={form.confirmation}
                      onChange={(event) => {
                        setError('');
                        setFieldErrors((current) => withoutFieldError(current, 'password'));
                        setForm((current) => ({
                          ...current,
                          confirmation: event.target.value,
                        }));
                      }}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !token || !email}
                  className="w-full py-2.5 bg-primary-800 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
                >
                  {loading ? 'Updating…' : 'Reset Password'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-primary-700">
                  Request a new reset link
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
