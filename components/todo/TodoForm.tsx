"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { todoFormSchema, type TodoFormValues } from "@/lib/schemas/todo";
import type { TiptapDocument } from "@/types/todo";

import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface TodoFormSubmitValues {
	title: string;
	content: TiptapDocument | null;
	dueDate: string | null;
}

interface TodoFormProps {
	defaultValues?: { title: string; content: TiptapDocument | null; dueDate: string | null };
	submitLabel: string;
	isSubmitting: boolean;
	onSubmit: (values: TodoFormSubmitValues) => void;
	onCancel: () => void;
}

/**
 * 작성/편집 화면 공용 폼 (Task 030). Tiptap 본문은 네이티브 입력이 아니라 RHF·Zod가
 * 검증할 수 없는 JSON 객체라 별도 state로 관리하고, 제출 시 폼 값과 합쳐 올려보낸다.
 */
export function TodoForm({ defaultValues, submitLabel, isSubmitting, onSubmit, onCancel }: TodoFormProps) {
	const [content, setContent] = useState<TiptapDocument | null>(defaultValues?.content ?? null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<TodoFormValues>({
		resolver: zodResolver(todoFormSchema),
		defaultValues: {
			title: defaultValues?.title ?? "",
			dueDate: defaultValues?.dueDate ?? "",
		},
	});

	function submit(values: TodoFormValues) {
		onSubmit({
			title: values.title,
			content,
			dueDate: values.dueDate ? values.dueDate : null,
		});
	}

	return (
		<form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="todo-title">제목</Label>
				<Input
					id="todo-title"
					maxLength={255}
					placeholder="할 일 제목"
					aria-invalid={!!errors.title}
					{...register("title")}
				/>
				{errors.title && (
					<p className="text-xs text-destructive" role="alert">
						{errors.title.message}
					</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="todo-due-date">마감일</Label>
				<Input id="todo-due-date" type="date" className="w-fit" {...register("dueDate")} />
			</div>

			<div className="flex flex-col gap-1.5">
				<Label>본문</Label>
				<TiptapEditor value={content} onChange={setContent} />
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					취소
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
