import { MessageCircle } from 'lucide-react';
import { getInstituteContactLinks } from '../config/contact';
import { InstituteButtonLink } from './InstituteButton';
import CourseEnquiryButton from './CourseEnquiryButton';

export default function EnquiryUnavailable({ courseTitle }: { courseTitle?: string }) {
  const links = getInstituteContactLinks(courseTitle);
  return <section className="rounded-xl border border-blue-200 bg-blue-50 p-6"><h2 className="font-bold text-slate-950">{courseTitle ? 'Express interest' : 'Contact the institute'}</h2><p className="mt-2 text-sm text-slate-700">Use a verified contact channel to ask about {courseTitle || 'the demonstration courses'}.</p><div className="mt-5 grid gap-3"><InstituteButtonLink href={links.whatsapp} variant="whatsapp" external><MessageCircle size={18} aria-hidden="true" /> WhatsApp enquiry</InstituteButtonLink>{courseTitle && <CourseEnquiryButton courseName={courseTitle} />}</div><p className="mt-4 text-xs leading-relaxed text-slate-600">Contacting the institute expresses interest only. It does not confirm registration or reserve a place.</p></section>;
}
