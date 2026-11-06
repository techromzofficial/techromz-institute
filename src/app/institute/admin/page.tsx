import type { Metadata } from 'next';
import InstituteAdminConsole from '@/features/education/components/InstituteAdminConsole';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';

export const metadata: Metadata = { title: 'Institute Administration', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default function InstituteAdminPage() {
  return <section className="min-h-[70vh] bg-slate-50"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[.16em] text-blue-700">Restricted system</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">Institute administration</h1><p className="mt-3 mb-8 max-w-3xl leading-7 text-slate-600">Manage intake records, registrations and verified enrolments. Certificate issuance and revocation remain disabled.</p><InstituteAdminConsole enabled={isInstituteFeatureEnabled('admin')} paymentEnabled={isInstituteFeatureEnabled('payment')} /></div></section>;
}
