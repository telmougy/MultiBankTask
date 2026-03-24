import { type Page } from '@playwright/test';
import { TopNav } from './components/TopNav.js';
import { Footer } from './components/Footer.js';

export class BasePage {
  readonly page: Page;
  readonly topNav: TopNav;
  readonly footer: Footer;

  constructor(page: Page) {
    this.page = page;
    this.topNav = new TopNav(page);
    this.footer = new Footer(page);
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25_000 });
    await this.dismissPopups();
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /** Dismisses notification popups and cookie banners if present */
  async dismissPopups(): Promise<void> {
    // Dismiss "awesome updates and offers" notification popup
    try {
      const dontAllow = this.page.getByRole('button', { name: "Don't Allow" });
      await dontAllow.waitFor({ state: 'visible', timeout: 5000 });
      await dontAllow.click();
      await dontAllow.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    } catch {
      // No popup — continue
    }

    // Dismiss cookie/consent banners
    try {
      const cookieButton = this.page.locator(
        'button:has-text("Accept"), button:has-text("Got it"), button:has-text("OK")'
      ).first();
      await cookieButton.click({ timeout: 2000 });
    } catch {
      // No cookie banner — continue
    }

    // Remove MoEngage push notification overlay that intercepts clicks
    await this.page.evaluate(() => {
      const moePush = document.getElementById('moe-push-div');
      if (moePush) moePush.remove();
    }).catch(() => {});
  }
}
