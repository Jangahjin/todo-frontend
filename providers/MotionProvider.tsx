"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * reducedMotion="user"로 OS의 "동작 줄이기" 설정을 전역에서 자동 존중한다(PRD 9.1) —
 * 컴포넌트마다 useReducedMotion을 직접 분기하지 않아도 transform·layout 애니메이션이
 * 꺼지고 opacity 등 비-transform 애니메이션만 남는다(Motion 공식 문서).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
	return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
