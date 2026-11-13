import { afterEach, describe, expect, it, vi } from 'vitest';
import { educationCourseService } from '@/features/education/services/courseService';
import { FIRST_INTAKE } from '@/features/education/config/intakes';
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });
describe('approved publication and intake remediation', () => {
  it('preserves exactly 37 public courses and hides all seven unpublished courses', async () => {
    expect(await educationCourseService.listCourses()).toHaveLength(37);
    for (const slug of ['fashion-apparel-design', 'bags-accessories-design', 'fragrance-product-development', 'fashion-production-quality-management', 'medicinal-plants-herbal-materials', 'ayurvedic-product-manufacturing-gmp', 'ayurvedic-product-quality-regulatory-compliance']) expect(await educationCourseService.getCourse(slug)).toBeNull();
  });
  it('uses approved launch times and fees without asserting registration dates', async () => {
    for (const [slug, intake] of Object.entries(FIRST_INTAKE)) {
      const details = (await educationCourseService.getCourse(slug))!.plannedDetails!;
      expect(details.courseStarts).toBe(intake.date);
      expect(details.fee).toBe(intake.fee);
      expect(details.registrationDeadline).toBeUndefined();
      expect(details.startTime).toBe(intake.start);
      expect(details.endTime).toBe(intake.end);
    }
  });
  it('removes unapproved future dates from public IT records', async () => {
    for (const slug of ['build-an-ai-knowledge-assistant', 'retail-developer-lab', 'build-and-launch-your-ai-assistant', 'retail-launchpad', 'mobile-developer-lab', 'mobile-launchpad']) {
      const details = (await educationCourseService.getCourse(slug))!.plannedDetails!;
      expect(details.courseStarts).toBeUndefined();
      expect(details.registrationDeadline).toBeUndefined();
      expect(JSON.stringify(details.faqs)).not.toMatch(/27 November|2 December 2026|3 December 2026/);
    }
  });
  it('fails closed for staging even with the search switch enabled', async () => {
    vi.stubEnv('INSTITUTE_ALLOW_INDEXING', 'true'); vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://staging.example.com');
    const policy = await import('@/features/education/config/site');
    expect(policy.instituteIndexingEnabled).toBe(false);
    expect(policy.instituteMetadata('/institute', 'TIT', 'Practical learning').alternates?.canonical).toBe('https://techromzit.com/institute');
  });
});

it('escapes JSON-LD script delimiters without changing the parsed facts', async () => {
  const { JsonLd } = await import('@/features/education/components/StructuredData');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const data = { name: '</script><script>alert(1)</script>', description: 'A < B' };
  const markup = renderToStaticMarkup(JsonLd({ data }));
  const payload = markup.slice(markup.indexOf('>') + 1, markup.lastIndexOf('</script>'));
  expect(payload).not.toContain('<');
  expect(JSON.parse(payload)).toEqual(data);
});
