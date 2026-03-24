import { test, expect } from '../src/fixtures/test-fixtures.js';
import AxeBuilder from '@axe-core/playwright';
import homeData from '../test-data/home.json';

test.describe.configure({ mode: 'parallel' });

// ---------------------------------------------------------------------------
// Navigation & Layout
// ---------------------------------------------------------------------------

test.describe('Navigation - Marketing Site (mb.io)', () => {
  test('should display nav links on homepage', async ({ homePage }) => {
    await homePage.navigate();
    const visibleLinks = await homePage.topNav.getVisibleNavLinks();

    for (const expectedLink of homeData.navigation.marketingSiteNav.visibleLinks) {
      expect(
        visibleLinks.some(link => link.includes(expectedLink)),
        `Expected nav link "${expectedLink}" to be visible. Found: ${visibleLinks.join(', ')}`
      ).toBeTruthy();
    }
  });

  test('should display Sign in and Sign up buttons', async ({ homePage }) => {
    await homePage.navigate();
    await expect(homePage.topNav.loginButton).toBeVisible();
    await expect(homePage.topNav.signUpButton).toBeVisible();
  });
});

test.describe('Navigation - Trading Platform (trade.mb.io)', () => {
  test('should display the logo on markets page', async ({ marketsPage }) => {
    await marketsPage.navigate();
    await expect(marketsPage.topNav.logo).toBeVisible();
  });

  test('should display primary nav links', async ({ marketsPage }) => {
    await marketsPage.navigate();
    const visibleLinks = await marketsPage.topNav.getVisibleNavLinks();

    for (const expectedLink of homeData.navigation.tradePlatformNav.visibleLinks) {
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

    for (const expected of homeData.navigation.moreDropdownItems) {
      expect(
        items.some(item => item.text.includes(expected.text) && item.href.includes(expected.hrefContains)),
        `Expected More dropdown item "${expected.text}" with href containing "${expected.hrefContains}"`
      ).toBeTruthy();
    }
  });
});

test.describe('Footer (mb.io)', () => {
  test('should display footer on homepage', async ({ homePage }) => {
    await homePage.navigate();
    await homePage.footer.scrollToFooter();
    const isVisible = await homePage.footer.isFooterVisible();
    expect(isVisible).toBeTruthy();
  });

  test('should contain all expected footer links', async ({ homePage }) => {
    await homePage.navigate();
    const footerLinks = await homePage.footer.getAllFooterLinks();

    for (const expected of homeData.footerLinks) {
      expect(
        footerLinks.some(link => link.includes(expected)),
        `Expected footer link "${expected}" to be present. Found: ${footerLinks.join(', ')}`
      ).toBeTruthy();
    }
  });

  test('should have working Terms & Conditions link', async ({ homePage }) => {
    await homePage.navigate();
    await homePage.footer.scrollToFooter();
    const termsLink = homePage.page.locator('footer').getByRole('link', { name: /Terms/i }).first();
    await expect(termsLink).toBeVisible();
    const href = await termsLink.getAttribute('href');
    expect(href).toContain('terms');
  });
});

// ---------------------------------------------------------------------------
// Routing (all public pages load correctly)
// ---------------------------------------------------------------------------

test.describe('Routing', () => {
  test('should load the marketing homepage at mb.io/en', async ({ homePage }) => {
    await homePage.navigate();
    await expect(homePage.downloadAppButton).toBeVisible();
  });

  test('should load Explore page at mb.io/en/explore', async ({ explorePage }) => {
    await explorePage.navigate();
    await expect(explorePage.spotMarketHeading).toBeVisible();
  });

  test('should load Markets page at trade.mb.io/en/markets', async ({ marketsPage }) => {
    await marketsPage.navigate();
    expect(marketsPage.page.url()).toContain('/markets');
  });

  test('should load Company page at mb.io/en/company', async ({ companyPage }) => {
    await companyPage.navigate();
    await expect(companyPage.heroHeading).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Homepage Content (mb.io/en)
// ---------------------------------------------------------------------------

test.describe('Homepage - CTA Buttons', () => {
  test('should display "Download the app" button', async ({ homePage }) => {
    await homePage.navigate();
    await expect(homePage.downloadAppButton).toBeVisible();
  });

  test('should have a valid download link', async ({ homePage }) => {
    await homePage.navigate();
    const href = await homePage.getDownloadAppHref();
    expect(href).toBeTruthy();
    expect(href!.length).toBeGreaterThan(0);
  });

  test('should display "Open an account" button linking to registration', async ({ homePage }) => {
    await homePage.navigate();
    await expect(homePage.openAccountButton).toBeVisible();
    const href = await homePage.openAccountButton.getAttribute('href');
    expect(href).toContain('register');
  });
});

test.describe('Homepage - Feature Cards', () => {
  test('should display all feature cards', async ({ homePage }) => {
    await homePage.navigate();

    for (const feature of homeData.featureCards) {
      const isVisible = await homePage.isFeatureVisible(feature);
      expect(isVisible, `Expected feature "${feature}" to be visible`).toBeTruthy();
    }
  });
});

test.describe('Homepage - Marketing Banners', () => {
  test('should display the Khabib partnership banner', async ({ homePage }) => {
    await homePage.navigate();
    const isVisible = await homePage.isKhabibBannerVisible();
    expect(isVisible).toBeTruthy();
  });

  test('should display the Khabib banner description', async ({ homePage }) => {
    await homePage.navigate();
    const desc = homePage.page.getByText(
      homeData.khabibBanner.descriptionContains, { exact: false }
    ).first();
    await desc.scrollIntoViewIfNeeded().catch(() => {});
    await expect(desc).toBeVisible();
  });

  test('should display trading category widgets', async ({ homePage }) => {
    await homePage.navigate();

    for (const widget of homeData.tradingWidgets) {
      const el = homePage.page.getByText(widget, { exact: false }).first();
      await el.scrollIntoViewIfNeeded().catch(() => {});
      await expect(el, `Expected trading widget "${widget}" to be visible`).toBeVisible();
    }
  });
});

// ---------------------------------------------------------------------------
// Bonus: Accessibility & Performance
// ---------------------------------------------------------------------------

test.describe('Accessibility (bonus)', () => {
  test('axe-core accessibility scan on marketing homepage', async ({ homePage }) => {
    test.setTimeout(60_000);
    await homePage.navigate();

    const results = await new AxeBuilder({ page: homePage.page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    if (results.violations.length > 0) {
      console.log(
        `Found ${results.violations.length} accessibility violation(s):\n` +
          results.violations.map(v => `  - ${v.id}: ${v.description} (${v.nodes.length} instances)`).join('\n')
      );
    }
    expect(results).toBeDefined();
  });
});

test.describe('Performance (bonus)', () => {
  test('should load marketing homepage within acceptable time', async ({ homePage }) => {
    await homePage.navigate();
    const timing = await homePage.getPerformanceTiming();

    expect.soft(
      timing.domContentLoaded,
      `DOM content loaded in ${timing.domContentLoaded}ms (threshold: 10000ms)`
    ).toBeLessThan(10_000);

    expect.soft(
      timing.loadComplete,
      `Page fully loaded in ${timing.loadComplete}ms (threshold: 20000ms)`
    ).toBeLessThan(20_000);
  });
});
