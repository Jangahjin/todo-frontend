import { apiFetch } from "@/lib/api/client";
import type { PageResponse } from "@/types/api";
import type {
	TodoCreateRequest,
	TodoListParams,
	TodoResponse,
	TodoStatusUpdateRequest,
	TodoUpdateRequest,
} from "@/types/todo";

/** API_SPEC 4.2 — page·status·keyword는 URL 쿼리스트링이 단일 출처다(PRD 6.4). 훅이 URL에서 읽어 그대로 넘긴다. */
export function listTodos(params: TodoListParams): Promise<PageResponse<TodoResponse>> {
	const query = new URLSearchParams();
	if (params.page !== undefined) query.set("page", String(params.page));
	if (params.size !== undefined) query.set("size", String(params.size));
	if (params.status) query.set("status", params.status);
	if (params.keyword) query.set("keyword", params.keyword);

	const queryString = query.toString();
	return apiFetch<PageResponse<TodoResponse>>(`/api/todos${queryString ? `?${queryString}` : ""}`);
}

/** API_SPEC 4.3 */
export function getTodo(id: number): Promise<TodoResponse> {
	return apiFetch<TodoResponse>(`/api/todos/${id}`);
}

/** API_SPEC 4.4 */
export function createTodo(request: TodoCreateRequest): Promise<TodoResponse> {
	return apiFetch<TodoResponse>("/api/todos", {
		method: "POST",
		body: JSON.stringify(request),
	});
}

/** API_SPEC 4.5 */
export function updateTodo(id: number, request: TodoUpdateRequest): Promise<TodoResponse> {
	return apiFetch<TodoResponse>(`/api/todos/${id}`, {
		method: "PUT",
		body: JSON.stringify(request),
	});
}

/** API_SPEC 4.6 — 클라이언트가 목표 상태를 지정한다(불변 규칙 13). */
export function updateTodoStatus(id: number, request: TodoStatusUpdateRequest): Promise<TodoResponse> {
	return apiFetch<TodoResponse>(`/api/todos/${id}/status`, {
		method: "PATCH",
		body: JSON.stringify(request),
	});
}

/** API_SPEC 4.7 — Soft Delete. */
export function deleteTodo(id: number): Promise<null> {
	return apiFetch<null>(`/api/todos/${id}`, {
		method: "DELETE",
	});
}
