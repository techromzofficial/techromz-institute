export const STANDARD_COURSE_DELIVERY_MODE = 'Live Online via Zoom';
export const STANDARD_COURSE_TEACHING_LANGUAGE = 'Sinhala';

/** Keeps approval and operational notes in data while presenting only the currency amount. */
export function formatCourseFee(value?: string): string | undefined {
  if (!value) return undefined;
  return value.match(/LKR\s*[\d,]+/i)?.[0].replace(/LKR\s*/i, 'LKR ') ?? value;
}
