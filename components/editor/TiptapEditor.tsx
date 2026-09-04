"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, ImagePlus, Italic, List, ListOrdered, Quote, Strikethrough } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";

import { completeUpload, presignUpload, uploadFile } from "@/lib/api/attachments";
import { cn } from "@/lib/utils";
import type { TiptapDocument } from "@/types/todo";

import { AttachmentImage } from "@/components/editor/extensions/attachment-image";
import { Button } from "@/components/ui/button";

interface TiptapEditorProps {
	/** Tiptap JSON 문서 객체. 서버는 이를 불투명 데이터로 저장하므로 HTML로 변환하지 않는다 (PRD 8.4 / API_SPEC 4.1). */
	value: TiptapDocument | null;
	onChange: (value: TiptapDocument) => void;
	/** 업로드가 하나라도 진행 중이면 true — TodoForm이 이 동안 저장 버튼을 막아 blob: URL이 저장되는 것을 방지한다. */
	onUploadingChange?: (isUploading: boolean) => void;
	className?: string;
}

const EDITOR_CONTENT_CLASS =
	"min-h-40 rounded-b-lg px-3 py-2 text-sm outline-none " +
	"[&_h2]:text-lg [&_h2]:font-semibold " +
	"[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
	"[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground " +
	"[&_strong]:font-semibold [&_em]:italic [&_s]:line-through " +
	"[&_img]:my-2 [&_img]:max-h-80 [&_img]:rounded-lg";

// 백엔드 app.upload.max-file-size / allowed-content-types 와 값을 맞춘다 — 클라이언트 검증은
// 불필요한 요청을 막을 뿐, 실질적인 강제는 서버(complete 단계)에서 이뤄진다 (가이드 §3·§7).
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

/** 업로드 중인 임시 미리보기 노드를 이후 실제 URL로 교체하거나(성공) 제거하기(실패) 위한 식별자. */
function findImageNodePosByUploadToken(editor: Editor, token: string): { pos: number; size: number } | null {
	let found: { pos: number; size: number } | null = null;
	editor.state.doc.descendants((node, pos) => {
		if (found) return false;
		if (node.type.name === "image" && node.attrs.uploadToken === token) {
			found = { pos, size: node.nodeSize };
			return false;
		}
		return true;
	});
	return found;
}

function replaceUploadPlaceholder(editor: Editor, token: string, attrs: Record<string, unknown>): void {
	const target = findImageNodePosByUploadToken(editor, token);
	if (!target) return;
	const node = editor.state.doc.nodeAt(target.pos);
	if (!node) return;
	editor.view.dispatch(editor.state.tr.setNodeMarkup(target.pos, undefined, { ...node.attrs, ...attrs }));
}

function removeUploadPlaceholder(editor: Editor, token: string): void {
	const target = findImageNodePosByUploadToken(editor, token);
	if (!target) return;
	editor.view.dispatch(editor.state.tr.delete(target.pos, target.pos + target.size));
}

/** Todo 본문 에디터 래퍼 — value/onChange로 RHF와 연결한다. */
export function TiptapEditor({ value, onChange, onUploadingChange, className }: TiptapEditorProps) {
	const [uploadError, setUploadError] = useState<string | null>(null);
	const uploadingCountRef = useRef(0);
	const fileInputRef = useRef<HTMLInputElement>(null);

	function setUploading(delta: number) {
		uploadingCountRef.current += delta;
		onUploadingChange?.(uploadingCountRef.current > 0);
	}

	// 파일 선택(툴바 버튼)·붙여넣기·드래그앤드롭 세 경로가 모두 이 함수로 모인다 (가이드 §7).
	async function handleFileUpload(editor: Editor, file: File) {
		if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
			setUploadError("이미지 파일만 첨부할 수 있습니다 (jpg, png, gif, webp).");
			return;
		}
		if (file.size > MAX_FILE_SIZE) {
			setUploadError("5MB 이하의 이미지만 첨부할 수 있습니다.");
			return;
		}
		setUploadError(null);

		const token = crypto.randomUUID();
		const blobUrl = URL.createObjectURL(file);
		// 1) 업로드 중임을 즉시 보여주는 임시 미리보기 노드를 삽입한다 (가이드 §7)
		editor.chain().focus().setImage({ src: blobUrl, uploadToken: token } as never).run();
		setUploading(1);

		try {
			// 2) presign → PUT → complete 순서로 호출한다. requiresAuthHeader만 보고 uploadFile을
			//    호출할 뿐, 로컬/S3 여부는 이 컴포넌트가 판단하지 않는다 (가이드 §3·§7).
			const presigned = await presignUpload({ filename: file.name, contentType: file.type, fileSize: file.size });
			await uploadFile(presigned.uploadUrl, file, presigned.requiresAuthHeader);
			const completed = await completeUpload(presigned.attachmentId);
			replaceUploadPlaceholder(editor, token, { attachmentId: presigned.attachmentId, src: completed.viewUrl, uploadToken: null });
			onChange(editor.getJSON());
		} catch (error) {
			removeUploadPlaceholder(editor, token);
			onChange(editor.getJSON());
			setUploadError(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
		} finally {
			URL.revokeObjectURL(blobUrl);
			setUploading(-1);
		}
	}

	const editor = useEditor({
		extensions: [StarterKit, AttachmentImage],
		content: value ?? "",
		// 서버에서는 렌더하지 않는다 — 그대로 두면 서버/클라이언트 첫 렌더가 어긋나
		// 하이드레이션 에러가 난다 (Tiptap 공식 Next.js 가이드).
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			onChange(editor.getJSON());
		},
		editorProps: {
			attributes: { class: EDITOR_CONTENT_CLASS },
			handleDrop: (view, event, _slice, moved) => {
				if (moved) return false; // 에디터 내부 노드 이동은 그대로 둔다
				const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
				if (files.length === 0) return false;
				event.preventDefault();
				files.forEach((file) => void handleFileUpload(view.dom.ownerDocument ? editorForCallbacks() : editorForCallbacks(), file));
				return true;
			},
			handlePaste: (_view, event) => {
				const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
				if (files.length === 0) return false;
				event.preventDefault();
				files.forEach((file) => void handleFileUpload(editorForCallbacks(), file));
				return true;
			},
		},
	});

	// handleDrop/handlePaste는 useEditor 최초 마운트 시점의 클로저로 고정되므로, 그 안에서
	// "지금" 시점의 editor 인스턴스를 안전하게 참조하기 위한 간접 참조가 필요하다.
	// ref 대입은 렌더링 중이 아니라 커밋 이후(useEffect)에 해야 한다 — React 19
	// react-hooks/refs 규칙: 렌더 중 ref.current 변경은 금지된다.
	const editorRef = useRef<Editor | null>(null);
	useEffect(() => {
		editorRef.current = editor ?? null;
	}, [editor]);
	function editorForCallbacks(): Editor {
		if (!editorRef.current) throw new Error("에디터가 아직 준비되지 않았습니다.");
		return editorRef.current;
	}

	function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = ""; // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 초기화
		if (file && editor) {
			void handleFileUpload(editor, file);
		}
	}

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
				<ToolbarButton active={false} label="이미지 삽입" onClick={() => fileInputRef.current?.click()}>
					<ImagePlus />
				</ToolbarButton>
				<input
					ref={fileInputRef}
					type="file"
					accept={ALLOWED_CONTENT_TYPES.join(",")}
					className="hidden"
					onChange={handleFileInputChange}
				/>
			</div>
			{uploadError && (
				<p className="border-b border-input bg-destructive/10 px-3 py-1.5 text-xs text-destructive" role="alert">
					{uploadError}
				</p>
			)}
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
