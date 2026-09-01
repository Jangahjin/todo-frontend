import { Button } from "@/components/ui/button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Google/Kakao 인가 시작점으로 전체 페이지 이동한다(fetch 아님) — 백엔드가 302로
 * 실제 제공자 로그인 화면까지 리다이렉트해야 하므로 SPA 라우팅으로 가로챌 수 없다.
 */
export function SocialLoginButtons() {
	return (
		<div className="space-y-2">
			<Button asChild variant="outline" className="w-full">
				<a href={`${API_BASE_URL}/oauth2/authorization/google`}>Google로 계속하기</a>
			</Button>
			<Button asChild variant="outline" className="w-full border-none bg-[#FEE500] text-black hover:bg-[#FEE500]/90">
				<a href={`${API_BASE_URL}/oauth2/authorization/kakao`}>카카오로 계속하기</a>
			</Button>
		</div>
	);
}
