'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedDestination, sanitizeInternalRedirect } from '@/lib/authRedirect';
import { firstFieldError, withoutFieldError } from '@/lib/formErrors';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = sanitizeInternalRedirect(
    searchParams.get('redirect'),
    '/dashboard',
  );

  const { login, user, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    router.replace(authenticatedDestination(user, redirectTo));
  }, [authLoading, isAuthenticated, redirectTo, router, user]);

  const [form, setForm]       = useState({ _el_id: '', _el_pw: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    searchParams.get('reason') === 'session_expired'
      ? 'Your session expired. Please sign in again.'
      : '',
  );
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const apiField = e.target.name === '_el_id' ? 'email' : 'password';
    setError('');
    setFieldErrors((current) => withoutFieldError(current, apiField));
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form._el_id.trim() || !form._el_pw) {
      setError('Please enter your email and password.');
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const data = await login({
        login:    form._el_id.trim(),
        password: form._el_pw,
      });
      toast.success('Welcome back!');

      router.replace(authenticatedDestination(data?.user, redirectTo, data?.redirect_to));
    } catch (err) {
      setFieldErrors(err.errors || {});
      setError(
        err.status === 401 || err.status === 403
          ? 'Invalid credentials. Please try again.'
          : (err.message || 'Unable to sign in. Please try again.'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SL</span>
              </div>
              <span className="text-xl font-bold text-primary-800">SL Beauty</span>
            </div>
          </Link>
          <p className="text-gray-400 text-sm mt-1">Premium Beauty Ecommerce Marketplace</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-6">Sign In to Your Account</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Username
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="login-email"
                  type="text"
                  name="_el_id"
                  autoComplete="username"
                  value={form._el_id}
                  onChange={handleChange}
                  placeholder="Email address or username"
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none"
                />
              </div>
              {firstFieldError(fieldErrors, 'login') && (
                <p className="mt-1 text-xs text-red-600">
                  {firstFieldError(fieldErrors, 'login')}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-pw" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-primary-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="login-pw"
                  type={showPw ? 'text' : 'password'}
                  name="_el_pw"
                  autoComplete="current-password"
                  value={form._el_pw}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-300 focus:border-primary-400 outline-none"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {firstFieldError(fieldErrors, 'password') && (
                <p className="mt-1 text-xs text-red-600">
                  {firstFieldError(fieldErrors, 'password')}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary-800 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary-700 font-medium hover:underline">
              Register Free
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <Link href="/register?role=supplier" className="text-sm text-accent-600 hover:underline font-medium">
              Become a Brand Partner →
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in you agree to our{' '}
          <Link href="/terms" className="underline">Terms</Link> &amp;{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
