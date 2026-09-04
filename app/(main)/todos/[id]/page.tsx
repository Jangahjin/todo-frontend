"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

import { getViewUrls } from "@/lib/api/attachments";
import { ApiError } from "@/lib/api/client";
import { getTodo, updateTodo } from "@/lib/api/todo";
import { collectAttachmentIds, injectViewUrls } from "@/lib/tiptap/attachment-content";

import { TodoForm, type TodoFormSubmitValues } from "@/components/todo/TodoForm";

interface TodoDetailPageProps {
	// Next 16 Async Request APIs — params는 Promise다 (ROADMAP Task 030 경고).
	params: Promise<{ id: string }>;
}

/**
 * Todo 상세/편집 화면 (PRD 6.6, Task 030). 상태 토글·삭제 버튼은 Task 031에서 추가한다 —
 * 지금은 로드된 상태값을 그대로 유지한 채 PUT을 보낸다(API_SPEC 4.5, title·status 필수).
 */
export default function TodoDetailPage({ params }: TodoDetailPageProps) {
	const { id: idParam } = use(params);
	const id = Number(idParam);
	const router = useRouter();
	const queryClient = useQueryClient();

	const { data, isPending, isError, error } = useQuery({
		queryKey: ["todos", id],
		// 저장된 content의 이미지 src는 만료된 조회 URL일 수 있다 — attachmentId만 신뢰하고,
		// 에디터에 주입하기 전에 항상 새 조회 URL을 받아 덮어쓴다 (attachment 가이드 §7).
		queryFn: async () => {
			const todo = await getTodo(id);
			const attachmentIds = collectAttachmentIds(todo.content);
			if (attachmentIds.length === 0 || !todo.content) {
				return todo;
			}
			const urls = await getViewUrls(attachmentIds);
			const urlsByAttachmentId = new Map(urls.map((url) => [url.attachmentId, url.viewUrl]));
			return { ...todo, content: injectViewUrls(todo.content, urlsByAttachmentId) };
		},
	});

	const notFound = isError && error instanceof ApiError && error.status === 404;

	// 없거나 타인 소유(TODO_001)면 목록으로 이동 + 안내 (PRD 3장 리다이렉트 규칙).
	useEffect(() => {
		if (notFound) {
			router.replace("/todos?notice=not_found");
		}
	}, [notFound, router]);

	const mutation = useMutation({
		mutationFn: (values: TodoFormSubmitValues) =>
			updateTodo(id, {
				title: values.title,
				status: data?.status ?? "TODO",
				content: values.content,
				dueDate: values.dueDate,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
			router.push("/todos");
		},
	});

	if (isPending) {
		return (
			<div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:p-8">
				<div className="h-7 w-24 animate-pulse rounded-lg bg-muted" />
				<div className="h-8 animate-pulse rounded-lg bg-muted" />
				<div className="h-48 animate-pulse rounded-lg bg-muted" />
			</div>
		);
	}

	if (isError) {
		// notFound는 useEffect가 이동시킨다 — 이동 전까지 잠깐 빈 화면을 보여준다.
		return null;
	}

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:p-8">
			<h1 className="text-lg font-semibold">Todo 편집</h1>

			{mutation.isError && (
				<p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
					{mutation.error instanceof ApiError && mutation.error.message ? mutation.error.message : "저장하지 못했습니다."}
				</p>
			)}

			<TodoForm
				defaultValues={{ title: data.title, content: data.content, dueDate: data.dueDate }}
				submitLabel="저장"
				isSubmitting={mutation.isPending}
				onSubmit={(values) => mutation.mutate(values)}
				onCancel={() => router.push("/todos")}
			/>
		</div>
	);
}
