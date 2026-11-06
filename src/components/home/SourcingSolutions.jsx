import Image from 'next/image';
import Link from 'next/link';
import { SOURCING_SOLUTIONS, SRI_LANKA_CATEGORIES } from '@/lib/constants';

const SOLUTION_CATS = [
  ['makeup', 'skincare', 'fragrance'],
  ['hair-care', 'bath-body', 'wellness'],
  ['luxury-beauty', 'k-beauty', 'new-arrivals'],
  ['gift-sets', 'mini-size', 'sale'],
];

export default function SourcingSolutions() {
  return (
    <section className="mt-8">
      <h2 className="text-base font-bold text-gray-800 mb-4 text-center">
        Beauty Collections &amp; Partner Services
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SOURCING_SOLUTIONS.map((card, idx) => {
          const catSlugs = SOLUTION_CATS[idx] || [];
          const cats = catSlugs.map((s) => SRI_LANKA_CATEGORIES.find((c) => c.slug === s)).filter(Boolean);
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover-lift block"
            >
              <div className="relative h-36 overflow-hidden">
                <Image src={card.bg} alt={card.title} width={600} height={360} unoptimized className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-3">
                  <h3 className="text-white font-bold text-sm leading-tight">{card.title}</h3>
                  <p className="text-white/75 text-[11px] mt-0.5">{card.subtitle}</p>
                </div>
              </div>

              <div className="p-3 grid grid-cols-3 gap-2">
                {cats.map((cat) => (
                  <div key={cat.slug} className="min-w-0">
                    <div className="relative mx-auto aspect-square w-11 overflow-hidden rounded-md bg-gray-100 ring-1 ring-gray-100">
                      <Image
                        src={cat.image}
                        alt={cat.imageAlt || cat.label}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <span className="mt-1 block text-center text-[10px] leading-tight text-gray-500 line-clamp-2">
                      {cat.label}
                    </span>
                  </div>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
