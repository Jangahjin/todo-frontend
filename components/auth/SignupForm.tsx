"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { signup } from "@/lib/api/auth";
import { applyServerError } from "@/lib/forms/applyServerError";
import { signupSchema, type SignupFormValues } from "@/lib/schemas/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
	const router = useRouter();
	const form = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: { email: "", password: "", confirmPassword: "" },
	});

	const mutation = useMutation({
		mutationFn: (values: SignupFormValues) => signup({ email: values.email, password: values.password }),
		onSuccess: () => {
			router.push("/login");
		},
		onError: (error) => applyServerError(error, form.setError),
	});

	function onSubmit(values: SignupFormValues) {
		form.clearErrors("root");
		mutation.mutate(values);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>회원가입</CardTitle>
				<CardDescription>이메일로 가입하고 할 일을 관리해보세요.</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
					<div className="space-y-1.5">
						<Label htmlFor="signup-email">이메일</Label>
						<Input
							id="signup-email"
							type="email"
							autoComplete="email"
							aria-invalid={!!form.formState.errors.email}
							{...form.register("email")}
						/>
						{form.formState.errors.email && (
							<p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="signup-password">비밀번호</Label>
						<Input
							id="signup-password"
							type="password"
							autoComplete="new-password"
							aria-invalid={!!form.formState.errors.password}
							{...form.register("password")}
						/>
						{form.formState.errors.password && (
							<p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="signup-confirm-password">비밀번호 확인</Label>
						<Input
							id="signup-confirm-password"
							type="password"
							autoComplete="new-password"
							aria-invalid={!!form.formState.errors.confirmPassword}
							{...form.register("confirmPassword")}
						/>
						{form.formState.errors.confirmPassword && (
							<p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
						)}
					</div>

					{form.formState.errors.root && (
						<p className="text-sm text-destructive" role="alert">
							{form.formState.errors.root.message}
						</p>
					)}

					<Button type="submit" className="w-full" disabled={mutation.isPending}>
						{mutation.isPending ? <Loader2 className="animate-spin" /> : "회원가입"}
					</Button>
				</form>

				<p className="mt-4 text-center text-sm text-muted-foreground">
					이미 계정이 있으신가요?{" "}
					<Link href="/login" className="font-medium text-primary hover:underline">
						로그인
					</Link>
				</p>
			</CardContent>
		</Card>
	);
}
