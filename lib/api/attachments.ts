import { apiFetch } from "@/lib/api/client";
import { getToken } from "@/lib/auth/token";
import type { AttachmentUrlResponse, CompleteResponse, PresignRequest, PresignResponse, ViewUrlsResponse } from "@/types/attachment";

/** attachment 가이드 §6 — presign/complete/urls/delete는 공용 ApiResponse 계약을 따른다. */
export function presignUpload(request: PresignRequest): Promise<PresignResponse> {
	return apiFetch<PresignResponse>("/api/attachments/presign", {
		method: "POST",
		body: JSON.stringify(request),
	});
}

/**
 * 업로드 PUT은 apiFetch를 거치지 않는다 — apiFetch는 Content-Type: application/json을
 * 강제하고 응답을 항상 JSON으로 파싱해 바이너리 전송에 쓸 수 없다(lib/api/client.ts:43-52).
 * S3 presigned URL에 Authorization 헤더를 붙이면 서명 불일치로 거부되므로, 로컬/S3를
 * 프론트가 직접 판단하지 않고 서버가 presign 응답으로 내려준 requiresAuthHeader만 본다
 * (가이드 §3). 진행률이 필요해 fetch가 아니라 XMLHttpRequest를 쓴다.
 */
export function uploadFile(
	uploadUrl: string,
	file: File,
	requiresAuthHeader: boolean,
	onProgress?: (ratio: number) => void,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("PUT", uploadUrl);
		xhr.setRequestHeader("Content-Type", file.type);
		if (requiresAuthHeader) {
			const token = getToken();
			if (token) {
				xhr.setRequestHeader("Authorization", `Bearer ${token}`);
			}
		}
		xhr.upload.onprogress = (event) => {
			if (onProgress && event.lengthComputable) {
				onProgress(event.loaded / event.total);
			}
		};
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve();
			} else {
				reject(new Error(`업로드에 실패했습니다. (status ${xhr.status})`));
			}
		};
		xhr.onerror = () => reject(new Error("업로드 중 네트워크 오류가 발생했습니다."));
		xhr.send(file);
	});
}

export function completeUpload(attachmentId: number): Promise<CompleteResponse> {
	return apiFetch<CompleteResponse>(`/api/attachments/${attachmentId}/complete`, { method: "POST" });
}

/** 본문 하나에 이미지가 여러 개 있어도 한 번에 조회한다 (가이드 §6 — 단건 API였다면 N번 왕복했을 것). */
export function getViewUrls(ids: number[]): Promise<AttachmentUrlResponse[]> {
	return apiFetch<ViewUrlsResponse>("/api/attachments/urls", {
		method: "POST",
		body: JSON.stringify({ ids }),
	}).then((response) => response.urls);
}

export function deleteAttachment(id: number): Promise<null> {
	return apiFetch<null>(`/api/attachments/${id}`, { method: "DELETE" });
}
