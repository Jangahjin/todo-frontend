import { z } from "zod";

/** PRD 6.5 — 제목은 필수, 255자 이내. 본문(Tiptap)·마감일은 선택이라 별도 검증하지 않는다. */
export const todoFormSchema = z.object({
	title: z.string().trim().min(1, "제목을 입력해주세요.").max(255, "제목은 255자 이내로 입력해주세요."),
	dueDate: z.string(),
});

export type TodoFormValues = z.infer<typeof todoFormSchema>;
