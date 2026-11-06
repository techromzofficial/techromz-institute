'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  BarChart3,
  BadgeCheck,
  Boxes,
  ChevronRight,
  FileText,
  Heart,
  MessageSquare,
  Package,
  Settings,
  Star,
  Store,
  TrendingUp,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import SupplierProductsManager from '@/components/supplier/SupplierProductsManager';
import { useAuth } from '@/contexts/AuthContext';
import {
  conversationsApi,
  ordersApi,
  quotationsApi,
  rfqApi,
  supplierProductsApi,
  supplierProfileApi,
  userApi,
  wishlistApi,
} from '@/lib/api';
import { formatCurrency, initials } from '@/lib/utils';

const BUYER_TABS = ['overview', 'orders', 'rfqs', 'wishlist', 'messages', 'analytics'];
const SUPPLIER_TABS = [
  'overview',
  'rfqs',
  'quotations',
  'orders',
  'products',
  'messages',
  'analytics',
];

const TAB_LABELS = {
  overview: 'Overview',
  orders: 'Orders',
  rfqs: 'RFQs',
  wishlist: 'Wishlist',
  messages: 'Messages',
  quotations: 'Quotations',
  products: 'Products',
  analytics: 'Analytics',
};

const PAGE_PARAMS = {
  orders: 'order_page',
  rfqs: 'rfq_page',
  quotations: 'quotation_page',
  products: 'product_page',
};

const STATUS_STYLES = {
  open: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  completed: 'bg-green-100 text-green-700',
  confirmed: 'bg-blue-100 text-blue-700',
  production: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-primary-100 text-primary-700',
  cancelled: 'bg-red-100 text-red-600',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  verified: 'bg-green-100 text-green-700',
};

function arrayData(response, key = 'data') {
  return Array.isArray(response?.[key]) ? response[key] : [];
}

function paginationData(response) {
  return {
    currentPage: Number(response?.current_page || 1),
    lastPage: Number(response?.last_page || 1),
    total: Number(response?.total || 0),
  };
}

function dateLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
}

function money(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
}

function participantName(conversation) {
  return conversation?.participant?.company_name
    || conversation?.participant?.name
    || 'Marketplace user';
}

function latestMessage(conversation) {
  return conversation?.latest_message?.message || 'No messages yet';
}

function profileCompletion(profile) {
  const supplier = profile?.supplier;
  if (!supplier) return { complete: 0, total: 0 };

  const values = [
    supplier.company_name,
    supplier.description,
    supplier.country,
    supplier.city,
    supplier.address,
    supplier.phone,
    supplier.email,
    supplier.website,
    supplier.business_type,
    supplier.established_year,
  ];

  return {
    complete: values.filter((value) => value !== null && value !== undefined && value !== '').length,
    total: values.length,
  };
}

function ModuleError({ title, message, onRetry }) {
  if (!message) return null;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-4">
      <div className="flex items-start gap-2">
        <AlertCircle size={17} className="text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-700">{title}</p>
          <p className="text-xs text-red-600 mt-1">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="text-xs font-semibold text-red-700 hover:underline"
      >
        Retry
      </button>
    </div>
  );
}

function EmptyState({ icon: Icon, title, action }) {
  return (
    <div className="text-center py-12">
      <Icon size={36} className="text-gray-200 mx-auto mb-3" />
      <p className="text-sm text-gray-500">{title}</p>
      {action}
    </div>
  );
}

function StatusBadge({ status }) {
  const value = status || 'pending';

  return (
    <span className={`badge-pill capitalize ${STATUS_STYLES[value] || 'bg-gray-100 text-gray-600'}`}>
      {value}
    </span>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    isAuthenticated,
    isSupplier,
    loading: authLoading,
  } = useAuth();

  const tabs = isSupplier ? SUPPLIER_TABS : BUYER_TABS;
  const requestedTab = (searchParams.get('tab') || 'overview').toLowerCase();
  const activeTab = tabs.includes(requestedTab) ? requestedTab : 'overview';
  const rfqPage = Math.max(Number(searchParams.get(PAGE_PARAMS.rfqs) || 1), 1);
  const orderPage = Math.max(Number(searchParams.get(PAGE_PARAMS.orders) || 1), 1);
  const quotationPage = Math.max(Number(searchParams.get(PAGE_PARAMS.quotations) || 1), 1);
  const productPage = Math.max(Number(searchParams.get(PAGE_PARAMS.products) || 1), 1);

  const [dashboard, setDashboard] = useState(null);
  const [rfqs, setRfqs] = useState([]);
  const [rfqMeta, setRfqMeta] = useState(paginationData());
  const [orders, setOrders] = useState([]);
  const [orderMeta, setOrderMeta] = useState(paginationData());
  const [wishlist, setWishlist] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [quotationMeta, setQuotationMeta] = useState(paginationData());
  const [products, setProducts] = useState([]);
  const [productMeta, setProductMeta] = useState(paginationData());
  const [companyProfile, setCompanyProfile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      const returnUrl = `/dashboard${searchParams.toString() ? `?${searchParams}` : ''}`;
      router.replace(`/login?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    let cancelled = false;

    const requests = {
      dashboard: userApi.dashboard(),
      rfqs: isSupplier
        ? rfqApi.supplierList({ page: rfqPage })
        : rfqApi.list({ page: rfqPage }),
      orders: ordersApi.list({ page: orderPage }),
      messages: conversationsApi.list(),
      ...(isSupplier
        ? {
            quotations: quotationsApi.supplierList({ page: quotationPage }),
            products: supplierProductsApi.list({ page: productPage }),
            profile: supplierProfileApi.getCompanyProfile(),
          }
        : {
            wishlist: wishlistApi.get(),
          }),
    };

    const load = async () => {
      setLoading(true);
      const entries = Object.entries(requests);
      const results = await Promise.allSettled(entries.map(([, request]) => request));

      if (cancelled) return;

      const nextErrors = {};

      results.forEach((result, index) => {
        const key = entries[index][0];

        if (result.status === 'rejected') {
          nextErrors[key] = result.reason?.message || `Could not load ${key}.`;
          return;
        }

        const response = result.value;

        if (key === 'dashboard') setDashboard(response);
        if (key === 'rfqs') {
          setRfqs(arrayData(response));
          setRfqMeta(paginationData(response));
        }
        if (key === 'orders') {
          setOrders(arrayData(response));
          setOrderMeta(paginationData(response));
        }
        if (key === 'messages') setConversations(arrayData(response));
        if (key === 'wishlist') {
          setWishlist(arrayData(response, 'items').filter((item) => item?.id && item?.product?.id));
        }
        if (key === 'quotations') {
          setQuotations(arrayData(response));
          setQuotationMeta(paginationData(response));
        }
        if (key === 'products') {
          setProducts(arrayData(response));
          setProductMeta(paginationData(response));
        }
        if (key === 'profile') setCompanyProfile(response);
      });

      setErrors(nextErrors);
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAuthenticated,
    isSupplier,
    orderPage,
    productPage,
    quotationPage,
    reloadKey,
    rfqPage,
    router,
    searchParams,
  ]);

  const unreadMessages = useMemo(
    () => conversations.reduce(
      (total, conversation) => total + Number(conversation?.unread_count || 0),
      0,
    ),
    [conversations],
  );

  const profileProgress = profileCompletion(companyProfile);
  const supplier = companyProfile?.supplier;

  const stats = isSupplier
    ? [
        { label: 'Active Products', value: dashboard?.products_count ?? productMeta.total, icon: Boxes, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Quotations', value: dashboard?.quotations_count ?? quotationMeta.total, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Orders', value: dashboard?.orders_count ?? orderMeta.total, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Unread Messages', value: unreadMessages, icon: MessageSquare, color: 'text-primary-600', bg: 'bg-primary-50' },
      ]
    : [
        { label: 'Total Orders', value: dashboard?.orders_count ?? orderMeta.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'RFQs', value: dashboard?.rfqs_count ?? rfqMeta.total, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Wishlist Items', value: dashboard?.wishlist_count ?? wishlist.length, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Unread Messages', value: unreadMessages, icon: MessageSquare, color: 'text-primary-600', bg: 'bg-primary-50' },
      ];

  const quickLinks = isSupplier
    ? [
        { label: 'Manage Products', tab: 'products', icon: Boxes },
        { label: 'Company Profile', href: supplier?.id ? `/suppliers/${supplier.id}` : '/settings', icon: Store },
        { label: 'Open RFQs', tab: 'rfqs', icon: FileText },
        { label: 'Quotations', tab: 'quotations', icon: TrendingUp },
        { label: 'Orders', tab: 'orders', icon: Package },
      ]
    : [
        { label: 'Browse Products', href: '/products', icon: TrendingUp },
        { label: 'Post an RFQ', href: '/rfq', icon: FileText },
        { label: 'My Suppliers', href: '/suppliers', icon: Star },
        { label: 'Account Settings', href: '/settings', icon: Settings },
      ];

  const changeTab = (tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    Object.values(PAGE_PARAMS).forEach((key) => params.delete(key));
    router.push(`/dashboard?${params.toString()}`);
  };

  const changePage = (tab, page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    params.set(PAGE_PARAMS[tab], String(page));
    router.push(`/dashboard?${params.toString()}`);
  };

  const retry = () => setReloadKey((value) => value + 1);

  if (authLoading || loading || !isAuthenticated) {
    return (
      <>
        <Header />
        <LoadingSpinner label="Loading dashboard…" />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {Object.keys(errors).length > 0 && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Some dashboard modules could not be loaded.</p>
                <p className="text-xs text-amber-700 mt-1">
                  Available modules are still shown. Retry to reload the failed data.
                </p>
              </div>
            </div>
            <button type="button" onClick={retry} className="text-sm font-semibold text-amber-800 hover:underline">
              Retry
            </button>
          </div>
        )}

        <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-6 text-white mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold flex-shrink-0">
            {initials(user?.name || 'U')}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{user?.name || 'Welcome back!'}</h1>
            <p className="text-primary-100 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="badge-pill bg-white/20 text-white text-[11px]">
                {isSupplier ? '📦 Supplier' : '🛒 Buyer'}
              </span>
              {(user?.company_name || user?.company) && (
                <span className="badge-pill bg-white/20 text-white text-[11px]">
                  {user.company_name || user.company}
                </span>
              )}
              {isSupplier && supplier?.verification_status && (
                <span className="badge-pill bg-white/20 text-white text-[11px] capitalize">
                  {supplier.verification_status}
                </span>
              )}
            </div>
          </div>
          <Link href="/settings" className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg flex items-center gap-1.5">
            <Settings size={14} /> Settings
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800">{value ?? '—'}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 border-b border-gray-200 mb-5 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => changeTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-700 text-primary-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Quick Actions</h2>
                <div className="space-y-2">
                  {quickLinks.map(({ label, href, tab, icon: Icon }) => {
                    const content = (
                      <>
                        <Icon size={18} className="text-primary-700" />
                        <span className="flex-1 text-sm text-gray-700">{label}</span>
                        <ChevronRight size={14} className="text-gray-300" />
                      </>
                    );

                    return href ? (
                      <Link key={label} href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                        {content}
                      </Link>
                    ) : (
                      <button key={label} type="button" onClick={() => changeTab(tab)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left">
                        {content}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800">{isSupplier ? 'Open Buyer RFQs' : 'Recent RFQs'}</h2>
                  <button type="button" onClick={() => changeTab('rfqs')} className="text-xs text-primary-700 hover:underline">
                    View All
                  </button>
                </div>
                <ModuleError title="RFQs unavailable" message={errors.rfqs} onRetry={retry} />
                {!errors.rfqs && rfqs.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title={isSupplier ? 'No open buyer RFQs right now' : 'No RFQs submitted yet'}
                    action={!isSupplier ? (
                      <Link href="/rfq" className="mt-3 inline-block text-sm text-primary-700 hover:underline">
                        Post your first RFQ →
                      </Link>
                    ) : null}
                  />
                ) : (
                  <div className="space-y-2 mt-3">
                    {rfqs.slice(0, 5).map((rfq) => (
                      <Link key={rfq.id} href={`/rfq/${rfq.id}`} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary-50">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-700 truncate">{rfq.title || rfq.product_name || 'RFQ'}</div>
                          <div className="text-xs text-gray-400">{dateLabel(rfq.created_at)}</div>
                        </div>
                        <StatusBadge status={rfq.status} />
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800">Recent Orders</h2>
                  <button type="button" onClick={() => changeTab('orders')} className="text-xs text-primary-700 hover:underline">
                    View All
                  </button>
                </div>
                <ModuleError title="Orders unavailable" message={errors.orders} onRetry={retry} />
                {!errors.orders && orders.length === 0 ? (
                  <EmptyState icon={Package} title="No orders yet" />
                ) : (
                  <div className="space-y-2 mt-3">
                    {orders.slice(0, 4).map((order) => (
                      <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary-50">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-700 truncate">{order.rfq?.title || order.order_number}</div>
                          <div className="text-xs text-gray-400">{order.order_number} · {dateLabel(order.created_at)}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-semibold text-gray-800">{money(order.total_amount, order.currency)}</div>
                          <StatusBadge status={order.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800">Recent Messages</h2>
                  <button type="button" onClick={() => changeTab('messages')} className="text-xs text-primary-700 hover:underline">
                    View All
                  </button>
                </div>
                <ModuleError title="Messages unavailable" message={errors.messages} onRetry={retry} />
                {!errors.messages && conversations.length === 0 ? (
                  <EmptyState icon={MessageSquare} title="No conversations yet" />
                ) : (
                  <div className="space-y-2 mt-3">
                    {conversations.slice(0, 4).map((conversation) => (
                      <Link key={conversation.id} href={`/messages?id=${conversation.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary-50">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {initials(participantName(conversation))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-700 truncate">{participantName(conversation)}</div>
                          <div className="text-xs text-gray-400 truncate">{latestMessage(conversation)}</div>
                        </div>
                        {conversation.unread_count > 0 && (
                          <span className="min-w-5 h-5 px-1 rounded-full bg-primary-700 text-white text-[10px] flex items-center justify-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {!isSupplier && (
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800">Saved Products</h2>
                  <button type="button" onClick={() => changeTab('wishlist')} className="text-xs text-primary-700 hover:underline">
                    View All
                  </button>
                </div>
                <ModuleError title="Wishlist unavailable" message={errors.wishlist} onRetry={retry} />
                {!errors.wishlist && wishlist.length === 0 ? (
                  <EmptyState icon={Heart} title="Your wishlist is empty" />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-3">
                    {wishlist.slice(0, 6).map((item) => (
                      <Link key={item.id} href={`/products/${item.product.id}`} className="rounded-xl border border-gray-100 p-2 hover:border-primary-200">
                        <Image
                          src={item.product.featured_image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'}
                          alt={item.product.name || 'Product'}
                          width={120}
                          height={120}
                          unoptimized
                          className="w-full aspect-square object-cover rounded-lg mb-2"
                        />
                        <div className="text-xs font-medium text-gray-700 line-clamp-2">{item.product.name || 'Product'}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {isSupplier && (
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800">Recent Quotations</h2>
                  <button type="button" onClick={() => changeTab('quotations')} className="text-xs text-primary-700 hover:underline">
                    View All
                  </button>
                </div>
                <ModuleError title="Quotations unavailable" message={errors.quotations} onRetry={retry} />
                {!errors.quotations && quotations.length === 0 ? (
                  <EmptyState icon={TrendingUp} title="No quotations submitted yet" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {quotations.slice(0, 4).map((quotation) => (
                      <Link key={quotation.id} href={`/rfq/${quotation.rfq_id}`} className="rounded-xl border border-gray-100 p-4 hover:border-primary-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">{quotation.rfq?.title || quotation.quotation_number}</div>
                            <div className="text-xs text-gray-400 mt-1">{quotation.quotation_number}</div>
                          </div>
                          <StatusBadge status={quotation.status} />
                        </div>
                        <div className="font-semibold text-primary-800 mt-3">{money(quotation.total_amount, quotation.currency)}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {activeTab === 'rfqs' && (
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-800">{isSupplier ? 'Open Buyer RFQs' : 'My RFQs'}</h2>
                <p className="text-xs text-gray-400 mt-1">{rfqMeta.total} total</p>
              </div>
              {!isSupplier && (
                <Link href="/rfq" className="px-4 py-2 bg-primary-800 text-white text-sm rounded-lg hover:bg-primary-700">
                  + New RFQ
                </Link>
              )}
            </div>
            <div className="p-5">
              <ModuleError title="RFQs unavailable" message={errors.rfqs} onRetry={retry} />
              {!errors.rfqs && rfqs.length === 0 ? (
                <EmptyState icon={FileText} title={isSupplier ? 'No open buyer RFQs right now' : 'No RFQs submitted yet'} />
              ) : (
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Request', 'Quantity', 'Submitted', 'Responses', 'Status'].map((heading) => (
                          <th key={heading} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {rfqs.map((rfq) => (
                        <tr key={rfq.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">
                            <Link href={`/rfq/${rfq.id}`} className="text-gray-800 hover:text-primary-700 hover:underline">
                              {rfq.title || rfq.product_name || 'RFQ'}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{rfq.quantity ?? '—'} {rfq.unit || ''}</td>
                          <td className="px-4 py-3 text-gray-400">{dateLabel(rfq.created_at) || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{rfq.responses_count ?? rfq.quotations_count ?? 0}</td>
                          <td className="px-4 py-3"><StatusBadge status={rfq.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Pagination currentPage={rfqMeta.currentPage} totalPages={rfqMeta.lastPage} onPageChange={(page) => changePage('rfqs', page)} />
            </div>
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-gray-800">Recent Orders</h2>
              <p className="text-xs text-gray-400 mt-1">{orderMeta.total} total</p>
            </div>
            <ModuleError title="Orders unavailable" message={errors.orders} onRetry={retry} />
            {!errors.orders && orders.length === 0 ? (
              <EmptyState icon={Package} title="No orders found" />
            ) : (
              <div className="space-y-3 mt-3">
                {orders.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-primary-200">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0">
                      <Package size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{order.order_number}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="text-sm font-medium text-gray-800 mt-1 truncate">{order.rfq?.title || 'Trade order'}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {isSupplier ? order.buyer?.name : order.supplier?.company_name} · {dateLabel(order.created_at)}
                      </div>
                    </div>
                    <div className="font-semibold text-gray-800">{money(order.total_amount, order.currency)}</div>
                  </Link>
                ))}
              </div>
            )}
            <Pagination currentPage={orderMeta.currentPage} totalPages={orderMeta.lastPage} onPageChange={(page) => changePage('orders', page)} />
          </section>
        )}

        {activeTab === 'messages' && (
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-800">Messages</h2>
                <p className="text-xs text-gray-400 mt-1">{conversations.length} conversations · {unreadMessages} unread</p>
              </div>
              <Link href="/messages" className="text-sm text-primary-700 hover:underline">Open Inbox</Link>
            </div>
            <ModuleError title="Messages unavailable" message={errors.messages} onRetry={retry} />
            {!errors.messages && conversations.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No conversations yet" />
            ) : (
              <div className="divide-y divide-gray-50 mt-3">
                {conversations.map((conversation) => (
                  <Link key={conversation.id} href={`/messages?id=${conversation.id}`} className="flex items-center gap-3 py-3 hover:bg-gray-50 px-2 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {initials(participantName(conversation))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{participantName(conversation)}</div>
                      <div className="text-xs text-gray-400 truncate">{latestMessage(conversation)}</div>
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className="min-w-5 h-5 px-1 rounded-full bg-primary-700 text-white text-[10px] flex items-center justify-center">
                        {conversation.unread_count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'wishlist' && !isSupplier && (
          <section>
            <ModuleError title="Wishlist unavailable" message={errors.wishlist} onRetry={retry} />
            {!errors.wishlist && wishlist.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100">
                <EmptyState
                  icon={Heart}
                  title="Your wishlist is empty"
                  action={<Link href="/products" className="mt-3 inline-block text-sm text-primary-700 hover:underline">Browse Products →</Link>}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-3">
                {wishlist.map((item) => (
                  <Link key={item.id} href={`/products/${item.product.id}`} className="bg-white rounded-xl border border-gray-100 p-3 hover-lift block">
                    <Image
                      src={item.product.featured_image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'}
                      alt={item.product.name || 'Product'}
                      width={160}
                      height={160}
                      unoptimized
                      className="w-full aspect-square object-cover rounded-lg mb-2"
                    />
                    <div className="text-sm font-medium text-gray-700 line-clamp-2">{item.product.name || 'Product'}</div>
                    <div className="text-primary-700 font-bold text-sm mt-1">{formatCurrency(item.product.price)}</div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'quotations' && isSupplier && (
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-gray-800">My Quotations</h2>
              <p className="text-xs text-gray-400 mt-1">{quotationMeta.total} total</p>
            </div>
            <ModuleError title="Quotations unavailable" message={errors.quotations} onRetry={retry} />
            {!errors.quotations && quotations.length === 0 ? (
              <EmptyState icon={TrendingUp} title="No quotations submitted yet" />
            ) : (
              <div className="space-y-3 mt-3">
                {quotations.map((quotation) => (
                  <Link key={quotation.id} href={`/rfq/${quotation.rfq_id}`} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-primary-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{quotation.quotation_number}</span>
                        <StatusBadge status={quotation.status} />
                      </div>
                      <div className="text-sm font-medium text-gray-800 mt-1 truncate">{quotation.rfq?.title || 'Buyer RFQ'}</div>
                      <div className="text-xs text-gray-400 mt-1">{dateLabel(quotation.created_at)}</div>
                    </div>
                    <div className="font-semibold text-primary-800">{money(quotation.total_amount, quotation.currency)}</div>
                  </Link>
                ))}
              </div>
            )}
            <Pagination currentPage={quotationMeta.currentPage} totalPages={quotationMeta.lastPage} onPageChange={(page) => changePage('quotations', page)} />
          </section>
        )}

        {activeTab === 'products' && isSupplier && (
          <SupplierProductsManager onChanged={retry} />
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-primary-700" />
                <h2 className="font-semibold text-gray-800">Operational Summary</h2>
              </div>
              <ModuleError title="Dashboard statistics unavailable" message={errors.dashboard} onRetry={retry} />
              <div className="grid grid-cols-2 gap-3 mt-3">
                {(isSupplier
                  ? [
                      ['Products', dashboard?.products_count],
                      ['Quotations', dashboard?.quotations_count],
                      ['Orders', dashboard?.orders_count],
                      ['Messages', dashboard?.messages_count],
                    ]
                  : [
                      ['RFQs', dashboard?.rfqs_count],
                      ['Quotations Received', dashboard?.quotations_received_count],
                      ['Orders', dashboard?.orders_count],
                      ['Wishlist', dashboard?.wishlist_count],
                    ]
                ).map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-gray-50 p-4">
                    <div className="text-xl font-bold text-gray-800">{value ?? '—'}</div>
                    <div className="text-xs text-gray-400 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </section>

            {isSupplier ? (
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BadgeCheck size={18} className="text-primary-700" />
                  <h2 className="font-semibold text-gray-800">Company Profile Status</h2>
                </div>
                <ModuleError title="Company profile unavailable" message={errors.profile} onRetry={retry} />
                {!errors.profile && supplier && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{supplier.company_name || 'Supplier company'}</div>
                        <div className="text-xs text-gray-400 mt-1">{supplier.location || supplier.country || 'Location not provided'}</div>
                      </div>
                      <StatusBadge status={supplier.verification_status} />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Profile details completed</span>
                        <span>{profileProgress.complete}/{profileProgress.total}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-700 rounded-full"
                          style={{
                            width: `${profileProgress.total
                              ? (profileProgress.complete / profileProgress.total) * 100
                              : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        ['Products', companyProfile.statistics?.total_products],
                        ['Completed Orders', companyProfile.statistics?.completed_orders],
                        ['RFQs Handled', companyProfile.statistics?.rfqs_handled],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-gray-50 p-3 text-center">
                          <div className="font-bold text-gray-800">{value ?? 0}</div>
                          <div className="text-[11px] text-gray-400 mt-1">{label}</div>
                        </div>
                      ))}
                    </div>
                    <Link href={`/suppliers/${supplier.id}`} className="inline-flex items-center gap-1 text-sm text-primary-700 hover:underline">
                      View public company profile <ChevronRight size={13} />
                    </Link>
                  </div>
                )}
              </section>
            ) : (
              <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-primary-700" />
                  <h2 className="font-semibold text-gray-800">Buyer Activity</h2>
                </div>
                <p className="text-sm text-gray-500">
                  Your dashboard statistics are scoped to your account. Marketplace-wide analytics remain restricted to administrators.
                </p>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                    <span>Unread conversations</span>
                    <strong>{unreadMessages}</strong>
                  </div>
                  <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                    <span>Saved products loaded</span>
                    <strong>{wishlist.length}</strong>
                  </div>
                  <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                    <span>Orders loaded</span>
                    <strong>{orderMeta.total}</strong>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading dashboard…" />}>
      <DashboardContent />
    </Suspense>
  );
}
