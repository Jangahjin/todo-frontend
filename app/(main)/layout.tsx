"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/auth/token";
import { useAuthToken } from "@/hooks/useAuth";

import { Header } from "@/components/common/Header";

/**
 * (main) 라우트 그룹 인증 가드. 토큰이 없으면 로그인 페이지로 보낸다.
 * 만료·위조 토큰(있지만 무효)은 실제 API 호출이 401을 받았을 때 lib/api/client.ts의
 * apiFetch가 토큰을 지우고 리다이렉트한다(Task 021, /login·/signup 외 경로는 루프 없음).
 *
 * 리다이렉트 여부는 렌더 시점의 `token`(useSyncExternalStore 스냅샷)이 아니라
 * effect 실행 시점에 `getToken()`을 직접 다시 읽어 판단한다 — /todos/new·/todos/[id]를
 * 하드 리로드하면 하이드레이션 첫 렌더의 서버 스냅샷(null)이 실제 토큰으로 교정되기 전에
 * 이 effect가 먼저 실행되어 로그인 화면으로 오탐 리다이렉트되는 버그가 있었다(Task 030
 * 브라우저 검증 중 발견). effect는 여전히 `token` 변경 시 재실행돼 다른 탭 로그아웃도 반영한다.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const token = useAuthToken();

	useEffect(() => {
		if (!getToken()) {
			router.replace("/login");
		}
	}, [token, router]);

	if (token === null) {
		return null;
	}

	return (
		<div className="flex min-h-full flex-1 flex-col">
			<Header />
			<main className="flex flex-1 flex-col">{children}</main>
		</div>
	);
}
