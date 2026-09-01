"use client";

import { useSyncExternalStore } from "react";

import { getToken } from "@/lib/auth/token";

function subscribeToTokenChanges(callback: () => void) {
	window.addEventListener("storage", callback);
	return () => window.removeEventListener("storage", callback);
}

/** 서버는 localStorage를 볼 수 없으므로(Next 16 proxy.ts도 대안이 아님) 항상 미인증으로 취급한다. */
function getServerSnapshot(): string | null {
	return null;
}

/**
 * localStorage의 accessToken을 구독한다. 하이드레이션 직후 `useSyncExternalStore`가
 * 페인트 전에 동기적으로 실제 값으로 교정하므로, 서버 스냅샷(null)이 화면에 보이는
 * 미인증 콘텐츠 플래시 없이 인증 가드에 바로 사용할 수 있다.
 */
export function useAuthToken(): string | null {
	return useSyncExternalStore(subscribeToTokenChanges, getToken, getServerSnapshot);
}
