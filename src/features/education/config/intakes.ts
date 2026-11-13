import type { EducationCourse } from '../contracts/course';

/** Management-approved first intake; future dates remain unconfirmed. */
export const FIRST_INTAKE = {
  'build-your-first-ai-assistant': { date: '2026-12-01T18:00:00+05:30', start: '18:00', end: '20:00', label: 'Tuesday, 1 December 2026, 6:00 PM–8:00 PM', fee: 'LKR 7,500' },
  'retail-kickstart': { date: '2026-12-01T20:00:00+05:30', start: '20:00', end: '22:00', label: 'Tuesday, 1 December 2026, 8:00 PM–10:00 PM', fee: 'LKR 7,500' },
  'mobile-kickstart': { date: '2026-12-07T18:00:00+05:30', start: '18:00', end: '20:00', label: 'Monday, 7 December 2026, 6:00 PM–8:00 PM', fee: 'LKR 7,500' },
  'business-management-kickstart': { date: '2026-12-07T20:00:00+05:30', start: '20:00', end: '22:00', label: 'Monday, 7 December 2026, 8:00 PM–10:00 PM', fee: 'LKR 10,000' },
} as const;
const futureCourses = new Set(['build-an-ai-knowledge-assistant', 'retail-developer-lab', 'build-and-launch-your-ai-assistant', 'retail-launchpad', 'mobile-developer-lab', 'mobile-launchpad']);
export function applyApprovedIntake(course: EducationCourse): EducationCourse {
  const details = course.plannedDetails;
  if (!details) return course;
  const intake = FIRST_INTAKE[course.slug as keyof typeof FIRST_INTAKE];
  if (!intake && !futureCourses.has(course.slug)) return course;
  const unconfirmed = 'Registration dates and deadlines are to be announced. An enquiry does not reserve a place or confirm enrolment.';
  return { ...course, plannedDetails: { ...details,
    courseStarts: intake?.date, registrationOpens: undefined, registrationDeadline: undefined,
    schedule: intake ? `${intake.label} Sri Lanka time; weekly` : 'To be announced',
    startTime: intake?.start ?? '00:00', endTime: intake?.end ?? '00:00',
    ...(intake ? { fee: intake.fee } : {}),
    interestNotice: unconfirmed,
    faqs: details.faqs.map(faq => /registration|deadline|when.*begin|arrangements|start date|schedule/i.test(faq.question)
      ? { ...faq, answer: intake ? `Planned first class: ${intake.label} Sri Lanka time. Fee: ${intake.fee}. ${unconfirmed}` : `Class dates and times are to be announced. ${unconfirmed}` } : faq),
  } };
}
