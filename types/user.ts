/** PRD 8.2 — 최초 가입 수단을 뜻하며 이후 다른 방식으로 로그인해도 바뀌지 않는다 (PRD 13.1). */
export type AuthProvider = "LOCAL" | "GOOGLE" | "KAKAO";

/** API_SPEC 3.1/3.3. */
export type UserResponse = {
	id: number;
	email: string;
	name: string | null;
	provider: AuthProvider;
	createdAt: string;
};
