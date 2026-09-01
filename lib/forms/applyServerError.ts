import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

import { ApiError } from "@/lib/api/client";

/**
 * 서버 에러를 RHF 필드 에러로 매핑한다 (API_SPEC 1.3).
 * - COMMON_001(검증 실패): data가 필드명→메시지 맵이므로 각 필드에 그대로 심는다.
 * - AUTH_002(이메일 중복): 계정이 이미 있는 이메일임을 그 필드에서 바로 보여준다.
 * - 그 외(AUTH_001 등): 폼 전체 에러("root")로 표시한다.
 * 메시지는 서버 ApiResponse.message를 그대로 쓴다 — "이메일 없음"/"비밀번호 불일치"를
 * 구분하지 않는 AUTH_001 문구 등은 이미 백엔드가 확정해 내려준다.
 */
export function applyServerError<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): void {
	if (error instanceof ApiError && error.errorCode === "COMMON_001" && error.data && typeof error.data === "object") {
		Object.entries(error.data as Record<string, string>).forEach(([field, message]) => {
			setError(field as FieldPath<T>, { type: "server", message });
		});
		return;
	}

	if (error instanceof ApiError && error.errorCode === "AUTH_002") {
		setError("email" as FieldPath<T>, { type: "server", message: error.message ?? "이미 사용 중인 이메일입니다." });
		return;
	}

	const message = error instanceof ApiError ? (error.message ?? "요청 처리 중 오류가 발생했습니다.") : "요청 처리 중 오류가 발생했습니다.";
	setError("root", { type: "server", message });
}
