import { expect, test } from "@playwright/test";

/**
 * 스모크 테스트 — 렌더 오류 없이 앱이 기동되는지만 확인한다.
 * 시나리오별 테스트는 auth.spec.ts / todo.spec.ts 등으로 분리한다 (Task 023 네이밍 규칙).
 */
test("루트(/) 접속 시 렌더 오류 없이 페이지가 로드된다", async ({ page }) => {
	const consoleErrors: string[] = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") {
			consoleErrors.push(msg.text());
		}
	});

	const response = await page.goto("/");

	expect(response?.ok()).toBe(true);
	expect(consoleErrors).toEqual([]);
});
