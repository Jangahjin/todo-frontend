"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";

/** UI-01 — 로그인/회원가입 등 비인증 페이지에도 노출된다 (PRD 6.7). 선택값은 ThemeProvider가 localStorage에 저장한다. */
export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-sm"
			aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
			onClick={() => setTheme(isDark ? "light" : "dark")}
		>
			{isDark ? <Sun /> : <Moon />}
		</Button>
	);
}
