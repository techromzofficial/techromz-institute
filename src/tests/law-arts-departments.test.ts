import { describe, expect, it } from 'vitest';
import { educationContentService } from '@/features/education/services/contentService';
import { educationCourseService } from '@/features/education/services/courseService';
import { isApprovedCourseForIndexing } from '@/features/education/config/site';
import { ARTS_LANGUAGES_COURSES } from '@/features/education/data/artsLanguagesCourses';

const lawSlugs = [
  'business-company-law-kickstart',
  'contracts-legal-documentation-kickstart',
  'corporate-governance-compliance-lab',
  'employment-workplace-law-lab',
  'commercial-law-dispute-resolution',
  'international-business-law-legal-risk-strategy',
];
const lawCourses = [
  { slug: 'business-company-law-kickstart', title: 'Business & Company Law', image: 'business-company-law' },
  { slug: 'contracts-legal-documentation-kickstart', title: 'Contracts & Legal Documentation', image: 'contracts-legal-documentation' },
  { slug: 'corporate-governance-compliance-lab', title: 'Corporate Governance & Compliance', image: 'corporate-governance-compliance' },
  { slug: 'employment-workplace-law-lab', title: 'Employment & Workplace Law', image: 'employment-workplace-law' },
  { slug: 'commercial-law-dispute-resolution', title: 'Commercial Law & Dispute Resolution', image: 'commercial-law-dispute-resolution' },
  { slug: 'international-business-law-legal-risk-strategy', title: 'International Business Law & Legal Risk Strategy', image: 'international-business-law-legal-risk-strategy' },
];
const artsSlugs = ['creative-branding-packaging-design', 'fashion-apparel-design', 'bags-accessories-design', 'gem-jewellery-design', 'fragrance-product-development', 'fashion-production-quality-management', 'sinhala-language-cultural-heritage', 'japanese-language-communication', 'korean-language-communication'];
const artsImages = [
  'creative-branding-packaging-design',
  'fashion-apparel-design',
  'bags-accessories-design',
  'gem-jewellery-design',
  'fragrance-product-development',
  'fashion-production-quality-management',
  'sinhala-language-cultural-heritage',
  'japanese-language-communication',
  'korean-language-communication',
];
const unpublishedArtsSlugs = ['fashion-apparel-design', 'bags-accessories-design', 'fragrance-product-development', 'fashion-production-quality-management'];
const publishedArtsSlugs = artsSlugs.filter((slug) => !unpublishedArtsSlugs.includes(slug));

describe('Law and Arts department catalogue integration', () => {
  it('registers the approved Arts & Languages catalogue', async () => {
    const departments = await educationContentService.listDepartments();
    const law = departments.find((item) => item.slug === 'law-corporate-governance');
    const arts = departments.find((item) => item.slug === 'arts-languages');

    expect(departments).toHaveLength(7);
    expect(law?.courseSlugs).toEqual(lawSlugs);
    expect(arts?.courseSlugs).toEqual(artsSlugs);
    expect(arts?.developmentStatus).toContain('Nine planned course pages');
  });

  it.each(publishedArtsSlugs)('keeps %s planned, no-index and enquiry-only', async (slug) => {
    const course = await educationCourseService.getCourse(slug);
    expect(course).not.toBeNull();
    expect(course?.subject).toBe('Arts & Languages');
    expect(course?.plannedDetails?.interestNotice).toContain('does not reserve a seat');
    expect(course?.plannedDetails?.fee).toBeUndefined();
    expect(isApprovedCourseForIndexing(course!)).toBe(false);
  });

  it.each(artsImages)('retains the approved image for %s', async (slug) => {
    const course = ARTS_LANGUAGES_COURSES.find((item) => item.slug === slug);
    expect(course?.image).toBe(`/images/institute/arts-languages/${slug}.webp`);
    expect(course?.plannedDetails?.imageBaseName).toBe(`arts-languages/${slug}`);
    expect(course?.plannedDetails?.imageAlt).toBeTruthy();
  });

  it.each(unpublishedArtsSlugs)('retains but blocks %s from public discovery and direct lookup', async (slug) => {
    expect(ARTS_LANGUAGES_COURSES.find((course) => course.slug === slug)?.publicationStatus).toBe('unpublished');
    expect(await educationCourseService.getCourse(slug)).toBeNull();
  });

  it('publishes five of the nine Arts & Languages records', async () => {
    const courses = (await educationCourseService.listCourses()).filter((course) => course.subject === 'Arts & Languages');
    expect(courses.map((course) => course.slug)).toEqual(publishedArtsSlugs);
    expect(ARTS_LANGUAGES_COURSES).toHaveLength(9);
  });

  it.each(lawSlugs)('keeps %s planned, no-index and enquiry-only', async (slug) => {
    const course = await educationCourseService.getCourse(slug);
    expect(course).not.toBeNull();
    expect(course?.subject).toBe('Law & Corporate Governance');
    expect(course?.plannedDetails?.weeklyCurriculum).toHaveLength(8);
    expect(course?.plannedDetails?.interestNotice).toContain('do not reserve a seat');
    expect(isApprovedCourseForIndexing(course!)).toBe(false);
    expect(course?.plannedDetails?.fee).toContain('not approved for payment');
  });

  it.each(lawCourses)('maps $title to its approved image and display title', async ({ slug, title, image }) => {
    const course = await educationCourseService.getCourse(slug);
    expect(course?.title).toBe(title);
    expect(course?.image).toBe(`/images/institute/learning/generated/law/${image}.webp`);
    expect(course?.plannedDetails?.imageBaseName).toBe(`law/${image}`);
  });
});
