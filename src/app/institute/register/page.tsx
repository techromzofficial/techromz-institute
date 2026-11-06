import type { Metadata } from 'next';
import { isInstituteFeatureEnabled } from '@/features/education/administration/config';
import InstituteRegistrationForm from '@/features/education/components/InstituteRegistrationForm';

export const metadata: Metadata = { title: 'Course Registration', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default function RegistrationPage() { return <section className="bg-slate-50"><div className="mx-auto max-w-3xl px-4 py-12 sm:px-6"><p className="text-sm font-bold uppercase tracking-[.16em] text-blue-700">Techromz Institute</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Course registration</h1><p className="mt-3 mb-8 leading-7 text-slate-600">Submit the minimum information needed for an intake review. Seat allocation and payment verification are separate, administrator-controlled steps.</p><InstituteRegistrationForm enabled={isInstituteFeatureEnabled('registration')} /></div></section>; }
