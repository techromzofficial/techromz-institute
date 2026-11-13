const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, filename) => {
  if (!filename.startsWith(path.join(root, 'src') + path.sep)) throw new Error('Unexpected dependency');
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText, filename);
};
require.extensions['.tsx'] = require.extensions['.ts'];
(async () => {
 const courses = await require('../src/features/education/services/courseService.ts').educationCourseService.listCourses();
 const departments = await require('../src/features/education/services/contentService.ts').educationContentService.listDepartments();
 const hidden=['fashion-apparel-design','bags-accessories-design','fragrance-product-development','fashion-production-quality-management','medicinal-plants-herbal-materials','ayurvedic-product-manufacturing-gmp','ayurvedic-product-quality-regulatory-compliance'];
 const results=[];
 async function check(route,status){const res=await fetch('http://localhost:3100'+route,{redirect:'manual',signal:AbortSignal.timeout(15000)});const body=await res.text();assert.equal(res.status,status,route);results.push({route,status:res.status});return {res,body};}
 for(const c of courses) { const page=await check('/institute/courses/'+c.slug,200); assert.match(page.body,/name="robots" content="[^"]*noindex/); assert.ok(page.body.includes('rel="canonical" href="https://techromzit.com/institute/courses/'+c.slug+'"')); assert.match(page.res.headers.get('x-robots-tag')||'',/noindex/); assert.ok(!page.body.includes('type="application/ld+json"')); }
 for(const d of departments) { const page=await check('/institute/departments/'+d.slug,200); assert.ok(page.body.includes('rel="canonical" href="https://techromzit.com/institute/departments/'+d.slug+'"')); assert.ok(!/<title>Department of [^<]* Department/.test(page.body)); }
 for(const slug of hidden) await check('/institute/courses/'+slug,404);
 for(const route of ['/api/institute/admin/dashboard','/api/institute/admin/registrations','/api/institute/admin/enquiries','/api/institute/course-enquiries/local-outbox','/api/institute/course-enquiries/delivery']) {const res=await fetch('http://localhost:3100'+route,{redirect:'manual',signal:AbortSignal.timeout(15000)});assert.ok([401,403,404,405,503].includes(res.status),route+': '+res.status);results.push({route,status:res.status});}
 for(const route of ['/api/institute/admin/registrations','/api/institute/course-enquiries/delivery']) { const res=await fetch('http://localhost:3100'+route,{method:'POST',headers:{'content-type':'application/json'},body:'{}',redirect:'manual',signal:AbortSignal.timeout(15000)}); assert.ok([400,401,403,404,503].includes(res.status),route+': '+res.status);results.push({route,method:'POST',status:res.status}); }
 await check('/admin/analytics',404);
 const home=await check('/institute',200);
 assert.match(home.body,/name="robots" content="[^"]*noindex/);
 assert.match(home.body,/rel="canonical" href="https:\/\/techromzit.com\/institute"/);
 assert.match(home.body,/property="og:/); assert.match(home.body,/name="twitter:/);
 assert.match(home.res.headers.get('x-robots-tag')||'',/noindex/);
 const robots=await check('/robots.txt',200);assert.match(robots.body,/Disallow: \/(?:\r?\n|$)/);
 const sitemap=await check('/sitemap.xml',200);for(const slug of hidden)assert.ok(!sitemap.body.includes(slug));
 const report={passed:true,publicCourses:courses.length,departments:departments.length,hiddenCourses:hidden.length,results,robots:robots.body,xRobotsTag:home.res.headers.get('x-robots-tag')};
 fs.writeFileSync('deployment-output/validation/http.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
