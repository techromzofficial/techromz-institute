import Cookies from 'js-cookie';
import { loginUrlFor } from '../authRedirect';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  '/api';

if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_BASE_URL) {
  console.warn('NEXT_PUBLIC_API_BASE_URL is not set; using the same-origin /api proxy.');
}

const COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE || '_el_tok';
const PUBLIC_AUTH_ENDPOINTS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/logout',
]);

let sessionRedirectStarted = false;

export class ApiError extends Error {
  constructor(message, { status = 0, category = 'UNKNOWN', data = null, errors = {}, referenceId = null, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'ApiError';
    this.status = status;
    this.category = category;
    this.data = data;
    this.errors = errors;
    this.referenceId = referenceId;
  }
}

function errorCategory(status) {
  if (status === 401) return 'AUTH_REQUIRED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 422) return 'VALIDATION_ERROR';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'API_UNAVAILABLE';
  return 'REQUEST_FAILED';
}

export function withQuery(endpoint, params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          query.append(key, String(item));
        }
      });
      return;
    }

    query.append(key, String(value));
  });

  const qs = query.toString();
  return `${endpoint}${qs ? `?${qs}` : ''}`;
}

export function uploadFormData(file, category) {
  const formData = new FormData();
  formData.append('file', file);

  if (category) {
    formData.append('category', category);
  }

  return formData;
}

function handleUnauthorized(endpoint, hadToken) {
  if (
    typeof window === 'undefined' ||
    !hadToken ||
    PUBLIC_AUTH_ENDPOINTS.has(endpoint) ||
    sessionRedirectStarted
  ) {
    return;
  }

  sessionRedirectStarted = true;
  clearAuthToken();
  window.dispatchEvent(new Event('auth:session-expired'));

  const returnUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(loginUrlFor(returnUrl, 'session_expired'));
}

export async function request(endpoint, options = {}) {
  const { params, ...fetchOptions } = options;
  const requestEndpoint = params ? withQuery(endpoint, params) : endpoint;
  const url = `${API_BASE}${requestEndpoint}`;
  const token = typeof window !== 'undefined' ? Cookies.get(COOKIE_NAME) : null;

  const headers = {
    Accept: 'application/json',
    ...(fetchOptions.body && !(fetchOptions.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;

  try {
    response = await fetch(url, {
      ...fetchOptions,
      credentials: fetchOptions.credentials ?? 'include',
      headers,
      signal: fetchOptions.signal || AbortSignal.timeout(fetchOptions.timeout ?? 30000),
    });
  } catch (cause) {
    const timedOut = cause?.name === 'TimeoutError' || cause?.name === 'AbortError';
    throw new ApiError(
      timedOut ? 'The request timed out.' : 'Network error — please check your connection.',
      { category: timedOut ? 'TIMEOUT' : 'NETWORK_FAILURE', cause },
    );
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (response.ok && fetchOptions.responseType === 'blob') {
    return response.blob();
  }

  let data = null;
  if (isJson) {
    try {
      data = await response.json();
    } catch {
      throw new ApiError('Server returned malformed JSON.', {
        status: response.status,
        category: 'MALFORMED_RESPONSE',
        referenceId: response.headers.get('X-Request-Id'),
      });
    }
  } else {
    const text = await response.text().catch(() => '');

    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}.`, {
        status: response.status,
        category: errorCategory(response.status),
        referenceId: response.headers.get('X-Request-Id'),
      });
    }

    return { success: true };
  }

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized(endpoint, Boolean(token));
    }

    const errors = data?.errors && typeof data.errors === 'object'
      ? data.errors
      : {};
    const message =
      data?.message ||
      (Object.keys(errors).length ? Object.values(errors).flat().join(' ') : null) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, {
      status: response.status,
      data,
      errors,
      category: data?.error?.category || errorCategory(response.status),
      referenceId: data?.reference_id || response.headers.get('X-Request-Id'),
    });
  }

  return data;
}

export const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, { method: 'GET', ...options }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { method: 'DELETE', ...options }),

  download: (endpoint, options = {}) =>
    request(endpoint, { method: 'GET', responseType: 'blob', ...options }),
};

export function saveAuthToken(token) {
  Cookies.set(COOKIE_NAME, token, {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
}

export function clearAuthToken() {
  Cookies.remove(COOKIE_NAME);
}

export function getAuthToken() {
  return typeof window !== 'undefined' ? Cookies.get(COOKIE_NAME) : null;
}
