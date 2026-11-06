'use client';

/**
 * ProductsContent — SL Beauty product search and listing page.
 *
 * Features:
 *  - Left filter sidebar: Category, Price, Brand, Product Types
 *  - Sort by: Best Match, Newest, Top Rated, Price ↑/↓
 *  - Grid / List view toggle
 *  - Product cards with beauty ecommerce actions
 *  - Mobile filter drawer
 *  - Pagination
 *
 * Public display data is forced to SL Beauty constants until backend beauty
 * product seed data is ready.
 */

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, LayoutGrid, List, ChevronDown, X, Search, ShieldCheck } from 'lucide-react';
import B2BProductCard from '@/components/product/B2BProductCard';
import Pagination from '@/components/ui/Pagination';
import { SRI_LANKA_CATEGORIES, TRENDING_PRODUCTS, NAV_DROPDOWNS } from '@/lib/constants';

const SORT_OPTIONS = [
  { value: 'best',       label: 'Best Match' },
  { value: 'newest',     label: 'Newest' },
  { value: 'top',        label: 'Most Popular' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

const MIN_ORDER_OPTIONS = [
  { label: 'Any quantity', value: '' },
  { label: 'Up to 50', value: '50' },
  { label: 'Up to 100', value: '100' },
  { label: 'Up to 500', value: '500' },
];

const LEAD_TIME_OPTIONS = [
  { label: 'Any delivery time', value: '' },
  { label: 'Ready within 7 days', value: '7' },
  { label: 'Ready within 14 days', value: '14' },
  { label: 'Ready within 30 days', value: '30' },
  { label: 'Ready within 45 days', value: '45' },
];

const PORT_OPTIONS = [
  { label: 'Any fulfilment option', value: '' },
  { label: 'Colombo delivery', value: 'Colombo' },
  { label: 'Islandwide delivery', value: 'Islandwide' },
  { label: 'Express delivery', value: 'Express' },
];

const STATUS_OPTIONS = [
  { label: 'All products', value: '' },
  { label: 'Active listings', value: 'active' },
  { label: 'Featured products', value: 'featured' },
  { label: 'Original brands', value: 'original' },
];

const BEAUTY_BRANDS = [
  { id: 'cerave', name: 'CeraVe', verified: true },
  { id: 'garnier', name: 'Garnier', verified: true },
  { id: 'la-roche-posay', name: 'La Roche-Posay', verified: true },
  { id: 'maybelline', name: 'Maybelline', verified: true },
  { id: 'loreal', name: 'L’Oréal', verified: true },
  { id: 'lancome', name: 'Lancôme', verified: true },
  { id: 'nivea', name: 'Nivea', verified: true },
  { id: 'the-ordinary', name: 'The Ordinary', verified: true },
  { id: 'kerastase', name: 'Kérastase', verified: true },
  { id: 'real-techniques', name: 'Real Techniques', verified: true },
  { id: 'nars', name: 'NARS', verified: true },
  { id: 'olay', name: 'Olay', verified: true },
  { id: 'bioderma', name: 'Bioderma', verified: true },
  { id: 'laneige', name: 'Laneige', verified: true },
  { id: 'anastasia-beverly-hills', name: 'Anastasia Beverly Hills', verified: true },
  { id: 'morphe', name: 'Morphe', verified: true },
];

const PAGE_SIZE = 12;

const slugify = (value = '') => String(value)
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const categoryOptions = SRI_LANKA_CATEGORIES.map((category) => ({
  ...category,
  name: category.label,
}));

const CATEGORY_IMAGES = {
  'makeup': [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515688594390-b649af70d282?auto=format&fit=crop&w=600&q=80',
  ],
  'skincare': [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
  ],
  'fragrance': [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&w=600&q=80',
  ],
  'hair-care': [
    'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1593998066526-65fcab3024a2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1527799863830-de80a4240aab?auto=format&fit=crop&w=600&q=80',
  ],
  'bath-body': [
    'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1607006342411-985f1c240974?auto=format&fit=crop&w=600&q=80',
  ],
  'tools-brushes': [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
  ]
};

const BASE_BEAUTY_PRODUCTS = TRENDING_PRODUCTS.map((product, index) => {
  const brandSlug = slugify(product.brand_name);
  const brand = BEAUTY_BRANDS.find((item) => item.id === brandSlug) || {
    id: brandSlug,
    name: product.brand_name,
    verified: true,
  };

  return {
    id: product.slug,
    slug: product.slug,
    name: product.label,
    image: product.image,
    price: product.price,
    price_min: product.price,
    currency_code: product.currency_code || 'LKR',
    unit: index % 5 === 0 ? 'Set' : 'Item',
    moq: index % 4 === 0 ? 2 : 1,
    minOrder: index % 4 === 0 ? 2 : 1,
    rating: product.rating,
    average_rating: product.rating,
    reviews_count: 32 + (index * 7),
    category: product.category,
    category_name: product.category?.label,
    supplier: {
      id: brand.id,
      slug: brand.id,
      name: brand.name,
      company_name: brand.name,
      location: 'Sri Lanka',
      verified: brand.verified,
    },
    supplier_id: brand.id,
    verified: brand.verified,
    featured: index < 6,
    is_original_brand: true,
    lead_time_days: [2, 3, 5, 7][index % 4],
    port: ['Colombo delivery', 'Islandwide delivery', 'Express delivery'][index % 3],
    supply_ability: 'Authentic beauty product',
    status: index < 6 ? 'featured' : 'active',
  };
});

const GENERATED_PRODUCTS = [];
let idCounter = 1001;

Object.entries(NAV_DROPDOWNS).forEach(([navGroup, data]) => {
  data.columns.forEach((column) => {
    column.sections.forEach((section) => {
      section.links.forEach((link) => {
        if (!link.href.startsWith('/products')) return;
        
        const queryParams = {};
        const queryStr = link.href.split('?')[1];
        if (queryStr) {
          queryStr.split('&').forEach((pair) => {
            const [k, v] = pair.split('=');
            if (k && v) {
              queryParams[decodeURIComponent(k)] = decodeURIComponent(v);
            }
          });
        }
        
        const catSlug = queryParams['category'] || '';
        const searchQ = queryParams['q'] || '';
        const sortParam = queryParams['sort'] || '';
        
        const targetCategory = SRI_LANKA_CATEGORIES.find(c => c.slug === catSlug) || { slug: catSlug || 'makeup', label: navGroup };
        
        const productLabels = [];
        if (searchQ) {
          const capitalizedQ = searchQ.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          productLabels.push(`${capitalizedQ} Cream`);
          productLabels.push(`Matte ${capitalizedQ}`);
        } else if (sortParam === 'new') {
          productLabels.push(`New Release ${link.label}`);
          productLabels.push(`Latest ${link.label} formulation`);
        } else if (sortParam === 'popular') {
          productLabels.push(`Best Selling ${link.label}`);
          productLabels.push(`Popular ${link.label} favorite`);
        } else {
          productLabels.push(`Premium ${link.label}`);
          productLabels.push(`Professional ${link.label}`);
        }
        
        productLabels.forEach((label, pIdx) => {
          const brand = BEAUTY_BRANDS[(idCounter + pIdx) % BEAUTY_BRANDS.length];
          const fullProductName = `${brand.name} ${label}`;
          
          const imageList = CATEGORY_IMAGES[catSlug] || CATEGORY_IMAGES['makeup'];
          const image = imageList[(idCounter + pIdx) % imageList.length];
          
          const price = 2500 + ((idCounter * 37) % 80) * 100;
          const rating = 4.4 + ((idCounter * 7) % 6) * 0.1;
          
          const slug = slugify(fullProductName) + '-' + idCounter;
          
          GENERATED_PRODUCTS.push({
            id: slug,
            slug: slug,
            name: fullProductName,
            image: image,
            price: price,
            price_min: price,
            currency_code: 'LKR',
            unit: 'Item',
            moq: 1,
            minOrder: 1,
            rating: parseFloat(rating.toFixed(1)),
            average_rating: parseFloat(rating.toFixed(1)),
            reviews_count: 15 + (idCounter % 50),
            category: { slug: targetCategory.slug, label: targetCategory.label },
            category_name: targetCategory.label,
            supplier: {
              id: brand.id,
              slug: brand.id,
              name: brand.name,
              company_name: brand.name,
              location: 'Sri Lanka',
              verified: brand.verified,
            },
            supplier_id: brand.id,
            verified: brand.verified,
            featured: idCounter % 5 === 0,
            is_original_brand: true,
            lead_time_days: 2 + (idCounter % 5),
            port: ['Colombo delivery', 'Islandwide delivery', 'Express delivery'][idCounter % 3],
            supply_ability: 'Authentic beauty product',
            status: 'active',
          });
          
          idCounter++;
        });
      });
    });
  });
});

// Keep product actions tied to records seeded in the backend catalogue. The
// generated navigation examples are useful for menu content, but they do not
// have product records and therefore cannot be added to an inquiry basket.
const BEAUTY_PRODUCTS = BASE_BEAUTY_PRODUCTS;

export default function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q        = searchParams.get('q')        || '';
  const category = searchParams.get('category') || '';
  const sort     = searchParams.get('sort')     || 'best';
  const page     = Number(searchParams.get('page') || 1);
  const urlPriceMin = searchParams.get('price_min') || '';
  const urlPriceMax = searchParams.get('price_max') || '';
  const urlMaxOrder = searchParams.get('max_order') || '';
  const supplierId = searchParams.get('supplier_id') || '';
  const verifiedSupplier = searchParams.get('verified_supplier') || '';
  const leadTimeMax = searchParams.get('lead_time_max') || '';
  const port = searchParams.get('port') || '';
  const productStatus = searchParams.get('status') || '';

  const [view,        setView]        = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* Filter state */
  const [keyword,     setKeyword]     = useState(q);
  const [selCat,      setSelCat]      = useState(category);
  const [priceMin,    setPriceMin]    = useState(urlPriceMin);
  const [priceMax,    setPriceMax]    = useState(urlPriceMax);
  const [maxOrder,    setMaxOrder]    = useState(urlMaxOrder);
  const [selSupplier, setSelSupplier] = useState(supplierId);
  const [selVerified, setSelVerified] = useState(verifiedSupplier);
  const [selLeadTime, setSelLeadTime] = useState(leadTimeMax);
  const [selPort,     setSelPort]     = useState(port);
  const [selStatus,   setSelStatus]   = useState(productStatus);
  const categories = categoryOptions;
  const suppliers = BEAUTY_BRANDS;

  const pushParams = (updates) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    if (!Object.prototype.hasOwnProperty.call(updates, 'page')) p.set('page', '1');
    router.push(`/products?${p.toString()}`);
  };

  const applyPriceFilter = () => {
    pushParams({ price_min: priceMin, price_max: priceMax });
  };

  const applyKeywordSearch = (event) => {
    event.preventDefault();
    pushParams({ q: keyword.trim() });
  };

  useEffect(() => {
    setKeyword(q);
    setSelCat(category);
    setPriceMin(urlPriceMin);
    setPriceMax(urlPriceMax);
    setMaxOrder(urlMaxOrder);
    setSelSupplier(supplierId);
    setSelVerified(verifiedSupplier);
    setSelLeadTime(leadTimeMax);
    setSelPort(port);
    setSelStatus(productStatus);
  }, [q, category, urlPriceMin, urlPriceMax, urlMaxOrder, supplierId, verifiedSupplier, leadTimeMax, port, productStatus]);

  const filteredProducts = useMemo(() => {
    const query = q.trim().toLowerCase();
    const min = Number(urlPriceMin);
    const max = Number(urlPriceMax);
    const maxOrderValue = Number(urlMaxOrder);
    const leadTimeValue = Number(leadTimeMax);

    const results = BEAUTY_PRODUCTS.filter((product) => {
      const matchesQuery = !query || [
        product.name,
        product.category?.label,
        product.brand_name,
        product.supplier?.name,
      ].filter(Boolean).join(' ').toLowerCase().includes(query);
      const matchesCategory = !category || product.category?.slug === category;
      const matchesPriceMin = !urlPriceMin || product.price >= min;
      const matchesPriceMax = !urlPriceMax || product.price <= max;
      const matchesQuantity = !urlMaxOrder || product.minOrder <= maxOrderValue;
      const matchesSupplier = !supplierId || String(product.supplier_id) === String(supplierId);
      const matchesVerified = !verifiedSupplier || product.verified;
      const matchesLeadTime = !leadTimeMax || Number(product.lead_time_days || 0) <= leadTimeValue;
      const matchesFulfilment = !port || String(product.port || '').toLowerCase().includes(port.toLowerCase());
      const matchesStatus = !productStatus
        || (productStatus === 'original' && product.is_original_brand)
        || product.status === productStatus
        || (productStatus === 'active' && ['active', 'featured'].includes(product.status));

      return matchesQuery
        && matchesCategory
        && matchesPriceMin
        && matchesPriceMax
        && matchesQuantity
        && matchesSupplier
        && matchesVerified
        && matchesLeadTime
        && matchesFulfilment
        && matchesStatus;
    });

    return [...results].sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'top') return b.rating - a.rating;
      if (sort === 'newest') return BEAUTY_PRODUCTS.indexOf(b) - BEAUTY_PRODUCTS.indexOf(a);
      return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
    });
  }, [category, leadTimeMax, port, productStatus, q, sort, supplierId, urlMaxOrder, urlPriceMax, urlPriceMin, verifiedSupplier]);

  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const products = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const clearFilters = () => {
    setSelCat('');
    setPriceMin('');
    setPriceMax('');
    setMaxOrder('');
    setSelSupplier('');
    setSelVerified('');
    setSelLeadTime('');
    setSelPort('');
    setSelStatus('');
    router.push('/products');
  };

  const selectedCategoryLabel = categories.find(c => c.slug === selCat)?.label || selCat;
  const selectedSupplierLabel = suppliers.find(supplier => String(supplier.id) === String(selSupplier))?.name || 'Selected brand';
  const selectedLeadTimeLabel = LEAD_TIME_OPTIONS.find(option => option.value === selLeadTime)?.label;
  const selectedPortLabel = PORT_OPTIONS.find(option => option.value === selPort)?.label || selPort;
  const selectedStatusLabel = STATUS_OPTIONS.find(option => option.value === selStatus)?.label || selStatus;
  const hasFilters = q || category || urlPriceMin || urlPriceMax || urlMaxOrder || supplierId || verifiedSupplier || leadTimeMax || port || productStatus;

  /* ── Filter sidebar content ─────────────────────────── */
  const FilterContent = () => (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-sm text-gray-800">Beauty filters</h3>
        {hasFilters && (
          <button onClick={clearFilters} className="flex flex-shrink-0 items-center gap-0.5 text-xs text-primary-700 hover:underline">
            <X size={11} /> Clear All
          </button>
        )}
      </div>

      {/* Brand */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Brand or seller</div>
        <select
          value={selSupplier}
          onChange={(event) => {
            setSelSupplier(event.target.value);
            pushParams({ supplier_id: event.target.value });
          }}
          className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-700 bg-white outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
        >
          <option value="">All brands</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}{supplier.verified ? ' - Verified' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Verified brand */}
      <label className="flex items-start gap-2 rounded-lg border border-primary-100 bg-primary-50/70 px-3 py-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={selVerified === '1'}
          onChange={(event) => {
            const value = event.target.checked ? '1' : '';
            setSelVerified(value);
            pushParams({ verified_supplier: value });
          }}
          className="mt-0.5 accent-primary-700 w-3.5 h-3.5"
        />
        <span>
          <span className="flex items-center gap-1 text-[13px] font-semibold text-primary-900">
            <ShieldCheck size={13} /> Verified brands only
          </span>
          <span className="block text-[11px] leading-snug text-primary-700 mt-0.5">
            Show original beauty brands and approved sellers first.
          </span>
        </span>
      </label>

      {/* Category */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</div>
        <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
          <button
            onClick={() => { setSelCat(''); pushParams({ category: '' }); }}
            className={`w-full text-left text-[13px] px-2 py-1.5 rounded-lg transition-colors ${!selCat ? 'bg-primary-50 text-primary-800 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => { setSelCat(c.slug); pushParams({ category: c.slug }); }}
              className={`w-full text-left text-[13px] px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${selCat === c.slug ? 'bg-primary-50 text-primary-800 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="line-clamp-1 flex-1">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Min Order */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quantity</div>
        <div className="space-y-0.5">
          {MIN_ORDER_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="minOrder"
                value={opt.value}
                checked={maxOrder === opt.value}
                onChange={() => {
                  setMaxOrder(opt.value);
                  pushParams({ max_order: opt.value });
                }}
                className="accent-primary-700 w-3.5 h-3.5"
              />
              <span className="text-[13px] text-gray-600">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price</div>
        <div className="flex items-center gap-1.5 mb-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
          />
          <span className="text-gray-300 flex-shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
          />
        </div>
        <button
          onClick={applyPriceFilter}
          className="w-full py-1.5 bg-gradient-to-r from-primary-800 to-rose-500 hover:from-primary-900 hover:to-rose-600 text-white text-xs font-semibold rounded-lg transition duration-200 shadow-sm border-0 antialiased"
        >
          Apply Price
        </button>
      </div>

      {/* Lead time */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery time</div>
        <select
          value={selLeadTime}
          onChange={(event) => {
            setSelLeadTime(event.target.value);
            pushParams({ lead_time_max: event.target.value });
          }}
          className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-700 bg-white outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
        >
          {LEAD_TIME_OPTIONS.map((option) => (
            <option key={option.value || 'any'} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Fulfilment */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fulfilment</div>
        <select
          value={selPort}
          onChange={(event) => {
            setSelPort(event.target.value);
            pushParams({ port: event.target.value });
          }}
          className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-700 bg-white outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
        >
          {PORT_OPTIONS.map((option) => (
            <option key={option.value || 'any'} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Product status */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Listing type</div>
        <select
          value={selStatus}
          onChange={(event) => {
            setSelStatus(event.target.value);
            pushParams({ status: event.target.value });
          }}
          className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-700 bg-white outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

    </div>
  );

  return (
    <div className="min-w-0">
      {/* Breadcrumb */}
      <div className="mb-3 flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-gray-400 sm:mb-4 sm:text-sm">
        <Link href="/" className="hover:text-primary-700 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-700">Products</span>
        {selCat && (
          <>
            <span>/</span>
            <span className="text-gray-700">{categories.find(c => c.slug === selCat)?.label || selCat}</span>
          </>
        )}
        {q && (
          <>
            <span>/</span>
            <span className="text-gray-700">&quot;{q}&quot;</span>
          </>
        )}
      </div>

      <section className="mb-4 rounded-xl border border-gray-100 bg-gradient-to-br from-white via-white to-pink-50/20 p-3.5 shadow-sm sm:mb-5 sm:p-5 relative overflow-hidden after:absolute after:top-0 after:left-0 after:h-[3px] after:w-full after:bg-gradient-to-r after:from-primary-800 after:to-rose-500">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">SL Beauty products</p>
            <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">Shop authentic beauty products</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Discover makeup, skincare, fragrance, hair care, bath and body essentials, beauty tools, and gift sets.
            </p>
          </div>
          <form onSubmit={applyKeywordSearch} className="flex w-full min-w-0 flex-col gap-2 sm:flex-row lg:max-w-xl">
            <div className="relative flex-1 min-w-0">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search lipstick, serum, perfume, sunscreen..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-primary-800 to-rose-500 hover:from-primary-900 hover:to-rose-600 text-sm font-semibold text-white transition duration-200 shadow-sm hover:shadow-md active:scale-[0.98] sm:flex-shrink-0 border-0 antialiased"
            >
              Search products
            </button>
          </form>
        </div>
      </section>

      <div className="flex min-w-0 gap-5">
        {/* ── Desktop filter sidebar ── */}
        <aside className="hidden lg:block flex-shrink-0 w-64">
          <div className="sticky top-20 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <FilterContent />
          </div>
        </aside>

        {/* ── Mobile filter drawer ── */}
        {filtersOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
            <div className="relative flex h-full w-[min(22rem,calc(100vw-2rem))] flex-col bg-white shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <h3 className="font-bold text-gray-800">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <FilterContent />
              </div>
              <div className="border-t border-gray-100 p-4">
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-primary-800 to-rose-500 hover:from-primary-900 hover:to-rose-600 text-white text-sm font-semibold rounded-xl transition duration-200 shadow-sm border-0 antialiased"
                >
                  Show Results ({total})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm transition-colors hover:border-gray-300 lg:hidden"
              >
                <SlidersHorizontal size={14} /> Filters
                {hasFilters && <span className="w-2 h-2 rounded-full bg-accent-500 flex-shrink-0" />}
              </button>

              {q && (
                <div className="flex min-w-0 max-w-full items-center gap-1 rounded-lg border border-primary-100 bg-primary-50 px-3 py-1.5 text-sm text-primary-800">
                  <Search size={13} />
                  <span className="font-medium truncate">&quot;{q}&quot;</span>
                </div>
              )}

              {total > 0 && (
                <span className="text-sm text-gray-500">
                  <strong className="text-gray-800">{total.toLocaleString()}</strong> products found
                </span>
              )}
            </div>

            <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
              {/* Sort */}
              <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:flex-none">
                <span className="text-xs text-gray-500 hidden sm:block">Sort by:</span>
                <div className="relative min-w-0 flex-1 sm:flex-none">
                  <select
                    value={sort}
                    onChange={(e) => pushParams({ sort: e.target.value })}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-7 text-sm text-gray-700 shadow-sm outline-none hover:border-gray-300 cursor-pointer sm:w-auto"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* View toggle */}
              <div className="flex flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <button
                  onClick={() => setView('grid')}
                  className={`p-1.5 transition-all ${view === 'grid' ? 'bg-gradient-to-r from-primary-800 to-rose-500 text-white font-medium' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                  title="Grid view"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 transition-all ${view === 'list' ? 'bg-gradient-to-r from-primary-800 to-rose-500 text-white font-medium' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                  title="List view"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Active filters chips */}
          {hasFilters && (
            <div className="mb-4 flex min-w-0 flex-wrap gap-2">
              {q && (
                <span className="flex max-w-full items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800">
                  <span className="truncate">Search: {q}</span>
                  <button onClick={() => { setKeyword(''); pushParams({ q: '' }); }} aria-label="Remove search filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {selCat && (
                <span className="flex max-w-full items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800">
                  <span className="truncate">Category: {selectedCategoryLabel}</span>
                  <button onClick={() => { setSelCat(''); pushParams({ category: '' }); }} aria-label="Remove category filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {selSupplier && (
                <span className="flex max-w-full items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800">
                  <span className="truncate">Brand: {selectedSupplierLabel}</span>
                  <button onClick={() => { setSelSupplier(''); pushParams({ supplier_id: '' }); }} aria-label="Remove brand filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {selVerified && (
                <span className="flex items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800">
                  Verified brands
                  <button onClick={() => { setSelVerified(''); pushParams({ verified_supplier: '' }); }} aria-label="Remove verified brand filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {(priceMin || priceMax) && (
                <span className="flex items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800">
                  Price: {priceMin || '0'}–{priceMax || '∞'}
                  <button onClick={() => { setPriceMin(''); setPriceMax(''); pushParams({ price_min: '', price_max: '' }); }} aria-label="Remove price filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {maxOrder && (
                <span className="flex items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800">
                  Quantity up to {maxOrder}
                  <button onClick={() => { setMaxOrder(''); pushParams({ max_order: '' }); }} aria-label="Remove quantity filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {selLeadTime && (
                <span className="flex items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800">
                  {selectedLeadTimeLabel}
                  <button onClick={() => { setSelLeadTime(''); pushParams({ lead_time_max: '' }); }} aria-label="Remove lead time filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {selPort && (
                <span className="flex max-w-full items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800">
                  <span className="truncate">Fulfilment: {selectedPortLabel}</span>
                  <button onClick={() => { setSelPort(''); pushParams({ port: '' }); }} aria-label="Remove port filter">
                    <X size={11} />
                  </button>
                </span>
              )}
              {selStatus && (
                <span className="flex max-w-full items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800">
                  <span className="truncate">{selectedStatusLabel}</span>
                  <button onClick={() => { setSelStatus(''); pushParams({ status: '' }); }} aria-label="Remove listing type filter">
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Products grid / list */}
          {products.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-sm text-gray-400 mb-4">Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="px-6 py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className={view === 'grid'
                ? 'grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'
                : 'space-y-3 sm:space-y-4'
              }>
                {products.map((p) => (
                  <B2BProductCard key={p.id} product={p} viewMode={view} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => pushParams({ page: String(p) })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
