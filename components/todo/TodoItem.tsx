"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { deleteTodo, updateTodoStatus } from "@/lib/api/todo";
import { cn } from "@/lib/utils";
import type { TodoResponse, TodoStatus } from "@/types/todo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

function formatDueDate(dueDate: string): string {
	// dueDate는 백엔드 LocalDate 직렬화 형식("YYYY-MM-DD")이다 (API_SPEC 4.2).
	return new Date(`${dueDate}T00:00:00`).toLocaleDateString("ko-KR", {
		month: "short",
		day: "numeric",
	});
}

interface TodoItemProps {
	todo: TodoResponse;
}

/** 목록의 카드 한 항목 — 체크박스로 상태 토글, 삭제(확인 후 Soft Delete), 클릭 시 상세/편집 이동 (Task 031). */
export function TodoItem({ todo }: TodoItemProps) {
	const queryClient = useQueryClient();
	const [deleteOpen, setDeleteOpen] = useState(false);
	// 같은 항목을 빠르게 두 번 토글해도 "마지막 클릭의 의도"가 이기도록, 응답이 가장 최근
	// 요청의 것일 때만 캐시를 갱신한다 — 먼저 보낸 요청이 나중에 도착해도 무시한다.
	const latestStatusRequestId = useRef(0);

	const statusMutation = useMutation({
		mutationFn: async (status: TodoStatus) => {
			const requestId = ++latestStatusRequestId.current;
			await updateTodoStatus(todo.id, { status });
			return requestId;
		},
		onSuccess: (requestId) => {
			if (requestId !== latestStatusRequestId.current) return;
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteTodo(todo.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
			setDeleteOpen(false);
		},
	});

	const isDone = statusMutation.isPending ? statusMutation.variables === "DONE" : todo.status === "DONE";

	return (
		<Card className="transition-colors hover:bg-muted/50">
			<CardContent className="flex items-center gap-3">
				<Checkbox
					checked={isDone}
					aria-label={isDone ? "완료 취소" : "완료로 표시"}
					onCheckedChange={(checked) => {
						if (checked === "indeterminate") return;
						statusMutation.mutate(checked ? "DONE" : "TODO");
					}}
				/>

				<Link href={`/todos/${todo.id}`} className="flex min-w-0 flex-1 items-center justify-between gap-4">
					<div className="flex min-w-0 items-center gap-3">
						<Badge variant={isDone ? "secondary" : "default"}>{isDone ? "완료" : "할 일"}</Badge>
						<span className={cn("truncate text-sm", isDone && "text-muted-foreground line-through")}>{todo.title}</span>
					</div>
					{todo.dueDate && (
						<span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
							<CalendarClock className="size-3.5" />
							{formatDueDate(todo.dueDate)}
						</span>
					)}
				</Link>

				<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
					<DialogTrigger asChild>
						<Button type="button" variant="ghost" size="icon-sm" aria-label="삭제">
							<Trash2 />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Todo 삭제</DialogTitle>
							<DialogDescription>&quot;{todo.title}&quot;을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteMutation.isPending}>
								취소
							</Button>
							<Button
								type="button"
								variant="destructive"
								onClick={() => deleteMutation.mutate()}
								disabled={deleteMutation.isPending}
							>
								삭제
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	);
}
