/**
 * utils.js — shared utility helpers
 */

/**
 * Merge class names, filtering falsy values.
 * Lightweight replacement for clsx.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/** Format currency as USD (or LKR if needed) */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format large numbers: 12400 → "12.4K", 1200000 → "1.2M" */
export function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** Truncate a string with an ellipsis */
export function truncate(str, maxLen = 80) {
  if (!str) return '';
  return str.length <= maxLen ? str : str.slice(0, maxLen).trimEnd() + '…';
}

/** Slugify a string */
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Render star rating as an array e.g. 4.5 → [1,1,1,1,0.5] */
export function starRating(rating, max = 5) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = max - full - half;
  return [
    ...Array(full).fill('full'),
    ...Array(half).fill('half'),
    ...Array(empty).fill('empty'),
  ];
}

/** Build a query string from an object, filtering empty values */
export function buildQS(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  return qs.toString();
}

/** Debounce a function */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Get initials from a name */
export function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Safe JSON parse — returns null instead of throwing */
export function safeJsonParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}
