import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
	title: "회원가입 | Todo List",
};

export default function SignupPage() {
	return <SignupForm />;
}
