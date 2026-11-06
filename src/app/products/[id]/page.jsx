'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Star, BadgeCheck, MapPin, Package, Send, Share2, ChevronLeft, MessageCircle, ShoppingBag } from 'lucide-react';
import { conversationsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, starRating } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';
import WishlistButton from '@/components/product/WishlistButton';
import { loginUrlFor } from '@/lib/authRedirect';
import toast from 'react-hot-toast';
import { TRENDING_PRODUCTS } from '@/lib/constants';

const slugify = (value = '') => String(value)
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const productPrimaryActionClass = 'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

function productCardFromConstant(item) {
  return {
    id: item.slug,
    slug: item.slug,
    name: item.label,
    image: item.image,
    price: item.price,
    moqUnit: 'Item',
    minOrder: 1,
    rating: item.rating,
    reviews: 24,
    supplier: { name: item.brand_name, company_name: item.brand_name, verified: true },
    verified: true,
  };
}

function buildBeautyProductDetail(slug) {
  const numericIndex = Number(slug);
  const source = Number.isInteger(numericIndex) && numericIndex > 0
    ? TRENDING_PRODUCTS[numericIndex - 1]
    : TRENDING_PRODUCTS.find((item) => item.slug === slug);
  if (!source) return null;

  return {
    ...productCardFromConstant(source),
    description: `${source.label} from ${source.brand_name}, selected for SL Beauty shoppers seeking authentic beauty products from verified brands and sellers.`,
    images: [source.image],
    category: source.category,
    supplier_id: slugify(source.brand_name),
    supplier: {
      id: slugify(source.brand_name),
      name: source.brand_name,
      company_name: source.brand_name,
      location: 'Sri Lanka',
      verified: true,
      rating: source.rating,
    },
    packaging_details: 'Retail-ready beauty packaging',
    supply_ability: 'Available from verified beauty sellers',
    lead_time: '2-7 days',
    fulfilment: 'Islandwide delivery',
    related_products: TRENDING_PRODUCTS
      .filter((item) => item.slug !== slug)
      .slice(0, 4)
      .map(productCardFromConstant),
  };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, isBuyer } = useAuth();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const product = buildBeautyProductDetail(id);

  if (!product) {
    return (
      <>
        <Header />
        <div className="p-20 text-center">
          <h1 className="text-lg font-semibold text-gray-700">Product not found</h1>
          <p className="mt-2 text-sm text-gray-400">This product is unavailable or no longer active.</p>
        </div>
        <Footer />
      </>
    );
  }

  const stars = starRating(product.rating || 0);
  const images = product.images?.length ? product.images : [product.image];
  const brand = product.supplier;
  const specificationRows = [
    ['Packaging', product.packaging_details],
    ['Availability', product.supply_ability],
    ['Quantity', `${product.minOrder} ${product.moqUnit}`],
    ['Unit', product.moqUnit],
  ];

  const handleChat = async () => {
    if (!isAuthenticated) {
      router.push(loginUrlFor(`/products/${id}`));
      return;
    }
    if (!isBuyer) {
      toast.error('Only shopper accounts can start brand conversations.');
      return;
    }
    try {
      const response = await conversationsApi.create({ supplier_id: product.supplier_id });
      const conversationId = response?.conversation?.id;
      router.push(conversationId ? `/messages?id=${conversationId}` : '/messages');
    } catch (chatError) {
      toast.error(chatError.message || 'Could not start this conversation.');
    }
  };

  const handleBuyNow = () => {
    const quantity = Math.max(product.minOrder || 1, Number(qty) || 1);
    const backendSlug = slugify(product.name);
    const checkoutProduct = {
      id: product.id,
      slug: product.slug,
      product_slug: backendSlug,
      backendSlug,
      name: product.name,
      image: images[activeImg],
      price: product.price,
      moqUnit: product.moqUnit,
      categorySlug: product.category?.slug,
      categoryName: product.category?.label || product.category?.name,
      brandName: brand?.name || product.supplier?.name || 'SL Beauty Brand',
      sellerName: product.supplier?.company_name || product.supplier?.name || 'Verified SL Beauty Seller',
      productPath: `/products/${id}`,
    };

    setBuyNowLoading(true);
    sessionStorage.setItem('slb_checkout_item', JSON.stringify({ product: checkoutProduct, quantity }));
    router.push('/checkout');
  };

  const handleOpenInquiry = () => {
    const params = new URLSearchParams({
      productId: String(product.id),
      productName: product.name,
      supplierName: brand?.company_name || brand?.name || 'Supplier',
      image: images[activeImg],
      qty: String(Math.max(product.minOrder || 1, Number(qty) || 1)),
    });

    router.push(`/inquiry/create?${params.toString()}`);
  };

  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="text-sm text-gray-400 mb-4 flex items-center gap-1.5">
          <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-primary-700">
            <ChevronLeft size={14} /> Back
          </button>
          <span>/</span>
          <Link href="/products" className="hover:text-primary-700">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <a href={`/categories/${product.category.slug}`} className="hover:text-primary-700">{product.category.label}</a>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden aspect-square mb-3">
              <Image
                src={images[activeImg]}
                alt={product.name}
                width={600}
                height={600}
                unoptimized
                className="w-full h-full object-contain p-4"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-primary-700' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Image src={img} alt="" width={64} height={64} unoptimized className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              {product.verified && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 font-medium px-2 py-0.5 rounded-full mb-2">
                  <BadgeCheck size={12} /> Verified Brand
                </span>
              )}
              <h1 className="text-2xl font-semibold leading-tight text-gray-950 sm:text-3xl lg:text-[34px]">{product.name}</h1>
            </div>

            {product.rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {stars.map((type, i) => (
                    <Star
                      key={`${type}-${i}`}
                      size={14}
                      className={type === 'full' ? 'fill-amber-400 text-amber-400' : type === 'half' ? 'fill-amber-200 text-amber-400' : 'fill-gray-100 text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                <span className="text-sm text-gray-400">({product.reviews?.toLocaleString()} reviews)</span>
              </div>
            )}

            <div className="bg-primary-50 rounded-xl p-4">
              <div className="text-3xl font-bold leading-tight text-primary-800 sm:text-[34px]">
                {formatCurrency(product.price)}
                <span className="text-base font-normal text-gray-500 ml-1">/ {product.moqUnit}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <Package size={13} />
                Quantity: {product.minOrder} {product.moqUnit}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity ({product.moqUnit})</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQty(Math.max(product.minOrder || 1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg">-</button>
                  <input
                    type="number"
                    value={qty}
                    onChange={(event) => setQty(Math.max(1, Number(event.target.value)))}
                    min={product.minOrder || 1}
                    className="w-20 h-10 text-center text-sm font-medium outline-none border-x border-gray-200"
                  />
                  <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg">+</button>
                </div>
                <span className="text-sm text-gray-400">Estimated: {formatCurrency(product.price * qty)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={buyNowLoading || qty < (product.minOrder || 1)}
                className={productPrimaryActionClass}
              >
                {buyNowLoading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                ) : (
                  <ShoppingBag size={17} />
                )}
                {buyNowLoading ? 'Opening Checkout...' : 'Buy Now'}
              </button>
              <button
                type="button"
                onClick={handleOpenInquiry}
                className={productPrimaryActionClass}
              >
                <MessageCircle size={16} aria-hidden="true" />
                <span>Send Inquiry</span>
              </button>
              <button
                type="button"
                onClick={handleChat}
                className={productPrimaryActionClass}
              >
                <Send size={16} /> Contact Seller
              </button>
            </div>
            <div className="flex gap-2">
              <WishlistButton productId={product.id} showLabel className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1.5" />
              <button type="button" onClick={handleChat} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
                <MessageCircle size={14} /> Chat Seller
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
                <Share2 size={14} /> Share
              </button>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-sm text-gray-800">{brand.name}</div>
                  {brand.location && (
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {brand.location}
                    </div>
                  )}
                </div>
                {brand.verified && <BadgeCheck size={18} className="text-primary-700" />}
              </div>
              {brand.rating > 0 && (
                <div className="text-xs text-gray-500 mb-2">
                  Brand rating: {brand.rating.toFixed(1)}
                </div>
              )}
              <Link href="/brands" className="text-xs text-primary-700 hover:underline">
                Browse Brand Directory →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="flex border-b border-gray-100">
            {['description', 'specifications', 'delivery'].map((tabName) => (
              <button
                key={tabName}
                onClick={() => setTab(tabName)}
                className={`px-6 py-3.5 text-sm font-medium capitalize transition-colors border-b-2 ${tab === tabName ? 'border-primary-700 text-primary-800 bg-primary-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tabName}
              </button>
            ))}
          </div>
          <div className="p-6">
            {tab === 'description' && (
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            )}
            {tab === 'specifications' && (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {specificationRows.map(([label, value]) => (
                    <tr key={label}>
                      <td className="py-2.5 pr-4 font-medium text-gray-500 w-40">{label}</td>
                      <td className="py-2.5 text-gray-800">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'delivery' && (
              <div className="space-y-3 text-sm text-gray-600">
                <p><strong>Fulfilment:</strong> {product.fulfilment}</p>
                <p><strong>Delivery time:</strong> {product.lead_time}</p>
                <p><strong>Packaging:</strong> {product.packaging_details}</p>
                <p><strong>Availability:</strong> {product.supply_ability}</p>
                <p>Contact the seller for shade, size, stock, and delivery questions.</p>
              </div>
            )}
          </div>
        </div>

        {product.related_products.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {product.related_products.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id || relatedProduct.slug} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
