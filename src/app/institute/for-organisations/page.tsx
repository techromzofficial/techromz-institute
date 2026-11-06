import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, Building2, GraduationCap, Landmark, Mail, MessageCircle, School, UsersRound } from 'lucide-react';
import ResponsiveLearningImage from '@/features/education/components/ResponsiveLearningImage';
import InstituteEnquiryPanel from '@/features/education/components/InstituteEnquiryPanel';
import { InstituteButtonLink } from '@/features/education/components/InstituteButton';
import { getOrganisationContactLinks, INSTITUTE_CONTACT } from '@/features/education/config/contact';
import { instituteMetadata } from '@/features/education/config/site';
import { educationContentService } from '@/features/education/services/contentService';

export const metadata: Metadata = instituteMetadata('/institute/for-organisations', 'Learning for Organisations', 'Discuss practical learning tailored to your people, priorities and goals with Techromz Institute.');

const presentation = {
  schools: { Icon: School, image: 'project-learning' as const, alt: 'Illustrative hands assembling a simple electronics project', accent: 'text-cyan-700', line: 'bg-cyan-600' },
  universities: { Icon: GraduationCap, image: 'information-technology-department' as const, alt: 'Illustrative software and technology project workspace', accent: 'text-blue-700', line: 'bg-blue-600' },
  teachers: { Icon: UsersRound, image: 'collaborative-learning' as const, alt: 'Illustrative fictional adults discussing a technology project', accent: 'text-violet-700', line: 'bg-violet-600' },
  businesses: { Icon: Building2, image: 'business-management-department' as const, alt: 'Illustrative business planning workspace with charts and practical materials', accent: 'text-amber-700', line: 'bg-amber-500' },
  'government-public-sector': { Icon: Landmark, image: 'data-science-track' as const, alt: 'Illustrative data-awareness workspace with charts and analytical notes', accent: 'text-emerald-700', line: 'bg-emerald-600' },
};

const process = [
  'Share your learning needs.',
  'Discuss audience, outcomes and delivery.',
  'Review the proposed scope and fees.',
  'Confirm arrangements before delivery.',
];

const audienceHeading = (name: string) => `For ${name}`;

export default async function ForOrganisationsPage() {
  const audiences = await educationContentService.listOrganisationAudiences();
  const generalContact = getOrganisationContactLinks('our organisation');

  return <>
    <section className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:px-8">
        <div><nav aria-label="Breadcrumb"><ol className="flex gap-2 text-sm text-slate-300"><li><Link href="/institute" className="rounded-sm hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Home</Link></li><li aria-hidden="true">/</li><li aria-current="page" className="font-semibold text-white">For Organisations</li></ol></nav><p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">Practical learning through consultation</p><h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Build skills that move your organisation forward.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">Discuss practical learning tailored to your people, priorities and goals.</p><InstituteButtonLink href={generalContact.whatsapp} variant="whatsapp" external className="mt-7"><MessageCircle size={18} aria-hidden="true" /> WhatsApp enquiry</InstituteButtonLink></div>
        <figure className="overflow-hidden rounded-2xl border border-white/20 bg-slate-900/30 shadow-xl"><div className="aspect-[3/2] overflow-hidden [&_img]:h-full [&_img]:object-cover"><ResponsiveLearningImage baseName="collaborative-learning" alt="Illustrative fictional adults collaborating around a technology project" largeWidth={960} largeHeight={640} smallWidth={640} smallHeight={427} sizes="(min-width: 1024px) 42vw, 100vw" priority /></div></figure>
      </div>
    </section>

    <nav aria-label="Organisation audiences" className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-5 sm:px-6 lg:px-8">{audiences.map((audience) => <a key={audience.id} href={`#${audience.id}`} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:border-blue-600 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">{audienceHeading(audience.name)}<ArrowDown size={14}/></a>)}</div></nav>

    <section id="audiences" className="mx-auto max-w-7xl scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8"><div className="space-y-20 lg:space-y-28">{audiences.map((audience, index) => {
      const visual = presentation[audience.id];
      const contact = getOrganisationContactLinks(audience.name);
      return <article id={audience.id} key={audience.id} className="grid scroll-mt-32 items-center gap-9 lg:grid-cols-2 lg:gap-14">
        <figure className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${index % 2 ? 'lg:order-2' : ''}`}><div className="aspect-[3/2] overflow-hidden [&_img]:h-full [&_img]:object-cover"><ResponsiveLearningImage baseName={visual.image} alt={visual.alt} largeWidth={960} largeHeight={640} smallWidth={640} smallHeight={427} sizes="(min-width: 1024px) 46vw, 100vw" /></div></figure>
        <div className={index % 2 ? 'lg:order-1' : ''}><h2 className={`flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl ${visual.accent}`}><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white ${visual.accent}`}><visual.Icon size={24} aria-hidden="true"/></span>{audienceHeading(audience.name)}</h2><div className={`mt-4 h-1 w-12 rounded-full ${visual.line}`} aria-hidden="true"/><h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{audience.headline}</h3><p className="mt-4 text-lg leading-8 text-slate-600">{audience.description}</p><h4 className="mt-7 text-base font-bold text-slate-700">Possible learning areas</h4><ul className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2">{audience.examples.map((example) => <li key={example} className="flex gap-3 text-slate-700"><span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${visual.line}`}/>{example}</li>)}</ul><p className="mt-6 border-l-2 border-slate-300 pl-4 text-sm leading-6 text-slate-600">{audience.consultationNote}</p><div className="mt-6 flex flex-wrap gap-3"><InstituteButtonLink href={contact.whatsapp} variant="whatsapp" external><MessageCircle size={18} aria-hidden="true" /> WhatsApp enquiry</InstituteButtonLink><InstituteButtonLink href={contact.email} variant="email"><Mail size={18} aria-hidden="true" /> Email enquiry</InstituteButtonLink></div></div>
      </article>;
    })}</div></section>

    <section className="bg-slate-50"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><p className="text-sm font-bold uppercase tracking-[.16em] text-blue-700">A proposed enquiry process</p><h2 className="mt-2 text-3xl font-bold text-slate-950">How it could work</h2><p className="mt-3 max-w-3xl text-slate-600">This is a consultation pathway, not an automated booking system.</p><ol className="mt-9 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">{process.map((step, index) => <li key={step} className="border-t border-slate-300 pt-5"><span className="text-sm font-bold text-blue-700">0{index + 1}</span><p className="mt-2 font-bold leading-6 text-slate-950">{step}</p></li>)}</ol></div></section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><InstituteEnquiryPanel heading="Let’s shape a practical learning experience." body="An enquiry starts a conversation. It does not confirm availability, a booking or a partnership." contactDetails={<>WhatsApp {INSTITUTE_CONTACT.whatsappDisplay} · {INSTITUTE_CONTACT.email}</>} whatsappHref={generalContact.whatsapp} emailHref={generalContact.email} /></section>
  </>;
}
