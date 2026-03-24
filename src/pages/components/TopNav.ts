import { type Page, type Locator } from '@playwright/test';

/**
 * TopNav component — handles two different nav layouts:
 * - mb.io (marketing site): Explore, Features, Company, $MBG, Sign in, Sign up
 * - trade.mb.io (trading platform): Home, Markets, Trade, More ▼, Log In, Sign Up
 */
export class TopNav {
  readonly page: Page;
  readonly logo: Locator;
  readonly loginButton: Locator;
  readonly signUpButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.locator('header a').first();
    // Works for both domains: "Log In" (trade) and "Sign in" (mb.io)
    this.loginButton = page.locator('header').getByRole('link', { name: /Log\s*In|Sign\s*in/i }).first();
    this.signUpButton = page.locator('header').getByRole('link', { name: /Sign\s*up/i }).first();
  }

  /** Returns text labels of all visible nav links in the header */
  async getVisibleNavLinks(): Promise<string[]> {
    const links = this.page.locator('header a, header nav a');
    const allTexts: string[] = [];
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const text = (await links.nth(i).textContent() ?? '').trim();
      if (text && text.length > 0) {
        allTexts.push(text);
      }
    }
    return allTexts;
  }

  async clickNavLink(name: string): Promise<void> {
    await this.page.locator('header').getByRole('link', { name }).first().click();
  }

  /** Opens the "More" dropdown on trade.mb.io */
  async openMoreDropdown(): Promise<void> {
    const moreButton = this.page.locator('header').getByText('More').first();
    await moreButton.click();
    // Wait for dropdown content to appear
    const dropdownLink = this.page.locator('[class*="dropdown"] a, [class*="popover"] a, [role="menu"] a, [class*="submenu"] a').first();
    await dropdownLink.waitFor({ state: 'visible', timeout: 5000 });
  }

  /** Returns all items from the "More" dropdown on trade.mb.io */
  async getMoreDropdownItems(): Promise<Array<{ text: string; href: string }>> {
    await this.openMoreDropdown();
    const items = this.page.locator('[class*="dropdown"] a, [class*="popover"] a, [role="menu"] a, [class*="submenu"] a');
    const result: Array<{ text: string; href: string }> = [];
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const text = (await items.nth(i).textContent() ?? '').trim();
      const href = await items.nth(i).getAttribute('href') ?? '';
      if (text) {
        result.push({ text, href });
      }
    }
    return result;
  }

  async isLogoVisible(): Promise<boolean> {
    return this.logo.isVisible();
  }
}
