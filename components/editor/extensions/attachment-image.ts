import Image from "@tiptap/extension-image";

/**
 * 기본 Image 확장에 attachmentId 속성을 추가한다. 값은 Tiptap JSON의 attrs.attachmentId로
 * 저장된다 — 이 프로젝트는 getHTML()을 쓰지 않으므로 HTML data-attachment-id 직렬화가
 * 아니다(attachment 가이드 §7). 조회 URL은 만료되므로 attachmentId만 실질적으로
 * 영속하는 식별자이고, src는 재조회할 때마다 새로 채워 넣는다.
 */
export const AttachmentImage = Image.extend({
	name: "image",

	addAttributes() {
		return {
			...this.parent?.(),
			attachmentId: {
				default: null,
			},
			// 업로드 중인 임시 placeholder 노드를 완료/실패 후 찾아 교체하기 위한 식별자.
			// 스키마에 등록하지 않으면 Tiptap이 이 값을 노드에 저장하지 않아, setImage로
			// 넘겨도 즉시 유실되고 findImageNodePosByUploadToken이 영영 매칭하지 못한다.
			uploadToken: {
				default: null,
			},
		};
	},
});
