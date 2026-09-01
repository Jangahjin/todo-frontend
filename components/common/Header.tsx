"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getMe } from "@/lib/api/auth";
import { clearToken } from "@/lib/auth/token";

import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** (main) 라우트 그룹 공통 헤더 — 로고·내비게이션, 사용자 메뉴(AUTH-04), 로그아웃(AUTH-05), 테마 토글(UI-01). */
export function Header() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const { data: user } = useQuery({
		queryKey: ["auth", "me"],
		queryFn: getMe,
	});

	function handleLogout() {
		// AUTH-05: 대응 API가 없다(API_SPEC 3.6) — 클라이언트에서 토큰 삭제만 수행한다.
		clearToken();
		queryClient.clear();
		router.push("/login");
	}

	const initial = user?.name?.trim()?.[0] ?? user?.email[0];

	return (
		<header className="flex items-center justify-between border-b px-4 py-3">
			<div className="flex items-center gap-4">
				<Link href="/todos" className="text-sm font-semibold">
					Todo List
				</Link>
				<nav className="flex items-center gap-1">
					<Button asChild variant="ghost" size="sm">
						<Link href="/todos">Todo 목록</Link>
					</Button>
					<Button asChild variant="ghost" size="sm">
						<Link href="/todos/new">새 Todo</Link>
					</Button>
				</nav>
			</div>

			<div className="flex items-center gap-2">
				<ThemeToggle />
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button type="button" aria-label="사용자 메뉴">
							<Avatar size="sm">
								<AvatarFallback>{initial ? initial.toUpperCase() : <UserIcon className="size-3.5" />}</AvatarFallback>
							</Avatar>
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
							<span className="text-sm font-medium text-foreground">{user?.name ?? user?.email}</span>
							{user?.name && <span className="text-xs text-muted-foreground">{user.email}</span>}
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem variant="destructive" onSelect={handleLogout}>
							<LogOut />
							로그아웃
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
