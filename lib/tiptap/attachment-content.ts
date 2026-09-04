import type { TiptapDocument } from "@/types/todo";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

/**
 * content(Tiptap JSON)의 image 노드에서 attachmentId를 전부 모은다 — 서버 TodoService의
 * JSON 노드 트리 순회와 동일한 규칙이다(HTML data-attachment-id 파싱이 아니다, attachment 가이드 §6).
 */
export function collectAttachmentIds(content: TiptapDocument | null): number[] {
	const ids = new Set<number>();

	function walk(node: unknown): void {
		if (!isRecord(node)) return;
		if (node.type === "image" && isRecord(node.attrs) && typeof node.attrs.attachmentId === "number") {
			ids.add(node.attrs.attachmentId);
		}
		if (Array.isArray(node.content)) {
			node.content.forEach(walk);
		}
	}

	walk(content);
	return [...ids];
}

/**
 * 조회 URL은 만료되므로 content에 영구히 박아두지 않는다(가이드 §7) — 저장된 src는 재로드
 * 시 무시하고, 새로 발급받은 URL로 image 노드의 src를 덮어써 에디터에 주입하기 전에 채운다.
 */
export function injectViewUrls(content: TiptapDocument, urlsByAttachmentId: Map<number, string>): TiptapDocument {
	function walk(node: unknown): unknown {
		if (!isRecord(node)) return node;

		const next: Record<string, unknown> = { ...node };
		if (next.type === "image" && isRecord(next.attrs) && typeof next.attrs.attachmentId === "number") {
			const viewUrl = urlsByAttachmentId.get(next.attrs.attachmentId);
			if (viewUrl) {
				next.attrs = { ...next.attrs, src: viewUrl };
			}
		}
		if (Array.isArray(next.content)) {
			next.content = next.content.map(walk);
		}
		return next;
	}

	return walk(content) as TiptapDocument;
}
