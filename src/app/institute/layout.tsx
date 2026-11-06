import type { Metadata } from 'next';
import EducationHeader from '@/features/education/components/EducationHeader';
import EducationFooter from '@/features/education/components/EducationFooter';
import InstituteContentProtection from '@/features/education/components/InstituteContentProtection';
import { instituteIndexingEnabled, instituteProductionOrigin } from '@/features/education/config/site';

export const metadata: Metadata = {
  metadataBase: instituteIndexingEnabled ? instituteProductionOrigin! : undefined,
  title: { default: 'Techromz Institute of Technology', template: '%s | Techromz Institute' },
  description: 'A practical education storefront for seven developing departments spanning technology, business, trade, law, arts, languages, Ayurveda and wellness.',
  keywords: ['technical education preview', 'Information Technology courses', 'AI courses', 'electronics courses', 'business learning', 'Ayurveda education', 'wellness education'],
  robots: { index: instituteIndexingEnabled, follow: instituteIndexingEnabled },
  openGraph: { title: 'Techromz Institute of Technology', description: 'Practical learning in Electronics, Information Technology and Business.', siteName: 'Techromz Institute of Technology', type: 'website' },
};

export default function InstituteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <InstituteContentProtection><div className="min-h-screen bg-white text-slate-900"><EducationHeader /><main>{children}</main><EducationFooter /></div></InstituteContentProtection>;
}
