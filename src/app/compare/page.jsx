'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  X, Plus, Check, Minus, Star, ShoppingCart, MessageCircle,
  BarChart2, ArrowLeft,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

const MOCK_PRODUCTS = [
  {
    id: 1, name: 'Premium BOPF Ceylon Black Tea 500g', supplier: 'Ceylon Exports (Pvt) Ltd.', supplier_verified: true,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80', category: 'Tea & Beverages',
    price: { min: 12.50, max: 18.00, currency: 'USD' }, moq: '50 Kg', lead_time: '14–21 days',
    rating: 4.8, reviews: 142, orders: 380, response_rate: '98%',
    certifications: ['ISO 22000', 'Rainforest Alliance', 'Organic Certified'],
    country: 'Sri Lanka', port: 'Colombo', shipping: ['Air Freight', 'Sea Freight'],
    specs: { Grade: 'BOPF', Moisture: '≤5%', 'Shelf Life': '24 months', Packaging: '25kg kraft bag', 'HS Code': '0902.30' },
    in_stock: true,
  },
  {
    id: 2, name: 'BOPF Ceylon Tea Export Grade 1Kg', supplier: 'High Grown Tea Co.', supplier_verified: true,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80', category: 'Tea & Beverages',
    price: { min: 11.00, max: 16.50, currency: 'USD' }, moq: '100 Kg', lead_time: '10–18 days',
    rating: 4.6, reviews: 87, orders: 210, response_rate: '95%',
    certifications: ['ISO 22000', 'Halal'],
    country: 'Sri Lanka', port: 'Colombo', shipping: ['Air Freight', 'Sea Freight', 'DHL Express'],
    specs: { Grade: 'BOPF', Moisture: '≤4.5%', 'Shelf Life': '18 months', Packaging: '50kg jute bag', 'HS Code': '0902.30' },
    in_stock: true,
  },
  {
    id: 3, name: 'Organic Ceylon Green Tea 200g Premium', supplier: 'Lanka Organic Exports', supplier_verified: false,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80', category: 'Tea & Beverages',
    price: { min: 16.00, max: 24.00, currency: 'USD' }, moq: '20 Kg', lead_time: '21–30 days',
    rating: 4.4, reviews: 54, orders: 95, response_rate: '89%',
    certifications: ['Organic Certified', 'Fair Trade'],
    country: 'Sri Lanka', port: 'Colombo', shipping: ['DHL Express', 'Air Freight'],
    specs: { Grade: 'Gunpowder', Moisture: '≤5%', 'Shelf Life': '24 months', Packaging: '5kg foil bag', 'HS Code': '0902.10' },
    in_stock: false,
  },
];

const COMPARISON_ROWS = [
  { label: 'Price Range',   key: 'price', render: (p) => `${p.price.currency} ${p.price.min}–${p.price.max}` },
  { label: 'MOQ',           key: 'moq' },
  { label: 'Lead Time',     key: 'lead_time' },
  { label: 'Rating',        key: 'rating', render: (p) => `${p.rating} ⭐ (${p.reviews} reviews)` },
  { label: 'Orders Placed', key: 'orders', render: (p) => p.orders.toLocaleString() + '+ orders' },
  { label: 'Response Rate', key: 'response_rate' },
  { label: 'Country',       key: 'country' },
  { label: 'Port',          key: 'port' },
  { label: 'Certifications',key: 'certifications', render: (p) => p.certifications.join(', ') },
  { label: 'Shipping',      key: 'shipping', render: (p) => p.shipping.join(', ') },
  { label: 'In Stock',      key: 'in_stock', render: (p) => p.in_stock ? '✅ Yes' : '❌ No' },
  { label: 'Verified',      key: 'supplier_verified', render: (p) => p.supplier_verified ? '✅ Verified' : '— Not verified' },
];

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || ['1', '2', '3'];
    const load = async () => {
      try {
        const data = await Promise.all(ids.map((id) => api.get(`/products/${id}`)));
        setProducts(data);
      } catch {
        setProducts(MOCK_PRODUCTS.slice(0, ids.length || 3));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParams]);

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Removed from comparison');
  };

  if (loading) return (
    <main className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-64 bg-gray-200 rounded-xl" />)}
      </div>
    </main>
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
            <ArrowLeft size={16} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 size={22} className="text-primary-600" /> Compare Products
            </h1>
            <p className="text-sm text-gray-500">{products.length} products · Side-by-side comparison</p>
          </div>
        </div>
        {products.length < 4 && (
          <Link href="/products" className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-gray-300 text-gray-500 text-sm rounded-xl hover:border-primary-400 hover:text-primary-700 transition-colors">
            <Plus size={14} /> Add product
          </Link>
        )}
      </div>

      {/* Comparison table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Product headers */}
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-4 w-40 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50/80">
                  Attribute
                </th>
                {products.map((p) => (
                  <th key={p.id} className="px-4 py-4 text-center min-w-[200px] border-l border-gray-100">
                    <div className="relative">
                      {/* Remove button */}
                      <button onClick={() => removeProduct(p.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gray-200 hover:bg-red-100 hover:text-red-500 text-gray-400 rounded-full flex items-center justify-center transition-colors">
                        <X size={10} />
                      </button>

                      <Image src={p.image} alt={p.name} width={80} height={80} unoptimized
                        className="w-20 h-20 object-cover rounded-xl mx-auto mb-2 border border-gray-100" />
                      <Link href={`/products/${p.id}`} className="font-semibold text-gray-800 text-xs line-clamp-2 hover:text-primary-700 text-center block">
                        {p.name}
                      </Link>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {p.supplier}
                        {p.supplier_verified && <span className="text-primary-600 ml-1">✓</span>}
                      </p>

                      {/* CTA buttons */}
                      <div className="flex flex-col gap-1.5 mt-2">
                        {p.in_stock && (
                          <button
                            onClick={() => { addItem(p, 1); }}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-primary-800 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            <ShoppingCart size={12} /> Add to Cart
                          </button>
                        )}
                        <Link href={`/messages?product=${p.id}&supplier=${p.supplier}`}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors">
                          <MessageCircle size={12} /> Contact
                        </Link>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Comparison rows */}
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={row.key} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                  <td className="px-5 py-3.5 text-xs font-semibold text-gray-500 bg-gray-50/80 align-top whitespace-nowrap">
                    {row.label}
                  </td>
                  {products.map((p) => {
                    const val = row.render ? row.render(p) : p[row.key];
                    return (
                      <td key={p.id} className="px-4 py-3.5 text-center border-l border-gray-100 text-sm text-gray-700 align-top">
                        {val ?? <Minus size={14} className="text-gray-300 mx-auto" />}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Spec rows */}
              {Object.keys(MOCK_PRODUCTS[0]?.specs || {}).map((specKey) => (
                <tr key={specKey} className="border-b border-gray-50">
                  <td className="px-5 py-3 text-xs font-semibold text-gray-500 bg-gray-50/80">{specKey}</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-4 py-3 text-center border-l border-gray-100 text-xs text-gray-600">
                      {p.specs?.[specKey] ?? <Minus size={12} className="text-gray-300 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {products.length === 0 && (
        <div className="text-center py-20">
          <BarChart2 size={48} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700 mb-2">Nothing to compare</h2>
          <Link href="/products" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors">
            <Plus size={14} /> Browse Products
          </Link>
        </div>
      )}
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" /></div>}>
      <CompareContent />
    </Suspense>
  );
}
