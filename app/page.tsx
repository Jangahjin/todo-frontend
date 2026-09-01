"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthToken } from "@/hooks/useAuth";

/** 진입점 — 토큰 유무로 Todo 목록/로그인 페이지로 분기한다 (PRD 3장). */
export default function RootPage() {
	const router = useRouter();
	const token = useAuthToken();

	useEffect(() => {
		router.replace(token ? "/todos" : "/login");
	}, [token, router]);

	return null;
}
