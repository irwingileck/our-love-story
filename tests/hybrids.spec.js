const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const proposals = [
  { slug: 'serra-lunar', title: 'Serra Lunar', banks: [['serra', 'estelar', 'estelar'], ['serra', 'estelar', 'estelar']], ridges: ['serra', 'serra'] },
  { slug: 'horizonte-sereno', title: 'Horizonte Sereno', banks: [['estelar', 'serra', 'serra'], ['estelar', 'serra', 'estelar']], ridges: ['estelar', 'estelar'] },
  { slug: 'ceu-das-serras', title: 'Céu das Serras', banks: [['serra', 'estelar', 'serra'], ['estelar', 'serra', 'estelar']], ridges: ['serra', 'estelar'] },
];

for (const { slug, title, banks, ridges } of proposals) {
  test(`T06 — ${slug}: accepted kits form a distinct, responsive hybrid`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
    await page.goto(`/propostas/${slug}`);
    await expect(page.locator(`[data-landscape="${slug}"]`)).toBeVisible();
    await expect(page).toHaveTitle(`${title} · Estudo de paisagem`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    const artBanks = page.locator('[data-art-bank]:visible');
    await expect(artBanks).toHaveCount(2);
    for (const [i, sources] of banks.entries()) {
      for (const [j, kind] of ['mountain', 'clouds', 'wind'].entries()) {
        const art = artBanks.nth(i).locator(`[data-artwork="${sources[j]}-${kind}"]`);
        await expect(art).toBeVisible();
        await expect(art).toHaveAttribute('focusable', 'false');
        await expect(art).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        const source = fs.readFileSync(path.join(__dirname, '../assets/landscapes', sources[j], `${kind}.svg`), 'utf8');
        const rendered = await art.evaluate((svg, text) => {
          const original = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
          const paths = node => [...node.querySelectorAll('path')].map(p => p.getAttribute('d'));
          return { equal: JSON.stringify(paths(svg)) === JSON.stringify(paths(original)), fill: svg.getAttribute('fill'), forbidden: svg.querySelectorAll('rect,image,use,foreignObject').length, paints: [...svg.querySelectorAll('[fill],[stroke]')].flatMap(e => ['fill','stroke'].map(a => e.getAttribute(a)).filter(Boolean)) };
        }, require('svgo').optimize(source).data);
        expect(rendered.equal, 'complete original engraving paths, not a placeholder').toBe(true);
        expect(rendered.fill).toBe('none');
        expect(rendered.forbidden).toBe(0);
        expect(rendered.paints.every(p => ['none', 'currentColor'].includes(p))).toBe(true);
      }
    }
    for (const [i, source] of ridges.entries()) {
      await expect(page.locator(`[data-ridge-bank="${i === 0 ? 'left' : 'right'}"]`)).toHaveAttribute('data-ridge-kit', source);
    }
    expect(await page.locator('[data-artwork^="brisa-"]').count()).toBe(0);
    for (const name of ['mountains', 'ornaments', 'particles']) {
      const layer = page.locator(`[data-layer="${name}"]`);
      await expect(layer).toHaveCount(1);
      const box = await layer.boundingBox();
      const home = await page.locator('.landscape-home').boundingBox();
      expect(box).toEqual(home);
    }
    const nav = page.getByRole('navigation', { name: 'Comparar paisagens' });
    await expect(nav.getByRole('link')).toHaveCount(3);
    await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', `/propostas/${slug}`);
    expect(await nav.getByRole('link').evaluateAll(es => es.every(e => e.getAttribute('href').includes('-') && e.title === e.getAttribute('aria-label')))).toBe(true);
    await test.step('composition has its own horizon, rhythm and negative space', async () => {
      const viewport = page.viewportSize();
      const home = await page.locator('.landscape-home').boundingBox();
      const leftPeak = await artBanks.nth(0).locator('[data-corner-mountain]').boundingBox();
      const rightPeak = await artBanks.nth(1).locator('[data-corner-mountain]').boundingBox();
      const cloud = await artBanks.nth(0).locator('[data-decorative-cloud]').boundingBox();
      const wind = await artBanks.nth(0).locator('[data-artwork$="-wind"]').boundingBox();
      if (viewport.width >= 700) {
        if (slug === 'serra-lunar') {
          expect(wind.y / home.height, 'moon and wind open the high sky').toBeLessThan(.15);
          expect(cloud.y / home.height).toBeGreaterThan(.28);
        } else if (slug === 'horizonte-sereno') {
          expect(cloud.y / home.height).toBeGreaterThan(.10);
          expect(cloud.y / home.height).toBeLessThan(.20);
          expect(leftPeak.width / viewport.width).toBeLessThan(.30);
        } else {
          expect(leftPeak.width - rightPeak.width, 'unequal engraving banks, not a symmetric swap').toBeGreaterThan(viewport.width * .015);
          expect(cloud.y / home.height).toBeGreaterThan(.18);
          expect(wind.y + wind.height, 'wind engraving clears the alpine summit').toBeLessThan(leftPeak.y - 20);
        }
      } else if (slug === 'horizonte-sereno') {
        expect(leftPeak.width / viewport.width).toBeLessThan(.30);
      } else if (slug === 'ceu-das-serras') {
        expect(leftPeak.width - rightPeak.width).toBeGreaterThan(viewport.width * .015);
      }
    });
    await test.step('motion, theme, storage fallback and responsive center remain intact', async () => {
      test.setTimeout(60000);
      const backdrop = page.locator('.landscape');
      await expect(backdrop).toHaveAttribute('aria-hidden', 'true');
      await expect(backdrop).toHaveCSS('pointer-events', 'none');
      expect(await backdrop.locator('a,button,input,[tabindex]').count()).toBe(0);
      expect(await backdrop.locator('svg').evaluateAll(es => es.every(e => e.getAttribute('focusable') === 'false'))).toBe(true);
      for (const selector of ['[data-particle]:visible', '[data-decorative-cloud]:visible', '#cloud_inf']) {
        const element = page.locator(selector).first();
        await expect.poll(() => element.evaluate(e => e.getAnimations().some(a => a.currentTime > 0 && a.playState === 'running'))).toBe(true);
        const before = await element.evaluate(e => ({ transform: getComputedStyle(e).transform, time: e.getAnimations()[0].currentTime }));
        await expect.poll(() => element.evaluate(e => getComputedStyle(e).transform)).not.toBe(before.transform);
        await expect.poll(() => element.evaluate(e => e.getAnimations()[0].currentTime)).toBeGreaterThan(before.time);
      }
      const durations = await page.locator('[data-particle]').evaluateAll(es => es.map(e => Number.parseFloat(getComputedStyle(e).animationDuration)));
      expect(Math.min(...durations)).toBeGreaterThanOrEqual(12);
      expect(new Set(durations).size).toBeGreaterThan(3);
      const counter = page.locator('.titulo-pequeno');
      await expect(counter).toContainText(/\d+ anos, \d+ meses, \d+ dias, \d+h \d+m \d+s/);
      const before = await counter.innerText();
      await expect.poll(() => counter.innerText()).not.toBe(before);
      await expect(page.getByRole('heading', { name: 'Lindeza', exact: true })).toBeVisible();
      await expect(page.locator('center h3')).toHaveText('Vc é minha brisa e ventania,Nunca deixe seubrilho se apagar.');
      await expect(page.locator('.subtitulo')).toHaveText('Pq todo segundo com vc é momento de comemoração.');
      const sizes = page.viewportSize().width < 700 ? [{ width: 393, height: 851 }, { width: 320, height: 640 }] : [{ width: 1440, height: 960 }];
      const overlaps = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
      for (const viewport of sizes) {
        await page.setViewportSize(viewport);
        for (const theme of ['dark', 'light']) {
          const button = page.getByRole('button', { name: 'Modo escuro', exact: true });
          if (await button.getAttribute('aria-pressed') !== String(theme === 'dark')) await button.click();
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
          await expect(backdrop).toHaveCSS('color', theme === 'dark' ? 'rgb(154, 183, 165)' : 'rgb(66, 109, 90)');
          for (const art of await page.locator('[data-artwork]:visible').all()) {
            await expect(art).toHaveCSS('color', theme === 'dark' ? 'rgb(154, 183, 165)' : 'rgb(66, 109, 90)');
            const box = await art.boundingBox();
            expect(box.x).toBeGreaterThanOrEqual(0);
            expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
            const vb = (await art.getAttribute('viewBox')).split(/[ ,]+/).map(Number);
            expect(box.width / box.height).toBeCloseTo(vb[2] / vb[3], 1);
            for (const message of await page.locator('center h2, center h3, center h4, center h6').all()) {
              // Contador includes block wrappers; measure actual text nodes, not full-width block boxes.
              const textBoxes = await message.evaluate(e => {
                const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
                const boxes = [];
                while (walker.nextNode()) {
                  if (!walker.currentNode.textContent.trim()) continue;
                  const r = document.createRange(); r.selectNodeContents(walker.currentNode);
                  for (const b of r.getClientRects()) boxes.push({ x:b.x, y:b.y, width:b.width, height:b.height });
                }
                return boxes;
              });
              expect(textBoxes.every(textBox => !overlaps(box, textBox)), `engraving ${await art.getAttribute('data-artwork')} must clear ${await message.getAttribute('class')} at ${viewport.width}px`).toBe(true);
            }
            if (viewport.width >= 700) expect(box.x + box.width <= viewport.width * .35 || box.x >= viewport.width * .65).toBe(true);
          }
          const n = await nav.boundingBox();
          const b = await button.boundingBox();
          expect(overlaps(n, b), 'comparison and theme control do not collide').toBe(false);
          const scene = await page.locator('.scene').boundingBox();
          expect(scene.y).toBeGreaterThanOrEqual(n.y + n.height);
          for (const link of await nav.getByRole('link').all()) {
            const box = await link.boundingBox();
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          await page.reload();
          await expect(button).toHaveAttribute('aria-pressed', String(theme === 'dark'));
        }
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect.poll(() => backdrop.evaluate(e => e.getAnimations({ subtree: true }).length)).toBe(0);
      await expect(page.locator('#cloud_inf')).not.toHaveCSS('animation-name', 'none');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      const next = proposals[(proposals.findIndex(p => p.slug === slug) + 1) % proposals.length];
      await nav.getByRole('link', { name: next.title, exact: true }).click();
      await expect(page.locator(`[data-landscape="${next.slug}"]`)).toBeVisible();
      await expect(nav.getByRole('link')).toHaveCount(3);
      await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } }));
      await page.goto(`/propostas/${slug}`);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
      await page.getByRole('button', { name: 'Modo escuro', exact: true }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
      await page.goto('/');
      await expect(page.locator('.landscape, .landscape-home')).toHaveCount(0);
      await expect(nav).toHaveCount(0);
    });
    expect(errors).toEqual([]);
  });
}
