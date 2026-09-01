"use client";

import { useQuery } from "@tanstack/react-query";

import { listTodos } from "@/lib/api/todo";
import type { TodoListParams } from "@/types/todo";

/** page·status·keyword는 URL 쿼리가 단일 출처다 — 쿼리 키를 그 값들로만 구성해 URL과 캐시를 일치시킨다 (PRD 6.4). */
export function useTodos(params: TodoListParams) {
	return useQuery({
		queryKey: ["todos", params],
		queryFn: () => listTodos(params),
	});
}
