import { expect, test } from "@playwright/test";

import { randomEmail, signupAndLogin } from "./helpers";

/**
 * Task 032 — 가입 → 로그인 → Todo 생성 → 목록 확인 → 수정 → 상태 토글 → 삭제 → 로그아웃
 * 단일 시나리오. mock 없이 실제 백엔드와 통신한다(playwright.config.ts 상단 주석 참조) —
 * 백엔드 dev 서버가 떠 있지 않으면 이 스펙은 통과할 수 없다.
 */
test("전체 사용자 플로우: 가입부터 로그아웃까지", async ({ page }) => {
	const email = randomEmail("full-flow");
	await signupAndLogin(page, email);

	// Todo 생성 (TODO-03)
	await page.getByRole("link", { name: "새 Todo" }).click();
	await page.waitForURL("/todos/new");
	// "제목" 라벨은 목록 페이지의 "제목 검색" 필터와 접근성 이름이 겹칠 수 있어 exact로 못박는다.
	await page.getByLabel("제목", { exact: true }).fill("E2E 테스트 할 일");
	await page.getByRole("button", { name: "저장" }).click();
	await page.waitForURL("/todos");

	// 목록 확인 (TODO-01)
	const createdLink = page.getByRole("link", { name: /E2E 테스트 할 일/ });
	await expect(createdLink).toBeVisible();

	// 수정 (TODO-04) — 링크 클릭 후 상세 페이지로의 네비게이션이 끝나길 기다린 뒤에만 입력한다.
	await createdLink.click();
	await page.waitForURL(/\/todos\/\d+$/);
	await page.getByLabel("제목", { exact: true }).fill("E2E 테스트 할 일 (수정됨)");
	await page.getByRole("button", { name: "저장" }).click();
	await page.waitForURL("/todos");
	await expect(page.getByRole("link", { name: /E2E 테스트 할 일 \(수정됨\)/ })).toBeVisible();

	// 상태 토글 (TODO-05) — 클라이언트가 목표 상태를 지정하는 멱등 요청(불변 규칙 13)
	const item = page.getByRole("listitem").filter({ hasText: "E2E 테스트 할 일 (수정됨)" });
	await item.getByRole("checkbox", { name: "완료로 표시" }).click();
	await expect(item.getByRole("checkbox", { name: "완료 취소" })).toBeChecked();

	// 삭제 (TODO-06, Soft Delete) — 삭제 트리거 아이콘과 다이얼로그 확인 버튼 모두
	// 접근성 이름이 "삭제"라 다이얼로그 범위로 좁혀 클릭한다.
	await item.getByRole("button", { name: "삭제" }).click();
	await page.getByRole("dialog").getByRole("button", { name: "삭제" }).click();
	await expect(item).toHaveCount(0);

	// 로그아웃 (AUTH-05)
	await page.getByRole("button", { name: "사용자 메뉴" }).click();
	await page.getByRole("menuitem", { name: "로그아웃" }).click();
	await page.waitForURL("/login");
});
