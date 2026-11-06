export const DEPARTMENT_SLUGS = ['electronics', 'information-technology', 'business-management', 'trade-logistics', 'law-corporate-governance', 'arts-languages', 'ayurveda-wellness'] as const;
export type DepartmentSlug = (typeof DEPARTMENT_SLUGS)[number];

export interface InstituteSpecialism {
  name: string;
  description: string;
}

export interface InstituteDepartment {
  slug: DepartmentSlug;
  name: string;
  eyebrow: string;
  headline: string;
  introduction: string;
  specialisms: InstituteSpecialism[];
  skills: string[];
  projectIdeas: string[];
  courseSlugs: string[];
  relatedTrackTitle: string;
  faqs: { question: string; answer: string }[];
  developmentStatus: string;
}

export interface LearningTrackStage {
  level: 'Foundation' | 'Intermediate' | 'Advanced';
  topics: string;
  courseSlug?: string;
}

export interface LearningTrack {
  title: string;
  department: string;
  summary: string;
  whoThisMaySuit: string;
  projectExample: string;
  stages: LearningTrackStage[];
}

export interface OrganisationAudience {
  id: 'schools' | 'universities' | 'teachers' | 'businesses' | 'government-public-sector';
  name: string;
  headline: string;
  description: string;
  examples: string[];
  consultationNote: string;
}

export interface EducationContentService {
  listDepartments(): Promise<InstituteDepartment[]>;
  getDepartment(slug: string): Promise<InstituteDepartment | null>;
  listLearningTracks(): Promise<LearningTrack[]>;
  listOrganisationAudiences(): Promise<OrganisationAudience[]>;
}
