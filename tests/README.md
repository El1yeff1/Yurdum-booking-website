# Browser test notes

Run `pnpm test` from the project root after installing the Playwright browsers.
The configuration starts Vite automatically for local test runs.

Set `PLAYWRIGHT_BASE_URL` to use an already-running preview instead. The address
must include any deployment base path.

The suite checks responsive search and filter interactions, saved items,
modals, and the scroll-based house and doorway story. It also checks reduced
motion, language switching, image loading, overflow, and browser errors.

Test results and the HTML report are written to `test-results/` and
`playwright-report/`; both folders are excluded from Git.
