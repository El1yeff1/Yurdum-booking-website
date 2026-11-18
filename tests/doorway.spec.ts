import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';
import { assertPhotographicScene, checkScene, feature, layoutProblems, ready, scrollProgress, scrollToStage, settle, stages, type Stage } from './doorway.helpers';

const titles = {
  az: { house: 'Bir qapı. Yeni bir hekayə.', doorway: 'Qapı açılır.', interior: 'Burada vaxt yavaşıyır.' },
  en: { house: 'One door. A new story.', doorway: 'The door gives way.', interior: 'Time slows down here.' },
};

test('house → doorway → interior and back, switching AZ/EN at every stage', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page);
  await scrollProgress(page, 0.1);
  const openingState = await page.evaluate(() => ({
    titleScale: new DOMMatrix(getComputedStyle(document.querySelector('.js-journey-intro h2')!).transform).a,
    cameraScale: new DOMMatrix(getComputedStyle(document.querySelector('.entry-camera')!).transform).a,
  }));
  expect(openingState.titleScale).toBeGreaterThan(1.05);
  expect(openingState.cameraScale).toBeCloseTo(1, 2);
  for (const [index, stage] of (['house', 'doorway', 'interior', 'doorway', 'house'] as Stage[]).entries()) {
    await test.step(`${index}: ${stage}`, async () => {
      if (stage === 'interior') {
        await scrollProgress(page, 0.84);
        await expect(page.locator('.js-interior-copy')).toHaveCSS('opacity', '1');
        const entranceY = await page.locator('.js-interior-copy').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).f);
        await scrollProgress(page, 0.96);
        const movingY = await page.locator('.js-interior-copy').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).f);
        expect(movingY).toBeLessThan(entranceY - 20);
      }
      await scrollToStage(page, stage);
      for (const lang of ['az', 'en', 'az'] as const) {
        if (await page.locator('html').getAttribute('lang') !== lang) {
          await page.getByTestId('button-lang').click();
          await expect(page.locator('html')).toHaveAttribute('lang', lang);
          // Language changes schedule a refresh; recheck the actual pin position.
          await settle(page);
          await scrollToStage(page, stage);
        }
        await expect(page.locator(stages[stage].copy).locator(stages[stage].title)).toHaveText(titles[lang][stage]);
        await checkScene(page, stage, info, `${index}-${stage}-${lang}`);
      }
    });
  }
  expect(errors, 'No uncaught browser errors').toEqual([]);
});

test('resize while pinned and continue forward and backward without duplicate pins', async ({ page }, info) => {
  await ready(page);
  const original = page.viewportSize()!;
  const other = original.width > 600 ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  for (const viewport of [original, other, original]) {
    await scrollToStage(page, 'doorway');
    await page.setViewportSize(viewport);
    await expect.poll(() => page.locator('.entry-camera').evaluate((el) => Math.round((el as HTMLElement).offsetWidth)))
      .toBe(Math.max(viewport.width, viewport.height));
    await expect.poll(() => page.locator('.entry-camera').evaluate((el) => Math.round((el as HTMLElement).offsetHeight)))
      .toBe(Math.max(viewport.width, viewport.height));
    await settle(page);
    for (const stage of ['doorway', 'interior', 'house'] as const) {
      await scrollToStage(page, stage);
      await checkScene(page, stage, info, `resize-${viewport.width}-${stage}`);
    }
    await expect(page.locator('.pin-spacer').filter({ has: page.locator(feature) })).toHaveCount(1);
  }
});

test('opening the door and crossing into the interior never leaves a blank scene', async ({ page }, info) => {
  await ready(page);
  for (const progress of [0.5, 0.65, 0.85, 0.65, 0.5]) {
    await scrollProgress(page, progress);
    await expect(page.locator('.entry-scene')).toBeVisible();
    const transform = await page.locator('.entry-leaf').evaluate((el) => getComputedStyle(el).transform);
    expect(transform, 'Door rotates inward rather than staying closed').toMatch(/^matrix3d/);
    const rotation = await page.locator('.entry-leaf').evaluate((el) => {
      const matrix = new DOMMatrix(getComputedStyle(el).transform);
      return Math.abs(matrix.m13);
    });
    expect(rotation, 'Door has a non-zero 3D rotation around its hinge').toBeGreaterThan(0.01);
    const exposure = await page.locator('.entry-whiteout').evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(exposure).toBeLessThanOrEqual(0.13);
    const screenshot = await page.locator(feature).screenshot();
    assertPhotographicScene(screenshot);
    await info.attach(`threshold-${progress}`, { body: screenshot, contentType: 'image/png' });
  }
});

test('reduced motion shows readable static interior in both languages with no pin', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await page.locator(feature).evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
  await settle(page);
  await expect(page.locator(feature).locator('..')).not.toHaveClass(/pin-spacer/);
  for (const lang of ['az', 'en'] as const) {
    if (lang === 'en') await page.getByTestId('button-lang').click();
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('.js-interior-copy h3')).toHaveText(titles[lang].interior);
    await checkScene(page, 'interior', info, `reduced-${lang}`);
    await expect(page.getByTestId('button-story-enter')).toBeHidden();
    await expect(page.locator('.entry-exterior')).toBeHidden();
  }
  const before = await page.locator('.journey-interior').getAttribute('style');
  await page.mouse.wheel(0, 180);
  await settle(page);
  expect(await page.locator('.journey-interior').getAttribute('style')).toBe(before);
});

test('regression detectors reject clipped text, horizontal overflow and blank scenes', async ({ page }) => {
  await ready(page);
  await scrollToStage(page, 'house');
  const clip = await page.addStyleTag({ content: '.js-journey-intro { height: 1px !important; overflow: hidden !important; }' });
  expect(await layoutProblems(page, stages.house.copy)).toEqual(expect.arrayContaining([expect.stringContaining('clipped copy')]));
  await clip.evaluate((el) => el.parentNode!.removeChild(el));
  const overflow = await page.addStyleTag({ content: 'html, body { overflow-x: visible !important; } body::before { content: ""; display: block; width: 200vw; height: 1px; }' });
  expect(await layoutProblems(page, stages.house.copy)).toContain('horizontal overflow');
  await overflow.evaluate((el) => el.parentNode!.removeChild(el));
  for (const color of [0, 255]) {
    const blank = new PNG({ width: 320, height: 640 });
    blank.data.fill(color);
    expect(() => assertPhotographicScene(PNG.sync.write(blank))).toThrow();
  }
});
