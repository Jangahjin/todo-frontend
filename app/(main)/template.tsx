"use client";

import { motion } from "motion/react";

/**
 * layout과 달리 template은 세그먼트가 바뀔 때마다 새로 마운트된다(Next.js 공식 문서) —
 * /todos ↔ /todos/new ↔ /todos/[id] 사이 이동마다 옅은 페이드+슬라이드 전환을 준다.
 * 같은 세그먼트 안에서 쿼리스트링만 바뀌는 목록 페이지네이션·필터는 리마운트되지 않는다.
 */
export default function MainTemplate({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.15, ease: "easeOut" }}
			className="flex flex-1 flex-col"
		>
			{children}
		</motion.div>
	);
}
