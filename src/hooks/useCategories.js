'use client';

import { useCallback, useEffect, useState } from 'react';
import { categoriesApi } from '@/lib/api';
import { normalizeCategories } from '@/lib/products';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await categoriesApi.list();
        if (!cancelled) setCategories(normalizeCategories(response));
      } catch (loadError) {
        if (!cancelled) {
          setCategories([]);
          setError(loadError.message || 'Could not load categories.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const retry = useCallback(() => setReloadKey((value) => value + 1), []);

  return { categories, loading, error, retry };
}
