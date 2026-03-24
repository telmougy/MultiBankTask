import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { ExplorePage } from '../pages/ExplorePage.js';
import { MarketsPage } from '../pages/MarketsPage.js';
import { CompanyPage } from '../pages/CompanyPage.js';

type PageFixtures = {
  homePage: HomePage;
  explorePage: ExplorePage;
  marketsPage: MarketsPage;
  companyPage: CompanyPage;
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  explorePage: async ({ page }, use) => {
    await use(new ExplorePage(page));
  },
  marketsPage: async ({ page }, use) => {
    await use(new MarketsPage(page));
  },
  companyPage: async ({ page }, use) => {
    await use(new CompanyPage(page));
  },
});

export { expect } from '@playwright/test';
