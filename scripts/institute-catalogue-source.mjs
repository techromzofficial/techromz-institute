import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Compile the existing authoritative catalogue for CLI use. No duplicate catalogue.
export async function readCatalogue() {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'institute-catalogue-'));
  try {
    const root = path.resolve('src/features/education');
    const program = ts.createProgram([path.join(root, 'services/courseService.ts'), path.join(root, 'data/instituteContent.ts')], {
      outDir: temporary, rootDir: root, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      skipLibCheck: true, esModuleInterop: true, noEmitOnError: true,
    });
    const result = program.emit();
    if (result.emitSkipped) throw new Error('CATALOGUE_COMPILATION_FAILED');
    const require = createRequire(import.meta.url);
    const { educationCourseService } = require(path.join(temporary, 'services/courseService.js'));
    const { INSTITUTE_DEPARTMENTS } = require(path.join(temporary, 'data/instituteContent.js'));
    const all = [];
    for (const [file, name] of [
      ['demoCourses', 'DEMO_COURSES'], ['electronicsTechnologyCourses', 'ELECTRONICS_TECHNOLOGY_COURSES'],
      ['businessCourses', 'BUSINESS_COURSES'], ['tradeLogisticsCourses', 'TRADE_LOGISTICS_COURSES'],
      ['lawCorporateGovernanceCourses', 'LAW_CORPORATE_GOVERNANCE_COURSES'], ['artsLanguagesCourses', 'ARTS_LANGUAGES_COURSES'],
      ['ayurvedaWellnessCourses', 'AYURVEDA_WELLNESS_COURSES'],
    ]) all.push(...require(path.join(temporary, `data/${file}.js`))[name]);
    const published = await educationCourseService.listCourses();
    if (INSTITUTE_DEPARTMENTS.length !== 7 || all.filter(c => c.publicationStatus === 'unpublished').length !== 7) throw new Error('CATALOGUE_VISIBILITY_REVIEW_REQUIRED');
    const courses = published.map(course => {
      const department = INSTITUTE_DEPARTMENTS.find(d => d.courseSlugs.includes(course.slug));
      if (!department) throw new Error('COURSE_DEPARTMENT_MISSING');
      return { slug: course.slug, title: course.title, department: department.slug, visibility: 'published',
        feeDisplay: course.plannedDetails?.fee ?? course.bundle?.fee ?? null, deliveryMode: course.plannedDetails?.deliveryMode ?? null,
        registrationDeadline: course.plannedDetails?.registrationDeadline ?? null, startsAt: course.plannedDetails?.courseStarts ?? null };
    });
    if (new Set(courses.map(c => c.slug)).size !== courses.length) throw new Error('DUPLICATE_COURSE_SLUG');
    return { departments: INSTITUTE_DEPARTMENTS.map(d => ({ slug: d.slug, name: d.name })), courses,
      unpublished: all.filter(c => c.publicationStatus === 'unpublished').map(c => ({ slug: c.slug, title: c.title })) };
  } finally {
    // mkdtemp supplies a concrete owned directory, checked before recursive cleanup.
    const resolved = path.resolve(temporary);
    if (path.dirname(resolved) === path.resolve(os.tmpdir()) && path.basename(resolved).startsWith('institute-catalogue-')) await fs.rm(resolved, { recursive: true });
  }
}
