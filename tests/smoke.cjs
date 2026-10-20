// Optional development-only browser checks. The shipped site has no dependencies.
const assert = require('node:assert/strict');
const { readFileSync, mkdirSync } = require('node:fs');
const { createServer } = require('node:http');
const { resolve } = require('node:path');
const { chromium } = require('playwright');
const source = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
const dataset = JSON.parse(source.match(/const DB=(.*);/)[1]);
const key = 'the-six-field-observations-v1';

async function main() {
  assert.equal(new Set(dataset.venues.map(v => v.id)).size, dataset.venues.length);
  for (const v of dataset.venues) {
    assert.ok(['left', 'right'].includes(v.side));
    assert.ok(['nightwish', 'baba', 'better', 'panda', 'unconfirmed'].includes(v.group));
    assert.ok(v.st_min === null || (Number.isInteger(v.st_min) && v.st_min >= 0));
    if (v.st_min !== null) assert.ok(v.rule_source && v.rule_date);
  }
  // Serve only the app, never repository metadata or local credentials.
  const server = createServer((req, res) => {
    if (req.url.split('?')[0] !== '/') { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(source);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = process.env.BASE_URL || `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch();
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(base);
      assert.equal(await page.locator('#resultsCount').textContent(), String(dataset.venues.length));
      assert.equal(await page.locator('#listView').isVisible(), false);
      assert.equal(await page.locator('#reportDialog').isVisible(), false);
      if (process.env.QA_SCREENSHOT_DIR) {
        mkdirSync(process.env.QA_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: resolve(process.env.QA_SCREENSHOT_DIR, `the-six-${width}.png`), fullPage: true });
      }
      await page.locator('#listToggle').click();
      assert.equal(await page.locator('#streetView').isVisible(), false);
      assert.equal(await page.locator('#listView').isVisible(), true);
      await page.locator('#search').fill('hollywood');
      assert.equal(await page.locator('#resultsCount').textContent(), '1');
      await page.locator('#listView [data-id="hollywood-bar"]').click();
      assert.match(await page.locator('#detailsContent').textContent(), /Source desk/);
      assert.ok(await page.locator('#detailsContent a[href^="https://"]').count() > 0);
      await page.locator('#addObservation').click();
      assert.equal(await page.locator('#reportVenueId').inputValue(), 'hollywood-bar');
      const today = await page.locator('#observedDate').inputValue();
      assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
      await page.locator('#status').selectOption('min');
      await page.locator('#cancelDialog').click();
      // Reopening after selecting a minimum must reset the hidden required field.
      await page.locator('#addObservation').click();
      assert.equal(await page.locator('#minValue').evaluate(x => x.required), false);
      await page.locator('#closeDialog').focus();
      await page.keyboard.press('Shift+Tab');
      assert.equal(await page.evaluate(() => document.activeElement.type), 'submit');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'closeDialog');
      await page.locator('#status').selectOption('min');
      await page.locator('#minValue').fill('4');
      await page.locator('#reportNotes').fill('<img src=x onerror="window.injected=true">');
      await page.locator('#reportForm button[type="submit"]').click();
      assert.match(await page.locator('#savedNote').textContent(), /Saved only on this device/);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#details').evaluate(x => x.classList.contains('open')), true);
      assert.equal(await page.evaluate(() => document.activeElement.id), 'addObservation');
      assert.match(await page.locator('#detailsContent').textContent(), /Observed:/);
      assert.equal(await page.locator('#detailsContent img').count(), 0);
      assert.equal(await page.evaluate(() => window.injected), undefined);
      const saved = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
      assert.equal(saved['hollywood-bar'].at(-1).min, 4);
      assert.equal(saved['hollywood-bar'].at(-1).date, today);
      await page.reload();
      assert.match(await page.locator('#detailsContent .rulevalue').textContent(), /4 drinks \(your note\)/);
      const downloading = page.waitForEvent('download');
      await page.locator('#exportBtn').click();
      const download = await downloading;
      const exported = JSON.parse(readFileSync(await download.path(), 'utf8'));
      assert.deepEqual(exported.venues, dataset.venues);
      assert.equal(exported.local_observations['hollywood-bar'].at(-1).min, 4);
      // Close the mobile sheet before reaching controls beneath it.
      await page.locator('#closeDetail').click();
      await page.locator('#search').fill('');
      await page.locator(width < 680 ? '#mobileGroups [data-group="baba"]' : '#groupFilters [data-group="baba"]').click();
      assert.equal(Number(await page.locator('#resultsCount').textContent()), dataset.venues.filter(v => v.group === 'baba').length);
      if (width < 680) await page.locator('#mobileRules').selectOption('min');
      else await page.locator('input[name="rules"][value="min"]').check();
      const expected = dataset.venues.filter(v => v.group === 'baba' && v.st_min > 0).length;
      assert.equal(Number(await page.locator('#resultsCount').textContent()), expected);
      assert.equal(await page.locator('#mobileRules').inputValue(), 'min');
      assert.equal(await page.locator('input[name="rules"][value="min"]').isChecked(), true);
      await page.locator('#streetToggle').click();
      assert.equal(await page.locator('#streetGrid .filtered:not(:disabled)').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.goto(base + '#bar=%E0%A4%A');
      await page.reload();
      assert.equal(await page.locator('#resultsCount').textContent(), String(dataset.venues.length));
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}px: views, search, groups, report filters, evidence, modal, note persistence, escaping, export, malformed URL`);
      await context.close();
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base);
    for (const corrupt of ['[]', '42', '{bad json', JSON.stringify({ 'hollywood-bar': {}, 'fire-bar': [null, { status: 'min', min: 1.5, date: '2026-02-30' }] })]) {
      await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, corrupt]);
      await page.goto(base + '#bar=hollywood-bar');
      await page.reload();
      assert.match(await page.locator('#detailsContent').textContent(), /Hollywood/);
    }
    assert.equal(await page.evaluate(() => safeURL('javascript:alert(1)')), '#');
    assert.equal(await page.evaluate(() => safeURL('data:text/html,test')), '#');
    assert.equal(await page.evaluate(() => safeURL('https://example.com/source')), 'https://example.com/source');
    // A valid existing note survives alongside malformed entries.
    await page.evaluate(([k, date]) => localStorage.setItem(k, JSON.stringify({ 'hollywood-bar': [null, { status: 'none', min: null, date, notes: 'Valid note' }] })), [key, '2026-01-01']);
    await page.reload();
    assert.match(await page.locator('.rulevalue').textContent(), /No minimum \(your note\)/);
    await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('Blocked'); }; Storage.prototype.setItem = () => { throw new Error('Blocked'); }; });
    await page.reload();
    await page.locator('#addObservation').click();
    await page.locator('#status').selectOption('none');
    await page.locator('#reportForm button[type="submit"]').click();
    assert.match(await page.locator('#savedNote').textContent(), /session only/);
    await page.keyboard.press('Escape');
    const downloading = page.waitForEvent('download');
    await page.locator('#exportBtn').click();
    const sessionExport = JSON.parse(readFileSync(await (await downloading).path(), 'utf8'));
    assert.equal(sessionExport.local_observations['hollywood-bar'].at(-1).status, 'none');
    assert.deepEqual(errors, []);
    console.log('PASS corrupted/blocked storage, safe source URLs, valid note recovery, session-only export');
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(r => server.close(r));
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
