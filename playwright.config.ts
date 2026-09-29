import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'npm run build && npm run preview', port: 4173 },
	use: { baseURL: 'http://localhost:4173' },
	testMatch: '**/*.e2e.{ts,js}',
	// Each page is independent: spread them over every worker, not one file per worker.
	fullyParallel: true,
	projects: [
		{ name: 'chrome', use: devices['Desktop Chrome'] },
		{ name: 'firefox', use: devices['Desktop Firefox'] },
		{ name: 'safari', use: devices['Desktop Safari'] },
		{ name: 'iphone', use: devices['iPhone SE'] },
		{ name: 'android', use: devices['Galaxy S9+'] },
		{ name: 'ipad', use: devices['iPad Mini'] }
	]
});
