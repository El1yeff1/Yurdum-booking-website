import { expect, type Page, type TestInfo } from '@playwright/test';
import { PNG } from 'pngjs';

export const feature = '.js-feature';
export const stages = {
  house: { progress: 0.01, copy: '.js-journey-intro', title: 'h2' },
  doorway: { progress: 0.42, copy: '.js-door-caption', title: '.display' },
  interior: { progress: 1, copy: '.js-interior-copy', title: 'h3' },
} as const;
export type Stage = keyof typeof stages;

export async function ready(page: Page) {
  await page.goto('./');
  await expect(page.locator(feature)).toBeAttached();
  await page.evaluate(async () => { await document.fonts.ready; });
  await expect.poll(() => page.evaluate(() => document.fonts.check('600 48px "Nexa Text Pro"'))).toBe(true);
  // A fallback illustration must not silently substitute for a failed story photo.
  for (const selector of ['.entry-camera > img', '.entry-leaf img', '.entry-portal-image', '.journey-interior img']) {
    await expect.poll(() => page.locator(selector).evaluateAll((images) =>
      images.every((node) => {
        const image = node as HTMLImageElement;
        return image.complete && image.naturalWidth > 100 && !image.dataset.fb;
      })), { message: `Story photographs loaded: ${selector}` }).toBe(true);
  }
}

// Derive scroll coordinates from the real pin spacer, including the earlier
// hero pin. No fixed page offsets or test-only timeline seeking.
export async function scrollToStage(page: Page, stage: Stage) {
  await scrollProgress(page, stages[stage].progress);
  await expect.poll(() => page.locator(stages[stage].copy).evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.99);
  const bounds = await page.locator(feature).boundingBox();
  expect(bounds, 'Pinned scene exists').not.toBeNull();
  expect(Math.abs(bounds!.y), 'Scene remains pinned to the viewport').toBeLessThan(2);
}

export async function scrollProgress(page: Page, progress: number) {
  await expect.poll(() => page.locator(feature).evaluate((el) =>
    el.parentElement!.classList.contains('pin-spacer'))).toBe(true);
  await page.locator(feature).evaluate((el, progress) => {
    const spacer = el.parentElement!;
    const start = spacer.getBoundingClientRect().top + window.scrollY;
    const travel = spacer.offsetHeight - (el as HTMLElement).offsetHeight;
    window.scrollTo({ top: start + travel * progress, behavior: 'instant' });
  }, progress);
  await settle(page);
}

export async function settle(page: Page) {
  // Wait for the scrub to converge rather than sleeping a machine-specific time.
  let previous = '';
  let stable = 0;
  await expect.poll(async () => {
    const current = await page.locator(feature).evaluate((el) =>
      [...el.querySelectorAll('.entry-camera, .entry-leaf, .journey-scene, .journey-interior, .journey-caption, .js-interior-copy')]
        .map((node) => {
          const style = getComputedStyle(node);
          return `${style.transform}/${style.opacity}/${style.visibility}`;
        }).join('|'));
    stable = current === previous ? stable + 1 : 0;
    previous = current;
    return stable;
  }, { intervals: [100, 200, 300] }).toBeGreaterThanOrEqual(2);
}

export async function layoutProblems(page: Page, copy: string) {
  return page.locator(feature).evaluate((scene, copySelector) => {
    const problems: string[] = [];
    const rect = scene.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const boundary = { left: Math.max(0, rect.left), right: Math.min(viewportWidth, rect.right), top: Math.max(0, rect.top), bottom: Math.min(innerHeight, rect.bottom) };
    if (document.documentElement.scrollWidth > viewportWidth + 1 || document.body.scrollWidth > viewportWidth + 1) {
      problems.push('horizontal overflow');
    }
    const root = scene.querySelector(copySelector)!;
    // Check text ranges, not just element boxes: wrapping, line-height, and
    // ancestor overflow can clip glyphs even when the container fits.
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = walker.currentNode;
      if (!text.textContent?.trim()) continue;
      const parent = text.parentElement!;
      const style = getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const range = document.createRange();
      range.selectNodeContents(text);
      for (const box of range.getClientRects()) {
        if (!box.width || !box.height) continue;
        let clipped = box.left < boundary.left - 2 || box.right > boundary.right + 2
          || box.top < boundary.top - 2 || box.bottom > boundary.bottom + 2;
        for (let ancestor: HTMLElement | null = parent; ancestor && ancestor !== scene; ancestor = ancestor.parentElement) {
          const css = getComputedStyle(ancestor);
          const a = ancestor.getBoundingClientRect();
          if (['hidden', 'clip', 'auto', 'scroll'].includes(css.overflowX) && (box.left < a.left - 2 || box.right > a.right + 2)) clipped = true;
          if (['hidden', 'clip', 'auto', 'scroll'].includes(css.overflowY) && (box.top < a.top - 2 || box.bottom > a.bottom + 2)) clipped = true;
        }
        if (clipped) problems.push(`clipped copy: ${text.textContent!.trim()}`);
      }
    }
    return problems;
  }, copy);
}

export async function checkScene(page: Page, stage: Stage, info: TestInfo, label: string) {
  const copy = page.locator(stages[stage].copy);
  await expect(copy).toBeVisible();
  await expect.poll(() => copy.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.99);
  await expect(page.locator('.entry-scene')).toBeVisible();
  await expect(page.locator('.entry-scene')).toHaveCSS('opacity', '1');
  await expect.poll(() => layoutProblems(page, stages[stage].copy), { message: `${label}: copy fits and page has no horizontal overflow` }).toEqual([]);
  if (stage === 'interior') {
    await expect(page.locator('.journey-interior')).toHaveCSS('opacity', '1');
    // IntersectionObserver rounds a full-bleed image's fractional CSS pixels.
    await expect(page.locator('.journey-interior img')).toBeInViewport({ ratio: 0.99 });
    await expect(page.getByTestId('button-feature-open')).toBeInViewport({ ratio: 1 });
  } else {
    await expect(page.locator('.entry-exterior')).toHaveCSS('opacity', '1');
    await expect(page.locator('.entry-camera > img')).toBeVisible();
  }
  const exposure = await page.locator('.entry-whiteout').evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(exposure, 'No opaque flash covers the scene').toBeLessThanOrEqual(0.13);
  const image = await page.locator(feature).screenshot();
  await info.attach(label, { body: image, contentType: 'image/png' });
  assertPhotographicScene(image);
}

export function assertPhotographicScene(buffer: Buffer) {
  const image = PNG.sync.read(buffer);
  let count = 0, sum = 0, squares = 0, white = 0;
  // Sample below the fixed header. A blank dark/white scene should fail even
  // if its DOM and image URLs still exist.
  for (let y = 100; y < image.height; y += 8) {
    for (let x = 0; x < image.width; x += 8) {
      const i = (y * image.width + x) * 4;
      const value = (image.data[i]! + image.data[i + 1]! + image.data[i + 2]!) / 3;
      sum += value; squares += value * value; count++;
      if (value > 240) white++;
    }
  }
  expect(squares / count - (sum / count) ** 2, 'Scene has photographic detail, not a blank fill').toBeGreaterThan(80);
  expect(white / count, 'Scene is not a white flash').toBeLessThan(0.8);
}
