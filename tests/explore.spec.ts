import { test, expect } from '../src/fixtures/test-fixtures.js';
import exploreData from '../test-data/explore.json';

test.describe.configure({ mode: 'parallel' });

test.describe('Explore Page - Spot Market Overview', () => {
  test('should display the page heading', async ({ explorePage }) => {
    await explorePage.navigate();
    const heading = await explorePage.getPageHeading();
    expect(heading).toContain(exploreData.pageHeading);
  });

  test('should display the Spot market section', async ({ explorePage }) => {
    await explorePage.navigate();
    await expect(explorePage.spotMarketHeading).toBeVisible();
  });
});

test.describe('Explore Page - Trading Pair Categories', () => {
  test('should display all category tabs', async ({ explorePage }) => {
    await explorePage.navigate();
    const tabs = await explorePage.getCategoryTabNames();

    for (const expected of exploreData.categoryTabs) {
      expect(
        tabs.some(t => t.includes(expected)),
        `Expected tab "${expected}" to be present. Found: ${tabs.join(', ')}`
      ).toBeTruthy();
    }
  });

  test('should display known trading pairs', async ({ explorePage }) => {
    await explorePage.navigate();

    for (const coin of exploreData.knownCoins) {
      const isVisible = await explorePage.isCoinVisible(coin);
      expect(isVisible, `Expected coin "${coin}" to be visible`).toBeTruthy();
    }
  });

  test('should switch between category tabs without errors', async ({ explorePage }) => {
    await explorePage.navigate();

    for (const tabName of exploreData.categoryTabs) {
      await explorePage.clickCategoryTab(tabName);
      // Verify the page didn't crash — spot market heading should remain visible
      await expect(explorePage.spotMarketHeading).toBeVisible();
    }
  });
});

test.describe('Explore Page - Content Sections', () => {
  test('should display section headings', async ({ explorePage }) => {
    await explorePage.navigate();

    for (const section of exploreData.sections) {
      await expect(
        explorePage.page.getByText(section, { exact: false }).first(),
        `Expected section "${section}" to be visible`
      ).toBeVisible();
    }
  });
});

test.describe('Explore Page - Download CTA', () => {
  test('should display the Download the app button', async ({ explorePage }) => {
    await explorePage.navigate();
    await explorePage.downloadAppButton.scrollIntoViewIfNeeded().catch(() => {});
    await expect(explorePage.downloadAppButton).toBeVisible();
  });

  test('should have a valid download link', async ({ explorePage }) => {
    await explorePage.navigate();
    const href = await explorePage.getDownloadAppHref();
    expect(href).toBeTruthy();
    expect(href!.length).toBeGreaterThan(0);
  });
});
