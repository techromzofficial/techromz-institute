import { applyApprovedIntake } from '../config/intakes';
import type { EducationCourse, EducationCourseService } from '../contracts/course';
import { DEMO_COURSES } from '../data/demoCourses';
import { BUSINESS_COURSES } from '../data/businessCourses';
import { TRADE_LOGISTICS_COURSES } from '../data/tradeLogisticsCourses';
import { LAW_CORPORATE_GOVERNANCE_COURSES } from '../data/lawCorporateGovernanceCourses';
import { ARTS_LANGUAGES_COURSES } from '../data/artsLanguagesCourses';
import { AYURVEDA_WELLNESS_COURSES } from '../data/ayurvedaWellnessCourses';
import { ELECTRONICS_TECHNOLOGY_COURSES } from '../data/electronicsTechnologyCourses';

export const PUBLIC_COURSE_SLUGS = [
  'electronics-fundamentals-circuit-building',
  'electronics-repair-troubleshooting',
  'build-your-first-ai-assistant',
  'retail-kickstart',
  'build-an-ai-knowledge-assistant',
  'retail-developer-lab',
  'build-and-launch-your-ai-assistant',
  'retail-launchpad',
  'mobile-kickstart',
  'mobile-developer-lab',
  'mobile-launchpad',
  'business-management-kickstart',
  'entrepreneurship-small-business-kickstart',
  'marketing-business-growth-lab',
  'business-operations-financial-management-lab',
  'strategic-business-leadership',
  'digital-business-transformation-strategy',
  'international-trade-kickstart',
  'logistics-warehouse-operations-kickstart',
  'import-export-operations-lab',
  'procurement-inventory-distribution-lab',
  'international-trade-supply-chain-strategy',
  'logistics-leadership-optimization',
  'business-company-law-kickstart',
  'contracts-legal-documentation-kickstart',
  'corporate-governance-compliance-lab',
  'employment-workplace-law-lab',
  'commercial-law-dispute-resolution',
  'international-business-law-legal-risk-strategy',
  'creative-branding-packaging-design',
  'fashion-apparel-design',
  'bags-accessories-design',
  'gem-jewellery-design',
  'fragrance-product-development',
  'fashion-production-quality-management',
  'sinhala-language-cultural-heritage',
  'japanese-language-communication',
  'korean-language-communication',
  'foundations-of-ayurveda-wellness',
  'ayurveda-centre-operations-patient-care',
  'ayurveda-therapy-assistance-safety',
  'medicinal-plants-herbal-materials',
  'ayurvedic-product-manufacturing-gmp',
  'ayurvedic-product-quality-regulatory-compliance',
] as const;

const publicCourseSlugs = new Set<string>(PUBLIC_COURSE_SLUGS);

export function isCoursePublished(course: EducationCourse): boolean {
  return course.publicationStatus !== 'unpublished';
}

class LocalEducationCourseService implements EducationCourseService {
  private readonly courses = [...DEMO_COURSES, ...ELECTRONICS_TECHNOLOGY_COURSES, ...BUSINESS_COURSES, ...TRADE_LOGISTICS_COURSES, ...LAW_CORPORATE_GOVERNANCE_COURSES, ...ARTS_LANGUAGES_COURSES, ...AYURVEDA_WELLNESS_COURSES];
  private prepareForPublicDiscovery(course: EducationCourse): EducationCourse {
    course = applyApprovedIntake(course);
    const publishedSlugs = new Set(this.courses.filter(isCoursePublished).map(({ slug }) => slug));
    if (!course.plannedDetails) return course;
    const pathwayCourses = course.plannedDetails.pathwayCourses?.filter(({ slug }) => publishedSlugs.has(slug));
    const relatedCourse = course.plannedDetails.relatedCourse && publishedSlugs.has(course.plannedDetails.relatedCourse.slug)
      ? course.plannedDetails.relatedCourse
      : undefined;
    return { ...course, plannedDetails: { ...course.plannedDetails, pathwayCourses, relatedCourse } };
  }
  async listCourses(): Promise<EducationCourse[]> {
    return this.courses.filter((course) => publicCourseSlugs.has(course.slug) && isCoursePublished(course)).map((course) => this.prepareForPublicDiscovery(course));
  }
  async getCourse(slug: string): Promise<EducationCourse | null> {
    if (!publicCourseSlugs.has(slug)) return null;
    const course = this.courses.find((item) => item.slug === slug);
    return course && isCoursePublished(course) ? this.prepareForPublicDiscovery(course) : null;
  }
}
export const educationCourseService: EducationCourseService = new LocalEducationCourseService();
