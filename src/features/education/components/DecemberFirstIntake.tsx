import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, GraduationCap, Laptop, ShoppingCart, Smartphone, Tag, UsersRound, type LucideIcon } from 'lucide-react';
import type { EducationCourse, EducationSubject } from '../contracts/course';
import { FIRST_INTAKE } from '../config/intakes';
import styles from './DecemberFirstIntake.module.css';

export function formatIntakeTimeRange(start: string, end: string) {
  const formatHour = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
  };

  return `${formatHour(start)}–${formatHour(end)}`;
}

type FirstIntake = (typeof FIRST_INTAKE)[keyof typeof FIRST_INTAKE];

const categoryIcons: Partial<Record<EducationSubject, LucideIcon>> = {
  'Information Technology': Laptop,
  'Retail Eco System / Retail Software Development': ShoppingCart,
  'Mobile App Development': Smartphone,
  'Business & Management': UsersRound,
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Colombo',
});

function timeLabel(value: string) {
  const [hour, minutes] = value.split(':');
  const hours = Number(hour);
  return `${hours % 12 || 12}:${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
}

function IntakeCourseCard({ course, intake }: { course: EducationCourse; intake: FirstIntake }) {
  const CategoryIcon = categoryIcons[course.subject] ?? Laptop;
  const category = course.subject.split(' / ');
  const date = dateFormatter.format(new Date(intake.date));
  const time = `${timeLabel(intake.start)}–${timeLabel(intake.end)}`;
  const [currency, amount] = intake.fee.split(' ');
  const image = course.image;
  const sizes = '(min-width: 1664px) 386px, (min-width: 1440px) calc((100vw - 120px) / 4), (min-width: 768px) calc((100vw - 72px) / 2), calc(100vw - 32px)';
  const avif = image?.replace(/\.webp$/, '.avif');
  const imageSources = (source: string) => source.endsWith('-1200.webp') || source.endsWith('-1200.avif')
    ? `${source.replace('-1200.', '-768.')} 768w, ${source} 1200w`
    : source;

  return <article className={styles.card} aria-labelledby={`first-intake-${course.slug}`}>
    <div className={styles.imageHeader}>
      {image && <picture className={styles.picture}>
        {avif && <source type="image/avif" srcSet={imageSources(avif)} sizes={sizes} />}
        <source type="image/webp" srcSet={imageSources(image)} sizes={sizes} />
        <Image src={image} alt={course.plannedDetails?.imageAlt ?? `${course.title} learning workspace`} fill sizes={sizes} loading="lazy" draggable={false} className={styles.image} />
      </picture>}
      <div className={styles.category}><CategoryIcon size={24} aria-hidden="true" /><span>{category[0]}{category.length > 1 && <> / <br />{category.slice(1).join(' / ')}</>}</span></div>
    </div>
    <div className={styles.body}>
      <div className={styles.badges}>
        <span className={styles.level}><GraduationCap size={17} aria-hidden="true" />{course.level}</span>
        <span className={styles.status}><CalendarDays size={16} aria-hidden="true" />Planned intake</span>
      </div>
      <h3 id={`first-intake-${course.slug}`} className={styles.title}>{course.title}</h3>
      {course.subtitle && <p className={styles.subtitle}>{course.subtitle}</p>}
      <p className={styles.description}>{course.summary}</p>
      <Link href={`/institute/courses/${course.slug}`} className={styles.button} aria-label={`View details about ${course.title}`}>
        View details <ArrowRight size={22} aria-hidden="true" />
      </Link>
    </div>
    <div className={styles.information}>
      <div className={styles.schedule}><CalendarDays size={21} aria-hidden="true" /><div><time dateTime={intake.date}>{date}</time><p>{time}</p></div></div>
      <div className={styles.fee}><Tag size={21} aria-hidden="true" /><div><span>{currency}</span><strong>{amount}</strong></div></div>
    </div>
  </article>;
}

export default function DecemberFirstIntake({ courses, showCards = true }: { courses: EducationCourse[]; showCards?: boolean }) {
  return <section aria-labelledby="first-intake-heading" className={styles.section}>
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.eyebrow}><CalendarDays size={23} aria-hidden="true" />Course Intakes</p>
        <h2 id="first-intake-heading" className={styles.heading}>December 2026 <span>first intake</span></h2>
        <p className={styles.introduction}>Practical live online learning for Sri Lankan learners. These intakes are planned; enquiries do not confirm admission or payment availability. All times are Sri Lanka time.</p>
      </header>
      {showCards && <div className={styles.grid}>
        {Object.entries(FIRST_INTAKE).map(([slug, intake]) => {
          const course = courses.find(item => item.slug === slug && item.publicationStatus !== 'unpublished');
          return course ? <IntakeCourseCard key={slug} course={course} intake={intake} /> : null;
        })}
      </div>}
    </div>
  </section>;
}
