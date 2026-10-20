const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const proposals = [{ slug: 'ceu-aberto', title: 'Céu Aberto', banks: [['serra', 'estelar', 'serra'], ['estelar', 'serra', 'estelar']], ridges: ['serra', 'estelar'] }, { slug: 'brisa-das-serras', title: 'Brisa das Serras', banks: [['serra', 'estelar', 'serra'], ['estelar', 'serra', 'estelar']], ridges: ['serra', 'estelar'] }];

for (const { slug, title, banks, ridges } of proposals) {
  test(`T07 — ${slug}: selected sky keeps its engraving and soft silhouettes without lower peaks`, async ({ page }) => {
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
        if (kind === 'mountain') continue;
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
    await test.step('lower mist is original transparent engraving, or entirely absent in Aberto', async () => {
      const mist = page.locator('[data-lower-mist]');
      await expect(mist).toHaveCount(slug === 'brisa-das-serras' ? 4 : 0);
      if (slug !== 'brisa-das-serras') return;
      for (const side of ['left', 'right']) {
        const art = page.locator(`[data-art-bank="${side}"]:visible [data-lower-mist]`);
        const source = fs.readFileSync(path.join(__dirname, `../assets/landscapes/refinements/mist-${side}.svg`), 'utf8');
        expect(source).not.toMatch(/<(?:rect|image|use|script|foreignObject)\b|https?:\/\/(?!www.w3.org)|(?:href|opacity)=/);
        const normalized = require('svgo').optimize(source).data;
        expect(await art.evaluate((svg, master) => {
          const original = new DOMParser().parseFromString(master, 'image/svg+xml').documentElement;
          const paths = e => [...e.querySelectorAll('path')].map(p => p.getAttribute('d'));
          return paths(svg).length > 8 && JSON.stringify(paths(svg)) === JSON.stringify(paths(original));
        }, normalized)).toBe(true);
        await expect(art).toHaveAttribute('fill', 'none');
        await expect(art).toHaveAttribute('aria-hidden', 'true');
        await expect(art).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        expect(await art.evaluate(e => [...e.querySelectorAll('[fill],[stroke]')].flatMap(p => ['fill', 'stroke'].map(a => p.getAttribute(a)).filter(Boolean)).every(p => ['none', 'currentColor'].includes(p)))).toBe(true);
      }
    });
    const nav = page.getByRole('navigation', { name: 'Comparar paisagens' });
    await expect(nav.getByRole('link')).toHaveCount(2);
    await expect(nav.getByRole('link')).toHaveText(['Aberto', 'Brisa']);
    await expect(nav.getByRole('link', { name: 'Céu Aberto', exact: true })).toHaveCount(1);
    await expect(nav.getByRole('link', { name: 'Brisa das Serras', exact: true })).toHaveCount(1);
    await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', `/propostas/${slug}`);
    expect(await nav.getByRole('link').evaluateAll(es => es.every(e => e.getAttribute('href').includes('-') && e.title === e.getAttribute('aria-label')))).toBe(true);
    await test.step('only lower peaks change; real approved ridge and upper geometry survive', async () => {
      await expect(page.locator('[data-corner-mountain]')).toHaveCount(0);
      const snapshot = () => page.evaluate(() => {
        const paths = e => [...e.querySelectorAll('path')].map(p => p.getAttribute('d'));
        return {
          ridges: [...document.querySelectorAll('[data-ridge-bank]')].map(e => ({ paths:paths(e), width:getComputedStyle(e).width, transform:[...e.querySelectorAll('svg')].map(s => getComputedStyle(s).transform) })),
          upper: [...document.querySelectorAll('[data-artwork]')].filter(e => !e.hasAttribute('data-lower-mist')).map(e => ({ paths:paths(e), source:e.dataset.artwork, top:getComputedStyle(e).top, width:getComputedStyle(e).width })),
          particles: [...document.querySelectorAll('[data-particle]')].map(e=>e.outerHTML)
        };
      });
      const actual = await snapshot();
      await page.goto('/propostas/ceu-das-serras');
      await expect(page.locator('[data-corner-mountain]')).toHaveCount(4);
      const reference = await snapshot();
      reference.upper = reference.upper.filter(e => !e.source.endsWith('-mountain'));
      expect(actual).toEqual(reference);
      expect(actual.ridges.every(r => r.paths.length === 8 && r.paths.every(d => d.length > 50))).toBe(true);
      await page.goto(`/propostas/${slug}`);
    });
    await test.step('motion, theme, storage fallback and responsive center remain intact', async () => {
      test.setTimeout(60000);
      const backdrop = page.locator('.landscape');
      await expect(backdrop).toHaveAttribute('aria-hidden', 'true');
      await expect(backdrop).toHaveCSS('pointer-events', 'none');
      expect(await backdrop.locator('a,button,input,[tabindex]').count()).toBe(0);
      expect(await backdrop.locator('svg').evaluateAll(es => es.every(e => e.getAttribute('focusable') === 'false'))).toBe(true);
      for (const selector of ['[data-particle]:visible', '[data-decorative-cloud]:visible', '#cloud_inf', ...(slug === 'brisa-das-serras' ? ['[data-lower-mist]:visible'] : [])]) {
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
            for (const control of [nav, button]) {
              expect(overlaps(box, await control.boundingBox()), 'engraving clears top controls').toBe(false);
            }
            if (await art.getAttribute('data-lower-mist') !== null) {
              const home = await page.locator('.landscape-home').boundingBox();
              expect(box.y + box.height, 'lower engraving stays inside page').toBeLessThanOrEqual(home.y + home.height);
            }
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
      await expect(nav.getByRole('link')).toHaveCount(2);
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
