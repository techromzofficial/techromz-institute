'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Award,
  BadgeCheck,
  BarChart3,
  Building2,
  Calendar,
  ChevronLeft,
  ExternalLink,
  Factory,
  FileText,
  Globe2,
  MapPin,
  Package,
  PlayCircle,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { supplierProfileApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProductCard from '@/components/product/ProductCard';

function formatDate(value) {
  if (!value) return 'Not specified';

  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function EmptySection({ message }) {
  return (
    <div className="py-10 text-center border border-dashed border-gray-200 rounded-xl text-sm text-gray-400">
      {message}
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
      <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-5">
        <Icon size={18} className="text-primary-700" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function SupplierProfileContent({ id }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');

      try {
        setProfile(await supplierProfileApi.publicProfile(id));
      } catch (err) {
        setError(err.message || 'Could not load this supplier profile.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading supplier storefront…" />;

  if (error) {
    return (
      <div className="py-16">
        <div className="max-w-xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-600">{error}</p>
            <Link href="/suppliers" className="inline-block text-sm text-primary-700 hover:underline mt-2">
              Return to suppliers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profile?.supplier) {
    return <div className="py-20 text-center text-gray-400">Supplier profile is unavailable.</div>;
  }

  const {
    supplier,
    certificates = [],
    videos = [],
    strengths = [],
    production_capacity: productionCapacity,
    latest_products: latestProducts = [],
    statistics = {},
  } = profile;

  const supplierName = supplier.company_name;
  const location = [supplier.city, supplier.country].filter(Boolean).join(', ');
  const logo = supplier.logo
    || `https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80))}`;
  const coverImage = supplier.cover_image
    || `https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80)}`;

  const products = latestProducts.map((product) => ({
    ...product,
    rating: product.average_rating,
    reviews: product.reviews_count,
  }));

  const companyFacts = [
    ['Company Name', supplier.company_name],
    ['Business Type', supplier.business_type],
    ['Address', supplier.address],
    ['Country', supplier.country],
    ['Website', supplier.website],
    ['Year Established', supplier.established_year],
    ['Employees', supplier.employee_count],
    ['Factory Size', supplier.factory_size],
    ['Main Markets', supplier.main_markets?.join(', ')],
  ].filter(([, value]) => value !== null && value !== undefined && value !== '');

  const stats = [
    {
      label: 'Total Products',
      value: statistics.total_products ?? supplier.products_count ?? 0,
      icon: Package,
    },
    {
      label: 'Completed Orders',
      value: statistics.completed_orders ?? 0,
      icon: BadgeCheck,
    },
    {
      label: 'Response Rate',
      value: statistics.response_rate !== null && statistics.response_rate !== undefined
        ? `${statistics.response_rate}%`
        : 'Not available',
      icon: BarChart3,
    },
    {
      label: 'RFQs Handled',
      value: statistics.rfqs_handled ?? 0,
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-400 flex items-center gap-1.5">
        <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-primary-700">
          <ChevronLeft size={14} />
          Back
        </button>
        <span>/</span>
        <Link href="/suppliers" className="hover:text-primary-700">Suppliers</Link>
        <span>/</span>
        <span className="text-gray-600 line-clamp-1">{supplierName}</span>
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-36 sm:h-52 w-full relative bg-primary-800">
          <Image src={coverImage} alt="" fill unoptimized className="object-cover opacity-90" />
        </div>
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-end -mt-10 sm:-mt-14 relative">
          <Image
            src={logo}
            alt={supplierName}
            width={104}
            height={104}
            unoptimized
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-md object-cover bg-white flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{supplierName}</h1>
              {supplier.verification_status === 'verified' && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 font-medium px-2 py-0.5 rounded-full">
                  <BadgeCheck size={12} />
                  Verified Supplier
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-gray-500">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {location}
                </span>
              )}
              {supplier.established_year && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  Established {supplier.established_year}
                </span>
              )}
              {supplier.business_type && (
                <span className="flex items-center gap-1">
                  <Building2 size={13} />
                  {supplier.business_type}
                </span>
              )}
            </div>
          </div>
          <Link
            href={`/rfq?description=${encodeURIComponent(`Interested in sourcing from ${supplierName}`)}`}
            className="px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5"
          >
            <Send size={15} />
            Request a Quote
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <Icon size={18} className="text-primary-700 mb-3" />
            <div className="text-xl font-bold text-gray-800">{value}</div>
            <div className="text-xs text-gray-400 mt-1">{label}</div>
          </div>
        ))}
      </section>

      <Section title="Company Information" icon={Building2}>
        {supplier.description ? (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-6">
            {supplier.description}
          </p>
        ) : (
          <p className="text-sm text-gray-400 mb-6">No company description has been provided.</p>
        )}

        {companyFacts.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {companyFacts.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-gray-50 py-2 text-sm">
                <span className="text-gray-400">{label}</span>
                {label === 'Website' ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-700 hover:underline text-right break-all"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-gray-800 font-medium text-right">{value}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptySection message="Company information has not been added yet." />
        )}
      </Section>

      <Section title="Certificates" icon={Award}>
        {certificates.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((certificate) => (
              <article key={certificate.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award size={18} className="text-primary-700" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-gray-800">{certificate.certificate_name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {certificate.issuing_authority || 'Issuing organization not specified'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Issued {formatDate(certificate.issue_date)}
                    </p>
                    {certificate.file_url && (
                      <a
                        href={certificate.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary-700 hover:underline mt-3"
                      >
                        View certificate <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptySection message="No certificates have been published." />
        )}
      </Section>

      <Section title="Company Videos" icon={PlayCircle}>
        {videos.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <a
                key={video.id}
                href={video.video_url}
                target="_blank"
                rel="noreferrer"
                className="border border-gray-100 rounded-xl p-4 flex items-center gap-3 hover:border-primary-200"
              >
                <PlayCircle size={34} className="text-primary-700 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-medium text-gray-800 line-clamp-2">{video.title}</h3>
                  <span className="inline-flex items-center gap-1 text-xs text-primary-700 mt-1">
                    Watch video <ExternalLink size={11} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <EmptySection message="No company videos have been published." />
        )}
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Company Strengths" icon={ShieldCheck}>
          {strengths.length ? (
            <div className="flex flex-wrap gap-2">
              {strengths.map((strength) => (
                <span
                  key={strength.id}
                  className="px-3 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                >
                  {strength.strength_name}
                </span>
              ))}
            </div>
          ) : (
            <EmptySection message="No company strengths have been published." />
          )}
        </Section>

        <Section title="Production Capacity" icon={Factory}>
          {productionCapacity ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['Monthly Output', [productionCapacity.monthly_output, productionCapacity.output_unit].filter(Boolean).join(' ')],
                ['Production Lines', productionCapacity.production_lines],
                ['Lead Time', productionCapacity.lead_time],
                ['Factory Size', productionCapacity.factory_size],
              ].filter(([, value]) => value !== null && value !== undefined && value !== '').map(([label, value]) => (
                <div key={label} className="rounded-xl bg-gray-50 p-3">
                  <div className="text-xs text-gray-400">{label}</div>
                  <div className="text-sm font-semibold text-gray-800 mt-1">{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptySection message="Production capacity has not been published." />
          )}
        </Section>
      </div>

      <Section title="Latest Products" icon={Package}>
        {products.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptySection message="This supplier has no active products." />
        )}
      </Section>

      <Section title="Contact Information" icon={Globe2}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            ['Email', supplier.email],
            ['Phone', supplier.phone],
            ['Address', supplier.address],
          ].filter(([, value]) => value).map(([label, value]) => (
            <div key={label} className="rounded-xl bg-gray-50 p-4">
              <div className="text-xs text-gray-400">{label}</div>
              <div className="text-sm text-gray-700 mt-1 break-words">{value}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
