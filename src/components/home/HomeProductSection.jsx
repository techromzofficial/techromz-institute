import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';

export default function HomeProductSection({ title, products = [], href = '/products' }) {
  if (!products.length) return null;

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800">{title}</h2>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-primary-700 hover:underline font-medium"
        >
          View More <ArrowRight size={13} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.slice(0, 6).map((product) => (
          <ProductCard key={product.id || product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
