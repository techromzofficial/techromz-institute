import { FIRST_INTAKE } from '../config/intakes';

import type { EducationCourse } from '../contracts/course';

import { instituteIndexingEnabled, isApprovedCourseForIndexing } from '../config/site';

const site = 'https://techromzit.com';

export const organization = { '@type': 'EducationalOrganization', '@id': `${site}/institute#organization`, name: 'Techromz Institute of Technology', url: `${site}/institute`, logo: `${site}/images/institute/techromz-institute-logo.png` };

export function JsonLd({ data }: { data: object }) {

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, String.fromCharCode(92) + 'u003c') }} />;

}
export function CourseStructuredData({ course }: { course: EducationCourse }) {

  if (!instituteIndexingEnabled || course.publicationStatus === 'unpublished' || !isApprovedCourseForIndexing(course)) return null;

  const url = `${site}/institute/courses/${course.slug}`;

  const intake = FIRST_INTAKE[course.slug as keyof typeof FIRST_INTAKE];

  return <JsonLd data={{ '@context': 'https://schema.org', '@graph': [

    { '@type': 'Course', '@id': `${url}#course`, url, name: course.title, description: course.summary, provider: organization, ...(intake ? { hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', startDate: intake.date, offers: { '@type': 'Offer', price: intake.fee.replace(/[^0-9]/g, ''), priceCurrency: 'LKR', url } } } : {}) },

    { '@type': 'BreadcrumbList', itemListElement: [

      { '@type': 'ListItem', position: 1, name: 'Institute', item: `${site}/institute` },

      { '@type': 'ListItem', position: 2, name: 'Courses', item: `${site}/institute/courses` },

      { '@type': 'ListItem', position: 3, name: course.title, item: url },

    ] },

  ] }} />;

}



export function CatalogueStructuredData({ courses }: { courses: EducationCourse[] }) {

  if (!instituteIndexingEnabled) return null;

  const eligible = courses.filter(course => course.publicationStatus !== 'unpublished' && isApprovedCourseForIndexing(course));

  return <JsonLd data={{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: eligible.map((course, index) => ({ '@type': 'ListItem', position: index + 1, url: `${site}/institute/courses/${course.slug}` })) }} />;

}



export function DepartmentStructuredData({ slug, name, courses }: { slug: string; name: string; courses: EducationCourse[] }) {

  if (!instituteIndexingEnabled) return null;

  const url = `${site}/institute/departments/${slug}`;

  const eligible = courses.filter(course => course.publicationStatus !== 'unpublished' && isApprovedCourseForIndexing(course));

  return <JsonLd data={{ '@context': 'https://schema.org', '@graph': [

    { '@type': 'CollectionPage', '@id': `${url}#department`, url, name, mainEntity: { '@type': 'ItemList', itemListElement: eligible.map((course, index) => ({ '@type': 'ListItem', position: index + 1, url: `${site}/institute/courses/${course.slug}` })) } },

    { '@type': 'BreadcrumbList', itemListElement: [

      { '@type': 'ListItem', position: 1, name: 'Institute', item: `${site}/institute` },

      { '@type': 'ListItem', position: 2, name: 'Departments', item: `${site}/institute/departments` },

      { '@type': 'ListItem', position: 3, name, item: url },

    ] },

  ] }} />;

}
