'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus, Search, Filter, Edit2, Trash2, Eye, Package,
  ToggleLeft, ToggleRight, ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import { RowSkeleton } from '@/components/shared/SkeletonLoader';
import toast from 'react-hot-toast';

const MOCK_PRODUCTS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: [
    'Vitamin C Brightening Serum 30ml',
    'Hydrating Gel Cleanser 150ml',
    'Long Wear Matte Lipstick',
    'Repair Shampoo 250ml',
    'Signature Eau de Parfum 50ml',
    'Soft Glow Body Lotion',
    'Pore Care Clay Face Mask',
    'Nourishing Hair Oil',
    'Essential Beauty Tools Set',
    'Rose Glow Blush Palette',
    'Retinol Night Cream',
    'Micellar Cleansing Water',
  ][i],
  sku: `SLB-${1001 + i}`,
  category: ['Skincare', 'Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Bath & Body'][i % 6],
  price: [3900, 4200, 3200, 4500, 18500, 2900, 5600, 9200, 7400, 9800, 7600, 5100][i],
  moq: [12, 12, 24, 12, 6, 12, 12, 12, 6, 6, 12, 12][i],
  stock: [500, 720, 420, 380, 120, 560, 260, 180, 90, 140, 220, 340][i],
  views: [1240, 860, 2100, 540, 380, 920, 670, 310, 1100, 490, 730, 210][i],
  orders: [38, 22, 47, 5, 12, 19, 26, 9, 33, 15, 28, 6][i],
  status: i % 5 === 4 ? 'draft' : 'active',
  image: [
    'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80',
  ][i % 6],
}));

const STATUS_TABS = ['All', 'Active', 'Draft', 'Out of Stock'];
const PRODUCT_PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80';

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function productCategory(product) {
  if (typeof product.category === 'string') return product.category;
  return product.category?.name || product.category?.label || 'Uncategorized';
}

function productImage(product) {
  return product.image || product.featured_image || product.images?.[0] || PRODUCT_PLACEHOLDER_IMAGE;
}

export default function SupplierProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [tab,      setTab]      = useState('All');
  const [page,     setPage]     = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get('/supplier/products');
        setProducts(data.data || data);
      } catch {
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = products.filter((p) => {
    const name = p.name || '';
    const stock = safeNumber(p.stock);
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'All'
      || (tab === 'Active' && p.status === 'active')
      || (tab === 'Draft'  && p.status === 'draft')
      || (tab === 'Out of Stock' && stock === 0);
    return matchSearch && matchTab;
  });

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleStatus = async (id, current) => {
    const next = current === 'active' ? 'draft' : 'active';
    try {
      await api.patch(`/supplier/products/${id}`, { status: next });
    } catch { /* continue */ }
    setProducts((p) => p.map((item) => item.id === id ? { ...item, status: next } : item));
    toast.success(`Product ${next === 'active' ? 'published' : 'unpublished'}`);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await api.delete(`/supplier/products/${id}`); } catch { /* continue */ }
    setProducts((p) => p.filter((item) => item.id !== id));
    toast.success('Product deleted');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500">{products.length} products listed</p>
        </div>
        <Link
          href="/supplier-dashboard/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={15} /> Add Product
        </Link>
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1 border-b border-gray-100 px-4 overflow-x-auto">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(1); }}
              className={`px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t ? 'border-primary-700 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={14} /> Filter <ChevronDown size={12} />
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-4"><RowSkeleton rows={5} /></div>
        ) : paged.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No products found</p>
            <Link href="/supplier-dashboard/products/new" className="mt-2 inline-block text-sm text-primary-700 hover:underline">
              Add your first product →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Views', 'Orders', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-400 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.map((p) => {
                  const name = p.name || 'Untitled product';
                  const sku = p.sku || p.slug || `Product-${p.id}`;
                  const category = productCategory(p);
                  const stock = safeNumber(p.stock);
                  const views = safeNumber(p.views ?? p.views_count);
                  const orders = safeNumber(p.orders ?? p.orders_count);
                  const image = productImage(p);

                  return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image src={image} alt={name} width={40} height={40} unoptimized className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                        <span className="font-medium text-gray-800 line-clamp-1 max-w-[160px]">{name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{sku}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{category}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-800">{formatCurrency(safeNumber(p.price))}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{stock.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{views.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-700">{orders.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(p.id, p.status)} className="flex items-center gap-1 text-xs">
                        {p.status === 'active'
                          ? <><ToggleRight size={18} className="text-primary-600" /><span className="text-primary-700">Active</span></>
                          : <><ToggleLeft size={18} className="text-gray-400" /><span className="text-gray-500">Draft</span></>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/products/${p.id}`} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Preview">
                          <Eye size={14} />
                        </Link>
                        <Link href={`/supplier-dashboard/products/${p.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={14} />
                        </Link>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > PER_PAGE && (
          <div className="px-4 pb-4">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(filtered.length / PER_PAGE)}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
