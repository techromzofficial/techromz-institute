export const EDUCATION_SUBJECTS = ['Electronics & Engineering', 'Information Technology', 'Mobile App Development', 'Retail Eco System / Retail Software Development', 'Business & Management', 'Trade & Logistics', 'Law & Corporate Governance', 'Arts & Languages', 'Ayurveda & Wellness'] as const;
export const EDUCATION_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
export type EducationSubject = (typeof EDUCATION_SUBJECTS)[number];
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];
export type CoursePublicationStatus = 'published' | 'unpublished';
export type CourseAvailabilityStatus = 'available' | 'coming-soon' | 'enquiry-only';
export interface CourseOutlineItem { title: string; topics: string[]; }
export interface EducationMiniCourse {
  id: string; title: string; description: string; image: string;
}
export interface EducationBundleDetails {
  totalDuration: string; fee: string; languages: string[]; instructor: string;
  notice: string; registrationOpens: string; courseStarts: string;
  miniCourses: EducationMiniCourse[];
}
export interface EducationCourseWeek {
  title: string;
  lessons: [string, string];
  lab: string;
  outcome: string;
}
export interface EducationWeeklyCourseSession {
  title: string;
  objectives: string[];
  activity: string;
  deliverable?: string;
  outcome: string;
}
export interface EducationCourseAdmissions {
  heading: string;
  summary: string;
  applicationItems: string[];
  reviewCriteria: { label: string; weight: string }[];
  alternativeRoute: string;
  reviewNote: string;
  capacityNotice?: string;
}
export interface EducationPlannedCourseDetails {
  provider: string;
  duration: string;
  cohortCapacity: string;
  prerequisites: string;
  schedule: string;
  totalLiveLearning: string;
  independentPractice: string;
  finalProject: string;
  certificate: string;
  fee?: string;
  registrationOpens?: string;
  registrationDeadline?: string;
  courseStarts?: string;
  teachingLanguage: string;
  deliveryMode: string;
  startTime: string;
  endTime: string;
  timeZone: 'Asia/Colombo';
  heroCopy: string;
  heroTagline?: string;
  imageBaseName?: string;
  imageAlt?: string;
  admissionFact?: string;
  facts?: { label: string; value: string; icon: 'duration' | 'level' | 'class-size' | 'learning' | 'admission' }[];
  audienceHeadline?: string;
  audiences: string[];
  requirements: string[];
  requirementNote?: string;
  learningHeadline?: string;
  learningNote?: string;
  conceptExplanation?: { term: string; explanation: string; caution: string };
  curriculumHeadline?: string;
  curriculumNote?: string;
  curriculumIntroduction?: string;
  curriculumLabel?: string;
  curriculum: EducationCourseWeek[];
  weeklyCurriculum?: EducationWeeklyCourseSession[];
  projectTitle?: string;
  projectIntroduction?: string;
  projectTopics: string[];
  projectFeatures: string[];
  projectTestPlan?: string[];
  projectRecordFields?: string[];
  projectPreview?: { appName: string; heading: string; note: string; placeholder: string; result: string; disclaimer: string };
  included: string[];
  includedNote?: string;
  recognitionStatement?: string;
  assessment: { label: string; weight: string }[];
  completionRequirements: string[];
  assessmentNote?: string;
  completionPolicyNote?: string;
  certificateLines?: string[];
  admissions?: EducationCourseAdmissions;
  relatedCourse?: { slug: string; title: string; note: string };
  pathwayCourses?: { slug: string; title: string; level: EducationLevel }[];
  scopeExclusions?: string[];
  division?: 'Creative Arts & Design' | 'Languages & Cultural Studies';
  practicalActivities?: string[];
  careerApplications?: string[];
  industryProjectLearning?: boolean;
  interestNotice?: string;
  faqs: { question: string; answer: string }[];
}
export interface EducationCourse {
  slug: string; title: string; subtitle?: string; subject: EducationSubject; level: EducationLevel;
  /** Legacy records without a status remain published. */
  publicationStatus?: CoursePublicationStatus;
  availabilityStatus?: CourseAvailabilityStatus;
  summary: string; description: string; learningOutcomes: string[];
  outline: CourseOutlineItem[]; detailsToConfirm: string[];
  accent: 'blue' | 'indigo' | 'cyan'; demo: boolean; image?: string;
  seoIndexable?: boolean;
  keywords?: string[];
  bundle?: EducationBundleDetails;
  plannedDetails?: EducationPlannedCourseDetails;
}
export interface EducationCourseService {
  listCourses(): Promise<EducationCourse[]>;
  getCourse(slug: string): Promise<EducationCourse | null>;
}
