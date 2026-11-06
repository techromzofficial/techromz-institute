export const INSTITUTE_FOOTER_LINKS = [
  { label: 'Courses', href: '/institute/courses' },
  { label: 'Departments', href: '/institute/departments' },
  { label: 'Learning Tracks', href: '/institute/learning-tracks' },
  { label: 'Community Impact', href: '/institute/community-impact' },
  { label: 'Verify Certificate', href: '/institute/verify' },
  { label: 'About', href: '/institute/about' },
  { label: 'Contact', href: '/institute/contact' },
] as const;

export const ORGANISATION_AUDIENCE_LINKS = [
  { label: 'For Schools', href: '/institute/for-organisations#schools' },
  { label: 'For Universities', href: '/institute/for-organisations#universities' },
  { label: 'For Teachers', href: '/institute/for-organisations#teachers' },
  { label: 'For Businesses', href: '/institute/for-organisations#businesses' },
  { label: 'For Government & Public Sector', href: '/institute/for-organisations#government-public-sector' },
] as const;

// Website destinations can be added once their official URLs are confirmed.
type TechromzGroupCompany = {
  name: string;
  website: string | null;
};

export const TECHROMZ_GROUP_COMPANIES: readonly TechromzGroupCompany[] = [
  { name: 'Techromz (Pvt) Ltd', website: 'https://techromz.com/' },
  { name: 'Techromz Trade & Logistics (Pvt) Ltd', website: 'https://techromztl.com/' },
] as const;

type InstituteSocialProfile = {
  platform: 'facebook' | 'instagram' | 'linkedin' | 'youtube';
  label: string;
  href: string | null;
};

// Icons stay hidden until an official TIT profile URL is confirmed.
export const INSTITUTE_SOCIAL_PROFILES: readonly InstituteSocialProfile[] = [
  { platform: 'facebook', label: 'Techromz on Facebook', href: 'https://www.facebook.com/Techromz/' },
  { platform: 'instagram', label: 'Techromz on Instagram', href: null },
  { platform: 'linkedin', label: 'Techromz on LinkedIn', href: null },
  { platform: 'youtube', label: 'Techromz on YouTube', href: null },
];
