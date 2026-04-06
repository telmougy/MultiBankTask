# MultiBank QA Automation Framework

Production-grade web automation framework for testing the [MultiBank trading platform](https://trade.mb.io/en), built with **Playwright** and **TypeScript**.

## Quick Start

### Prerequisites
- Node.js 20+
- npm

### Setup
```bash
npm install
npx playwright install
```

### Run Tests
```bash
# All tests, all browsers (Chromium, Firefox, WebKit)
npm test

# Chromium only (fastest, used in CI)
npm run test:chromium

# Headed mode (see the browser)
npm run test:headed

# Interactive UI mode
npm run test:ui

# View HTML report
npm run test:report

# Task 2: String frequency tests only
npm run test:string

# Type-check only (no execution)
npm run lint
```

### Task 2: String Character Frequency (CLI)
```bash
npx ts-node task2-string-frequency/charFrequency.ts "hello world"
# Output: h:1, e:1, l:3, o:2, w:1, r:1, d:1
```

---

## Architecture

### Dual-Domain Architecture

The MultiBank platform spans **two domains** with different purposes:

| Domain | Purpose | Key Pages |
|---|---|---|
| `mb.io` | Marketing site | Homepage (`/en`), Explore/Spot Market (`/en/explore`), Company (`/en/company`), Features |
| `trade.mb.io` | Trading platform | Markets (`/en/markets`), Login (`/en`) |

The framework handles this by using **absolute URLs** instead of a single baseURL. Each page object encapsulates its own domain.

### Project Structure
```
MultiBankTask/
├── playwright.config.ts                  # Browsers, timeouts, reporters, parallel config
├── package.json                          # Dependencies and npm scripts
├── tsconfig.json                         # TypeScript strict mode, resolveJsonModule
│
├── src/
│   ├── pages/                            # Page Object Model
│   │   ├── BasePage.ts                   # Base class: TopNav/Footer composition, popup dismissal
│   │   ├── HomePage.ts                   # mb.io/en — hero, feature cards, banners, download CTA
│   │   ├── ExplorePage.ts                # mb.io/en/explore — spot market, trading categories
│   │   ├── MarketsPage.ts               # trade.mb.io/en/markets — table, tabs, search
│   │   ├── CompanyPage.ts               # mb.io/en/company — stats, sections, community
│   │   └── components/
│   │       ├── TopNav.ts                 # Shared nav (handles both domain layouts)
│   │       └── Footer.ts                # Shared footer (mb.io pages only)
│   └── fixtures/
│       └── test-fixtures.ts              # Custom Playwright fixtures (DI for page objects)
│
├── tests/                                # Test specs — one per page, consistent naming
│   ├── home.spec.ts                      # Navigation, CTAs, banners, features, a11y, perf
│   ├── explore.spec.ts                   # Spot market, trading categories, download CTA
│   ├── markets.spec.ts                   # Table structure, tabs, search functionality
│   └── company.spec.ts                   # Hero, stats, sections, strengths, community
│
├── test-data/                            # External test data — one JSON per spec file
│   ├── home.json                         # Nav items, More dropdown, footer, features, banners
│   ├── explore.json                      # Spot market headings, category tabs, known coins
│   ├── markets.json                      # Column headers, tabs, search cases, format patterns
│   └── company.json                      # Hero text, stats, section headings, strengths
│
├── task2-string-frequency/               # Task 2: String character frequency
│   ├── charFrequency.ts                  # Core function + CLI entry point
│   └── charFrequency.test.ts             # 12 unit tests (edge cases, unicode, formatting)
│
├── docs/evidence/                        # Committed test report screenshots
├── .github/workflows/qa-tests.yml        # CI/CD: Chromium-only for speed
└── README.md
```

### Design Decisions

| Decision | Rationale |
|---|---|
| **Playwright** over Cypress/Selenium | Native cross-browser (Chromium, Firefox, WebKit), auto-wait, TypeScript-first, parallel execution |
| **Composition** over inheritance | TopNav/Footer shared via composition in BasePage — avoids deep class hierarchies |
| **Absolute URLs** over baseURL | Site spans two domains (`trade.mb.io` + `mb.io`); a single baseURL would break cross-domain tests |
| **Element-based waits** over `networkidle` | Next.js SPA has streaming/WebSocket connections; `networkidle` causes flakiness. Each page object waits for a key element instead |
| **JSON test data** with `resolveJsonModule` | Zero extra dependencies; native TS import, easy to maintain |
| **Format regex** over exact values | Prices/percentages change constantly; we assert the shape, not the value |
| **Chromium-only CI** | Speed/cost trade-off; full 3-browser run available locally, evidence committed |
| **Zero `waitForTimeout`** | All waits use `waitFor()`, `waitForLoadState()`, or Playwright's built-in auto-wait — no fixed sleeps |
| **MoEngage popup removal** | Third-party notification overlay intercepts clicks; removed via `page.evaluate()` in `dismissPopups()` |

### Parallel Execution Strategy
- **`navigation.spec.ts`**, **`content.spec.ts`**, **`company.spec.ts`**, **`explore.spec.ts`**: `test.describe.configure({ mode: 'parallel' })` — independent tests, no shared state
- **`markets.spec.ts`** Category Tabs block: `test.describe.configure({ mode: 'serial' })` — tab clicks affect shared page state
- **Config-level**: `fullyParallel: true` runs spec files in parallel across workers

### Wait Strategy (No Fixed Sleeps)
All waits are event-driven:
- **Navigation**: `page.goto(url, { waitUntil: 'domcontentloaded' })`
- **Elements**: `await expect(locator).toBeVisible()` — Playwright auto-wait
- **Tables**: `waitForTableLoad()` — waits for first row via `locator.waitFor()`
- **Tab panels**: waits for `[role="tabpanel"]:not([hidden]) table tbody tr`
- **Search overlay**: waits for `input[placeholder*="Search"]:visible` after icon click
- **Dropdowns**: waits for first dropdown link to be visible after click
- **Popups**: `dismissPopups()` — waits for button visibility, then click, then removal

---

## Cross-Browser Testing

### CI (GitHub Actions)
Runs **Chromium only** for speed. See `.github/workflows/qa-tests.yml`.

### Local (Full 3-Browser)
```bash
npm test  # Runs Chromium + Firefox + WebKit
```

Evidence of cross-browser runs is committed to `docs/evidence/`.

---

## Test Coverage Summary

| Spec File | Data File | Tests | Scope |
|---|---|---|---|
| `home.spec.ts` | `home.json` | 22 | Navigation (both domains), More dropdown, footer, routing, CTAs, features, Khabib banner, a11y, performance |
| `explore.spec.ts` | `explore.json` | 8 | Spot market, trading categories (Hot/Gainers/Losers), known coins (BTC/ETH/SOL/DOGE/XRP), download CTA |
| `markets.spec.ts` | `markets.json` | 10 | Column headers, data rows, page title, category tabs, search overlay, Bitcoin/Ethereum search, empty results |
| `company.spec.ts` | `company.json` | 8 | Why MultiBank Group heading/description, stat values/labels (3 each), section headings (3), strengths, community |
| `charFrequency.test.ts` | — | 12 | Example input, empty, single char, repeats, case sensitivity, spaces, special chars, unicode, order |
| **Total** | | **60** | |

---

## How to Extend

### Add a new page
1. Create `src/pages/NewPage.ts` extending `BasePage`
2. Add a fixture in `src/fixtures/test-fixtures.ts`
3. Add test data in `test-data/`
4. Create `tests/newpage.spec.ts`

### Add a new test to existing suite
1. Add test data to the relevant JSON file
2. Add the test case in the corresponding `.spec.ts`
3. If using new locators, add them to the page object

### Run a specific test
```bash
npx playwright test tests/markets.spec.ts --project=chromium
npx playwright test -g "should display hero heading"
```

---

## Task 2: String Character Frequency

### Approach
Iterates the input string character by character, building a `Map<string, number>` that preserves insertion order (first appearance). Spaces are excluded per the specification example.

### Assumptions
- **Case-sensitive**: `'A'` and `'a'` are distinct characters
- **Spaces excluded**: per the provided example output (`"hello world"` → `h:1, e:1, l:3, o:2, w:1, r:1, d:1`), whitespace is intentionally omitted. This is a reasoned decision based on the example, not an oversight.
- **All other characters included**: special chars, unicode, punctuation are counted
- **Output order**: characters appear in order of first occurrence in the input

### Complexity
- Time: O(n) — single pass through the string
- Space: O(k) — where k is the number of unique characters

---

## Reporting

After test runs, view the HTML report:
```bash
npm run test:report
```

Failed tests include:
- **Screenshots** — captured on failure
- **Traces** — captured on first retry, open with `npx playwright show-trace`

---

## Assumptions & Trade-offs

1. **Public pages only** — no authentication flows tested (wallet, trading require login)
2. **Dual-domain architecture** — `trade.mb.io` (trading) and `mb.io` (marketing); tests use absolute URLs
3. **No `data-testid` attributes** — the live site doesn't expose test IDs; we use `getByRole`, `getByText`, `getByPlaceholder` per Playwright best practices
4. **Dynamic market data** — prices and percentages change constantly; tests assert format patterns (regex), not exact values
5. **Search input behind icon** — the search field on markets is hidden behind an icon-only button; tests click the icon to activate it
6. **MoEngage overlay** — third-party notification popup intercepts clicks; handled by removing the DOM element
7. **Download link** — the "Download the app" button uses a deep link (`mbio.go.link`) rather than separate App Store / Google Play links
8. **CI runs Chromium only** — full 3-browser testing is available locally; this is a speed/cost trade-off
9. **Performance thresholds** — use soft assertions to account for variable network conditions across browser engines
