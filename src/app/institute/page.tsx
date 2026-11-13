import { JsonLd, organization } from '@/features/education/components/StructuredData';
import { instituteIndexingEnabled } from '@/features/education/config/site';
import type { Metadata } from 'next';
import InstituteHomepage from '@/features/education/components/InstituteHomepage';
import { educationContentService } from '@/features/education/services/contentService';
import { educationCourseService } from '@/features/education/services/courseService';
import { instituteMetadata } from '@/features/education/config/site';

export const metadata: Metadata = instituteMetadata('/institute', { absolute: 'Techromz Institute of Technology' }, 'Explore practical technology, business, trade, law, arts, languages, Ayurveda and wellness learning directions at Techromz Institute of Technology.');

export default async function InstituteHomePage() {
  const [departments, tracks, courses] = await Promise.all([
    educationContentService.listDepartments(),
    educationContentService.listLearningTracks(),
    educationCourseService.listCourses(),
  ]);

  return <>{instituteIndexingEnabled && <JsonLd data={{ '@context': 'https://schema.org', '@graph': [organization, { '@type': 'WebSite', '@id': 'https://techromzit.com/institute#website', url: 'https://techromzit.com/institute', name: organization.name, publisher: { '@id': organization['@id'] } }] }}/>}<InstituteHomepage departments={departments} tracks={tracks} courses={courses} /></>;
}
