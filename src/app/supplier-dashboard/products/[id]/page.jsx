'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Upload, X, Plus, Package, Info, DollarSign,
  Truck, Image as ImageIcon, Save, ArrowLeft,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SRI_LANKA_CATEGORIES } from '@/lib/constants';
import { RowSkeleton } from '@/components/shared/SkeletonLoader';
import toast from 'react-hot-toast';

const UNITS      = ['Kg', 'Ton', 'Piece', 'Set', 'Pair', 'Box', 'Roll', 'Bag', 'Litre', 'Meter'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'LKR'];

// Mock product prefill
const MOCK_PRODUCT = {
  id: 1, name: 'Vitamin C Brightening Serum 30ml', category: 'skincare',
  description: 'A brightening vitamin C serum prepared for daily skincare routines.',
  price_min: '12.50', price_max: '18.00', currency: 'USD',
  moq: '12', moq_unit: 'Piece', stock: '2000',
  lead_time_min: '7', lead_time_max: '21',
  specifications: [
    { key: 'Skin Type', value: 'All skin types' }, { key: 'Finish', value: 'Radiant' },
    { key: 'Volume', value: '30ml' }, { key: 'Shelf Life', value: '24 months' },
  ],
  certifications: ['ISO 22000', 'Rainforest Alliance'],
  packaging: 'Glass bottle with retail carton', hs_code: '3304.99',
  country_of_origin: 'Sri Lanka', shipping_note: '',
  status: 'active',
  existingImages: ['https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=800&q=80'],
};

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function EditProductPage() {
  const { id } = useParams();
  const router  = useRouter();
  const fileInputRef = useRef(null);
  const [form,    setForm]    = useState(null);
  const [images,  setImages]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.get(`/supplier/products/${id}`);
        setForm({ ...MOCK_PRODUCT, ...data });
        setImages((data.existingImages || MOCK_PRODUCT.existingImages).map((url) => ({ url, existing: true })));
      } catch {
        setForm(MOCK_PRODUCT);
        setImages(MOCK_PRODUCT.existingImages.map((url) => ({ url, existing: true })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const addImages = (files) => {
    const items = Array.from(files).slice(0, 8 - images.length).map((f) => ({
      file: f, url: URL.createObjectURL(f), name: f.name,
    }));
    setImages((prev) => [...prev, ...items]);
  };

  const addSpec = () => setForm((f) => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }));
  const removeSpec = (i) => setForm((f) => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }));
  const setSpec = (i, field, val) => setForm((f) => ({
    ...f, specifications: f.specifications.map((s, idx) => idx === i ? { ...s, [field]: val } : s),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'existingImages') fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
      });
      images.filter((i) => i.file).forEach((img, i) => fd.append(`images[${i}]`, img.file));
      await api.put(`/supplier/products/${id}`, fd);
      toast.success('Product updated!');
      router.push('/supplier-dashboard/products');
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  if (loading) return <div className="p-6"><RowSkeleton rows={6} /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500 line-clamp-1">{form.name}</p>
        </div>
        <span className={`ml-auto badge-pill ${form.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {form.status}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Info size={15} className="text-primary-600" /> Basic Information</h2>
          <Field label="Product Name" required>
            <input type="text" value={form.name} onChange={set('name')} className={inputCls} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Category" required>
              <select value={form.category} onChange={set('category')} className={inputCls}>
                {SRI_LANKA_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={set('status')} className={inputCls}>
                <option value="active">Active (Published)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </Field>
          </div>
          <Field label="Description" required>
            <textarea value={form.description} onChange={set('description')} rows={4} className={`${inputCls} resize-none`} />
          </Field>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><DollarSign size={15} className="text-primary-600" /> Pricing & MOQ</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              ['price_min', 'Min Price', 'USD'], ['price_max', 'Max Price', 'USD'],
              ['moq', 'MOQ', form.moq_unit], ['stock', 'Stock', 'Units'],
              ['lead_time_min', 'Lead Time Min', 'Days'], ['lead_time_max', 'Lead Time Max', 'Days'],
            ].map(([field, label, suffix]) => (
              <Field key={field} label={label}>
                <div className="relative">
                  <input type="number" min="0" value={form[field]} onChange={set(field)} className={`${inputCls} pr-14`} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{suffix}</span>
                </div>
              </Field>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><ImageIcon size={15} className="text-primary-600" /> Images</h2>
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50">
                <Image src={img.url} alt="" fill unoptimized className="object-cover" />
                {i === 0 && <div className="absolute top-1 left-1 bg-primary-800 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">Main</div>}
                <button type="button" onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 w-6 h-6 bg-white/90 hover:bg-red-50 text-red-500 rounded-full items-center justify-center hidden group-hover:flex shadow">
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < 8 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors">
                <Plus size={20} /><span className="text-[10px] mt-1">Add</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => addImages(e.target.files)} />
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Package size={15} className="text-primary-600" /> Specifications</h2>
          {form.specifications.map((spec, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" placeholder="Attribute" value={spec.key} onChange={(e) => setSpec(i, 'key', e.target.value)} className={`${inputCls} flex-1`} />
              <input type="text" placeholder="Value" value={spec.value} onChange={(e) => setSpec(i, 'value', e.target.value)} className={`${inputCls} flex-1`} />
              <button type="button" onClick={() => removeSpec(i)} className="p-2 text-gray-400 hover:text-red-500 flex-shrink-0"><X size={15} /></button>
            </div>
          ))}
          <button type="button" onClick={addSpec} className="flex items-center gap-1.5 text-sm text-primary-700 font-medium">
            <Plus size={14} /> Add specification
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.back()} className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
