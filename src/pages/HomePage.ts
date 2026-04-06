import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * HomePage page object for the mb.io marketing homepage.
 *
 * URL: https://mb.io/en
 *
 * Verified structure:
 * - Hero: "Crypto for everyone" heading with subtext
 * - CTA buttons: "Download the app" (deep link), "Open an account" (trade.mb.io)
 * - Feature cards: "The fastest way to trade", "Credit card & Bank transfers",
 *   "Move funds effortlessly", "Stay informed", "Security of funds"
 * - Khabib partnership banner: "Unblemished. Unstoppable. United."
 * - Trading widgets: Top Gainers, Trending Now, Top Losers
 * - Footer: Terms, Privacy, Client Agreement, Cookie Policy, Acceptable Use, Contact Us
 *
 * Note: trade.mb.io/en is the trading login page — a separate, minimal page.
 */
export class HomePage extends BasePage {
  readonly downloadAppButton: Locator;
  readonly openAccountButton: Locator;

  constructor(page: Page) {
    super(page);
    this.downloadAppButton = page.getByRole('link', { name: /Download the app/i }).first();
    this.openAccountButton = page.getByRole('link', { name: /Open an account/i }).first();
  }

  async navigate(): Promise<void> {
    await this.navigateTo('https://mb.io/en');
    await this.downloadAppButton.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  }

  async getHeroHeadingText(): Promise<string> {
    const heading = this.page.locator('h1').first();
    return (await heading.textContent() ?? '').trim();
  }

  /** Checks if a feature card heading is visible on the page */
  async isFeatureVisible(featureName: string): Promise<boolean> {
    const el = this.page.getByText(featureName, { exact: false }).first();
    await el.scrollIntoViewIfNeeded().catch(() => {});
    return el.isVisible({ timeout: 5000 }).catch(() => false);
  }

  /** Checks if the Khabib partnership banner is visible */
  async isKhabibBannerVisible(): Promise<boolean> {
    const banner = this.page.getByText('Unblemished', { exact: false }).first();
    await banner.scrollIntoViewIfNeeded().catch(() => {});
    return banner.isVisible({ timeout: 5000 }).catch(() => false);
  }

  /** Returns the href of the "Download the app" CTA */
  async getDownloadAppHref(): Promise<string | null> {
    return this.downloadAppButton.getAttribute('href');
  }

  /** Returns performance navigation timing for load-time assertions */
  async getPerformanceTiming(): Promise<{ domContentLoaded: number; loadComplete: number }> {
    return this.page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
        loadComplete: nav.loadEventEnd - nav.startTime,
      };
    });
  }
}
