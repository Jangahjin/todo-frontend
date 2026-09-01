"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useTodos } from "@/hooks/useTodos";
import { ApiError } from "@/lib/api/client";
import type { TodoStatus } from "@/types/todo";

import { Pagination } from "@/components/common/Pagination";
import { TodoFilter } from "@/components/todo/TodoFilter";
import { TodoList } from "@/components/todo/TodoList";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

function isTodoStatus(value: string | null): value is TodoStatus {
	return value === "TODO" || value === "DONE";
}

function buildTodosHref(params: { page: number; status: TodoStatus | null; keyword: string }): string {
	const query = new URLSearchParams();
	if (params.page > 0) query.set("page", String(params.page));
	if (params.status) query.set("status", params.status);
	if (params.keyword) query.set("keyword", params.keyword);
	const queryString = query.toString();
	return queryString ? `/todos?${queryString}` : "/todos";
}

/** page·status·keyword는 URL 쿼리스트링이 단일 출처다(PRD 6.4) — useSearchParams()를 쓰므로 Suspense 필수(Next.js 16). */
function TodosPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const page = Number(searchParams.get("page") ?? "0") || 0;
	const rawStatus = searchParams.get("status");
	const status = isTodoStatus(rawStatus) ? rawStatus : null;
	const keyword = searchParams.get("keyword") ?? "";
	// 상세 화면이 존재하지 않거나 타인 소유(TODO_001)인 Todo에서 리다이렉트할 때 붙이는 안내 (Task 030).
	const notice = searchParams.get("notice") === "not_found" ? "요청하신 Todo를 찾을 수 없습니다." : null;

	const { data, isPending, isError, error } = useTodos({
		page,
		size: PAGE_SIZE,
		status: status ?? undefined,
		keyword: keyword || undefined,
	});

	function goTo(next: { page?: number; status?: TodoStatus | null; keyword?: string }) {
		router.push(
			buildTodosHref({
				page: next.page ?? page,
				status: next.status !== undefined ? next.status : status,
				keyword: next.keyword !== undefined ? next.keyword : keyword,
			}),
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-lg font-semibold">Todo 목록</h1>
				<Button asChild size="sm">
					<Link href="/todos/new">
						<Plus />
						새 Todo
					</Link>
				</Button>
			</div>

			{notice && (
				<p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
					{notice}
				</p>
			)}

			<TodoFilter
				status={status}
				keyword={keyword}
				onStatusChange={(next) => goTo({ page: 0, status: next })}
				onKeywordChange={(next) => goTo({ page: 0, keyword: next })}
			/>

			{isPending ? (
				<div className="flex flex-col gap-2" aria-label="Todo 목록 불러오는 중">
					{Array.from({ length: 3 }).map((_, index) => (
						<div key={index} className="h-14 animate-pulse rounded-lg bg-muted" />
					))}
				</div>
			) : isError ? (
				<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
					{error instanceof ApiError && error.message ? error.message : "목록을 불러오지 못했습니다."}
				</div>
			) : (
				<>
					<TodoList todos={data.content} />
					<Pagination page={data.page} totalPages={data.totalPages} onPageChange={(next) => goTo({ page: next })} />
				</>
			)}
		</div>
	);
}

export default function TodosPage() {
	return (
		<Suspense>
			<TodosPageContent />
		</Suspense>
	);
}
