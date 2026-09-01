"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TodoStatus } from "@/types/todo";

interface TodoFilterProps {
	/** null이면 전체 상태. URL 동기화는 호출부 책임이다(components/common/Pagination.tsx와 동일한 원칙). */
	status: TodoStatus | null;
	keyword: string;
	onStatusChange: (status: TodoStatus | null) => void;
	onKeywordChange: (keyword: string) => void;
}

const KEYWORD_DEBOUNCE_MS = 400;
const STATUS_ALL = "ALL";

/** 상태 필터(전체/TODO/DONE) + 제목 검색(디바운스). */
export function TodoFilter({ status, keyword, onStatusChange, onKeywordChange }: TodoFilterProps) {
	const [keywordInput, setKeywordInput] = useState(keyword);

	// 타이핑은 즉시 입력창에 반영하고, onKeywordChange(→URL 갱신)는 디바운스한다.
	// setKeywordInput은 오직 위 onChange 핸들러에서만 호출되고 이 effect는 외부(부모)
	// 콜백만 호출하므로 "effect 안에서 setState" 안티패턴에 해당하지 않는다.
	useEffect(() => {
		const timer = setTimeout(() => {
			if (keywordInput !== keyword) {
				onKeywordChange(keywordInput);
			}
		}, KEYWORD_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [keywordInput, keyword, onKeywordChange]);

	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
			<Select
				value={status ?? STATUS_ALL}
				onValueChange={(value) => onStatusChange(value === STATUS_ALL ? null : (value as TodoStatus))}
			>
				<SelectTrigger className="w-28">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={STATUS_ALL}>전체</SelectItem>
					<SelectItem value="TODO">TODO</SelectItem>
					<SelectItem value="DONE">DONE</SelectItem>
				</SelectContent>
			</Select>

			<div className="relative flex-1">
				<Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={keywordInput}
					onChange={(event) => setKeywordInput(event.target.value)}
					placeholder="제목 검색"
					aria-label="제목 검색"
					className="pl-8"
				/>
			</div>
		</div>
	);
}
