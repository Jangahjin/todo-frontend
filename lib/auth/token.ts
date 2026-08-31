/**
 * localStorage 사용 확정 (PRD 13.1). httpOnly 쿠키는 불가 — PRD 10장이
 * Authorization: Bearer를 전제하므로 JS가 토큰을 직접 읽어야 한다.
 * sessionStorage는 탭을 닫으면 사라져 24h 토큰의 의미가 없어진다.
 *
 * SSR 안전성: localStorage는 서버에 없다. 이 파일의 모든 함수는
 * typeof window로 가드해 서버 컴포넌트/빌드 타임에서도 안전하게 호출된다.
 */
const TOKEN_KEY = "accessToken";

export function getToken(): string | null {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(TOKEN_KEY);
}
