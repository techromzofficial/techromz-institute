const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
// Reuse a separately installed browser tool; do not add it to production dependencies.
const puppeteer = require(path.resolve(process.argv[2]));
(async () => {
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox','--disable-gpu']});
 const results=[];
 try {
  const page=await browser.newPage();await page.setCacheEnabled(false);page.setDefaultTimeout(15000);
  const routes=['/institute','/institute/courses/mobile-kickstart','/institute/departments/arts-languages','/institute/contact','/institute/verify','/institute/admin'];
  for(const width of [390,768,1440]) {
   await page.setViewport({width,height:900,deviceScaleFactor:1});
   for(const route of routes) {
    const response=await page.goto('http://localhost:3100'+route,{waitUntil:'networkidle0',timeout:30000});assert.equal(response.status(),200);
    const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,main:document.querySelectorAll('main').length}));
    assert.ok(layout.scroll<=layout.width+1,`${route} overflows at ${width}: ${layout.scroll}`);assert.equal(layout.h1,1,route);assert.equal(layout.main,1,route);
    results.push({width,route,...layout});
    if(route==='/institute') await page.screenshot({path:`deployment-output/validation/home-${width}.png`,fullPage:false});
   }
  }
  await page.setViewport({width:390,height:900,deviceScaleFactor:1});await page.goto('http://localhost:3100/institute',{waitUntil:'networkidle0'});
  await page.focus('button[aria-label="Toggle navigation"]');await page.keyboard.press('Enter');
  assert.equal(await page.$eval('button[aria-label="Toggle navigation"]',el=>el.getAttribute('aria-expanded')),'true');
  const nav=await page.$eval('nav[aria-label="Mobile institute navigation"]',el=>({visible:el.getBoundingClientRect().height>0,links:el.querySelectorAll('a').length}));assert.ok(nav.visible && nav.links>=6);
  await page.keyboard.press('Tab');
  const focus=await page.evaluate(()=>{const el=document.activeElement,style=getComputedStyle(el),rect=el.getBoundingClientRect();return {tag:el.tagName,label:el.textContent.trim(),visible:rect.width>0&&rect.height>0,outline:style.outlineStyle,outlineWidth:style.outlineWidth};});
  assert.ok(focus.visible);assert.notEqual(focus.tag,'BODY');assert.notEqual(focus.outline,'none');
  await page.screenshot({path:'deployment-output/validation/mobile-menu-focus.png',fullPage:false});
  const report={passed:true,results,mobileNavigation:nav,keyboardFocus:focus,scope:'No enquiry submitted, no database or email acceptance claimed.'};fs.writeFileSync('deployment-output/validation/browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
