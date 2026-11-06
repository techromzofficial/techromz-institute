import Link from 'next/link';

export default function TrendingKeywords({ keywords = [] }) {
  if (!keywords.length) return null;

  return (
    <section className="mt-5 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-gray-500">Trending:</span>
      {keywords.slice(0, 10).map((item) => (
        <Link
          key={item.id || item.keyword}
          href={`/products?q=${encodeURIComponent(item.keyword)}`}
          className="px-3 py-1.5 bg-white border border-gray-100 rounded-full text-xs text-gray-600 hover:text-primary-700 hover:border-primary-200 transition-colors"
        >
          {item.keyword}
        </Link>
      ))}
    </section>
  );
}
