'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Bell, CheckCheck, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationsApi } from '@/lib/api';
import {
  notificationHref,
  notificationTime,
  notificationsFromResponse,
} from '@/lib/notifications';

function EmptyNotifications({ compact }) {
  return (
    <div className={compact ? 'px-4 py-8 text-center' : 'py-12 text-center'}>
      <Bell size={compact ? 24 : 36} className="mx-auto text-gray-200 mb-2" />
      <p className="text-sm text-gray-500">No notifications yet.</p>
    </div>
  );
}

function NotificationItem({ notification, onOpen, compact }) {
  const unread = !notification.is_read;

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={`w-full text-left flex items-start gap-3 ${compact ? 'px-4 py-3' : 'p-4'} hover:bg-primary-50 transition-colors`}
    >
      <span className={`mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 ${unread ? 'bg-primary-700' : 'bg-gray-200'}`} />
      <span className="min-w-0 flex-1">
        <span className={`block text-sm ${unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
          {notification.title || 'Notification'}
        </span>
        <span className="block text-xs text-gray-500 mt-1 line-clamp-2">
          {notification.message || 'Open notification details.'}
        </span>
        <span className="block text-[11px] text-gray-400 mt-1">
          {notificationTime(notification.created_at)}
        </span>
      </span>
    </button>
  );
}

export default function NotificationCenter({ compact = false, pageSize = 20 }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await notificationsApi.list({ per_page: pageSize });
      setNotifications(notificationsFromResponse(response));
      setUnreadCount(Number(response?.unread_count || 0));
    } catch (loadError) {
      setError(loadError.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const markAllRead = async () => {
    setMarking(true);
    try {
      const response = await notificationsApi.markAllRead();
      setUnreadCount(Number(response?.unread_count || 0));
      window.dispatchEvent(new CustomEvent('notifications:unread', {
        detail: { count: Number(response?.unread_count || 0) },
      }));
      setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
      toast.success(response.message || 'Notifications marked as read.');
    } catch (markError) {
      toast.error(markError.message || 'Could not mark notifications as read.');
    } finally {
      setMarking(false);
    }
  };

  const openNotification = async (notification) => {
    const href = notificationHref(notification);

    if (!notification.is_read) {
      setNotifications((items) => items.map((item) => (
        item.id === notification.id ? { ...item, is_read: true } : item
      )));
      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        const response = await notificationsApi.markRead(notification.id);
        const nextCount = Number(response?.unread_count ?? Math.max(0, unreadCount - 1));
        setUnreadCount(nextCount);
        window.dispatchEvent(new CustomEvent('notifications:unread', {
          detail: { count: nextCount },
        }));
      } catch {
        load();
      }
    }

    router.push(href);
  };

  return (
    <div className={compact ? 'w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden mt-2' : 'bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'}>
      <div className={`flex items-center justify-between gap-3 border-b border-gray-100 ${compact ? 'px-4 py-3' : 'p-5'}`}>
        <div>
          <h2 className={compact ? 'text-sm font-semibold text-gray-800' : 'font-semibold text-gray-800'}>
            Notifications
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-primary-700 disabled:opacity-60"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {!compact && 'Retry'}
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              disabled={marking}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 hover:underline disabled:opacity-60"
            >
              {marking ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
              Mark all
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={compact ? 'px-4 py-8 text-center' : 'py-12 flex justify-center'}>
          <Loader2 size={22} className="animate-spin text-primary-700 mx-auto" />
          {compact && <p className="text-xs text-gray-400 mt-2">Loading notifications…</p>}
        </div>
      ) : error ? (
        <div className={compact ? 'px-4 py-6' : 'p-6'}>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Notifications unavailable</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
            <button type="button" onClick={load} className="text-xs font-semibold text-red-700 hover:underline">
              Retry
            </button>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyNotifications compact={compact} />
      ) : (
        <div className={compact ? 'max-h-96 overflow-y-auto divide-y divide-gray-50' : 'divide-y divide-gray-50'}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onOpen={openNotification}
              compact={compact}
            />
          ))}
        </div>
      )}

      {compact && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <Link href="/notifications" className="text-xs font-semibold text-primary-700 hover:underline">
            View all notifications →
          </Link>
        </div>
      )}
    </div>
  );
}
