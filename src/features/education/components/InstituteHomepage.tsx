import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, CircuitBoard, Code2, Languages, Leaf, Route, Scale, Ship, UsersRound } from 'lucide-react';
import type { InstituteDepartment, LearningTrack } from '../contracts/content';
import type { EducationCourse } from '../contracts/course';
import CourseVisual from './CourseVisual';
import { InstituteButtonLink } from './InstituteButton';
import ResponsiveLearningImage from './ResponsiveLearningImage';
import CommunityImpactPhoto from './CommunityImpactPhoto';
import { COMMUNITY_IMPACT } from '../data/communityImpact';

const departmentPresentation = {
  electronics: {
    Icon: CircuitBoard,
    line: 'Build circuits. Test components. Diagnose faults safely.',
    image: 'project-learning' as const,
    alt: 'Illustration of hands assembling a small breadboard electronics project',
    accent: 'bg-cyan-50 text-cyan-900',
  },
  'information-technology': {
    Icon: Code2,
    line: 'Create software. Explore AI. Solve digital challenges.',
    image: 'information-technology-department' as const,
    alt: 'Editorial illustration of a laptop, software, data and network concepts',
    accent: 'bg-blue-50 text-blue-950',
  },
  'business-management': {
    Icon: BriefcaseBusiness,
    line: 'Develop ideas. Understand markets. Make informed decisions.',
    image: 'business-management-department' as const,
    alt: 'Editorial illustration of business planning materials, charts and a calculator',
    accent: 'bg-orange-50 text-orange-950',
  },
  'trade-logistics': {
    Icon: Ship,
    line: 'Understand trade. Connect markets. Move business forward.',
    image: 'trade-logistics-department' as const,
    alt: 'Modern container port with a cargo vessel, freight trucks, cranes and organised container operations',
    accent: 'bg-sky-50 text-sky-950',
  },
  'law-corporate-governance': {
    Icon: Scale,
    line: 'Understand obligations. Strengthen governance. Manage legal risk.',
    image: 'law/law-corporate-governance-department' as const,
    alt: 'Law and corporate governance workspace with legal documents, scales and professional compliance materials',
    accent: 'bg-indigo-50 text-indigo-950',
  },
  'arts-languages': {
    Icon: Languages,
    line: 'Build language. Develop expression. Create with confidence.',
    image: 'department-arts-languages' as const,
    alt: 'Creative arts and language study with fashion sketches, jewellery, Sinhala and Asian language books',
    accent: 'bg-rose-50 text-rose-950',
  },
  'ayurveda-wellness': {
    Icon: Leaf,
    line: 'Support wellness. Handle herbal materials. Strengthen quality practice.',
    image: 'ayurveda/ayurveda-wellness-department' as const,
    alt: 'Illustrative Ayurveda and wellness workspace with herbal materials, brass vessels and professional study resources',
    accent: 'bg-emerald-50 text-emerald-950',
  },
};

const trackAccents = ['border-cyan-300 bg-cyan-50', 'border-indigo-300 bg-indigo-50', 'border-amber-300 bg-amber-50', 'border-rose-300 bg-rose-50'];

const technologyImages = [
  {
    name: 'retail-eco-system-v2',
    width: 1200,
    height: 480,
    alt: 'Retail Eco System operating platform banner with a retail analytics dashboard',
  },
  {
    name: 'ai-advisor-v2',
    width: 1200,
    height: 400,
    alt: 'AI Advisor intelligent assistance banner in a modern workspace',
  },
] as const;

function TechnologyProjectImage({ image }: { image: (typeof technologyImages)[number] }) {
  return <picture>
    <source type="image/avif" srcSet={`/images/institute/technology/generated/${image.name}-720.avif 720w, /images/institute/technology/generated/${image.name}-1200.avif 1200w`} sizes="(max-width: 767px) 100vw, 50vw" />
    <source type="image/webp" srcSet={`/images/institute/technology/generated/${image.name}-720.webp 720w, /images/institute/technology/generated/${image.name}-1200.webp 1200w`} sizes="(max-width: 767px) 100vw, 50vw" />
    <img src={`/images/institute/technology/generated/${image.name}-1200.webp`} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" draggable={false} className="h-auto w-full" />
  </picture>;
}

function TechnologyHeroImage() {
  return <picture className="contents">
    <source type="image/avif" srcSet="/images/institute/technology/generated/retail-ai-side-by-side-768.avif 768w, /images/institute/technology/generated/retail-ai-side-by-side-1200.avif 1200w" sizes="(max-width: 767px) calc(100vw - 3rem), 46vw" />
    <source type="image/webp" srcSet="/images/institute/technology/generated/retail-ai-side-by-side-768.webp 768w, /images/institute/technology/generated/retail-ai-side-by-side-1200.webp 1200w" sizes="(max-width: 767px) calc(100vw - 3rem), 46vw" />
    <img src="/images/institute/technology/generated/retail-ai-side-by-side-1200.webp" alt="Retail Eco System operating platform and AI Advisor intelligent assistance presented side by side" width={1200} height={800} loading="eager" fetchPriority="high" decoding="async" draggable={false} className="h-full w-full object-cover" />
  </picture>;
}

function HomeCourseCard({ course }: { course: EducationCourse }) {
  return <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2">
    <CourseVisual course={course} compact />
    <div className="flex flex-1 flex-col p-6"><div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">{course.subject}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{course.level}</span><span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">{course.availabilityStatus === 'coming-soon' ? 'Coming January 2027' : 'Planned intake'}</span></div><h3 className="mt-4 text-xl font-bold text-slate-950">{course.title}</h3>
{course.subtitle && <p className="mt-1 text-sm font-semibold text-blue-800">{course.subtitle}</p>}
<p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{course.summary}</p><Link href={`/institute/courses/${course.slug}`} className="mt-5 inline-flex items-center gap-2 self-start text-sm font-bold text-blue-700 outline-none hover:text-blue-900 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-600">View details <ArrowRight size={15} /></Link></div>
  </article>;
}

export default function InstituteHomepage({ departments, tracks, courses }: { departments: InstituteDepartment[]; tracks: LearningTrack[]; courses: EducationCourse[] }) {
  return <>
    <section className="overflow-hidden border-b border-slate-200 bg-gradient-to-br from-[#f7faff] via-white to-[#fff8ee]"><div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.03fr_.97fr] md:py-20 lg:px-8"><div><div className="flex flex-wrap gap-2">{['Electronics & Engineering', 'IT', 'Business', 'Trade & Logistics', 'Law & Governance', 'Arts & Languages', 'Ayurveda & Wellness'].map((subject, index) => <span key={subject} className={`rounded-full border px-3 py-1 text-xs font-bold ${index >= 2 ? 'border-orange-200 bg-orange-50 text-orange-800' : 'border-blue-200 bg-white text-blue-700'}`}>{subject}</span>)}</div><h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Big ideas start with practical skills.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Explore hands-on learning across seven developing departments in technology, business, trade, law, arts, languages, Ayurveda and wellness with Techromz Institute of Technology.</p><div className="mt-8 flex flex-wrap gap-3"><InstituteButtonLink href="/institute/courses" variant="primary">Explore Courses <ArrowRight size={17} aria-hidden="true" /></InstituteButtonLink><InstituteButtonLink href="/institute/about" variant="secondary">Discover TIT</InstituteButtonLink></div></div><figure className="relative"><div className="flex aspect-[3/2] items-center justify-center overflow-hidden rounded-[1.75rem] border-8 border-white bg-slate-950 shadow-2xl"><TechnologyHeroImage /></div><div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 shadow-lg sm:block"><p className="text-xs font-bold uppercase tracking-wider text-orange-800">Learn by making</p><p className="mt-1 text-sm font-semibold text-slate-800">Ideas → experiments → projects</p></div></figure></div></section>

    <section aria-labelledby="homepage-departments-heading" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Explore your interests</p><h2 id="homepage-departments-heading" className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Find the field that gets you thinking.</h2></div><div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{departments.map((department) => { const item = departmentPresentation[department.slug]; const Icon = item.Icon; return <article key={department.slug} className={`group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 ${item.accent} shadow-sm transition-shadow duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2`}><figure className="bg-white"><div className="aspect-[4/3] overflow-hidden [&_img]:h-full [&_img]:w-full [&_img]:object-cover"><ResponsiveLearningImage baseName={item.image} alt={item.alt} largeWidth={960} largeHeight={640} smallWidth={640} smallHeight={427} sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 25vw" /></div></figure><div className="flex flex-1 flex-col p-5"><Icon size={24} aria-hidden="true" /><h3 className="mt-3 text-xl font-bold leading-tight">{department.name}</h3><p className="mt-2 flex-1 text-sm font-medium leading-6">{item.line}</p><Link href={`/institute/departments/${department.slug}`} className="mt-4 inline-flex w-fit items-center gap-2 rounded-sm text-sm font-bold text-blue-800 outline-none hover:text-blue-950 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Explore department <ArrowRight className="transition-transform duration-200 motion-safe:group-hover:translate-x-0.5" size={15} aria-hidden="true" /></Link></div></article>; })}</div></section>

    <section className="bg-[#f8fafc]"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Planned courses</p><h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Build practical application skills.</h2><p className="mt-3 max-w-2xl text-slate-600">Explore our planned AI and retail software development courses. Enquiries do not reserve a place or confirm enrolment.</p></div><Link href="/institute/courses" className="text-sm font-bold text-blue-700">View all courses →</Link></div><div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <HomeCourseCard key={course.slug} course={course} />)}</div></div></section>

    <section aria-labelledby="community-impact-heading" className="border-y border-blue-100 bg-blue-50"><div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8"><div><p className="text-sm font-bold uppercase tracking-[.16em] text-blue-700">Our community impact</p><h2 id="community-impact-heading" className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{COMMUNITY_IMPACT.homepageHeading}</h2><p className="mt-4 max-w-3xl leading-7 text-slate-700">{COMMUNITY_IMPACT.homepageDescription}</p><dl className="mt-7 grid gap-3 sm:grid-cols-3">{COMMUNITY_IMPACT.impact.map((item) => <div key={item.label} className="rounded-xl border border-blue-200 bg-white p-4"><dt className="text-sm font-bold leading-5 text-slate-700">{item.label}</dt><dd className="mt-1 text-2xl font-bold text-blue-800">{item.value}</dd></div>)}</dl><p className="mt-5 text-sm font-semibold text-slate-700">{COMMUNITY_IMPACT.fundingStatement}</p><InstituteButtonLink href="/institute/community-impact" variant="primary" className="mt-7">Explore Our Community Impact <ArrowRight size={16} aria-hidden="true" /></InstituteButtonLink></div><figure className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]"><CommunityImpactPhoto {...COMMUNITY_IMPACT.gallery[0]} sizes="(max-width: 1023px) calc(100vw - 2rem), 44vw" /></figure></div></section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]"><div><Route className="text-blue-700" size={34} /><p className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Choose your next direction</p><h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">See how skills could build over time.</h2><p className="mt-4 leading-7 text-slate-600">These are planned roadmaps, not currently available qualifications.</p><Link href="/institute/learning-tracks" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-700">Explore every stage <ArrowRight size={15} /></Link></div><div className="grid gap-4 sm:grid-cols-2">{tracks.map((track, index) => <Link key={track.title} href="/institute/learning-tracks" className={`group rounded-2xl border-t-4 p-6 transition motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${trackAccents[index]}`}><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">Planned roadmap</p><h3 className="mt-3 text-xl font-bold text-slate-950">{track.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{track.summary}</p><div className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-700"><span>Foundation</span><span className="h-px flex-1 bg-slate-300" /><span>Advanced</span></div></Link>)}</div></div></section>

    <section className="border-y border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8"><figure><div className="overflow-hidden rounded-2xl"><ResponsiveLearningImage baseName="collaborative-learning" alt="Editorial illustration of fictional learners collaborating around laptops and a technology prototype" largeWidth={960} largeHeight={640} smallWidth={640} smallHeight={427} sizes="(max-width: 1023px) 100vw, 42vw" /></div></figure><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Why TIT?</p><h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Learning designed around useful progress.</h2><div className="mt-7 grid gap-5 sm:grid-cols-2">{[['Hands-on projects', 'Apply ideas through guided practical work.'], ['Focused learning', 'Build specific skills with clear outcomes.'], ['Portfolio development', 'Create work that demonstrates progress.'], ['Industry-focused thinking', 'Connect learning to real-world challenges.']].map(([title, copy]) => <div key={title} className="border-t border-slate-200 pt-4"><CheckCircle2 className="text-blue-700" size={19} /><h3 className="mt-3 font-bold">{title}</h3><p className="mt-1 text-sm text-slate-600">{copy}</p></div>)}</div></div></div></section>

    <section id="technology-from-techromz-group" className="scroll-mt-28 bg-slate-50"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Industry perspective</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Technology from the Techromz Group</h2><p className="mt-3 text-slate-600">Explore the technology projects that help shape our practical, industry-focused approach.</p></div>
<div className="mt-8 grid items-start gap-5 lg:grid-cols-2">{technologyImages.map((image) => <figure key={image.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><TechnologyProjectImage image={image} /></figure>)}</div>
<div className="mt-6 grid gap-4 md:grid-cols-2"><article className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-bold text-slate-950">Retail Eco System</h3><p className="mt-2 text-sm leading-6 text-slate-600">A Techromz project focused on connected retail operations and digital commerce.</p></article><article className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-lg font-bold text-slate-950">AI Advisor</h3><p className="mt-2 text-sm leading-6 text-slate-600">A Techromz project exploring AI-assisted product guidance and shopping experiences.</p></article></div></div></section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-600 text-white"><div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><UsersRound size={31} /><p className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-blue-100">Learning for organisations</p><h2 className="mt-2 text-3xl font-bold">Practical learning shaped through discussion.</h2><p className="mt-3 max-w-3xl text-blue-50">Explore proposed programmes for Schools, Universities, Teachers, Businesses and Government & Public Sector. Scope and availability require consultation and confirmation.</p><div className="mt-5 flex flex-wrap gap-2">{['Schools', 'Universities', 'Teachers', 'Businesses', 'Government / Public Sector'].map((audience) => <Link key={audience} href="/institute/for-organisations" className="rounded-full border border-white/30 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{audience}</Link>)}</div></div><InstituteButtonLink href="/institute/for-organisations" variant="secondary">For Organisations <ArrowRight size={16} aria-hidden="true" /></InstituteButtonLink></div></div></section>

  </>;
}
