const { test, expect } = require('@playwright/test');

const toggle = (page) => page.getByRole('button', { name: 'Modo escuro', exact: true });

// Browser errors (including React hydration diagnostics) fail either scenario.
test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.__errors = errors;
});
test.afterEach(async ({ page }) => {
  expect(page.__errors).toEqual([]);
});

test('T01 — site opens with the original illustration, animations and counter', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Lindeza', exact: true })).toBeVisible();
  await expect(page.locator('.subtitulo')).toHaveText('Pq todo segundo com vc é momento de comemoração.');
  await expect(page.locator('.scene')).toBeVisible();
  await expect(page.locator('#diamond')).toHaveCSS('opacity', '1');
  for (const id of ['diamond', 'mountain', 'cloud_inf', 'cloud_sup', 'sun', 'wind_sup_dir', 'wind_sup_esq', 'wind_inf']) {
    await expect(page.locator(`#${id}`)).not.toHaveCSS('animation-name', 'none');
  }
  const animated = page.locator('#cloud_inf');
  await expect(animated).toHaveCSS('opacity', '1');
  await expect(animated).toHaveCSS('animation-iteration-count', '1, infinite');
  await expect.poll(() => animated.evaluate((element) => element.getAnimations().some((animation) =>
    animation.effect.getTiming().iterations === Infinity && animation.effect.getComputedTiming().progress !== null
  )), { timeout: 10000 }).toBe(true);
  const before = await animated.evaluate((element) => ({
    transform: getComputedStyle(element).transform,
    time: element.getAnimations().find((animation) => animation.effect.getTiming().iterations === Infinity).currentTime,
  }));
  await expect.poll(() => animated.evaluate((element) => getComputedStyle(element).transform)).not.toBe(before.transform);
  await expect.poll(() => animated.evaluate((element) => element.getAnimations().find((animation) =>
    animation.effect.getTiming().iterations === Infinity).currentTime)).toBeGreaterThan(before.time);
  const counter = page.locator('.titulo-pequeno');
  await expect(counter).toContainText(/Feliz.*\d+ anos, \d+ meses, \d+ dias, \d+h \d+m \d+s/s);
  const initial = await counter.innerText();
  await expect.poll(() => counter.innerText()).not.toBe(initial);
});

test('T02 — dark mode works', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await test.step('light is the default and the toggle is accessible', async () => {
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(236, 253, 245)');
    await expect(toggle(page)).toBeVisible();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
  });
  await test.step('switches to legible dark colors without replacing existing content', async () => {
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(16, 34, 29)');
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(236, 253, 245)');
    await expect(page.getByRole('heading', { name: 'Lindeza', exact: true })).toBeVisible();
    await expect(page.locator('.titulo-pequeno')).toContainText('Feliz');
    await expect(page.locator('.scene')).toBeVisible();
  });
  await test.step('returns to the original light theme', async () => {
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(236, 253, 245)');
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(21, 43, 36)');
  });
  await test.step('stays fixed in the top-right corner including after scrolling', async () => {
    const button = toggle(page);
    await expect(button).toHaveCSS('position', 'fixed');
    const checkPosition = async () => {
      const box = await button.boundingBox();
      const viewport = page.viewportSize();
      expect(box.y).toBeGreaterThanOrEqual(8);
      expect(box.y).toBeLessThanOrEqual(24);
      expect(viewport.width - box.x - box.width).toBeGreaterThanOrEqual(8);
      expect(viewport.width - box.x - box.width).toBeLessThanOrEqual(24);
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    };
    await checkPosition();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await checkPosition();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
  await test.step('keyboard focus is visible and Enter/Space toggle the theme', async () => {
    await page.reload();
    await page.keyboard.press('Tab');
    await expect(toggle(page)).toBeFocused();
    await expect(toggle(page)).toHaveCSS('outline-style', 'solid');
    await expect(toggle(page)).toHaveCSS('outline-width', '3px');
    await page.keyboard.press('Enter');
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Space');
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
  });
  await test.step('reload retains an explicit choice in either direction', async () => {
    await toggle(page).click();
    await page.reload();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(16, 34, 29)');
    await toggle(page).click();
    await page.reload();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(236, 253, 245)');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
  });
  await test.step('applies saved dark before application scripts run without hydration mismatch', async () => {
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    let releaseScripts;
    const gate = new Promise((resolve) => { releaseScripts = resolve; });
    await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, async (route) => {
      await gate;
      await route.continue();
    });
    try {
      await page.reload({ waitUntil: 'commit' });
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      if (process.env.PLAYWRIGHT_TEST_PRODUCTION) {
        await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(16, 34, 29)');
      }
    } finally {
      releaseScripts();
      await page.unrouteAll({ behavior: 'wait' });
    }
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(16, 34, 29)');
  });
  await test.step('invalid saved values fall back to light', async () => {
    await page.evaluate(() => localStorage.setItem('theme', 'not-a-theme'));
    await page.reload();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(236, 253, 245)');
  });
  await test.step('write-only storage denial leaves a usable toggle', async () => {
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); };
    });
    await page.reload();
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(16, 34, 29)');
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
  });
  await test.step('storage denied does not break rendering or either toggle direction', async () => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() { throw new DOMException('Storage denied', 'SecurityError'); },
      });
    });
    await page.reload();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(16, 34, 29)');
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
    await page.reload();
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(236, 253, 245)');
  });
});
