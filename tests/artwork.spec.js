const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
// Fingerprints of the nine reviewed, independently authored original vector masters.
const originals = {
  "serra": {
    "mountain": "6b671a595b1d1184ce9e0907f40098790c41a19962a238eaa115c6ced17f7b88",
    "clouds": "e916cebea181e3938899fc0b27b6fc28f8c270a80f24cce804b6f69653a55310",
    "wind": "73ef99ca79c8d6fad653610cf57aeabd21d20c46c100d777fc88b6a2b8ed1245"
  },
  "brisa": {
    "mountain": "5dacb9b968ead3efafea9e2b998984f19aa8ce3227dd98eae3f7283c2797f983",
    "clouds": "cb8e5077f2d2be2b34c3ae1fad6e4d50124f37fe82be22795bc193066bf9b1ea",
    "wind": "352385114313a78fc52d74a5d7dbdbacb86604612105580d8418d6ef80888c8c"
  },
  "estelar": {
    "mountain": "13d4a505a91ee22f70132544b8726f39c819ec34d9fe51128976b6d758774935",
    "clouds": "7e4f6dca739c49d68bdd918dba038705ac3764997a957b03cf36b49e2d54a62c",
    "wind": "c9efca88aff7ab8dfd40f478aca980ac40166d424bc374622448775ff4a15dbf"
  }
};

for (const variant of ['serra', 'brisa', 'estelar']) {
  test(`T05 — ${variant}: original transparent vector kit is rendered, not recycled scene art`, async ({ page }) => {
    await page.goto(`/propostas/${variant}`);
    await expect(page.locator(`[data-artwork="${variant}-mountain"]:visible`)).toHaveCount(2);
    for (const kind of ['mountain', 'clouds', 'wind']) {
      const filename = path.join(__dirname, '../assets/landscapes', variant, `${kind}.svg`);
      expect(fs.existsSync(filename), `reviewed ${variant}/${kind} master exists`).toBe(true);
      const source = fs.readFileSync(filename, 'utf8');
      expect(createHash('sha256').update(source).digest('hex')).toBe(originals[variant][kind]);
      expect(source).not.toBe(fs.readFileSync(path.join(__dirname, '../assets/nuvem_inf.svg'), 'utf8'));
      const parsed = await page.evaluate((text) => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const svg = doc.documentElement;
        return {
          valid: !doc.querySelector('parsererror') && svg.localName === 'svg' && svg.hasAttribute('viewBox'),
          background: svg.getAttribute('fill'),
          forbidden: doc.querySelectorAll('rect, image, foreignObject, script, style, use, [href]').length,
          paints: [...doc.querySelectorAll('[fill], [stroke]')].flatMap(e => ['fill','stroke'].map(a => e.getAttribute(a)).filter(Boolean)),
        };
      }, source);
      expect(parsed.valid).toBe(true);
      expect(parsed.background).toBe('none');
      expect(parsed.forbidden).toBe(0);
      expect(parsed.paints.every(paint => ['none', 'currentColor'].includes(paint))).toBe(true);
      const art = page.locator(`[data-artwork="${variant}-${kind}"]:visible`);
      await expect(art).toHaveCount(2);
      for (const svg of await art.all()) {
        await expect(svg).toHaveAttribute('focusable', 'false');
        await expect(svg).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
        expect(await svg.locator('path').count()).toBeGreaterThan(3);
      }
    }
    await test.step('engraved artwork is legible, proportionate and composed around negative space in both themes', async () => {
      const mobile = page.viewportSize().width < 700;
      const clouds = page.locator(`[data-artwork="${variant}-clouds"]:visible`);
      const left = await clouds.nth(0).boundingBox();
      const right = await clouds.nth(1).boundingBox();
      expect(Math.abs(left.y - right.y), 'cloud banks have deliberate asymmetric heights').toBeGreaterThan(35);
      for (const kind of ['mountain', 'clouds', 'wind']) {
        for (const svg of await page.locator(`[data-artwork="${variant}-${kind}"]:visible`).all()) {
          const box = await svg.boundingBox();
          const vb = await svg.getAttribute('viewBox');
          const [, , w, h] = vb.split(/[ ,]+/).map(Number);
          expect(box.width / box.height).toBeCloseTo(w / h, 1);
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
          expect(box.width).toBeGreaterThanOrEqual(page.viewportSize().width * (mobile ? .27 : .22));
          if (!mobile) {
            expect(box.x + box.width <= page.viewportSize().width * .35 || box.x >= page.viewportSize().width * .65).toBe(true);
          }
          const opacity = await svg.evaluate(e => {
            let opacity = 1;
            for (let node = e; node && !node.classList.contains('landscape-home'); node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
            return opacity;
          });
          expect(opacity, 'fine engraved contours must not be hidden by near-transparent ancestors').toBeGreaterThanOrEqual(.45);
          expect(opacity, 'central artwork retains contrast priority').toBeLessThanOrEqual(.8);
        }
      }
      const path = page.locator(`[data-artwork="${variant}-mountain"]:visible path`).first();
      const light = await path.evaluate(e => getComputedStyle(e).stroke);
      expect(light).not.toBe('none');
      await page.getByRole('button', { name: 'Modo escuro', exact: true }).click();
      await expect(path).not.toHaveCSS('stroke', light);
      await expect(path).toHaveCSS('stroke', 'rgb(154, 183, 165)');
      const dark = await path.evaluate(e => getComputedStyle(e).stroke);
      for (const svg of await page.locator('[data-artwork]:visible').all()) {
        await expect(svg).toHaveCSS('color', dark);
        await expect(svg).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      }
      await page.getByRole('button', { name: 'Modo escuro', exact: true }).click();
      await expect(path).toHaveCSS('stroke', light);
    });
    await test.step('mobile cloud scrolls remain readable and clear the main illustration clusters', async () => {
      if (page.viewportSize().width >= 700) return;
      const scene = await page.locator('.scene').boundingBox();
      const clouds = page.locator(`[data-artwork="${variant}-clouds"]:visible`);
      for (const cloud of await clouds.all()) {
        const box = await cloud.boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(page.viewportSize().width * .39);
        expect(box.y).toBeGreaterThanOrEqual(scene.y + scene.height - 115);
        expect(box.y + box.height).toBeLessThanOrEqual(scene.y + scene.height + 26);
      }
      for (const wind of await page.locator(`[data-artwork="${variant}-wind"]:visible`).all()) {
        const box = await wind.boundingBox();
        expect(box.y + box.height).toBeLessThanOrEqual(scene.y + 50);
      }
    });
    const component = fs.readFileSync(path.join(__dirname, '../components/Landscape.jsx'), 'utf8');
    expect(component).not.toMatch(/nuvem_inf|MountainDrawing|skyArc/);
  });
}
