import { INSTITUTE_DEPARTMENT_NAVIGATION } from '../config/navigation';
import { educationCourseService } from './courseService';
import type { EducationContentService } from '../contracts/content';
import { INSTITUTE_DEPARTMENTS, LEARNING_TRACKS, ORGANISATION_AUDIENCES } from '../data/instituteContent';

class LocalEducationContentService implements EducationContentService {
  async listDepartments() {
    const published = new Set((await educationCourseService.listCourses()).map(({ slug }) => slug));
    const order = INSTITUTE_DEPARTMENT_NAVIGATION.map(({ href }) => href.split('/').pop());
    return [...INSTITUTE_DEPARTMENTS].sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug)).map((department) => {
      if (!['arts-languages', 'ayurveda-wellness'].includes(department.slug)) return department;
      const count = department.courseSlugs.filter((slug) => published.has(slug)).length;
      const correctCount = (text: string) => text.replace(/\b(nine|six)\b/gi, String(count));
      return { ...department, introduction: correctCount(department.introduction), developmentStatus: correctCount(department.developmentStatus), faqs: department.faqs.map((faq) => ({ ...faq, answer: correctCount(faq.answer) })) };
    });
  }
  async getDepartment(slug: string) { return (await this.listDepartments()).find((department) => department.slug === slug) ?? null; }
  async listLearningTracks() { return LEARNING_TRACKS; }
  async listOrganisationAudiences() { return ORGANISATION_AUDIENCES; }
}

export const educationContentService: EducationContentService = new LocalEducationContentService();
