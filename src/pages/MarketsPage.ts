import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * MarketsPage page object for trade.mb.io/en/markets.
 *
 * Verified DOM structure:
 * - Page title: "Trending assets" (h1)
 * - Tabs (role="tab"): Favorites, All, Top Gainers, Top Losers, Top Volume
 * - Table columns: #, Coin, Price, 24h %, 7d %, Market Cap, Circulating Supply, Last 7 days
 * - Search: hidden input (placeholder "Search Assets") behind an icon-only button
 * - Nav: Home, Markets, Trade (yellow), More ▼, Log In, Sign Up
 */
export class MarketsPage extends BasePage {

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.navigateTo('https://trade.mb.io/en/markets');
    await this.waitForTableLoad();
  }

  /** Waits for at least one data row to appear in the table */
  async waitForTableLoad(): Promise<void> {
    await this.page.locator('table tbody tr').first().waitFor({
      state: 'visible',
      timeout: 15_000,
    }).catch(() => {});
  }

  async getColumnHeaders(): Promise<string[]> {
    const headers = this.page.locator('table thead th');
    const texts: string[] = [];
    const count = await headers.count();
    for (let i = 0; i < count; i++) {
      const text = (await headers.nth(i).textContent() ?? '').trim();
      if (text) {
        texts.push(text);
      }
    }
    return texts;
  }

  async getCategoryTabNames(): Promise<string[]> {
    const tabs = this.page.getByRole('tab');
    const texts: string[] = [];
    const count = await tabs.count();
    for (let i = 0; i < count; i++) {
      const text = (await tabs.nth(i).textContent() ?? '').trim();
      if (text) {
        texts.push(text);
      }
    }
    return texts;
  }

  async clickCategoryTab(tabName: string): Promise<void> {
    const tab = this.page.getByRole('tab', { name: tabName }).first();
    await tab.scrollIntoViewIfNeeded();
    await tab.click();
    // Wait for the tab's panel to become active and table to re-render
    await this.page.locator(`[role="tabpanel"]:not([hidden]) table tbody tr`).first().waitFor({
      state: 'visible',
      timeout: 10_000,
    }).catch(() => {});
  }

  /**
   * Activates the search overlay and types a query.
   *
   * The search input is hidden by default behind an icon-only button.
   * Clicking it reveals the input with placeholder "Search Assets".
   * After filling, we wait for the table to re-render with filtered results.
   */
  async searchCrypto(query: string): Promise<void> {
    // Step 1: Click the visible search icon button to reveal the input
    const searchButton = this.page.locator('button[class*="icon-only"]:visible').last();
    await searchButton.click({ timeout: 5000 });

    // Step 2: Wait for the search input to become visible, then fill it
    const input = this.page.locator('input[placeholder*="Search"]:visible').first();
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(query);

    // Step 3: Wait for the table to update with filtered results
    await this.waitForTableLoad();
  }

  /** Clears the search input */
  async clearSearch(): Promise<void> {
    const input = this.page.locator('input[placeholder*="Search"]:visible').first();
    if (await input.isVisible().catch(() => false)) {
      await input.clear();
      await this.waitForTableLoad();
    }
  }

  async getVisibleCoinNames(): Promise<string[]> {
    const cells = this.page.locator('table tbody tr td:nth-child(2)');
    const names: string[] = [];
    const count = await cells.count();
    for (let i = 0; i < count; i++) {
      const text = (await cells.nth(i).textContent() ?? '').trim();
      if (text) {
        names.push(text);
      }
    }
    return names;
  }

  async getRowCount(): Promise<number> {
    return this.page.locator('table tbody tr').count();
  }
}
