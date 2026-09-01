"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { login } from "@/lib/api/auth";
import { setToken } from "@/lib/auth/token";
import { applyServerError } from "@/lib/forms/applyServerError";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth";

import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

/** OAuth2 콜백(app/oauth2/callback)이 실패 시 ?authError=<code>로 넘겨주는 안내 메시지 (API_SPEC 3.5). */
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
	AUTH_007: "소셜 계정에서 이메일 정보를 가져오지 못했어요. 이메일 제공에 동의했는지 확인해주세요.",
};

function resolveOAuthErrorMessage(code: string | null): string | null {
	if (!code) return null;
	return OAUTH_ERROR_MESSAGES[code] ?? "소셜 로그인에 실패했습니다. 다시 시도해주세요.";
}

export function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const oauthErrorMessage = resolveOAuthErrorMessage(searchParams.get("authError"));
	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const mutation = useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			setToken(data.accessToken);
			router.push("/todos");
		},
		onError: (error) => applyServerError(error, form.setError),
	});

	function onSubmit(values: LoginFormValues) {
		form.clearErrors("root");
		mutation.mutate(values);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>로그인</CardTitle>
				<CardDescription>이메일과 비밀번호로 로그인하세요.</CardDescription>
			</CardHeader>
			<CardContent>
				{oauthErrorMessage && (
					<p className="mb-4 rounded-md bg-destructive/10 p-2 text-sm text-destructive" role="alert">
						{oauthErrorMessage}
					</p>
				)}

				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
					<div className="space-y-1.5">
						<Label htmlFor="login-email">이메일</Label>
						<Input
							id="login-email"
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
						<Label htmlFor="login-password">비밀번호</Label>
						<Input
							id="login-password"
							type="password"
							autoComplete="current-password"
							aria-invalid={!!form.formState.errors.password}
							{...form.register("password")}
						/>
						{form.formState.errors.password && (
							<p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
						)}
					</div>

					{form.formState.errors.root && (
						<p className="text-sm text-destructive" role="alert">
							{form.formState.errors.root.message}
						</p>
					)}

					<Button type="submit" className="w-full" disabled={mutation.isPending}>
						{mutation.isPending ? <Loader2 className="animate-spin" /> : "로그인"}
					</Button>
				</form>

				<div className="my-4 flex items-center gap-3">
					<Separator className="flex-1" />
					<span className="text-xs text-muted-foreground">또는</span>
					<Separator className="flex-1" />
				</div>

				<SocialLoginButtons />

				<p className="mt-4 text-center text-sm text-muted-foreground">
					계정이 없으신가요?{" "}
					<Link href="/signup" className="font-medium text-primary hover:underline">
						회원가입
					</Link>
				</p>
			</CardContent>
		</Card>
	);
}
