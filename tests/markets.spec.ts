import { test, expect } from '../src/fixtures/test-fixtures.js';
import marketsData from '../test-data/markets.json';

// ---------------------------------------------------------------------------
// Navigation & Layout (trade.mb.io)
// ---------------------------------------------------------------------------

test.describe('Markets Page - Navigation', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should display the logo', async ({ marketsPage }) => {
    await marketsPage.navigate();
    await expect(marketsPage.topNav.logo).toBeVisible();
  });

  test('should display primary nav links', async ({ marketsPage }) => {
    await marketsPage.navigate();
    const visibleLinks = await marketsPage.topNav.getVisibleNavLinks();

    for (const expectedLink of marketsData.navigation.visibleLinks) {
      expect(
        visibleLinks.some(link => link.includes(expectedLink)),
        `Expected nav link "${expectedLink}" to be visible. Found: ${visibleLinks.join(', ')}`
      ).toBeTruthy();
    }
  });

  test('should display Log In and Sign Up buttons', async ({ marketsPage }) => {
    await marketsPage.navigate();
    await expect(marketsPage.topNav.loginButton).toBeVisible();
    await expect(marketsPage.topNav.signUpButton).toBeVisible();
  });

  test('should open More dropdown with all expected items', async ({ marketsPage }) => {
    await marketsPage.navigate();
    const items = await marketsPage.topNav.getMoreDropdownItems();

    for (const expected of marketsData.navigation.moreDropdownItems) {
      expect(
        items.some(item => item.text.includes(expected.text) && item.href.includes(expected.hrefContains)),
        `Expected More dropdown item "${expected.text}" with href containing "${expected.hrefContains}"`
      ).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// Table Structure
// ---------------------------------------------------------------------------

test.describe('Markets Page - Table Structure', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should display all expected column headers', async ({ marketsPage }) => {
    await marketsPage.navigate();
    const headers = await marketsPage.getColumnHeaders();

    for (const expected of marketsData.columnHeaders) {
      if (!expected || expected === '#') continue;
      expect(
        headers.some(h => h.includes(expected)),
        `Expected column header "${expected}" to be present. Found: ${headers.join(', ')}`
      ).toBeTruthy();
    }
  });

  test('should display market data rows', async ({ marketsPage }) => {
    await marketsPage.navigate();
    const rowCount = await marketsPage.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(marketsData.minimumVisibleRows);
  });

  test('should display the page title', async ({ marketsPage }) => {
    await marketsPage.navigate();
    const heading = marketsPage.page.getByText(marketsData.pageTitle, { exact: false }).first();
    await expect(heading).toBeVisible();
  });
});

test.describe('Markets Page - Category Tabs', () => {
  test.describe.configure({ mode: 'serial' });

  test('should display all category tabs', async ({ marketsPage }) => {
    await marketsPage.navigate();
    const tabs = await marketsPage.getCategoryTabNames();

    for (const expected of marketsData.categoryTabs) {
      expect(
        tabs.some(t => t.includes(expected)),
        `Expected tab "${expected}" to be present. Found: ${tabs.join(', ')}`
      ).toBeTruthy();
    }
  });

  test('should filter results when clicking a category tab', async ({ marketsPage }) => {
    await marketsPage.navigate();

    await marketsPage.clickCategoryTab('Top Gainers');
    const rowCount = await marketsPage.getRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should show Bitcoin in All category', async ({ marketsPage }) => {
    await marketsPage.navigate();
    await marketsPage.clickCategoryTab('All');
    const coins = await marketsPage.getVisibleCoinNames();
    expect(
      coins.some(c => c.includes('Bitcoin')),
      `Expected "Bitcoin" in All category. Found: ${coins.slice(0, 5).join(', ')}`
    ).toBeTruthy();
  });
});

test.describe('Markets Page - Search', () => {
  test.describe.configure({ mode: 'serial' });

  test('should open search overlay when clicking the search icon', async ({ marketsPage }) => {
    await marketsPage.navigate();

    // Before clicking: search input exists but is hidden
    const hiddenInput = marketsPage.page.locator('input[placeholder*="Search"]');
    await expect(hiddenInput).toHaveCount(1);
    expect(await hiddenInput.isVisible()).toBe(false);

    // Click the visible search icon button to reveal the input
    const searchButton = marketsPage.page.locator('button[class*="icon-only"]:visible').last();
    await searchButton.click();

    // Wait for the search input to become visible after icon click
    const visibleInput = marketsPage.page.locator('input[placeholder*="Search"]:visible').first();
    await visibleInput.waitFor({ state: 'visible', timeout: 5000 });
    const placeholder = await visibleInput.getAttribute('placeholder');
    expect(placeholder).toBe(marketsData.searchPlaceholder);
  });

  test('should filter results when searching for Bitcoin', async ({ marketsPage }) => {
    await marketsPage.navigate();
    await marketsPage.searchCrypto('Bitcoin');

    const coins = await marketsPage.getVisibleCoinNames();
    expect(
      coins.some(c => c.includes('Bitcoin')),
      `Expected "Bitcoin" in search results. Found: ${coins.join(', ')}`
    ).toBeTruthy();

    // All visible results should contain "Bitcoin"
    for (const coin of coins) {
      expect(coin.toLowerCase()).toContain('bitcoin');
    }
  });

  test('should filter results when searching for Ethereum', async ({ marketsPage }) => {
    await marketsPage.navigate();
    await marketsPage.searchCrypto('Ethereum');

    const coins = await marketsPage.getVisibleCoinNames();
    expect(
      coins.some(c => c.includes('Ethereum')),
      `Expected "Ethereum" in search results. Found: ${coins.join(', ')}`
    ).toBeTruthy();
  });

  test('should show no results for nonsense query', async ({ marketsPage }) => {
    await marketsPage.navigate();
    await marketsPage.searchCrypto('ZZZZZZNOTACOIN');

    const rowCount = await marketsPage.getRowCount();
    expect(rowCount).toBe(0);
  });
});
