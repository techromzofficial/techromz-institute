const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const puppeteer = require(path.resolve(process.argv[2]));
const output = 'deployment-output/intake-ui';
const base = process.env.INTAKE_UI_BASE_URL || 'http://localhost:3100';
const slugs = ['build-your-first-ai-assistant', 'retail-kickstart', 'mobile-kickstart', 'business-management-kickstart'];

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const checks = [], errors = [], warnings = [];
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(20000);
    await page.setCacheEnabled(false);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() !== 'error') return;
      const value = message.text();
      if (value.includes('React does not recognize the') && value.includes('fetchPriority')) warnings.push(value);
      else errors.push(value);
    });
    for (const width of [375, 768, 1024, 1440, 1920]) {
      await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
      const response = await page.goto(`${base}/institute`, { waitUntil: 'networkidle0', timeout: 120000 });
      assert.equal(response.status(), 200);
      // Stabilize scroll positions for full-section captures on the site's smooth-scrolling page.
      await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
      const section = await page.$('section[aria-labelledby="first-intake-heading"]');
      assert.ok(section);
      const cards = await section.$$('article');
      assert.equal(cards.length, 4);
      for (const card of cards) {
        await card.evaluate(el => el.scrollIntoView({ block: 'center' }));
        await page.waitForFunction(el => { const img = el.querySelector('img'); return img.complete && img.naturalWidth > 0; }, { timeout: 20000 }, card);
      }
      const layout = await section.evaluate(el => {
        const rect = node => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
        return {
          viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, sectionWidth: el.clientWidth,
          cards: [...el.querySelectorAll('article')].map(card => ({
            rect: rect(card), button: rect(card.querySelector('a')), panel: rect(card.lastElementChild),
            href: card.querySelector('a').getAttribute('href'), text: card.innerText,
            image: { src: card.querySelector('img').currentSrc, alt: card.querySelector('img').alt, loaded: card.querySelector('img').naturalWidth > 0 },
            overflow: card.scrollWidth > card.clientWidth,
          })),
        };
      });
      // Exclude the sticky site header and development indicator from section-only captures.
      const captureStyle = await page.addStyleTag({ content: 'body header:first-of-type:not(main header), nextjs-portal { visibility: hidden !important; }' });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      const captureBox = await section.boundingBox();
      await page.screenshot({ path: `${output}/intake-${width}.png`, clip: captureBox, captureBeyondViewport: true });
      await captureStyle.evaluate(el => el.remove());
      assert.ok(layout.documentWidth <= width + 1, `document overflow at ${width}`);
      assert.ok(layout.sectionWidth <= width + 1);
      layout.cards.forEach((card, i) => {
        assert.equal(card.href, `/institute/courses/${slugs[i]}`);
        assert.ok(card.image.loaded && card.image.alt);
        assert.ok(!card.overflow, `card overflow at ${width}`);
        assert.match(card.text, /Planned intake/);
      });
      const columns = width >= 1440 ? 4 : width >= 768 ? 2 : 1;
      for (let start = 0; start < 4; start += columns) {
        const row = layout.cards.slice(start, start + columns);
        for (const card of row) {
          for (const key of ['y', 'height']) assert.ok(Math.abs(card.rect[key] - row[0].rect[key]) < 1, `${key} alignment at ${width}`);
          assert.ok(Math.abs(card.button.y - row[0].button.y) < 1, `button alignment at ${width}`);
          assert.ok(Math.abs(card.panel.y - row[0].panel.y) < 1, `panel alignment at ${width}`);
        }
      }
      if (width === 375 || width === 1440) {
        await page.addScriptTag({ path: path.resolve(process.argv[2], '../axe-core/axe.min.js') });
        const violations = await page.evaluate(async () => {
          const result = await axe.run(document.querySelector('section[aria-labelledby="first-intake-heading"]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
          return result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.html) }));
        });
        layout.accessibilityViolations = violations;
        assert.deepEqual(violations, []);
      }
      checks.push({ width, columns, ...layout });
    }
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    await page.goto(`${base}/institute`, { waitUntil: 'networkidle0' });
    const selector = 'section[aria-labelledby="first-intake-heading"] article a';
    await page.focus(selector);
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => { const el = document.activeElement, style = getComputedStyle(el); return { href: el.getAttribute('href'), outline: style.outlineStyle, outlineWidth: style.outlineWidth }; });
    assert.equal(focus.href, '/institute/courses/retail-kickstart');
    assert.notEqual(focus.outline, 'none');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const transition = await page.$eval(selector, el => getComputedStyle(el).transitionDuration);
    assert.equal(transition, '0s');
    for (const slug of slugs) {
      await page.goto(`${base}/institute`, { waitUntil: 'networkidle0' });
      const title = await page.$eval(`${selector}[href="/institute/courses/${slug}"]`, el => el.closest('article').querySelector('h3').textContent);
      await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 120000 }), page.click(`${selector}[href="/institute/courses/${slug}"]`)]);
      assert.equal(new URL(page.url()).pathname, `/institute/courses/${slug}`);
      assert.equal(await page.$$eval('h1', els => els.length), 1);
      assert.equal(await page.$eval('h1', el => el.textContent), title);
    }
    assert.deepEqual(errors, []);
    const report = { passed: true, checks, keyboardFocus: focus, reducedMotionTransition: transition, detailLinks: slugs, consoleErrors: errors, existingDevWarnings: warnings.length };
    fs.writeFileSync(`${output}/browser.json`, JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ passed: true, widths: checks.map(c => c.width), columns: checks.map(c => c.columns), keyboardFocus: focus, links: slugs.length, consoleErrors: errors, existingDevWarnings: warnings.length }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
