"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/auth/token";

/**
 * 로그인/회원가입 카드를 중앙 정렬하고(PRD 9.2), 이미 인증된 상태로 들어오면
 * Todo 목록으로 보낸다.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	useEffect(() => {
		if (getToken()) {
			router.replace("/todos");
		}
	}, [router]);

	return (
		<div className="flex flex-1 items-center justify-center p-4">
			<div className="w-full max-w-sm">{children}</div>
		</div>
	);
}
