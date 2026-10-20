const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  page.__errors = [];
  page.on('pageerror', (error) => page.__errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') page.__errors.push(message.text());
  });
});
test.afterEach(async ({ page }) => expect(page.__errors).toEqual([]));

for (const variant of ['serra', 'brisa', 'estelar']) {
test(`T04 — ${variant}: preview landscape preserves home and exposes independent scenery`, async ({ page }) => {
  await test.step('landscape is opt-in and keeps the original message and drawing', async () => {
    let originalRidges;
    if (variant !== 'serra') {
      await page.goto('/propostas/serra');
      originalRidges = await page.locator('[data-layer="mountains"] path').evaluateAll((es) => es.map((e) => e.getAttribute('d')));
    }
    await page.goto(`/propostas/${variant}`);
    await expect(page.locator(`[data-landscape="${variant}"]`)).toBeVisible();
    if (originalRidges) {
      const ridges = await page.locator('[data-layer="mountains"] path').evaluateAll((es) => es.map((e) => e.getAttribute('d')));
      expect(ridges).not.toEqual(originalRidges);
    }
    for (const layer of ['mountains', 'ornaments', 'particles']) {
      const element = page.locator(`[data-layer="${layer}"]`);
      await expect(element).toHaveCount(1);
      await expect(element.locator('svg')).not.toHaveCount(0);
    }
    await expect(page.getByRole('heading', { name: 'Lindeza', exact: true })).toBeVisible();
    await expect(page.locator('.scene #diamond')).toHaveCount(1);
    await expect(page.locator('.subtitulo')).toHaveText('Pq todo segundo com vc é momento de comemoração.');
  });
  await test.step('decorative layers fill the page without intercepting input or hiding the center', async () => {
    const backdrop = page.locator('.landscape');
    await expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    await expect(backdrop).toHaveCSS('pointer-events', 'none');
    expect(await backdrop.locator('a, button, input, [tabindex]').count()).toBe(0);
    expect(await backdrop.locator('svg').evaluateAll((es) => es.every((e) => e.getAttribute('focusable') === 'false'))).toBe(true);
    const bounds = await page.locator('.landscape-home').boundingBox();
    for (const name of ['mountains', 'ornaments', 'particles']) {
      const layer = page.locator(`[data-layer="${name}"]`);
      const box = await layer.boundingBox();
      expect(box.x).toBe(0);
      expect(box.y).toBe(0);
      expect(box.width).toBe(bounds.width);
      expect(box.height).toBe(bounds.height);
      await expect(layer).toHaveCSS('pointer-events', 'none');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const mobile = page.viewportSize().width < 700;
    await expect(page.locator('.landscape-mobile').first()).toBeVisible({ visible: mobile });
    await expect(page.locator('.landscape-desktop').first()).toBeVisible({ visible: !mobile });
    await expect(page.locator('[data-layer="ornaments"] .landscape-mobile')).toHaveCount(2);
    await expect(page.locator('[data-layer="ornaments"] .landscape-mobile').first()).toBeVisible({ visible: mobile });
    if (mobile) {
      const mountains = page.locator('[data-layer="ornaments"] .landscape-mobile [data-corner-mountain]');
      await expect(mountains).toHaveCount(2);
      for (const mountain of await mountains.all()) {
        const box = await mountain.boundingBox();
        expect(box.width).toBeLessThanOrEqual(page.viewportSize().width * .32);
      }
    }
    expect(await page.locator('[data-layer="mountains"] path').count()).toBeGreaterThanOrEqual(6);
    await expect(page.locator('.landscape-home')).toHaveCSS('filter', 'none');
    await expect(page.locator('.scene')).toHaveCSS('filter', 'none');
  });
  await test.step('new ink adapts softly to both themes without replacing the illustration', async () => {
    const backdrop = page.locator('.landscape');
    const ink = await backdrop.evaluate((e) => getComputedStyle(e).color);
    const ridge = page.locator('[data-layer="mountains"] path').first();
    const wash = await ridge.evaluate((e) => getComputedStyle(e).fill);
    await page.locator('.scene').evaluate((e) => e.dataset.preserved = 'yes');
    await page.getByRole('button', { name: 'Modo escuro', exact: true }).click();
    await expect(backdrop).not.toHaveCSS('color', ink);
    await expect(ridge).not.toHaveCSS('fill', wash);
    expect(await backdrop.evaluate((e) => parseFloat(getComputedStyle(e).transitionDuration))).toBeGreaterThan(0);
    await expect(page.locator('.scene')).toHaveAttribute('data-preserved', 'yes');
    for (const locator of [page.locator('html'), page.locator('body'), page.locator('.landscape-home'), backdrop]) {
      await expect(locator).toHaveCSS('filter', 'none');
    }
    await page.getByRole('button', { name: 'Modo escuro', exact: true }).click();
    await expect(backdrop).toHaveCSS('color', ink);
    await expect(ridge).toHaveCSS('fill', wash);
  });
  await test.step('deterministic edge particles and cloud ornaments move slowly and independently', async () => {
    const particle = page.locator('[data-particle]').first();
    await expect(particle).toBeVisible();
    const before = await particle.evaluate((e) => ({ transform: getComputedStyle(e).transform, time: e.getAnimations()[0]?.currentTime }));
    expect(before.time).not.toBeUndefined();
    expect(await particle.evaluate((e) => e.getAnimations()[0].effect.getTiming().duration)).toBeGreaterThanOrEqual(12000);
    await expect.poll(() => particle.evaluate((e) => getComputedStyle(e).transform)).not.toBe(before.transform);
    await expect.poll(() => particle.evaluate((e) => e.getAnimations()[0].currentTime)).toBeGreaterThan(before.time);
    const durations = await page.locator('[data-particle]').evaluateAll((es) => es.map((e) => getComputedStyle(e).animationDuration));
    expect(new Set(durations).size).toBeGreaterThan(1);
    const cloud = page.locator('[data-decorative-cloud]:visible').first();
    const cloudBefore = await cloud.evaluate((e) => getComputedStyle(e).transform);
    await expect.poll(() => cloud.evaluate((e) => getComputedStyle(e).transform)).not.toBe(cloudBefore);
    const originalCloud = page.locator('#cloud_inf');
    await expect.poll(() => originalCloud.evaluate((e) => e.getAnimations().some((a) => a.effect.getTiming().iterations === Infinity && a.effect.getComputedTiming().progress !== null)), { timeout: 10000 }).toBe(true);
    const originalBefore = await originalCloud.evaluate((e) => getComputedStyle(e).transform);
    await expect.poll(() => originalCloud.evaluate((e) => getComputedStyle(e).transform)).not.toBe(originalBefore);
    await expect(page.locator('.titulo-pequeno')).toContainText(/Feliz.*\d+ anos, \d+ meses, \d+ dias, \d+h \d+m \d+s/s);
    const counterBefore = await page.locator('.titulo-pequeno').innerText();
    await expect.poll(() => page.locator('.titulo-pequeno').innerText()).not.toBe(counterBefore);
  });
  await test.step('reduced motion stops only new decoration', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => page.locator('.landscape').evaluate((e) => e.getAnimations({ subtree: true }).length)).toBe(0);
    await expect(page.locator('.landscape')).toHaveCSS('transition-duration', '0s');
    await expect(page.locator('#cloud_inf')).not.toHaveCSS('animation-name', 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
  });
  await test.step('preview comparison is accessible and does not cover the theme button or drawing', async () => {
    const nav = page.getByRole('navigation', { name: 'Comparar paisagens' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link')).toHaveCount(3);
    await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', `/propostas/${variant}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    const check = async () => {
      const n = await nav.boundingBox();
      const t = await page.getByRole('button', { name: 'Modo escuro', exact: true }).boundingBox();
      expect(n.x + n.width <= t.x || t.x + t.width <= n.x || n.y + n.height <= t.y || t.y + t.height <= n.y).toBe(true);
      const drawing = await page.locator('.scene').boundingBox();
      expect(drawing.y).toBeGreaterThanOrEqual(n.y + n.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const link of await nav.getByRole('link').all()) {
        const b = await link.boundingBox();
        expect(b.height).toBeGreaterThanOrEqual(44);
        expect(b.width).toBeGreaterThanOrEqual(44);
      }
    };
    await check();
    if (page.viewportSize().width < 700) {
      await page.setViewportSize({ width: 320, height: 640 });
      await check();
    }
    const next = variant === 'serra' ? 'brisa' : variant === 'brisa' ? 'estelar' : 'serra';
    await nav.locator(`a[href="/propostas/${next}"]`).click();
    await expect(page.locator(`[data-landscape="${next}"]`)).toBeVisible();
    await page.goto('/');
    await expect(page.locator('.landscape')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Comparar paisagens' })).toHaveCount(0);
    await expect(page.locator('.landscape-home')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Lindeza', exact: true })).toBeVisible();
  });
});
}
