import type { ReactNode } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { InstituteButtonLink } from './InstituteButton';

type InstituteEnquiryPanelProps = {
  heading: string;
  body: string;
  whatsappHref: string;
  emailHref: string;
  beforeHeading?: ReactNode;
  contactDetails?: ReactNode;
};

export default function InstituteEnquiryPanel({
  heading,
  body,
  whatsappHref,
  emailHref,
  beforeHeading,
  contactDetails,
}: InstituteEnquiryPanelProps) {
  return <div className="rounded-2xl bg-cyan-50 p-7 sm:p-10">
    {beforeHeading}
    <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{heading}</h2>
    <p className="mt-3 max-w-3xl leading-7 text-slate-700">{body}</p>
    {contactDetails && <p className="mt-3 text-sm font-semibold text-slate-600">{contactDetails}</p>}
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <InstituteButtonLink href={whatsappHref} variant="whatsapp" external className="w-full sm:w-auto"><MessageCircle size={18} aria-hidden="true" /> WhatsApp enquiry</InstituteButtonLink>
      <InstituteButtonLink href={emailHref} variant="email" className="w-full sm:w-auto"><Mail size={18} aria-hidden="true" /> Email enquiry</InstituteButtonLink>
    </div>
  </div>;
}
