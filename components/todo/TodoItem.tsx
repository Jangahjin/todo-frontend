import { CalendarClock } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { TodoResponse } from "@/types/todo";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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

/** 목록의 카드 한 항목 — 클릭 시 상세/편집 화면으로 이동한다(상태 토글·삭제는 Task 031). */
export function TodoItem({ todo }: TodoItemProps) {
	const isDone = todo.status === "DONE";

	return (
		<Link href={`/todos/${todo.id}`}>
			<Card className="transition-colors hover:bg-muted/50">
				<CardContent className="flex items-center justify-between gap-4">
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
				</CardContent>
			</Card>
		</Link>
	);
}
