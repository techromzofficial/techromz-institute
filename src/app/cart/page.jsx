'use client';

/**
 * app/cart/page.jsx
 *
 * Fix: Cart now reads from CartContext (real state), not hardcoded items.
 */

import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBasket, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CartPage() {
  // ✅ FIX: reading from real CartContext, not hardcoded basket
  const { items, total, count, loading, updateItem, removeItem, clearCart } = useCart();

  if (loading) {
    return (
      <>
        <Header />
        <LoadingSpinner label="Loading your basket…" />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">
            Inquiry Basket
            {count > 0 && <span className="ml-2 text-sm font-normal text-gray-400">({count} items)</span>}
          </h1>
          {items.length > 0 && (
            <button onClick={clearCart} className="text-sm text-red-500 hover:underline flex items-center gap-1">
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <ShoppingBasket size={56} className="text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-500">Your basket is empty</h2>
            <p className="text-sm text-gray-400 mt-1 mb-6">
              Browse products and add them to get quotes from suppliers.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-800 text-white rounded-full text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Browse Products <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Items list */}
            <div className="flex-1 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id || item.product_id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4 items-start"
                >
                  <Image
                    src={item.image || `https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80`}
                    alt={item.name}
                    width={80}
                    height={80}
                    unoptimized
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-800 line-clamp-2">{item.name}</h3>
                    <div className="text-primary-800 font-semibold text-base mt-1">
                      {formatCurrency(item.price)}
                      <span className="text-gray-400 text-xs font-normal ml-0.5">/{item.moqUnit || 'unit'}</span>
                    </div>
                    {item.supplier && (
                      <div className="text-xs text-gray-400 mt-0.5">{item.supplier}</div>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateItem(item.id || item.product_id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id || item.product_id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                    <button
                      onClick={() => removeItem(item.id || item.product_id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary panel */}
            <aside className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-20">
                <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{count} {count === 1 ? 'item' : 'items'}</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Estimated Shipping</span>
                    <span>TBD</span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Link
                  href="/rfq"
                  className="mt-5 block w-full py-3 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold text-center rounded-xl transition-colors"
                >
                  Request Quotation
                </Link>
                <Link
                  href="/products"
                  className="mt-2 block w-full py-2.5 border border-gray-200 text-gray-600 text-sm font-medium text-center rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Continue Browsing
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
