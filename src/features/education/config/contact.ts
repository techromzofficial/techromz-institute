export const INSTITUTE_CONTACT = {
  whatsappDisplay: '+94 77 366 3604',
  whatsappNumber: '94773663604',
  email: 'info@techromzit.com',
  enrolmentsEmail: 'enrolments@techromzit.com',
} as const;

export const ARDUINO_BUNDLE_SCHEDULE = {
  timeZone: 'Asia/Colombo',
  registrationOpens: '2026-11-01T00:00:00+05:30',
  courseStarts: '2026-12-01T00:00:00+05:30',
} as const;

export const RETAIL_KICKSTART_SCHEDULE = {
  timeZone: 'Asia/Colombo',
  registrationOpens: '2026-11-01T00:00:00+05:30',
  courseStarts: '2026-12-01T00:00:00+05:30',
} as const;

export function formatInstituteDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: ARDUINO_BUNDLE_SCHEDULE.timeZone,
  }).format(new Date(value));
}

export function getInstituteContactLinks(courseTitle?: string) {
  const context = courseTitle ? `the ${courseTitle}` : 'Techromz Institute courses';
  const message = `Hello Techromz Institute, I am interested in ${context}.`;
  return {
    whatsapp: `https://wa.me/${INSTITUTE_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`,
    email: getCourseEnquiryEmailLink(courseTitle),
  };
}

export function getCourseEnquiryEmailLink(courseTitle?: string) {
  const title = courseTitle ?? 'Techromz Institute Course';
  const subject = `Course Enquiry - ${title}`;
  const body = `Hello Techromz Institute,\n\nI would like to request more information about the following course:\n\nCourse: ${title}\n\nMy enquiry:\n\nThank you.`;
  return `mailto:${INSTITUTE_CONTACT.enrolmentsEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getGeneralContactLinks() {
  const message = 'Hello Techromz Institute, I have a question about your courses, learning roadmaps or organisational training.';
  return {
    whatsapp: `https://wa.me/${INSTITUTE_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`,
    email: `mailto:${INSTITUTE_CONTACT.email}?subject=${encodeURIComponent('Techromz Institute enquiry')}`,
  };
}

export function getSchoolWorkshopContactLinks() {
  const message = 'Hello Techromz Institute, I would like to request information about a free technology workshop for a government school. I understand that requests depend on programme capacity, scheduling and available resources.';
  return {
    whatsapp: `https://wa.me/${INSTITUTE_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`,
    email: `mailto:${INSTITUTE_CONTACT.email}?subject=${encodeURIComponent('School Workshop Request')}`,
  };
}

export function getOrganisationContactLinks(audience: string) {
  const message = `Hello Techromz Institute, I would like to discuss proposed training for ${audience}. I understand that availability and programme details require consultation and confirmation.`;
  const subject = `Training enquiry for ${audience}`;
  return {
    whatsapp: `https://wa.me/${INSTITUTE_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`,
    email: `mailto:${INSTITUTE_CONTACT.email}?subject=${encodeURIComponent(subject)}`,
  };
}

export function getDepartmentContactLinks(department: string) {
  const message = `Hello Techromz Institute, I would like to ask about proposed ${department} learning. I understand that programme details and availability require confirmation.`;
  const subject = `${department} learning enquiry`;
  return {
    whatsapp: `https://wa.me/${INSTITUTE_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`,
    email: `mailto:${INSTITUTE_CONTACT.email}?subject=${encodeURIComponent(subject)}`,
  };
}

export function getTrackContactLinks(track: string) {
  const context = track === 'learning roadmap' ? 'a proposed learning roadmap' : `the proposed ${track} learning track`;
  const message = `Hello Techromz Institute, I would like to express interest in ${context}. I understand that this does not reserve a place and that course availability requires confirmation.`;
  const subject = track === 'learning roadmap' ? 'Learning roadmap interest' : `${track} learning track interest`;
  return {
    whatsapp: `https://wa.me/${INSTITUTE_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`,
    email: `mailto:${INSTITUTE_CONTACT.email}?subject=${encodeURIComponent(subject)}`,
  };
}
