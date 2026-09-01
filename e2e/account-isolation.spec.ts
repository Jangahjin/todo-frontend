import { expect, test } from "@playwright/test";

import { randomEmail, signupAndLogin } from "./helpers";

/**
 * Task 032 — A 계정이 만든 Todo를 B 계정에서 볼 수 없어야 한다: ID를 직접 입력해
 * 접근해도 목록으로 리다이렉트된다. 서버가 소유권 위반을 403이 아닌 404(TODO_001)로
 * 응답해 타인 리소스의 존재 자체를 숨기는 정책(PRD 10장, 불변 규칙 11)의 프론트 관점 확인.
 * 두 계정을 완전히 분리하기 위해 브라우저 컨텍스트(별도 localStorage)를 각각 만든다.
 */
test("A 계정의 Todo에 B 계정이 ID로 직접 접근하면 목록으로 리다이렉트된다", async ({ browser }) => {
	const contextA = await browser.newContext();
	const pageA = await contextA.newPage();
	await signupAndLogin(pageA, randomEmail("isolation-a"));

	await pageA.getByRole("link", { name: "새 Todo" }).click();
	await pageA.waitForURL("/todos/new");
	await pageA.getByLabel("제목", { exact: true }).fill("A 계정 전용 할 일");
	await pageA.getByRole("button", { name: "저장" }).click();
	await pageA.waitForURL("/todos");

	await pageA.getByRole("link", { name: /A 계정 전용 할 일/ }).click();
	await pageA.waitForURL(/\/todos\/\d+$/);
	const todoId = pageA.url().match(/\/todos\/(\d+)$/)?.[1];
	expect(todoId).toBeTruthy();
	await contextA.close();

	const contextB = await browser.newContext();
	const pageB = await contextB.newPage();
	await signupAndLogin(pageB, randomEmail("isolation-b"));

	await pageB.goto(`/todos/${todoId}`);
	await pageB.waitForURL("/todos?notice=not_found");
	await expect(pageB.getByRole("alert").filter({ hasText: "찾을 수 없습니다" })).toBeVisible();
	// 목록 자체는 정상 렌더되어야 한다 — 리다이렉트가 에러 화면이 아니라 안내 배너여야 함.
	await expect(pageB.getByRole("heading", { name: "Todo 목록" })).toBeVisible();

	await contextB.close();
});
