import type { EducationContentService } from '../contracts/content';
import { INSTITUTE_DEPARTMENTS, LEARNING_TRACKS, ORGANISATION_AUDIENCES } from '../data/instituteContent';

class LocalEducationContentService implements EducationContentService {
  async listDepartments() { return INSTITUTE_DEPARTMENTS; }
  async getDepartment(slug: string) { return INSTITUTE_DEPARTMENTS.find((department) => department.slug === slug) ?? null; }
  async listLearningTracks() { return LEARNING_TRACKS; }
  async listOrganisationAudiences() { return ORGANISATION_AUDIENCES; }
}

export const educationContentService: EducationContentService = new LocalEducationContentService();
