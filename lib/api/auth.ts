import { apiFetch } from "@/lib/api/client";
import type { LoginRequest, SignupRequest, TokenResponse } from "@/types/auth";
import type { UserResponse } from "@/types/user";

/** API_SPEC 3.1 */
export function signup(request: SignupRequest): Promise<UserResponse> {
	return apiFetch<UserResponse>("/api/auth/signup", {
		method: "POST",
		body: JSON.stringify(request),
		skipAuth: true,
	});
}

/** API_SPEC 3.2 */
export function login(request: LoginRequest): Promise<TokenResponse> {
	return apiFetch<TokenResponse>("/api/auth/login", {
		method: "POST",
		body: JSON.stringify(request),
		skipAuth: true,
	});
}

/** API_SPEC 3.3 */
export function getMe(): Promise<UserResponse> {
	return apiFetch<UserResponse>("/api/auth/me");
}
