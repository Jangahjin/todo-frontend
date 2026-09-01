"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Italic, List, ListOrdered, Quote, Strikethrough } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { TiptapDocument } from "@/types/todo";

import { Button } from "@/components/ui/button";

interface TiptapEditorProps {
	/** Tiptap JSON 문서 객체. 서버는 이를 불투명 데이터로 저장하므로 HTML로 변환하지 않는다 (PRD 8.4 / API_SPEC 4.1). */
	value: TiptapDocument | null;
	onChange: (value: TiptapDocument) => void;
	className?: string;
}

const EDITOR_CONTENT_CLASS =
	"min-h-40 rounded-b-lg px-3 py-2 text-sm outline-none " +
	"[&_h2]:text-lg [&_h2]:font-semibold " +
	"[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
	"[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground " +
	"[&_strong]:font-semibold [&_em]:italic [&_s]:line-through";

/** Todo 본문 에디터 래퍼 — value/onChange로 RHF와 연결한다. */
export function TiptapEditor({ value, onChange, className }: TiptapEditorProps) {
	const editor = useEditor({
		extensions: [StarterKit],
		content: value ?? "",
		// 서버에서는 렌더하지 않는다 — 그대로 두면 서버/클라이언트 첫 렌더가 어긋나
		// 하이드레이션 에러가 난다 (Tiptap 공식 Next.js 가이드).
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			onChange(editor.getJSON());
		},
		editorProps: {
			attributes: { class: EDITOR_CONTENT_CLASS },
		},
	});

	// 외부에서 value가 바뀌면(예: 수정 화면에서 기존 Todo를 비동기로 불러온 경우) 에디터에
	// 반영한다. onUpdate가 올려보낸 값이 그대로 다시 내려오는 흔한 왕복은 JSON 비교로
	// 건너뛰어 커서 위치가 리셋되지 않게 한다.
	useEffect(() => {
		if (!editor) return;
		const current = JSON.stringify(editor.getJSON());
		const next = JSON.stringify(value ?? "");
		if (current !== next) {
			editor.commands.setContent(value ?? "", { emitUpdate: false });
		}
	}, [editor, value]);

	if (!editor) {
		return <div className={cn("h-48 animate-pulse rounded-lg bg-muted", className)} />;
	}

	return (
		<div className={cn("rounded-lg border border-input", className)}>
			<div className="flex flex-wrap items-center gap-0.5 border-b border-input p-1">
				<ToolbarButton
					active={editor.isActive("heading", { level: 2 })}
					label="제목"
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				>
					<Heading2 />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive("bold")}
					label="굵게"
					onClick={() => editor.chain().focus().toggleBold().run()}
				>
					<Bold />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive("italic")}
					label="기울임"
					onClick={() => editor.chain().focus().toggleItalic().run()}
				>
					<Italic />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive("strike")}
					label="취소선"
					onClick={() => editor.chain().focus().toggleStrike().run()}
				>
					<Strikethrough />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive("bulletList")}
					label="글머리 기호 목록"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
				>
					<List />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive("orderedList")}
					label="번호 매기기 목록"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
				>
					<ListOrdered />
				</ToolbarButton>
				<ToolbarButton
					active={editor.isActive("blockquote")}
					label="인용구"
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
				>
					<Quote />
				</ToolbarButton>
			</div>
			<EditorContent editor={editor} />
		</div>
	);
}

function ToolbarButton({
	active,
	label,
	onClick,
	children,
}: {
	active: boolean;
	label: string;
	onClick: () => void;
	children: ReactNode;
}) {
	return (
		<Button
			type="button"
			variant={active ? "secondary" : "ghost"}
			size="icon-sm"
			aria-label={label}
			aria-pressed={active}
			onClick={onClick}
		>
			{children}
		</Button>
	);
}
