const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, filename) => {
  if (!filename.startsWith(path.join(root, 'src') + path.sep)) throw new Error('Unexpected TypeScript dependency');
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText, filename);
};
require.extensions['.tsx'] = require.extensions['.ts'];
(async () => {
  const { educationCourseService } = require('../src/features/education/services/courseService.ts');
  const { FIRST_INTAKE } = require('../src/features/education/config/intakes.ts');
  const courses = await educationCourseService.listCourses();
  assert.equal(courses.length, 37);
  for (const slug of ['fashion-apparel-design', 'bags-accessories-design', 'fragrance-product-development', 'fashion-production-quality-management', 'medicinal-plants-herbal-materials', 'ayurvedic-product-manufacturing-gmp', 'ayurvedic-product-quality-regulatory-compliance']) assert.equal(await educationCourseService.getCourse(slug), null);
  for (const [slug, intake] of Object.entries(FIRST_INTAKE)) {
    const c = await educationCourseService.getCourse(slug);
    assert.equal(c.plannedDetails.courseStarts, intake.date);
    assert.equal(c.plannedDetails.fee, intake.fee);
    assert.equal(c.plannedDetails.registrationDeadline, undefined);
  }
  const { educationContentService } = require('../src/features/education/services/contentService.ts');
  assert.equal((await educationContentService.listDepartments()).length, 7);
  process.env.INSTITUTE_ONLY_MODE = 'true';
  process.env.INSTITUTE_ALLOW_INDEXING = 'true';
  process.env.NEXT_PUBLIC_APP_URL = 'https://techromzit.com';
  const policy = require('../src/features/education/config/site.ts');
  assert.equal(policy.instituteIndexingEnabled, true);
  const { renderToStaticMarkup } = require('react-dom/server');
  const { CourseStructuredData, JsonLd } = require('../src/features/education/components/StructuredData.tsx');
  const fixture = { ...courses.find(c => c.slug === 'retail-kickstart'), demo: false, seoIndexable: true };
  const output = renderToStaticMarkup(CourseStructuredData({ course: fixture }));
  const graph = JSON.parse(output.replace(/^.*?<script[^>]*>/s, '').replace(/<\/script>.*$/s, ''));
  assert.equal(graph['@graph'][0].hasCourseInstance.startDate, FIRST_INTAKE['retail-kickstart'].date);
  assert.equal(CourseStructuredData({ course: { ...fixture, publicationStatus: 'unpublished' } }), null);
  assert.equal(CourseStructuredData({ course: { ...fixture, demo: true } }), null);
  const special = { name: '</script><script>example</script>', description: 'A < B' };
  const safe = renderToStaticMarkup(JsonLd({ data: special }));
  const payload = safe.slice(safe.indexOf('>') + 1, safe.lastIndexOf('</script>'));
  assert.equal(payload.includes('<'), false);
  assert.deepEqual(JSON.parse(payload), special);
  console.log('PASS: trusted metadata gate, fixture JSON-LD parsing and hidden/demo schema suppression.');
  console.log('PASS: 37 public courses, 7 hidden courses, 7 departments, 4 approved intake dates/fees. Source-data checks only; no HTTP or integration claim.');
})().catch(error => { console.error(error); process.exitCode = 1; });
