import { expect, test, type Locator, type Page } from '@playwright/test';
import { ready, scrollToStage } from './doorway.helpers';

async function expectDialogFocusCycle(page: Page, opener: Locator) {
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
  await expect(page.locator('#dialog-title')).toBeVisible();
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);

  const close = page.getByTestId('button-close-modal');
  await close.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByTestId('button-confirm-booking')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();

  await close.click();
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
}

test('listing details trap keyboard focus and return it to the listing button', async ({ page }) => {
  await ready(page);
  const listing = page.getByTestId('button-open-listing-1');
  await listing.focus();
  await page.keyboard.press('Enter');

  await expectDialogFocusCycle(page, listing);
});

test('featured-home details trap keyboard focus and return it to the opener', async ({ page }) => {
  await ready(page);
  await scrollToStage(page, 'interior');
  const opener = page.getByTestId('button-feature-open');
  await opener.focus();
  await page.keyboard.press('Enter');

  await expectDialogFocusCycle(page, opener);
});

test('Escape and backdrop still dismiss listing details and restore focus', async ({ page }) => {
  await ready(page);
  const listing = page.getByTestId('button-open-listing-1');
  const dialog = page.getByRole('dialog');

  await listing.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(listing).toBeFocused();

  await listing.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await page.getByTestId('modal-backdrop').click({ position: { x: 1, y: 1 } });
  await expect(dialog).toBeHidden();
  await expect(listing).toBeFocused();
});
