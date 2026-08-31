import { clearToken, getToken } from "@/lib/auth/token";
import type { ApiResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/** 서버가 ApiResponse로 감싸 돌려준 실패 응답을 그대로 들고 있는 에러 (API_SPEC 1.1). */
export class ApiError extends Error {
	readonly status: number;
	readonly errorCode: string | null;
	readonly data: unknown;

	constructor(status: number, errorCode: string | null, data: unknown, message: string | null) {
		super(message ?? "요청 처리 중 오류가 발생했습니다.");
		this.name = "ApiError";
		this.status = status;
		this.errorCode = errorCode;
		this.data = data;
	}
}

const AUTH_PAGE_PREFIXES = ["/login", "/signup"];

function isOnAuthPage(): boolean {
	return AUTH_PAGE_PREFIXES.some((prefix) => window.location.pathname.startsWith(prefix));
}

type ApiRequestOptions = RequestInit & {
	/** 회원가입·로그인처럼 토큰이 아직 없거나 필요 없는 요청 */
	skipAuth?: boolean;
};

/**
 * 모든 API 호출은 이 함수를 거친다 (API_SPEC 6장) — 컴포넌트에서 fetch를 직접 호출하지 않는다.
 * JWT를 Authorization 헤더에 자동 첨부하고, 401을 받으면 토큰을 지우고 로그인 페이지로 보낸다.
 * 단, 로그인·회원가입 페이지 자체에서 받은 401(예: 로그인 폼의 AUTH_001)은 리다이렉트하지
 * 않는다 — 안 그러면 "로그인 실패 → /login으로 이동 → 같은 페이지에서 다시 로그인 시도"가
 * 반복될 수 있다(무한 루프 방지, API_SPEC 6장).
 */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
	const { skipAuth, headers, ...rest } = options;
	const token = skipAuth ? null : getToken();

	const response = await fetch(`${API_BASE_URL}${path}`, {
		...rest,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...headers,
		},
	});

	const body = (await response.json()) as ApiResponse<T>;

	if (response.status === 401 && typeof window !== "undefined" && !isOnAuthPage()) {
		clearToken();
		// 이 함수는 컴포넌트 밖(React Query queryFn/mutationFn)에서도 호출되므로
		// useRouter()를 쓸 수 없다 — 전체 페이지를 새로고침해 메모리 상태(캐시 등)도 함께 비운다.
		// eslint-disable-next-line @next/next/no-location-assign-relative-destination
		window.location.href = "/login";
	}

	if (!body.success) {
		throw new ApiError(response.status, body.errorCode, body.data, body.message);
	}

	return body.data as T;
}
