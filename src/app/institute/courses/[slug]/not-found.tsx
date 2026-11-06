import type { Metadata } from 'next';
import { InstituteButtonLink } from '@/features/education/components/InstituteButton';

export const metadata: Metadata = {
  title: { absolute: 'Course not found | Techromz Institute Preview' },
  robots: { index: false, follow: false },
};

export default function CourseNotFound() { return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><p className="text-sm font-bold uppercase tracking-wider text-blue-700">Course not found</p><h1 className="mt-3 text-4xl font-bold text-slate-950">That demonstration course does not exist.</h1><p className="mt-4 text-slate-600">The link may be incomplete or the preview content may have changed.</p><InstituteButtonLink href="/institute/courses" variant="primary" className="mt-7">Return to course catalogue</InstituteButtonLink></div>; }
