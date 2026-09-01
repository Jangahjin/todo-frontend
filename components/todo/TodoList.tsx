"use client";

import { ClipboardList } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import type { TodoResponse } from "@/types/todo";

import { TodoItem } from "@/components/todo/TodoItem";

interface TodoListProps {
	todos: TodoResponse[];
}

/** 빈 결과는 `content: []`이지 에러가 아니다(API_SPEC 4.2) — 별도 안내 UI로 구분한다. */
export function TodoList({ todos }: TodoListProps) {
	if (todos.length === 0) {
		return (
			<div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
				<ClipboardList className="size-8" />
				<p className="text-sm">조건에 맞는 Todo가 없습니다.</p>
			</div>
		);
	}

	return (
		<ul className="flex flex-col gap-2">
			<AnimatePresence>
				{todos.map((todo) => (
					<motion.li
						key={todo.id}
						layout
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
					>
						<TodoItem todo={todo} />
					</motion.li>
				))}
			</AnimatePresence>
		</ul>
	);
}
