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
    for (const width of [1440, 390, 320]) {
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
      await page.locator('#notebookBtn').click();
      assert.match(await page.locator('#notebookSummary').textContent(), /1 note across 1/);
      assert.equal(await page.locator('#notebookEntries img').count(), 0);
      assert.match(await page.locator('#notebookEntries').textContent(), /<img src=x/);
      await page.locator('[data-remove-venue="hollywood-bar"]').click();
      assert.match(await page.locator('#notebookSummary').textContent(), /0 notes/);
      assert.equal(await page.locator('#detailsContent .rulevalue').textContent(), dataset.venues.find(v => v.id === 'hollywood-bar').st_label);
      await page.locator('#undoNote').click();
      assert.match(await page.locator('#notebookSummary').textContent(), /1 note/);
      await page.locator('[data-remove-venue="hollywood-bar"]').click();
      await page.locator('#closeNotebook').click();
      await page.reload();
      await page.locator('#notebookBtn').click();
      assert.match(await page.locator('#notebookSummary').textContent(), /0 notes/);
      const backup = { name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(exported)) };
      await page.locator('#importFile').setInputFiles(backup);
      await page.locator('#importPreview').waitFor({ state: 'visible' });
      assert.match(await page.locator('#importSummary').textContent(), /1 new note/);
      assert.match(await page.locator('#notebookSummary').textContent(), /0 notes/);
      await page.locator('#cancelImport').click();
      assert.equal(await page.locator('#importPreview').isVisible(), false);
      await page.locator('#importFile').setInputFiles(backup);
      await page.locator('#confirmImport').click();
      assert.match(await page.locator('#notebookSummary').textContent(), /1 note/);
      await page.locator('#importFile').setInputFiles(backup);
      await page.locator('#importPreview').waitFor({ state: 'visible' });
      assert.match(await page.locator('#importSummary').textContent(), /0 new notes, 1 duplicate/);
      assert.equal(await page.locator('#confirmImport').isDisabled(), true);
      await page.locator('#cancelImport').click();
      const older = { status: 'min', min: 2, date: '2025-01-01', notes: 'Older backup note' };
      const mixed = { local_observations: { 'hollywood-bar': [older, { status: 'min', min: 3.5, date: today }, { status: 'none', date: '2026-02-30' }], 'unknown-id': [older] }, venues: [{ id: 'hollywood-bar', st_min: 99 }] };
      await page.locator('#importFile').setInputFiles({ ...backup, buffer: Buffer.from(JSON.stringify(mixed)) });
      await page.locator('#importPreview').waitFor({ state: 'visible' });
      assert.match(await page.locator('#importSummary').textContent(), /1 new note, 0 duplicates, 3 skipped/);
      await page.locator('#confirmImport').click();
      assert.match(await page.locator('#notebookSummary').textContent(), /2 notes/);
      assert.match(await page.locator('#detailsContent .rulevalue').textContent(), /4 drinks/);
      await page.locator('#importFile').setInputFiles({ ...backup, buffer: Buffer.from('{broken json') });
      await page.waitForFunction(() => document.getElementById('notebookMessage').textContent.includes('not valid JSON'));
      assert.match(await page.locator('#notebookSummary').textContent(), /2 notes/);
      await page.locator('#closeNotebook').focus();
      await page.keyboard.press('Shift+Tab');
      assert.equal(await page.locator('#notebookDialog').evaluate(x => x.contains(document.activeElement)), true);
      if (process.env.QA_SCREENSHOT_DIR) await page.screenshot({ path: resolve(process.env.QA_SCREENSHOT_DIR, `notebook-${width}.png`) });
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#notebookDialog').isVisible(), false);
      await page.reload();
      await page.locator('#notebookBtn').click();
      assert.match(await page.locator('#notebookSummary').textContent(), /2 notes/);
      const restoredDownloading = page.waitForEvent('download');
      await page.locator('#notebookExport').click();
      const restoredExport = JSON.parse(readFileSync(await (await restoredDownloading).path(), 'utf8'));
      assert.equal(restoredExport.local_observations['hollywood-bar'].length, 2);
      assert.deepEqual(restoredExport.venues, dataset.venues);
      await page.locator('#closeNotebook').click();
      await page.locator('#closeDetail').click();
      console.log(`PASS ${width}px notebook: history, escaped content, remove/undo, restore preview/cancel, merge, duplicates, invalid input, persistence, keyboard, export`);
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
    await page.locator('#notebookBtn').click();
    assert.equal(await page.locator('#notebookStorage').isVisible(), true);
    const restoreFile = value => ({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });
    await page.locator('#importFile').setInputFiles(restoreFile({ venues: [] }));
    await page.waitForFunction(() => document.getElementById('notebookMessage').textContent.includes('local_observations'));
    await page.locator('#importFile').setInputFiles({ name: 'large.json', mimeType: 'application/json', buffer: Buffer.alloc(2 * 1024 * 1024 + 1, ' ') });
    await page.waitForFunction(() => document.getElementById('notebookMessage').textContent.includes('smaller than 2 MB'));
    const oldRecord = { status: 'min', min: 2, date: '2025-01-01', notes: 'Imported in blocked-storage session' };
    await page.locator('#importFile').setInputFiles(restoreFile({ local_observations: { 'hollywood-bar': [oldRecord] } }));
    await page.locator('#confirmImport').click();
    assert.match(await page.locator('#notebookMessage').textContent(), /session only/);
    assert.match(await page.locator('#notebookSummary').textContent(), /2 notes/);
    await page.locator('[data-remove-venue="hollywood-bar"][data-remove-index="0"]').click();
    assert.match(await page.locator('#notebookSummary').textContent(), /1 note/);
    // Restoring a removed note and then undoing must not create a duplicate.
    await page.locator('#importFile').setInputFiles(restoreFile({ local_observations: { 'hollywood-bar': [oldRecord] } }));
    await page.locator('#confirmImport').click();
    await page.locator('#undoNote').click();
    assert.match(await page.locator('#notebookSummary').textContent(), /2 notes/);
    await page.locator('#importFile').setInputFiles(restoreFile({ local_observations: { 'hollywood-bar': [{ status: 'min', min: 8, date: sessionExport.local_observations['hollywood-bar'][0].date }] } }));
    await page.locator('#confirmImport').click();
    assert.match(await page.locator('#detailsContent .rulevalue').textContent(), /No minimum/);
    const mergedDownloading = page.waitForEvent('download');
    await page.locator('#notebookExport').click();
    const mergedExport = JSON.parse(readFileSync(await (await mergedDownloading).path(), 'utf8'));
    assert.equal(mergedExport.local_observations['hollywood-bar'].length, 3);
    assert.deepEqual(mergedExport.venues, dataset.venues);
    assert.deepEqual(errors, []);
    console.log('PASS corrupted/blocked storage, safe source URLs, valid note recovery, session-only restore/export, backup limits, undo deduplication, date-tie precedence');
    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(r => server.close(r));
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
