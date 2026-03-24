import { type Page, type Locator } from '@playwright/test';

/**
 * Footer component — present on mb.io pages (company, features).
 * Note: trade.mb.io pages do NOT have a visible footer.
 *
 * Footer links: Terms & Conditions, Privacy Policy, Client Agreement,
 * Cookie Policy, Acceptable Use Policy, Contact Us.
 */
export class Footer {
  readonly page: Page;
  readonly footerContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.footerContainer = page.locator('footer');
  }

  async isFooterVisible(): Promise<boolean> {
    return this.footerContainer.isVisible({ timeout: 5000 }).catch(() => false);
  }

  async scrollToFooter(): Promise<void> {
    await this.footerContainer.scrollIntoViewIfNeeded();
    await this.footerContainer.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  }

  /** Returns text of all links in the footer */
  async getAllFooterLinks(): Promise<string[]> {
    await this.scrollToFooter();
    const links = this.footerContainer.getByRole('link');
    const texts: string[] = [];
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const text = await links.nth(i).textContent();
      if (text?.trim()) {
        texts.push(text.trim());
      }
    }
    return texts;
  }

  async clickFooterLink(linkName: string): Promise<void> {
    await this.scrollToFooter();
    await this.footerContainer.getByRole('link', { name: linkName }).first().click();
  }
}
