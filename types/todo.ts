/** API_SPEC 4.1. */
export type TodoStatus = "TODO" | "DONE";

/**
 * content는 Tiptap이 생성하는 JSON 문서를 그대로 주고받는다 — 서버가 내용을 해석하지
 * 않는 불투명(opaque) 데이터라 정확한 스키마 대신 record로 둔다 (PRD 8.4, API_SPEC 4.1).
 */
export type TiptapDocument = Record<string, unknown>;

/** API_SPEC 4.1 — 모든 Todo 엔드포인트가 공통으로 쓰는 응답 구조. */
export type TodoResponse = {
	id: number;
	title: string;
	content: TiptapDocument | null;
	status: TodoStatus;
	dueDate: string | null;
	createdAt: string;
	updatedAt: string;
};

/** API_SPEC 4.4 — status는 요청에 포함하지 않는다(생성 시 항상 TODO로 시작). */
export type TodoCreateRequest = {
	title: string;
	content?: TiptapDocument;
	dueDate?: string;
};

/**
 * API_SPEC 4.5 — PUT은 전체 교체다. title·status는 생략 불가(DB NOT NULL),
 * content·dueDate는 생략하면 null로 갱신된다.
 */
export type TodoUpdateRequest = {
	title: string;
	status: TodoStatus;
	content?: TiptapDocument | null;
	dueDate?: string | null;
};

/** API_SPEC 4.6 — 클라이언트가 목표 상태를 지정한다(서버 반전 토글 금지, 불변 규칙 13). */
export type TodoStatusUpdateRequest = {
	status: TodoStatus;
};

/** API_SPEC 4.2 — URL 쿼리스트링이 단일 출처다 (PRD 6.4). */
export type TodoListParams = {
	page?: number;
	size?: number;
	status?: TodoStatus;
	keyword?: string;
};
