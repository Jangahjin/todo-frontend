"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthToken } from "@/hooks/useAuth";

import { Header } from "@/components/common/Header";

/**
 * (main) 라우트 그룹 인증 가드. 토큰이 없으면 로그인 페이지로 보낸다.
 * 만료·위조 토큰(있지만 무효)은 실제 API 호출이 401을 받았을 때 lib/api/client.ts의
 * apiFetch가 토큰을 지우고 리다이렉트한다(Task 021, /login·/signup 외 경로는 루프 없음).
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const token = useAuthToken();

	useEffect(() => {
		if (token === null) {
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
