'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { authApi } from '@/lib/api';
import { firstFieldError, withoutFieldError } from '@/lib/formErrors';

export default function ForgotPasswordForm() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setFieldErrors(err.errors || {});
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/">
            <div className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SL</span>
              </div>
              <span className="text-xl font-bold text-primary-800">SL Beauty</span>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-14 h-14 text-primary-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Check Your Email</h2>
              <p className="text-gray-500 text-sm mb-6">
                We&apos;ve sent password reset instructions to <strong>{email}</strong>.
                Please check your inbox (and spam folder).
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-primary-700 font-medium hover:underline">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-800">Forgot Password?</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Enter your registered email and we&apos;ll send reset instructions.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fp-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="fp-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setError('');
                        setFieldErrors((current) => withoutFieldError(current, 'email'));
                        setEmail(e.target.value);
                      }}
                      placeholder="you@company.com"
                      required
                      autoFocus
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none"
                    />
                  </div>
                  {firstFieldError(fieldErrors, 'email') && (
                    <p className="mt-1 text-xs text-red-600">
                      {firstFieldError(fieldErrors, 'email')}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary-800 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-700">
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
