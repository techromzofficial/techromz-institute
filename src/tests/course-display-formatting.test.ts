import { describe, expect, it } from 'vitest';
import { formatCourseFee, STANDARD_COURSE_DELIVERY_MODE, STANDARD_COURSE_TEACHING_LANGUAGE } from '@/features/education/config/courseDisplay';

describe('shared public course display formatting', () => {
  it.each([
    ['LKR 10,000 proposed — not approved for payment', 'LKR 10,000'],
    ['LKR 20,000 proposed fee · pending approval', 'LKR 20,000'],
    ['LKR 30,000 (Pending Approval)', 'LKR 30,000'],
  ])('shows only the amount from %s', (input, expected) => {
    expect(formatCourseFee(input)).toBe(expected);
  });

  it('uses the approved minimal delivery labels', () => {
    expect(STANDARD_COURSE_DELIVERY_MODE).toBe('Live Online via Zoom');
    expect(STANDARD_COURSE_TEACHING_LANGUAGE).toBe('Sinhala');
  });
});
