'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { wishlistApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { syncWishlistItems } from '@/components/product/WishlistButton';

function validWishlistItems(items) {
  return Array.isArray(items)
    ? items.filter((wishlist) => wishlist?.id && wishlist?.product?.id)
    : [];
}

export default function WishlistPage() {
  const { addItem } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await wishlistApi.get();
        setItems(validWishlistItems(data.items));
        syncWishlistItems(data);
      } catch (loadError) {
        setItems([]);
        setError(loadError.message || 'Could not load your wishlist.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reloadKey]);

  const remove = async (wishlistId) => {
    const previousItems = items;
    setItems((current) => current.filter((wishlist) => wishlist.id !== wishlistId));

    try {
      const response = await wishlistApi.remove(wishlistId);
      syncWishlistItems(response);
      toast.success('Removed from wishlist');
    } catch (error) {
      setItems(previousItems);
      toast.error(error.message || 'Could not remove this wishlist item.');
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-800 mb-1">My Wishlist</h1>
        <p className="text-sm text-gray-400 mb-6">Products you have saved for later</p>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Heart size={48} className="text-gray-200 mx-auto mb-3" />
            <h2 className="text-gray-600 font-medium">Wishlist could not be loaded</h2>
            <p className="text-sm text-gray-400 mt-1 mb-4">{error}</p>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="px-5 py-2 bg-primary-800 text-white text-sm font-semibold rounded-lg">
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Heart size={48} className="text-gray-200 mx-auto mb-3" />
            <h2 className="text-gray-500 font-medium">Your wishlist is empty</h2>
            <Link href="/products" className="mt-3 inline-block text-sm text-primary-700 hover:underline">
              Browse Products →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {items.map((wishlist) => (
              <div key={wishlist.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 hover-lift relative group">
                <button
                  onClick={() => remove(wishlist.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 z-10 shadow-sm"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={13} />
                </button>
                <Link href={`/products/${wishlist.product.id}`}>
                  <Image
                    src={wishlist.product.featured_image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'}
                    alt={wishlist.product.name}
                    width={160}
                    height={160}
                    unoptimized
                    className="w-full aspect-square object-cover rounded-lg mb-2"
                  />
                  <div className="text-sm font-medium text-gray-700 line-clamp-2">{wishlist.product.name}</div>
                  <div className="text-primary-700 font-bold text-sm mt-1">{formatCurrency(wishlist.product.price)}</div>
                </Link>
                <button
                  onClick={() => addItem(wishlist.product)}
                  className="mt-2 w-full py-1.5 bg-gradient-to-r from-primary-800 to-rose-500 hover:from-primary-900 hover:to-rose-600 text-white text-xs font-semibold rounded-lg transition duration-200 shadow-sm border-0 antialiased"
                >
                  Add to Basket
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
