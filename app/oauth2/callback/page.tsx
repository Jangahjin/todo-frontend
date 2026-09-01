"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { setToken } from "@/lib/auth/token";

/**
 * OAuth2SuccessHandler/FailureHandler가 `#token=...` 또는 `#error=...` 프래그먼트로
 * 보낸 결과를 받아 처리하는 중계 페이지 (API_SPEC 3.5). 프래그먼트는 서버로 전송되지
 * 않으므로(클라이언트에서만 읽을 수 있음) 반드시 클라이언트 컴포넌트여야 한다.
 * ⚠️ 이 페이지에서는 외부 리소스(폰트·이미지·분석 스크립트)를 로드하지 않는다 (PRD 6.3).
 */
export default function OAuth2CallbackPage() {
	const router = useRouter();

	useEffect(() => {
		const params = new URLSearchParams(window.location.hash.slice(1));
		const token = params.get("token");
		const error = params.get("error");

		if (token) {
			setToken(token);
			// 저장 직후 URL에서 프래그먼트를 제거한다 — 24h 유효 토큰이 브라우저 히스토리에
			// 남지 않도록 한다.
			window.history.replaceState(null, "", "/oauth2/callback");
			router.replace("/todos");
			return;
		}

		window.history.replaceState(null, "", "/oauth2/callback");
		router.replace(`/login?authError=${encodeURIComponent(error ?? "AUTH_007")}`);
	}, [router]);

	return (
		<div className="flex flex-1 items-center justify-center p-4">
			<Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="로그인 처리 중" />
		</div>
	);
}
