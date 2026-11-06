import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Lightbulb, Mail, MessageCircle, Route } from 'lucide-react';
import ResponsiveLearningImage from '@/features/education/components/ResponsiveLearningImage';
import { InstituteButtonLink } from '@/features/education/components/InstituteButton';
import { getTrackContactLinks } from '@/features/education/config/contact';
import { instituteMetadata } from '@/features/education/config/site';
import { educationContentService } from '@/features/education/services/contentService';
import { educationCourseService } from '@/features/education/services/courseService';

export const metadata: Metadata = instituteMetadata('/institute/learning-tracks', 'Planned Learning Tracks', 'Explore proposed step-by-step learning roadmaps across technology and business, from first concepts to advanced projects.');

const presentation = {
  'Web Development': {
    image: 'information-technology-department' as const,
    alt: 'Illustrative software-building workspace with code, interface and connected technology concepts',
    accent: 'text-blue-700', line: 'bg-blue-600', wash: 'bg-blue-50',
  },
  'Data Science': {
    image: 'data-science-track' as const,
    alt: 'Illustrative data exploration workspace with charts, a dataset and analytical notes',
    accent: 'text-violet-700', line: 'bg-violet-600', wash: 'bg-violet-50',
  },
  'IoT & Embedded Systems': {
    image: 'project-learning' as const,
    alt: 'Illustrative hands building a microcontroller and sensor prototype on a workbench',
    accent: 'text-cyan-700', line: 'bg-cyan-600', wash: 'bg-cyan-50',
  },
  Entrepreneurship: {
    image: 'business-management-department' as const,
    alt: 'Illustrative planning workspace with idea notes, charts and practical business materials',
    accent: 'text-amber-700', line: 'bg-amber-500', wash: 'bg-amber-50',
  },
};

export default async function LearningTracksPage() {
  const tracks = await educationContentService.listLearningTracks();
  const courseSlugs = tracks.flatMap((track) => track.stages.map((stage) => stage.courseSlug).filter((slug): slug is string => Boolean(slug)));
  const courseEntries = await Promise.all(courseSlugs.map(async (slug) => [slug, await educationCourseService.getCourse(slug)] as const));
  const courses = new Map(courseEntries);

  return <>
    <section className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <nav aria-label="Breadcrumb"><ol className="flex gap-2 text-sm text-slate-300"><li><Link href="/institute" className="rounded-sm hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Home</Link></li><li aria-hidden="true">/</li><li aria-current="page" className="font-semibold text-white">Learning Tracks</li></ol></nav>
        <Route className="mt-10 text-cyan-300" size={34} aria-hidden="true" />
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">Four planned roadmaps</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">Find your direction. Build your next skill.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">Explore step-by-step learning roadmaps in technology and business, from your first concepts to more advanced projects.</p>
        <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-300">Every stage below is a proposed roadmap, not confirmed course availability, enrolment or a qualification.</p>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-20 lg:space-y-28">
        {tracks.map((track, trackIndex) => {
          const visual = presentation[track.title as keyof typeof presentation];
          const contact = getTrackContactLinks(track.title);
          const supportingCourse = track.stages.map((stage) => stage.courseSlug ? courses.get(stage.courseSlug) : null).find(Boolean);
          return <article key={track.title} className="grid items-center gap-9 lg:grid-cols-2 lg:gap-14">
            <figure className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${trackIndex % 2 ? 'lg:order-2' : ''}`}>
              <div className="aspect-[3/2] overflow-hidden [&_img]:h-full [&_img]:object-cover">
                <ResponsiveLearningImage baseName={visual.image} alt={visual.alt} largeWidth={960} largeHeight={640} smallWidth={640} smallHeight={427} sizes="(min-width: 1024px) 46vw, 100vw" priority={trackIndex === 0} />
              </div>
              
            </figure>

            <div className={trackIndex % 2 ? 'lg:order-1' : ''}>
              <div className="flex items-center gap-3"><span className={`h-1 w-10 rounded-full ${visual.line}`} /><p className={`text-xs font-bold uppercase tracking-[0.16em] ${visual.accent}`}>Planned learning roadmap</p></div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{track.title}</h2>
              <p className="mt-3 text-lg leading-8 text-slate-600">{track.summary}</p>

              <div className="mt-7 grid grid-cols-[auto_1fr] gap-x-4">
                {track.stages.map((stage, index) => <div key={stage.level} className="contents">
                  <div className="flex flex-col items-center"><span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${visual.wash} ${visual.accent}`}>{index + 1}</span>{index < track.stages.length - 1 && <span className="my-1 h-full min-h-8 w-px bg-slate-200" />}</div>
                  <div className="pb-6"><h3 className="font-bold text-slate-950">{stage.level}</h3><p className="mt-1 leading-6 text-slate-600">{stage.topics}.</p></div>
                </div>)}
              </div>

              <div className={`mt-1 rounded-xl p-5 ${visual.wash}`}><div className="flex gap-3"><Lightbulb className={`mt-0.5 shrink-0 ${visual.accent}`} size={20} aria-hidden="true"/><div><h3 className="font-bold text-slate-950">Illustrative project</h3><p className="mt-1 text-sm leading-6 text-slate-700">{track.projectExample}</p></div></div></div>
              <div className="mt-6"><h3 className="text-sm font-bold text-slate-950">Who this may suit</h3><p className="mt-1 text-sm leading-6 text-slate-600">{track.whoThisMaySuit}</p></div>

              {supportingCourse && <div className="mt-6 border-l-2 border-cyan-500 pl-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Relevant starting point</p><Link href={`/institute/courses/${supportingCourse.slug}`} className="mt-1 inline-flex items-center gap-2 rounded-sm font-bold text-blue-700 hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{supportingCourse.title} <ArrowRight size={16}/></Link><p className="mt-1 text-xs leading-5 text-slate-500">Demonstration course information; curriculum and availability require confirmation.</p></div>}

              <p className="mt-6 text-xs leading-5 text-slate-500">These stages describe a proposed roadmap, not confirmed course availability. Expressing interest does not reserve a place.</p>
              <div className="mt-4 flex flex-wrap gap-3"><InstituteButtonLink href={contact.whatsapp} variant="whatsapp" external><MessageCircle size={18} aria-hidden="true" /> WhatsApp enquiry</InstituteButtonLink><InstituteButtonLink href={contact.email} variant="email"><Mail size={18} aria-hidden="true" /> Email enquiry</InstituteButtonLink></div>
            </div>
          </article>;
        })}
      </div>
      <div className="mt-20 border-t border-slate-200 pt-8"><h2 className="text-xl font-bold text-slate-950">Before you choose a direction</h2><p className="mt-2 max-w-4xl leading-7 text-slate-600">These roadmaps help explain possible learning progression. They do not guarantee employment, professional status, course progression or a qualification. Final content, prerequisites, delivery and availability must be confirmed before launch.</p></div>
    </section>
  </>;
}
