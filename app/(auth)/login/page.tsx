import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
	title: "로그인 | Todo List",
};

// LoginForm이 useSearchParams()(authError)를 쓰므로 Suspense 경계가 필수다 (Next.js 16).
export default function LoginPage() {
	return (
		<Suspense>
			<LoginForm />
		</Suspense>
	);
}
