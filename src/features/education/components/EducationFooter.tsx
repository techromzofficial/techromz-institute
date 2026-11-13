import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, MessageCircle, Youtube, type LucideIcon } from 'lucide-react';
import { getGeneralContactLinks, INSTITUTE_CONTACT } from '../config/contact';
import { INSTITUTE_FOOTER_LINKS, INSTITUTE_SOCIAL_PROFILES, ORGANISATION_AUDIENCE_LINKS, TECHROMZ_GROUP_COMPANIES } from '../config/footer';

const linkClassName = 'w-fit rounded-sm text-sm leading-5 text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black';
const socialIcons: Record<(typeof INSTITUTE_SOCIAL_PROFILES)[number]['platform'], LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
};

export default function EducationFooter() {
  const contact = getGeneralContactLinks();
  const year = new Date().getFullYear();
  const configuredSocialProfiles = INSTITUTE_SOCIAL_PROFILES.filter((profile): profile is typeof profile & { href: string } => Boolean(profile.href));

  return <footer className="border-t border-slate-800 bg-[#1E1E1E] text-slate-300">
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8">
      <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-4">
          <Link href="/institute" aria-label="Techromz Institute of Technology home" className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-black">
            <Image src="/images/institute/techromz-institute-logo-white-840.webp" alt="Techromz Institute of Technology logo" width={840} height={334} draggable={false} className="h-auto w-[205px]" />
          </Link>
          <p className="mt-4 text-base font-bold text-white">Innovation in Action.</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">Practical learning across technology, business, trade, law, arts and languages.</p>

          <section aria-labelledby="footer-group-heading" className="mt-5">
            <h2 id="footer-group-heading" className="text-sm font-bold text-white">Techromz Group</h2>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-400">{TECHROMZ_GROUP_COMPANIES.map((company) => <li key={company.name}>{company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer" className={linkClassName}>{company.name}</a> : company.name}</li>)}</ul>
          </section>

          {configuredSocialProfiles.length > 0 && <nav aria-label="Techromz social media" className="mt-4 flex gap-2">{configuredSocialProfiles.map((profile) => {
            const Icon = socialIcons[profile.platform];
            return <a key={profile.platform} href={profile.href} target="_blank" rel="noopener noreferrer" aria-label={profile.label} className="grid h-9 w-9 place-items-center rounded-full border border-slate-700 text-slate-300 transition hover:border-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black"><Icon size={17} aria-hidden="true" /></a>;
          })}</nav>}
        </div>

        <nav aria-labelledby="footer-explore-heading" className="lg:col-span-2">
          <h2 id="footer-explore-heading" className="text-sm font-bold text-white">Explore TIT</h2>
          <ul className="mt-3 space-y-1.5">{INSTITUTE_FOOTER_LINKS.map((link) => <li key={link.href}><Link href={link.href} className={linkClassName}>{link.label}</Link></li>)}</ul>
        </nav>

        <nav aria-labelledby="footer-organisations-heading" className="lg:col-span-3">
          <h2 id="footer-organisations-heading" className="text-sm font-bold text-white">For Organisations</h2>
          <ul className="mt-3 space-y-1.5">{ORGANISATION_AUDIENCE_LINKS.map((link) => <li key={link.href}><Link href={link.href} className={linkClassName}>{link.label}</Link></li>)}</ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="text-sm font-bold text-white">Contact</h2>
          <address className="mt-3 space-y-3 not-italic">
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className={`${linkClassName} flex items-start gap-2.5`}><MessageCircle size={18} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" /><span><span className="block text-xs font-semibold text-slate-400">WhatsApp</span><span className="select-text text-slate-200">{INSTITUTE_CONTACT.whatsappDisplay}</span></span></a>
            <a href={`mailto:${INSTITUTE_CONTACT.enrolmentsEmail}`} className={`${linkClassName} flex items-start gap-2.5`}><Mail size={18} className="mt-0.5 shrink-0 text-cyan-400" aria-hidden="true" /><span><span className="block text-xs font-semibold text-slate-400">Enrolment Enquiries</span><span className="select-text break-all text-slate-200">{INSTITUTE_CONTACT.enrolmentsEmail}</span></span></a>
            <a href={contact.email} className={`${linkClassName} flex items-start gap-2.5`}><Mail size={18} className="mt-0.5 shrink-0 text-blue-400" aria-hidden="true" /><span><span className="block text-xs font-semibold text-slate-400">General Enquiries</span><span className="select-text break-all text-slate-200">{INSTITUTE_CONTACT.email}</span></span></a>
          </address>
        </div>
      </div>
    </div>

    <div className="border-t border-slate-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 text-xs leading-5 text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>© {year} Techromz Institute. All rights reserved.</p>
        <p>Preview only · Details require confirmation before launch</p>
      </div>
    </div>
  </footer>;
}
