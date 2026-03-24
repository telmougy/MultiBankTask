import { test, expect } from '../src/fixtures/test-fixtures.js';
import companyData from '../test-data/company.json';

test.describe.configure({ mode: 'parallel' });

test.describe('Company Page - Why MultiBank Group', () => {
  test('should be reachable via Company nav item on mb.io', async ({ companyPage }) => {
    await companyPage.navigateViaNav();
    await expect(companyPage.heroHeading).toBeVisible();
  });

  test('should display "Why MultiBank Group?" heading', async ({ companyPage }) => {
    await companyPage.navigate();
    const heading = await companyPage.getHeroHeading();
    expect(heading).toContain(companyData.heroHeading);
  });

  test('should display the Why MultiBank Group description', async ({ companyPage }) => {
    await companyPage.navigate();
    const description = await companyPage.getHeroDescription();
    expect(description).toContain(companyData.heroDescriptionContains);
  });
});

test.describe('Company Page - Key Statistics', () => {
  test('should display all 3 stat values', async ({ companyPage }) => {
    await companyPage.navigate();

    for (const stat of companyData.stats) {
      await expect(
        companyPage.page.getByText(stat.value, { exact: false }).first(),
        `Expected stat value "${stat.value}" to be visible`
      ).toBeVisible();
    }
  });

  test('should display all 3 stat labels', async ({ companyPage }) => {
    await companyPage.navigate();

    for (const stat of companyData.stats) {
      await expect(
        companyPage.page.getByText(stat.label, { exact: false }).first(),
        `Expected stat label "${stat.label}" to be visible`
      ).toBeVisible();
    }
  });
});

test.describe('Company Page - Content Sections', () => {
  test('should display all section headings', async ({ companyPage }) => {
    await companyPage.navigate();
    const headings = await companyPage.getSectionHeadings();

    for (const expected of companyData.sectionHeadings) {
      expect(
        headings.some(h => h.toLowerCase().includes(expected.toLowerCase())),
        `Expected section heading "${expected}" to be present. Found: ${headings.join(', ')}`
      ).toBeTruthy();
    }
  });

  test('should display the strengths section heading', async ({ companyPage }) => {
    await companyPage.navigate();
    await expect(
      companyPage.page.getByText(companyData.strengthsHeading, { exact: false }).first()
    ).toBeVisible();
  });
});

test.describe('Company Page - Community & Media', () => {
  test('should display the community section heading', async ({ companyPage }) => {
    await companyPage.navigate();
    await expect(
      companyPage.page.getByText(companyData.communityHeading, { exact: false }).first()
    ).toBeVisible();
  });
});
