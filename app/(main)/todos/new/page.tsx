"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api/client";
import { createTodo } from "@/lib/api/todo";

import { TodoForm, type TodoFormSubmitValues } from "@/components/todo/TodoForm";

/** Todo 작성 화면 (PRD 6.5, Task 030). */
export default function NewTodoPage() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (values: TodoFormSubmitValues) =>
			createTodo({
				title: values.title,
				content: values.content ?? undefined,
				dueDate: values.dueDate ?? undefined,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
			router.push("/todos");
		},
	});

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:p-8">
			<h1 className="text-lg font-semibold">새 Todo</h1>

			{mutation.isError && (
				<p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
					{mutation.error instanceof ApiError && mutation.error.message ? mutation.error.message : "저장하지 못했습니다."}
				</p>
			)}

			<TodoForm
				submitLabel="저장"
				isSubmitting={mutation.isPending}
				onSubmit={(values) => mutation.mutate(values)}
				onCancel={() => router.push("/todos")}
			/>
		</div>
	);
}
