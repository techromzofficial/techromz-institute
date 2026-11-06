import type { Metadata } from 'next';
import { ArrowRight, BriefcaseBusiness, FolderKanban, Focus, Lightbulb, Rocket, Wrench } from 'lucide-react';
import ResponsiveLearningImage from '@/features/education/components/ResponsiveLearningImage';
import { InstituteButtonLink } from '@/features/education/components/InstituteButton';
import { instituteMetadata } from '@/features/education/config/site';

export const metadata: Metadata = instituteMetadata('/institute/about', 'About Techromz Institute of Technology', 'Learn about the mission, vision and practical learning approach of Techromz Institute of Technology.');

const reasons = [
  { title: 'Practical, project-based learning', copy: 'Apply concepts through guided activities and hands-on projects.', Icon: Wrench },
  { title: 'Focused learning', copy: 'Build specific skills through structured courses with clear learning outcomes.', Icon: Focus },
  { title: 'Portfolio development', copy: 'Create work that demonstrates your knowledge and progress.', Icon: FolderKanban },
  { title: 'Industry-focused thinking', copy: 'Explore how technology and business concepts apply to real-world challenges.', Icon: BriefcaseBusiness },
  { title: 'Innovation and problem-solving', copy: 'Develop curiosity, creativity and a thoughtful approach to building solutions.', Icon: Lightbulb },
  { title: 'A foundation for continued growth', copy: 'Prepare for further study, more advanced projects and future opportunities.', Icon: Rocket },
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Innovation in Action</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">About Techromz Institute of Technology</h1>
          <p className="mt-6 max-w-2xl text-xl font-semibold text-slate-700 sm:text-2xl">Practical learning. Real-world thinking.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Our Story</p>
            <div className="mt-4 h-1 w-14 rounded-full bg-blue-700" />
            <div className="mt-7 space-y-5 text-base leading-8 text-slate-600 sm:text-lg">
              <p>Techromz Institute of Technology (TIT) is an educational initiative within the Techromz group, developing practical learning departments across technology, business, trade, law, arts and languages.</p>
              <p>Guided by our slogan, “Innovation in Action,” we help learners connect theory with real-world applications through focused courses, guided activities and hands-on projects.</p>
              <p>Our approach encourages curiosity, problem-solving and continuous learning. We aim to help students build knowledge step by step, apply their skills with confidence and develop projects that demonstrate their progress.</p>
              <p>Our connection to the wider Techromz group informs our industry-focused approach, bringing technology, creativity and business thinking into the learning experience.</p>
            </div>
          </div>
          <figure>
            <div className="overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
              <ResponsiveLearningImage
                baseName="project-learning"
                alt="Illustration of hands assembling a small breadboard electronics project with tools and notes"
                largeWidth={960}
                largeHeight={640}
                smallWidth={640}
                smallHeight={427}
                sizes="(max-width: 1023px) 100vw, 42vw"
              />
            </div>
            
          </figure>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-2 lg:px-8">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-7 sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">Our Mission</p><p className="mt-4 text-lg leading-8 text-slate-200">To empower learners across technology, business, trade, law, arts and languages through practical education that develops useful skills, confidence and thoughtful expression.</p></article>
          <article className="rounded-2xl border border-white/10 bg-white/5 p-7 sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">Our Vision</p><p className="mt-4 text-lg leading-8 text-slate-200">To develop skilled, responsible and forward-thinking learners who use technology and business knowledge to create meaningful solutions.</p></article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-14">
          <figure>
            <div className="overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
              <ResponsiveLearningImage
                baseName="collaborative-learning"
                alt="Editorial illustration of fictional learners collaborating around laptops and a technology prototype"
                largeWidth={960}
                largeHeight={640}
                smallWidth={640}
                smallHeight={427}
                sizes="(max-width: 1023px) 100vw, 40vw"
              />
            </div>
            
          </figure>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Learning approach</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Why Learn with TIT?</h2>
            <div className="mt-7 divide-y divide-slate-200 border-y border-slate-200">
              {reasons.map(({ title, copy, Icon }, index) => (
                <div key={title} className="grid grid-cols-[42px_1fr] gap-4 py-5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700"><Icon size={19} aria-hidden="true" /></span>
                  <div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">0{index + 1}</p><h3 className="mt-1 font-bold text-slate-950">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-blue-700 px-6 py-10 text-white sm:px-10 sm:py-12"><div className="flex flex-col items-start justify-between gap-7 md:flex-row md:items-center"><div><h2 className="text-3xl font-bold">Put your ideas into action.</h2><p className="mt-3 max-w-2xl text-blue-100">Explore our courses and find your next learning opportunity.</p></div><InstituteButtonLink href="/institute/courses" variant="secondary" className="shrink-0">Explore courses <ArrowRight size={17} aria-hidden="true" /></InstituteButtonLink></div></div>
      </section>
    </div>
  );
}
