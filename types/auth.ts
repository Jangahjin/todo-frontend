import type { UserResponse } from "@/types/user";

/** API_SPEC 3.1. name은 선택(최대 100자), password는 6자 이상이면 통과(추가 복잡도 규칙 없음). */
export type SignupRequest = {
	email: string;
	password: string;
	name?: string;
};

/** API_SPEC 3.2. */
export type LoginRequest = {
	email: string;
	password: string;
};

/** API_SPEC 3.2 — expiresIn 단위는 밀리초(86400000 = 24시간, 불변 규칙 4). */
export type TokenResponse = {
	accessToken: string;
	tokenType: string;
	expiresIn: number;
	user: UserResponse;
};
