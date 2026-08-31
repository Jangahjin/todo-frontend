// "use client" 파일(ThemeProvider.tsx)의 export는 Next.js가 전부 client reference로 취급해
// 서버 컴포넌트(app/layout.tsx)에서 값으로 직접 쓸 수 없다. 순수 상수만 담은 서버/클라이언트
// 공용 모듈로 분리해 이 문제를 피한다.
export const THEME_STORAGE_KEY = "theme";
