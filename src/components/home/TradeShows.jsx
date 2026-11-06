import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { TRADE_SHOWS } from '@/lib/constants';

export default function TradeShows() {
  return (
    <section className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">Beauty Events</h2>
          <p className="text-xs text-gray-400">Upcoming SL Beauty campaigns, brand weeks, and partner showcases</p>
        </div>
        <Link href="/products?collection=events" className="text-sm text-primary-700 hover:underline flex items-center gap-1">
          View More <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TRADE_SHOWS.map((show) => (
          <Link
            key={show.id}
            href="/products?collection=events"
            className="group flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors"
          >
            <Image
              src={show.image}
              alt={show.title}
              width={128}
              height={80}
              unoptimized
              className="w-32 h-20 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary-700 line-clamp-2 leading-tight">
                {show.title}
              </h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar size={11} />
                  {show.date}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin size={11} />
                  {show.location}
                </div>
              </div>
              <span className="inline-block mt-2 text-[11px] text-primary-700 font-medium">
                Register Now →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
