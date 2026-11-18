import { expect, test } from '@playwright/test';
import { ready } from './doorway.helpers';

const legacyStoragePrefix = ['air', 'bnb'].join('');

test('Yurdum branding is consistent and saved stays survive the rename', async ({ page }) => {
  await page.addInitScript((prefix) => {
    window.localStorage.setItem(`${prefix}-favs`, JSON.stringify([1]));
    window.localStorage.setItem(`${prefix}-plans`, JSON.stringify([{ key: 1, id: 1, name: 'Weekend', date: '2027-06-12' }]));
  }, legacyStoragePrefix);
  await ready(page);

  await expect(page).toHaveTitle(/Yurdum/);
  await expect(page.getByTestId('link-home')).toHaveAttribute('aria-label', 'Yurdum ana səhifə');
  await expect(page.getByTestId('link-home')).toContainText('Yurdum');
  await expect(page.getByTestId('button-profile')).toContainText('Y');
  await expect(page.locator('.js-footer')).toContainText('Yurdum');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Yurdum/);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', /favicon\.svg$/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('yurdum-favs'))).toBe('[1]');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('yurdum-plans') || 'null'))).toEqual([{ key: 1, id: 1, name: 'Weekend', date: '2027-06-12' }]);
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), `${legacyStoragePrefix}-favs`)).toBeNull();
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), `${legacyStoragePrefix}-plans`)).toBeNull();

  await page.getByTestId('button-favorites').click();
  await expect(page.getByTestId('card-fav-1')).toBeVisible();
});

test('search and category results always have a visible reset path', async ({ page }) => {
  await ready(page);
  const listings = page.locator('[data-testid^="card-listing-"]');
  const initialCount = await listings.count();
  expect(initialCount).toBeGreaterThan(0);

  await page.getByTestId('input-dest').fill('Şəki');
  await page.getByTestId('button-search').click();
  await expect(listings).toHaveCount(1);
  await expect(page.getByTestId('button-clear-chips')).toBeVisible();
  await page.getByTestId('button-clear-chips').click();
  await expect(listings).toHaveCount(initialCount);
  await expect(page.getByTestId('input-dest')).toHaveValue('');

  await page.getByTestId('button-cat-Dağ evləri').click();
  await expect(page.getByTestId('button-cat-Dağ evləri')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('button-clear-chips')).toBeVisible();
  await page.getByTestId('button-clear-chips').click();
  await expect(listings).toHaveCount(initialCount);

  await page.getByTestId('button-map-toggle').click();
  await expect(page.getByTestId('button-map-toggle')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('map-panel')).toBeVisible();
  await expect(page.locator('.map-shell .leaflet-container')).toBeVisible();
  await page.getByTestId('input-dest').fill('No matching city');
  await page.getByTestId('button-search').click();
  await expect(page.getByTestId('state-empty')).toBeVisible();
  await page.getByTestId('button-reset-filters').click();
  await expect(page.getByTestId('map-panel')).toBeVisible();
  await page.getByTestId('button-map-toggle').click();
  await expect(listings).toHaveCount(initialCount);
});

test('listing cards support Space without swallowing favourite actions', async ({ page }) => {
  await ready(page);
  const card = page.locator('[data-testid^="card-listing-"]').first();
  const id = (await card.getAttribute('data-testid'))!.replace('card-listing-', '');
  const save = page.getByTestId(`button-fav-${id}`);

  await save.focus();
  await page.keyboard.press('Space');
  await expect(save).toHaveAttribute('aria-pressed', 'true');
  await expect(save).toHaveAttribute('aria-label', 'Seçilmişlərdən çıxar');
  await expect(page.getByTestId('input-detail-in')).toHaveCount(0);

  await page.getByTestId('button-favorites').click();
  await expect(page.getByTestId(`card-fav-${id}`)).toBeVisible();
  await page.getByTestId(`button-unfav-${id}`).click();
  await expect(page.getByText("Hələ heç nə saxlamamısan")).toBeVisible();
  await expect(page.getByTestId('input-detail-in')).toHaveCount(0);
  await page.keyboard.press('Escape');

  const open = page.getByTestId(`button-open-listing-${id}`);
  await open.focus();
  await page.keyboard.press('Space');
  await expect(page.getByTestId('input-detail-in')).toBeVisible();
  await page.getByTestId('button-close-modal').click();
});

test('dialogs trap keyboard focus and return it to their opener', async ({ page }) => {
  await ready(page);
  const trigger = page.getByTestId('button-profile');
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
  await expect(page.getByTestId('button-close-modal')).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(page.getByTestId('button-profile-menu')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('button-close-modal')).toBeFocused();
  await page.getByTestId('button-profile-favs').click();
  await expect(page.getByTestId('button-close-modal')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('zero budgets stay restrictive and surprise cards open', async ({ page }) => {
  await ready(page);
  await page.getByTestId('button-filters').click();
  await page.getByTestId('input-filter-max').fill('0');
  await page.getByTestId('button-apply-filters').click();
  await expect(page.getByTestId('state-empty')).toBeVisible();
  await expect(page.getByTestId('button-clear-chips')).toBeVisible();
  await page.getByTestId('button-clear-chips').click();

  await page.getByTestId('button-tool-surprise').click();
  await page.getByTestId('input-surprise-max').fill('0');
  await expect.poll(() => page.getByRole('dialog').evaluate((dialog) =>
    dialog.getBoundingClientRect().width <= document.documentElement.clientWidth
  )).toBe(true);
  await page.getByTestId('button-surprise-go').click();
  await expect(page.getByTestId('card-surprise')).toHaveCount(0);
  await expect(page.getByText('Bu büdcə və seçimlə uyğun ev tapılmadı. Limitini artır.')).toBeVisible();

  await page.getByTestId('input-surprise-max').fill('');
  await page.getByTestId('button-surprise-go').click();
  await expect(page.getByTestId('card-surprise')).toBeVisible();
  await page.getByTestId('card-surprise').click();
  await expect(page.getByTestId('input-detail-in')).toBeVisible();
});

test('booking rejects same-day check-out and calculates a valid total', async ({ page }) => {
  await ready(page);
  await page.locator('[data-testid^="button-open-listing-"]').first().click();
  const checkIn = page.getByTestId('input-detail-in');
  const checkOut = page.getByTestId('input-detail-out');
  const today = (await checkIn.getAttribute('min'))!;
  const tomorrow = new Date(Date.parse(`${today}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

  await checkIn.fill(today);
  await checkOut.fill(today);
  await page.getByTestId('button-calc').click();
  await expect(page.getByText('Çıxış tarixi girişdən sonra olmalıdır.')).toBeVisible();
  await page.getByTestId('button-confirm-booking').click();
  await expect(page.getByRole('heading', { name: 'Planın hazırdır!' })).toHaveCount(0);

  await checkOut.fill(tomorrow);
  await expect(page.getByTestId('text-breakdown')).toBeVisible();
  await page.getByTestId('button-confirm-booking').click();
  await expect(page.getByRole('heading', { name: 'Planın hazırdır!' })).toBeVisible();
});

test('split tool clamps guest count to the selected home capacity', async ({ page }) => {
  await ready(page);
  await page.getByTestId('button-tool-split').click();
  const guests = page.getByTestId('input-split-guests');
  const capacity = await guests.getAttribute('max');
  await guests.fill('99');
  await expect(guests).toHaveValue(capacity!);
  await page.getByTestId('button-split-calc').click();
  await expect(page.getByTestId('text-split-result')).not.toContainText('NaN');
});
