import { defineConfig, devices } from "@playwright/test";

/**
 * E2E는 백엔드 기동을 전제로 한다 — 인증·Todo API를 모킹하지 않아 통합 리스크를 줄인다
 * (ROADMAP 0.5). 실행 순서: 백엔드 dev 기동 → `npm run test:e2e`(webServer가 next dev를 자동 기동).
 */
export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: [
		["list"],
		["html", { open: "never" }], // 자동으로 리포트 서버를 띄워 프로세스가 종료되지 않는 것을 방지
	],
	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "npm run dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
