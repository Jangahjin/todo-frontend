import { z } from "zod";

export const emailSchema = z.string().min(1, "이메일을 입력해주세요.").email("올바른 이메일 형식이 아닙니다.");

/** 불변 규칙 2: 6자 이상이면 통과. 대문자·특수문자 등 복잡도 규칙을 추가하지 않는다. */
export const passwordSchema = z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다.");

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "비밀번호를 입력해주세요."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
	.object({
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "비밀번호가 일치하지 않습니다.",
		path: ["confirmPassword"],
	});

export type SignupFormValues = z.infer<typeof signupSchema>;
