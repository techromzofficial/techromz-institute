'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Edit3,
  Loader2,
  PackagePlus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/ui/Pagination';
import FileUploadField from '@/components/ui/FileUploadField';
import { categoriesApi, supplierProductsApi } from '@/lib/api';
import { FALLBACK_PRODUCT_IMAGE, normalizeProductResponse, normalizeProducts } from '@/lib/products';
import { formatCurrency } from '@/lib/utils';

const emptyForm = {
  category_id: '',
  name: '',
  short_description: '',
  description: '',
  price: '',
  moq: '',
  unit: '',
  supply_ability: '',
  lead_time: '',
  port: '',
  packaging_details: '',
  featured_image: '',
  status: 'active',
};

function paginationData(response) {
  return {
    currentPage: Number(response?.current_page || 1),
    lastPage: Number(response?.last_page || 1),
    total: Number(response?.total || 0),
  };
}

function firstError(errors, field) {
  const value = errors?.[field];
  return Array.isArray(value) ? value[0] : value;
}

function FieldError({ errors, field }) {
  const message = firstError(errors, field);
  if (!message) return null;

  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function normalizeCategories(response) {
  const roots = Array.isArray(response?.data) ? response.data : [];
  return roots.flatMap((category) => [
    category,
    ...(Array.isArray(category.children) ? category.children : []),
  ]).filter((category) => category?.id);
}

function formFromProduct(product) {
  return {
    category_id: product?.category?.id || product?.category_id || '',
    name: product?.name || '',
    short_description: product?.short_description || '',
    description: product?.description || '',
    price: product?.price ?? '',
    moq: product?.moq ?? '',
    unit: product?.unit || '',
    supply_ability: product?.supply_ability || '',
    lead_time: product?.lead_time || '',
    port: product?.port || '',
    packaging_details: product?.packaging_details || '',
    featured_image: product?.featured_image || product?.image || '',
    status: product?.status || 'active',
  };
}

function productPayload(form) {
  return {
    ...form,
    category_id: Number(form.category_id),
    price: Number(form.price),
    moq: Number(form.moq),
  };
}

export default function SupplierProductsManager({ onChanged }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(paginationData());
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [validation, setValidation] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  const query = useMemo(() => ({
    page,
    search,
    status,
    category_id: categoryId,
  }), [categoryId, page, search, status]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          supplierProductsApi.list(query),
          categoriesApi.list(),
        ]);

        if (cancelled) return;

        const normalized = normalizeProductResponse(productResponse);
        setProducts(normalized.data);
        setMeta(paginationData(productResponse));
        setCategories(normalizeCategories(categoryResponse));
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || 'Could not load supplier products.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [query, reloadKey]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingProduct(null);
    setValidation({});
    setShowForm(false);
  };

  const retry = () => setReloadKey((value) => value + 1);

  const beginCreate = () => {
    setForm(emptyForm);
    setEditingProduct(null);
    setValidation({});
    setShowForm(true);
  };

  const beginEdit = async (product) => {
    setValidation({});
    setShowForm(true);
    setEditingProduct(product);
    setForm(formFromProduct(product));

    try {
      const response = await supplierProductsApi.get(product.id);
      const [freshProduct] = normalizeProducts([response.product]);
      if (freshProduct) {
        setEditingProduct(freshProduct);
        setForm(formFromProduct(freshProduct));
      }
    } catch {
      // Keep the list item data in the form; the save request will surface any real error.
    }
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    setValidation({});

    try {
      const payload = productPayload(form);
      const response = editingProduct
        ? await supplierProductsApi.update(editingProduct.id, payload)
        : await supplierProductsApi.create(payload);

      const [savedProduct] = normalizeProducts([response.product]);
      if (savedProduct) {
        setProducts((items) => (
          editingProduct
            ? items.map((item) => (item.id === savedProduct.id ? savedProduct : item))
            : [savedProduct, ...items]
        ));
      }

      resetForm();
      onChanged?.();
      toast.success(response.message || 'Product saved.');
    } catch (saveError) {
      setValidation(saveError.errors || {});
      toast.error(saveError.message || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name || 'this product'}?`)) return;

    setSaving(true);
    try {
      await supplierProductsApi.delete(product.id);
      setProducts((items) => items.filter((item) => item.id !== product.id));
      onChanged?.();
      toast.success('Product deleted.');
    } catch (deleteError) {
      toast.error(deleteError.message || 'Could not delete product.');
    } finally {
      setSaving(false);
    }
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    retry();
  };

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="font-semibold text-gray-800">My Products</h2>
          <p className="text-xs text-gray-400 mt-1">{meta.total} total products</p>
        </div>
        <button
          type="button"
          onClick={beginCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-800 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg"
        >
          <PackagePlus size={15} /> Add Product
        </button>
      </div>

      <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
        <div className="md:col-span-2 relative">
          <Search size={15} className="absolute left-3 top-3 text-gray-300" />
          <input
            className={`${inputClass} pl-9`}
            value={search}
            placeholder="Search my products"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select className={inputClass} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name || category.label}</option>
          ))}
        </select>
        <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit" className="md:col-span-4 inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          <RefreshCw size={14} /> Apply Filters
        </button>
      </form>

      {showForm && (
        <form onSubmit={saveProduct} className="border border-primary-100 bg-primary-50/30 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-semibold text-gray-800">{editingProduct ? 'Edit Product' : 'Create Product'}</h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Product Name</label>
              <input required className={inputClass} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              <FieldError errors={validation} field="name" />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select required className={inputClass} value={form.category_id} onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name || category.label}</option>
                ))}
              </select>
              <FieldError errors={validation} field="category_id" />
            </div>
            <div>
              <label className={labelClass}>Price</label>
              <input required type="number" min="0" step="0.01" className={inputClass} value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} />
              <FieldError errors={validation} field="price" />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <FieldError errors={validation} field="status" />
            </div>
            <div>
              <label className={labelClass}>MOQ</label>
              <input required type="number" min="0.01" step="0.01" className={inputClass} value={form.moq} onChange={(event) => setForm((current) => ({ ...current, moq: event.target.value }))} />
              <FieldError errors={validation} field="moq" />
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <input required className={inputClass} value={form.unit} placeholder="Piece, kg, carton…" onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} />
              <FieldError errors={validation} field="unit" />
            </div>
            <div>
              <label className={labelClass}>Lead Time</label>
              <input className={inputClass} value={form.lead_time} onChange={(event) => setForm((current) => ({ ...current, lead_time: event.target.value }))} />
              <FieldError errors={validation} field="lead_time" />
            </div>
            <div>
              <label className={labelClass}>Port</label>
              <input className={inputClass} value={form.port} onChange={(event) => setForm((current) => ({ ...current, port: event.target.value }))} />
              <FieldError errors={validation} field="port" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Supply Ability</label>
              <input className={inputClass} value={form.supply_ability} onChange={(event) => setForm((current) => ({ ...current, supply_ability: event.target.value }))} />
              <FieldError errors={validation} field="supply_ability" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Short Description</label>
              <textarea rows={2} className={inputClass} value={form.short_description} onChange={(event) => setForm((current) => ({ ...current, short_description: event.target.value }))} />
              <FieldError errors={validation} field="short_description" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea rows={4} className={inputClass} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              <FieldError errors={validation} field="description" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Packaging Details</label>
              <textarea rows={3} className={inputClass} value={form.packaging_details} onChange={(event) => setForm((current) => ({ ...current, packaging_details: event.target.value }))} />
              <FieldError errors={validation} field="packaging_details" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Featured Image</label>
              <input className={`${inputClass} mb-3`} value={form.featured_image} onChange={(event) => setForm((current) => ({ ...current, featured_image: event.target.value }))} />
              <FileUploadField
                kind="image"
                category="product_image"
                label="Upload featured image"
                value={form.featured_image}
                disabled={saving}
                onUploaded={(url) => setForm((current) => ({ ...current, featured_image: url }))}
              />
              <FieldError errors={validation} field="featured_image" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary-800 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60">
              {saving ? 'Saving…' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={resetForm} className="px-5 py-2.5 border border-gray-200 text-sm rounded-xl">
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={17} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700">Products unavailable</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <button type="button" onClick={retry} className="text-xs font-semibold text-red-700 hover:underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-10">
          <Loader2 size={18} className="animate-spin text-primary-700" />
          Loading supplier products…
        </div>
      ) : !error && products.length === 0 ? (
        <div className="text-center py-12">
          <PackagePlus size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No supplier products found.</p>
          <button type="button" onClick={beginCreate} className="mt-3 text-sm text-primary-700 hover:underline">
            Add your first product →
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 mt-3">
          {products.map((product) => (
            <div key={product.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <Image
                src={product.image || FALLBACK_PRODUCT_IMAGE}
                alt={product.name || 'Product'}
                width={64}
                height={64}
                unoptimized
                className="w-16 h-16 rounded-xl object-cover border border-gray-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.id}`} className="text-sm font-medium text-gray-800 hover:text-primary-700 truncate block">
                  {product.name || 'Product'}
                </Link>
                <div className="text-xs text-gray-400 mt-1">
                  {product.category?.name || 'Uncategorized'} · MOQ {product.moq || '—'} {product.unit || ''} · {formatCurrency(product.price)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {[product.lead_time, product.port, product.supply_ability].filter(Boolean).join(' · ') || 'Trade details not provided'}
                </div>
              </div>
              <span className={`badge-pill capitalize self-start sm:self-auto ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {product.status || 'inactive'}
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => beginEdit(product)} className="inline-flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                  <Edit3 size={13} /> Edit
                </button>
                <button type="button" onClick={() => deleteProduct(product)} className="inline-flex items-center gap-1 px-3 py-2 border border-red-100 rounded-lg text-xs text-red-600 hover:bg-red-50">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={meta.currentPage} totalPages={meta.lastPage} onPageChange={setPage} />
    </section>
  );
}
