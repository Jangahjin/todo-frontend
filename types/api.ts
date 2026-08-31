/** API_SPEC 1.1 — 모든 응답이 감싸이는 공통 래퍼. */
export type ApiResponse<T> = {
	success: boolean;
	data: T | null;
	message: string | null;
	errorCode: string | null;
};

/**
 * data는 성공 시 T, 실패 시 null이 원칙이지만 검증 실패(COMMON_001)에 한해
 * 필드명→메시지 맵을 담는다 (API_SPEC 1.1/1.3).
 */
export type ValidationErrorResponse = ApiResponse<Record<string, string>> & {
	errorCode: "COMMON_001";
};

/** API_SPEC 1.2 — 목록 조회 시 ApiResponse.data에 담기는 페이지네이션 래퍼. */
export type PageResponse<T> = {
	content: T[];
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
	hasNext: boolean;
};

/** API_SPEC 2장 에러코드 체계. */
export type ErrorCode =
	| "COMMON_001"
	| "COMMON_002"
	| "COMMON_500"
	| "AUTH_001"
	| "AUTH_002"
	| "AUTH_003"
	| "AUTH_004"
	| "AUTH_005"
	| "AUTH_006"
	| "AUTH_007"
	| "TODO_001"
	| "TODO_002";
