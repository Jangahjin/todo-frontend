import type { Page } from "@playwright/test";

/** 불변 규칙 2: 6자 이상이면 통과. 테스트 전용 고정 비밀번호. */
export const TEST_PASSWORD = "test1234";

/** 반복 실행 시 "이미 가입된 이메일"(AUTH_002) 충돌을 피하기 위해 매번 새 이메일을 만든다. */
export function randomEmail(prefix: string): string {
	return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@example.com`;
}

/**
 * 회원가입 → (SignupForm이 /login으로 리다이렉트) → 로그인 → /todos 진입까지
 * UI로 수행한다. 실제 백엔드와 통신하므로 각 스펙은 이 헬퍼로 매번 새 계정을 만든다.
 */
export async function signupAndLogin(page: Page, email: string, password: string = TEST_PASSWORD): Promise<void> {
	await page.goto("/signup");
	await page.getByLabel("이메일").fill(email);
	await page.getByLabel("비밀번호", { exact: true }).fill(password);
	await page.getByLabel("비밀번호 확인").fill(password);
	await page.getByRole("button", { name: "회원가입" }).click();

	await page.waitForURL("/login");
	await page.getByLabel("이메일").fill(email);
	await page.getByLabel("비밀번호", { exact: true }).fill(password);
	await page.getByRole("button", { name: "로그인" }).click();

	await page.waitForURL("/todos");
}
