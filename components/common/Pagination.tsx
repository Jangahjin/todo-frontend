"use client";

import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
	/** 0-base 현재 페이지. PageResponse.page와 그대로 맞물린다 (API_SPEC 1.2). */
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	className?: string;
}

const SIBLING_COUNT = 1;

type PageItem = number | "ellipsis-left" | "ellipsis-right";

/** currentPage(1-base) 주변 SIBLING_COUNT칸 + 처음·끝 페이지만 남기고 나머지는 생략 표시로 접는다. */
function buildPageItems(currentPage: number, totalPages: number): PageItem[] {
	const totalVisible = SIBLING_COUNT * 2 + 5; // 처음·끝·현재·좌우 형제 + 생략 2칸분 여유

	if (totalPages <= totalVisible) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	const leftSibling = Math.max(currentPage - SIBLING_COUNT, 1);
	const rightSibling = Math.min(currentPage + SIBLING_COUNT, totalPages);
	const showLeftEllipsis = leftSibling > 2;
	const showRightEllipsis = rightSibling < totalPages - 1;

	const items: PageItem[] = [1];

	if (showLeftEllipsis) {
		items.push("ellipsis-left");
	} else {
		for (let i = 2; i < leftSibling; i++) items.push(i);
	}

	for (let i = leftSibling; i <= rightSibling; i++) {
		if (i !== 1 && i !== totalPages) items.push(i);
	}

	if (showRightEllipsis) {
		items.push("ellipsis-right");
	} else {
		for (let i = rightSibling + 1; i < totalPages; i++) items.push(i);
	}

	items.push(totalPages);
	return items;
}

/** 목록 페이지네이션 재사용 컴포넌트 (불변 규칙 7 / UI-02). URL 동기화는 호출부(onPageChange)의 책임이다. */
export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	const currentPage = page + 1;
	const isFirstPage = page <= 0;
	const isLastPage = page >= totalPages - 1;
	const pageItems = buildPageItems(currentPage, totalPages);

	return (
		<nav aria-label="페이지네이션" className={cn("flex items-center justify-center gap-1", className)}>
			<Button
				variant="outline"
				size="icon-sm"
				aria-label="이전 페이지"
				disabled={isFirstPage}
				onClick={() => onPageChange(page - 1)}
			>
				<ChevronLeft />
			</Button>

			{pageItems.map((item) =>
				typeof item === "number" ? (
					<Button
						key={item}
						variant={item === currentPage ? "default" : "outline"}
						size="icon-sm"
						aria-label={`${item}페이지로 이동`}
						aria-current={item === currentPage ? "page" : undefined}
						onClick={() => onPageChange(item - 1)}
					>
						{item}
					</Button>
				) : (
					<span
						key={item}
						aria-hidden="true"
						className="flex size-7 items-center justify-center text-muted-foreground"
					>
						<Ellipsis className="size-3.5" />
					</span>
				),
			)}

			<Button
				variant="outline"
				size="icon-sm"
				aria-label="다음 페이지"
				disabled={isLastPage}
				onClick={() => onPageChange(page + 1)}
			>
				<ChevronRight />
			</Button>
		</nav>
	);
}
