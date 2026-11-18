import { expect, test } from '@playwright/test';
import { ready, scrollToStage, settle } from './doorway.helpers';

type RecordedEvent = {
  name: string;
  data?: Record<string, string | number | boolean>;
};

test('featured-home events contain only listing and language, without blocking dialogs', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as Window & {
      __analyticsEvents?: RecordedEvent[];
      umami?: { track: (name: string, data?: Record<string, string | number | boolean>) => void };
    };
    w.__analyticsEvents = [];
    w.umami = {
      track: (name, data) => {
        w.__analyticsEvents?.push({ name, data });
        throw new Error('Simulated analytics failure');
      },
    };
  });

  await ready(page);
  await scrollToStage(page, 'interior');
  await page.getByTestId('button-feature-open').click();
  await expect(page.getByTestId('input-detail-in')).toBeVisible();
  await page.getByTestId('button-close-modal').click();

  await page.getByTestId('button-lang').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await settle(page);
  await scrollToStage(page, 'interior');
  await page.getByTestId('button-feature-surprise').click();
  await expect(page.getByRole('heading', { name: 'A surprise within budget' })).toBeVisible();

  const events = await page.evaluate(() => (window as Window & { __analyticsEvents?: RecordedEvent[] }).__analyticsEvents ?? []);
  expect(events).toEqual([
    { name: 'featured_home_open', data: { listing_id: 1, language: 'AZ' } },
    { name: 'featured_home_surprise_click', data: { listing_id: 1, language: 'EN' } },
  ]);
});
