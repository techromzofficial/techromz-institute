'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { wishlistApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { loginUrlFor } from '@/lib/authRedirect';

let wishlistPromise;
let wishlistRecords = new Map();
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener(new Map(wishlistRecords)));
}

export function syncWishlistItems(response) {
  const items = Array.isArray(response?.items) ? response.items : [];
  wishlistRecords = new Map(
    items.filter((item) => item?.product?.id)
      .map((item) => [Number(item.product.id), item.id]),
  );
  notify();
}

async function loadWishlist() {
  if (!wishlistPromise) {
    wishlistPromise = wishlistApi.get()
      .then((response) => {
        syncWishlistItems(response);
        return wishlistRecords;
      })
      .catch((error) => {
        wishlistPromise = null;
        throw error;
      });
  }
  return wishlistPromise;
}

export default function WishlistButton({ productId, className = '', showLabel = false }) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [records, setRecords] = useState(wishlistRecords);
  const [saving, setSaving] = useState(false);
  const wishlistId = records.get(Number(productId));
  const saved = Boolean(wishlistId);

  useEffect(() => {
    listeners.add(setRecords);
    if (isAuthenticated) {
      loadWishlist().catch(() => {});
    } else {
      wishlistPromise = undefined;
      wishlistRecords = new Map();
      notify();
    }
    return () => listeners.delete(setRecords);
  }, [isAuthenticated]);

  const toggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (saving || authLoading) return;

    if (!isAuthenticated) {
      const returnUrl = `${window.location.pathname}${window.location.search}`;
      router.push(loginUrlFor(returnUrl));
      return;
    }

    const previous = new Map(wishlistRecords);
    const optimistic = new Map(previous);
    if (saved) optimistic.delete(Number(productId));
    else optimistic.set(Number(productId), `pending-${productId}`);
    wishlistRecords = optimistic;
    notify();
    setSaving(true);

    try {
      const response = saved
        ? await wishlistApi.remove(wishlistId)
        : await wishlistApi.add(productId);
      syncWishlistItems(response);
      toast.success(saved ? 'Removed from wishlist.' : 'Added to wishlist.');
    } catch (error) {
      wishlistRecords = previous;
      notify();
      toast.error(error.message || 'Could not update wishlist.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={saved}
      className={className}
    >
      <Heart size={showLabel ? 14 : 13} className={saved ? 'fill-red-500 text-red-500' : ''} />
      {showLabel && (saved ? 'Saved' : 'Wishlist')}
    </button>
  );
}
