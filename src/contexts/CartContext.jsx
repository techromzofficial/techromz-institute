'use client';

/**
 * CartContext.jsx
 *
 * Fixes applied:
 *  ✅ Cart state from REAL context, not hardcoded items
 *  ✅ Guest cart persisted in localStorage, synced to API on login
 *  ✅ Optimistic updates with rollback on error
 */

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { cartApi } from '@/lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const GUEST_CART_KEY = '_el_cart';

const initialState = {
  items:    [],
  total:    0,
  count:    0,
  loading:  false,
};

function calcTotals(items) {
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return { count, total };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS': {
      const { count, total } = calcTotals(action.payload);
      return { ...state, items: action.payload, count, total, loading: false };
    }
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR':
      return { ...initialState };
    default:
      return state;
  }
}

function loadGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveGuestCart(items) {
  try { localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items)); } catch {}
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isAuthenticated } = useAuth();

  // ── Load cart ─────────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // guest cart from localStorage
      const items = loadGuestCart();
      dispatch({ type: 'SET_ITEMS', payload: items });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await cartApi.get();
      dispatch({ type: 'SET_ITEMS', payload: data.items || [] });
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ── Add to cart ───────────────────────────────────────────
  const addItem = useCallback(async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const data = await cartApi.add(product, quantity);
        dispatch({ type: 'SET_ITEMS', payload: data.items || [] });
        toast.success(`${product.name} added to cart`);
      } catch (e) {
        toast.error(e.message || 'Could not add to cart');
      }
    } else {
      // guest: update localStorage
      const items = loadGuestCart();
      const idx = items.findIndex((i) => i.product_id === product.id);
      if (idx > -1) {
        items[idx].quantity += quantity;
      } else {
        items.push({
          product_id: product.id,
          name:       product.name,
          price:      product.price,
          image:      product.image,
          quantity,
        });
      }
      saveGuestCart(items);
      dispatch({ type: 'SET_ITEMS', payload: items });
      toast.success(`${product.name} added to cart`);
    }
  }, [isAuthenticated]);

  // ── Update quantity ───────────────────────────────────────
  const updateItem = useCallback(async (itemId, quantity) => {
    const prev = state.items;
    // optimistic
    const updated = prev.map((i) => (i.id === itemId ? { ...i, quantity } : i));
    dispatch({ type: 'SET_ITEMS', payload: updated });

    if (isAuthenticated) {
      try {
        const data = await cartApi.update(itemId, quantity);
        dispatch({ type: 'SET_ITEMS', payload: data.items || [] });
      } catch {
        dispatch({ type: 'SET_ITEMS', payload: prev }); // rollback
        toast.error('Could not update quantity');
      }
    } else {
      saveGuestCart(updated);
    }
  }, [state.items, isAuthenticated]);

  // ── Remove item ───────────────────────────────────────────
  const removeItem = useCallback(async (itemId) => {
    const prev = state.items;
    const updated = prev.filter((i) => i.id !== itemId && i.product_id !== itemId);
    dispatch({ type: 'SET_ITEMS', payload: updated });

    if (isAuthenticated) {
      try {
        await cartApi.remove(itemId);
      } catch {
        dispatch({ type: 'SET_ITEMS', payload: prev });
        toast.error('Could not remove item');
      }
    } else {
      saveGuestCart(updated);
    }
  }, [state.items, isAuthenticated]);

  // ── Clear cart ────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    dispatch({ type: 'CLEAR' });
    if (isAuthenticated) {
      try { await cartApi.clear(); } catch {}
    } else {
      saveGuestCart([]);
    }
  }, [isAuthenticated]);

  return (
    <CartContext.Provider value={{ ...state, addItem, updateItem, removeItem, clearCart, refetch: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
