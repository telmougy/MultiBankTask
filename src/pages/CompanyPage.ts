import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

/**
 * CompanyPage page object for the "Company" page (About Us / Why MultiBank).
 *
 * URL: https://mb.io/en/company
 * Nav label: "Company"
 *
 * Verified structure:
 * - H1: "Why MultiBank Group?" (hero heading)
 * - H2 (description): "For nearly two decades..."
 * - Stats: $2 trillion, 2,000,000+, 25+
 * - H2 sections: "A tradition of global leadership", "Innovation with purpose",
 *   "Integrity built into every decision"
 * - H3: "The strength behind MultiBank Group" with cards
 * - H3: "Community & Media" with media items
 * - Footer: Terms, Privacy, Client Agreement, Cookie Policy, Acceptable Use, Contact Us
 */
export class CompanyPage extends BasePage {
  readonly heroHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.heroHeading = page.locator('h1').first();
  }

  async navigate(): Promise<void> {
    await this.navigateTo('https://mb.io/en/company');
  }

  /** Navigate to the company page via the "Company" nav link on mb.io */
  async navigateViaNav(): Promise<void> {
    await this.navigateTo('https://mb.io/en');
    await this.topNav.clickNavLink('Company');
    await this.heroHeading.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async getHeroHeading(): Promise<string> {
    return (await this.heroHeading.textContent() ?? '').trim();
  }

  async getHeroDescription(): Promise<string> {
    const desc = this.page.locator('h1 ~ h2').first();
    return (await desc.textContent() ?? '').trim();
  }

  async isStatVisible(value: string): Promise<boolean> {
    return this.page.getByText(value, { exact: false }).first()
      .isVisible({ timeout: 5000 }).catch(() => false);
  }

  /** Returns all h2 section headings on the page */
  async getSectionHeadings(): Promise<string[]> {
    const headings = this.page.locator('h2');
    const texts: string[] = [];
    const count = await headings.count();
    for (let i = 0; i < count; i++) {
      const text = (await headings.nth(i).textContent() ?? '').trim();
      if (text) texts.push(text);
    }
    return texts;
  }

  /** Returns all h3 headings */
  async getH3Headings(): Promise<string[]> {
    const headings = this.page.locator('h3');
    const texts: string[] = [];
    const count = await headings.count();
    for (let i = 0; i < count; i++) {
      const text = (await headings.nth(i).textContent() ?? '').trim();
      if (text) texts.push(text);
    }
    return texts;
  }
}
