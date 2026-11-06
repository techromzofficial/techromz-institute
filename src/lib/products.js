const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80';

function normalizeSupplier(source, product = {}) {
  if (!source || typeof source !== 'object') {
    const name = typeof source === 'string' && source.trim()
      ? source
      : 'Supplier information unavailable';
    return {
      id: product.supplier_id ?? null,
      name,
      company_name: name,
      location: product.supplierLocation || '',
      rating: 0,
      reviews: 0,
      verified: Boolean(product.verified),
    };
  }

  const location = source.location
    || [source.city, source.country].filter(Boolean).join(', ');

  return {
    ...source,
    id: source.id ?? product.supplier_id ?? null,
    name: source.name || source.company_name || 'Supplier information unavailable',
    company_name: source.company_name || source.name || 'Supplier information unavailable',
    location,
    rating: Number(source.rating || 0),
    reviews: Number(source.reviews ?? source.reviews_count ?? 0),
    products: Number(source.products ?? source.products_count ?? source.productsCount ?? 0),
    verified: Boolean(
      source.verified
      || source.verification_status === 'verified'
      || product.verified,
    ),
    since: source.since || source.established_year || null,
  };
}

export function normalizeProduct(product) {
  if (!product || typeof product !== 'object') return null;

  const supplier = normalizeSupplier(product.supplier_details || product.supplier, product);
  const rawImages = Array.isArray(product.images) ? product.images : [];
  const images = [...new Set([
    product.featured_image,
    product.image,
    ...rawImages.map((image) => (
      typeof image === 'string' ? image : image?.image || image?.url
    )),
  ].filter(Boolean))];

  return {
    ...product,
    image: images[0] || FALLBACK_PRODUCT_IMAGE,
    images,
    minOrder: Number(product.moq ?? product.minOrder ?? 0),
    moq: Number(product.moq ?? product.minOrder ?? 0),
    unit: product.unit || product.moqUnit || 'Piece',
    moqUnit: product.unit || product.moqUnit || 'Piece',
    rating: Number(product.average_rating ?? product.rating ?? 0),
    reviews: Number(product.reviews_count ?? product.reviews ?? 0),
    supplier,
    supplier_id: product.supplier_id ?? supplier.id,
    supplierLocation: supplier.location,
    verified: supplier.verified,
    audited: supplier.verified,
    category: product.category
      ? {
          ...product.category,
          label: product.category.label || product.category.name || '',
        }
      : null,
  };
}

export function normalizeProducts(products) {
  return Array.isArray(products) ? products.map(normalizeProduct).filter(Boolean) : [];
}

export function normalizeProductResponse(response) {
  return {
    ...response,
    data: normalizeProducts(response?.data || response?.products),
    total: Number(response?.total || 0),
    current_page: Number(response?.current_page || 1),
    last_page: Number(response?.last_page || 1),
  };
}

export function normalizeProductDetail(response) {
  const product = normalizeProduct(response);
  return product
    ? { ...product, related_products: normalizeProducts(response?.related_products) }
    : null;
}

export function normalizeCategories(response) {
  const roots = Array.isArray(response?.data) ? response.data : [];
  return roots.flatMap((category) => {
    const normalizedRoot = {
      ...category,
      label: category.label || category.name || '',
      children: Array.isArray(category.children)
        ? category.children.map((child) => ({
          ...child,
          label: child.label || child.name || '',
        }))
        : [],
    };

    return [normalizedRoot, ...normalizedRoot.children];
  });
}

export { FALLBACK_PRODUCT_IMAGE };
