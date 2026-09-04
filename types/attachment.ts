/** attachment 가이드 §6 — 첨부파일 API 계약. */
export type PresignRequest = {
	filename: string;
	contentType: string;
	fileSize: number;
};

/**
 * requiresAuthHeader — 프론트는 스토리지 종류(로컬/S3)를 직접 판단하지 않고 이 플래그만 본다.
 * 로컬은 true(우리 서버의 인증 엔드포인트), S3는 false(Authorization 헤더를 붙이면 서명 충돌).
 */
export type PresignResponse = {
	attachmentId: number;
	uploadUrl: string;
	requiresAuthHeader: boolean;
};

export type CompleteResponse = {
	attachmentId: number;
	viewUrl: string;
};

export type AttachmentUrlResponse = {
	attachmentId: number;
	viewUrl: string;
};

export type ViewUrlsResponse = {
	urls: AttachmentUrlResponse[];
};
