import { expect, test } from "@playwright/test";

import { randomEmail, signupAndLogin } from "./helpers";

/**
 * Task 032 — 위조/만료된 토큰으로 보호된 페이지의 API를 호출하면 서버가 401을 반환하고,
 * lib/api/client.ts의 apiFetch가 토큰을 지운 뒤 로그인 페이지로 보낸다(Task 021).
 * (main) 레이아웃 가드는 토큰의 "존재 여부"만 보고 통과시키므로, 실제로는 Header의
 * getMe() 호출이 401을 받는 시점에 리다이렉트가 일어난다.
 */
test("유효하지 않은 토큰으로 보호된 페이지에 진입하면 로그인 페이지로 이동하고 토큰이 삭제된다", async ({ page }) => {
	// 정상 로그인을 한 번 태운 뒤 토큰을 위조된 값으로 바꿔치기해, 서버가 서명 불일치
	// (AUTH_005)로 401을 반환하는 실제 경로를 그대로 탄다.
	await signupAndLogin(page, randomEmail("session-expiry"));

	await page.evaluate(() => {
		window.localStorage.setItem("accessToken", "invalid.forged.token");
	});

	await page.goto("/todos");
	await page.waitForURL("/login");

	const token = await page.evaluate(() => window.localStorage.getItem("accessToken"));
	expect(token).toBeNull();
});
