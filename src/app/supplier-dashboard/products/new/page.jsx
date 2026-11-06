'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Upload, X, Plus, ChevronDown, ChevronUp, Package,
  Info, DollarSign, Truck, Image as ImageIcon, Save,
  ArrowLeft, Video,
} from 'lucide-react';
import { api } from '@/lib/api';
import { SRI_LANKA_CATEGORIES } from '@/lib/constants';
import toast from 'react-hot-toast';

const UNITS    = ['Kg', 'Ton', 'Piece', 'Set', 'Pair', 'Box', 'Roll', 'Bag', 'Litre', 'Meter'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'LKR'];
const CERTIFICATIONS = ['ISO 9001', 'ISO 22000', 'CE Mark', 'Fair Trade', 'Rainforest Alliance', 'Organic Certified', 'Halal', 'Kosher', 'HACCP', 'FDA Approved'];

const INITIAL_FORM = {
  name: '', category: '', description: '',
  price_min: '', price_max: '', currency: 'USD',
  moq: '', moq_unit: 'Kg',
  lead_time_min: '', lead_time_max: '',
  stock: '',
  specifications: [{ key: '', value: '' }],
  certifications: [],
  packaging: '', hs_code: '', country_of_origin: 'Sri Lanka',
  shipping_note: '',
  status: 'active',
};

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={16} className="text-primary-600" />
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-50">{children}</div>}
    </div>
  );
}

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

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [form,    setForm]    = useState(INITIAL_FORM);
  const [images,  setImages]  = useState([]); // { url, file }
  const [loading, setLoading] = useState(false);
  const [drag,    setDrag]    = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  /* ── Image handling ── */
  const addImages = (files) => {
    const items = Array.from(files).slice(0, 8 - images.length).map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setImages((prev) => [...prev, ...items]);
  };

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    addImages(e.dataTransfer.files);
  };

  /* ── Specifications ── */
  const addSpec = () => setForm((f) => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }));
  const removeSpec = (i) => setForm((f) => ({ ...f, specifications: f.specifications.filter((_, idx) => idx !== i) }));
  const setSpec = (i, field, val) => setForm((f) => ({
    ...f,
    specifications: f.specifications.map((s, idx) => idx === i ? { ...s, [field]: val } : s),
  }));

  /* ── Certifications ── */
  const toggleCert = (cert) => setForm((f) => ({
    ...f,
    certifications: f.certifications.includes(cert)
      ? f.certifications.filter((c) => c !== cert)
      : [...f.certifications, cert],
  }));

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.category)    { toast.error('Please select a category'); return; }
    if (!form.price_min)   { toast.error('Please enter a price'); return; }
    if (!form.moq)         { toast.error('MOQ is required'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, typeof v === 'object' ? JSON.stringify(v) : v);
      });
      images.forEach((img, i) => img.file && fd.append(`images[${i}]`, img.file));

      await api.post('/supplier/products', fd);
      toast.success('Product published successfully!');
      router.push('/supplier-dashboard/products');
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all';
  const textareaCls = `${inputCls} resize-none`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-sm text-gray-500">Fill in the details to list your product on SL Beauty</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ── Basic Information ── */}
        <Section title="Basic Information" icon={Info}>
          <div className="pt-4 grid gap-4">
            <Field label="Product Name" required hint="Use a clear, descriptive name buyers would search for">
              <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Vitamin C Brightening Serum - 30ml Retail Pack" className={inputCls} />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Category" required>
                <select value={form.category} onChange={set('category')} className={inputCls}>
                  <option value="">Select category…</option>
                  {SRI_LANKA_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Country of Origin">
                <input type="text" value={form.country_of_origin} onChange={set('country_of_origin')} className={inputCls} />
              </Field>
            </div>

            <Field label="Description" required hint="Minimum 100 characters. Include key features, use cases, and export details.">
              <textarea
                value={form.description}
                onChange={set('description')}
                rows={5}
                placeholder="Describe your product in detail — ingredients, benefits, usage notes, packaging, and retail availability…"
                className={textareaCls}
              />
              <p className="text-[11px] text-gray-400 mt-1 text-right">{form.description.length} chars</p>
            </Field>
          </div>
        </Section>

        {/* ── Pricing & MOQ ── */}
        <Section title="Pricing & MOQ" icon={DollarSign}>
          <div className="pt-4 grid sm:grid-cols-2 gap-4">
            <Field label="Currency">
              <select value={form.currency} onChange={set('currency')} className={inputCls}>
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Unit">
              <select value={form.moq_unit} onChange={set('moq_unit')} className={inputCls}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </Field>

            <Field label="Price (min)" required hint="Lowest price for bulk orders">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{form.currency}</span>
                <input type="number" min="0" step="0.01" value={form.price_min} onChange={set('price_min')} className={`${inputCls} pl-12`} placeholder="0.00" />
              </div>
            </Field>

            <Field label="Price (max)" hint="Optional: for price range display">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{form.currency}</span>
                <input type="number" min="0" step="0.01" value={form.price_max} onChange={set('price_max')} className={`${inputCls} pl-12`} placeholder="0.00" />
              </div>
            </Field>

            <Field label="Minimum Order Quantity (MOQ)" required>
              <input type="number" min="1" value={form.moq} onChange={set('moq')} className={inputCls} placeholder="e.g. 50" />
            </Field>

            <Field label="Available Stock">
              <input type="number" min="0" value={form.stock} onChange={set('stock')} className={inputCls} placeholder="e.g. 5000" />
            </Field>
          </div>
        </Section>

        {/* ── Images ── */}
        <Section title="Product Images" icon={ImageIcon}>
          <div className="pt-4 space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                drag ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <Upload size={28} className={`mx-auto mb-2 ${drag ? 'text-primary-600' : 'text-gray-300'}`} />
              <p className="text-sm font-medium text-gray-600">Drag & drop images here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · Up to 8 images · Max 5MB each</p>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => addImages(e.target.files)} />
            </div>

            {/* Preview grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50">
                    <Image src={img.url} alt={img.name} fill unoptimized className="object-cover" />
                    {i === 0 && (
                      <div className="absolute top-1 left-1 bg-primary-800 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">Main</div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-white/90 hover:bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {images.length < 8 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
                  >
                    <Plus size={20} />
                    <span className="text-[10px] mt-1">Add more</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* ── Specifications ── */}
        <Section title="Specifications" icon={Package}>
          <div className="pt-4 space-y-3">
            {form.specifications.map((spec, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Attribute (e.g. Skin Type)"
                  value={spec.key}
                  onChange={(e) => setSpec(i, 'key', e.target.value)}
                  className={`${inputCls} flex-1`}
                />
                <input
                  type="text"
                  placeholder="Value (e.g. All skin types)"
                  value={spec.value}
                  onChange={(e) => setSpec(i, 'value', e.target.value)}
                  className={`${inputCls} flex-1`}
                />
                <button type="button" onClick={() => removeSpec(i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                  <X size={15} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSpec}
              className="flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-800 font-medium"
            >
              <Plus size={14} /> Add specification
            </button>
          </div>
        </Section>

        {/* ── Shipping & Lead Time ── */}
        <Section title="Shipping & Lead Time" icon={Truck} defaultOpen={false}>
          <div className="pt-4 grid sm:grid-cols-2 gap-4">
            <Field label="Lead Time (min days)">
              <input type="number" min="1" value={form.lead_time_min} onChange={set('lead_time_min')} className={inputCls} placeholder="e.g. 7" />
            </Field>
            <Field label="Lead Time (max days)">
              <input type="number" min="1" value={form.lead_time_max} onChange={set('lead_time_max')} className={inputCls} placeholder="e.g. 30" />
            </Field>
            <Field label="Packaging Details" hint="e.g. 25kg kraft bag or custom">
              <input type="text" value={form.packaging} onChange={set('packaging')} className={inputCls} placeholder="Describe packaging…" />
            </Field>
            <Field label="HS Code" hint="Harmonized System code for export customs">
              <input type="text" value={form.hs_code} onChange={set('hs_code')} className={inputCls} placeholder="e.g. 3304.99" />
            </Field>
            <Field label="Shipping Notes" hint="Any special handling or export restrictions" className="sm:col-span-2">
              <textarea value={form.shipping_note} onChange={set('shipping_note')} rows={2} className={textareaCls} placeholder="e.g. Fragile beauty items require careful carton packing…" />
            </Field>
          </div>
        </Section>

        {/* ── Certifications ── */}
        <Section title="Certifications" icon={Video} defaultOpen={false}>
          <div className="pt-4">
            <p className="text-xs text-gray-500 mb-3">Select all applicable certifications:</p>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATIONS.map((cert) => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => toggleCert(cert)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.certifications.includes(cert)
                      ? 'border-primary-600 bg-primary-50 text-primary-800'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {form.certifications.includes(cert) && '✓ '}{cert}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Action bar ── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            {loading ? 'Publishing…' : 'Publish Product'}
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, status: 'draft' }))}
            disabled={loading}
            className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
