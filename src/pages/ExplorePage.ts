import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * ExplorePage page object for the Explore / Spot Market page.
 *
 * URL: https://mb.io/en/explore
 *
 * Verified structure:
 * - H1: "Markets at your fingertips"
 * - H2: "Spot market"
 * - Category tabs (role="tab"): Hot, Gainers, Losers
 * - Trading pairs visible: BTC, ETH, SOL, DOGE, XRP, etc.
 * - H3: "Today's top crypto prices", "Market sentiment"
 * - Download CTA: "Download the app" deep link
 * - Footer: Same as other mb.io pages
 */
export class ExplorePage extends BasePage {
  readonly spotMarketHeading: Locator;
  readonly downloadAppButton: Locator;

  constructor(page: Page) {
    super(page);
    this.spotMarketHeading = page.getByText('Spot market', { exact: false }).first();
    this.downloadAppButton = page.getByRole('link', { name: /Download the app/i }).first();
  }

  async navigate(): Promise<void> {
    await this.navigateTo('https://mb.io/en/explore');
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async getPageHeading(): Promise<string> {
    return (await this.page.locator('h1').first().textContent() ?? '').trim();
  }

  /** Returns names of the trading category filter buttons (Hot, Gainers, Losers) */
  async getCategoryTabNames(): Promise<string[]> {
    const knownTabs = ['Hot', 'Gainers', 'Losers'];
    const found: string[] = [];
    for (const name of knownTabs) {
      const btn = this.page.getByRole('button', { name, exact: true }).first();
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        found.push(name);
      }
    }
    return found;
  }

  async clickCategoryTab(tabName: string): Promise<void> {
    const tab = this.page.getByRole('button', { name: tabName, exact: true }).first();
    await tab.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** Checks if a known trading pair/coin is visible on the page */
  async isCoinVisible(coinName: string): Promise<boolean> {
    return this.page.getByText(coinName, { exact: false }).first()
      .isVisible({ timeout: 5000 }).catch(() => false);
  }

  /** Returns the download app button href */
  async getDownloadAppHref(): Promise<string | null> {
    await this.downloadAppButton.scrollIntoViewIfNeeded().catch(() => {});
    return this.downloadAppButton.getAttribute('href');
  }
}
