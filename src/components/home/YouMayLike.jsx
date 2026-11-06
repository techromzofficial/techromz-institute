import Link from 'next/link';
import Image from 'next/image';
import { YOU_MAY_LIKE } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export default function YouMayLike({ recommendations }) {
  const items = (recommendations ?? YOU_MAY_LIKE).slice(0, 6);

  if (!items.length) return null;

  return (
    <aside className="hidden xl:block w-44 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 self-start">
      <div className="px-3 py-2.5 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">You May Like</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item) => {
          const label = item.name || item.label;
          const image = item.featured_image || item.image;
          const href = item.id ? `/products/${item.id}` : `/products?q=${encodeURIComponent(label)}`;
          const detail = item.id
            ? `${formatCurrency(item.price)} / ${item.unit || 'unit'}`
            : `${item.count} Products`;

          return (
          <Link
            key={item.id || label}
            href={href}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors"
          >
            <Image
              src={image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=160&q=80'}
              alt={label}
              width={44}
              height={44}
              unoptimized
              className="rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-medium text-gray-800 line-clamp-1">{label}</div>
              <div className="text-[11px] text-gray-400">{detail}</div>
            </div>
          </Link>
          );
        })}
      </div>
      <div className="px-3 py-2 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 mb-1.5">Looking for more beauty picks?</p>
        <Link
          href="/products"
          className="block text-center text-xs py-1.5 border border-accent-500 text-accent-600 rounded-lg hover:bg-accent-50 font-medium transition-colors"
        >
          Shop All Products
        </Link>
      </div>
    </aside>
  );
}
