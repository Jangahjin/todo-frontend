"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { THEME_STORAGE_KEY } from "./theme-constants";

export type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

function applyThemeClass(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

// setTheme()이 같은 탭에서 localStorage를 바꿔도 네이티브 storage 이벤트는 다른 탭에서만
// 발생한다. 같은 탭 구독자에게도 알리기 위한 최소 pub/sub.
const themeChangeListeners = new Set<() => void>();

function notifyThemeChange() {
  themeChangeListeners.forEach((listener) => listener());
}

function subscribeToThemeChanges(callback: () => void) {
  themeChangeListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    themeChangeListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

/** 서버는 localStorage를 볼 수 없으므로 항상 "system"으로 취급한다. */
function getServerThemeSnapshot(): Theme {
  return "system";
}

/**
 * UI-01: 다크모드(시스템 설정 연동 + 수동 토글, 선택값 로컬 저장).
 * app/layout.tsx의 인라인 스크립트가 첫 페인트 전에 이미 .dark 클래스를 정해둔다(FOUC 방지,
 * Next.js 16 공식 가이드 preventing-flash-before-hydration).
 * 여기서는 그 값을 그대로 이어받고, 개발 모드 Strict Mode 이중 렌더가 인라인 스크립트가 붙인
 * 클래스를 지우는 문제를 useLayoutEffect로 재적용해 막는다(같은 공식 가이드의 권고).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // readStoredTheme()를 useState 초기값으로 바로 쓰면 클라이언트 첫 렌더에서 실제
  // 저장값을 즉시 반환해 서버 렌더("system")와 어긋난다 — 실측(2026-09-01)
  // ThemeToggle 도입 시 실제 하이드레이션 에러로 발견됐다. useSyncExternalStore는
  // 하이드레이션 시 서버 스냅샷을 먼저 맞춘 뒤, 페인트 전에 동기적으로 실제 저장값으로
  // 교정하므로 하이드레이션 불일치도 깜빡임도 없다.
  const theme = useSyncExternalStore(subscribeToThemeChanges, readStoredTheme, getServerThemeSnapshot);
  const resolvedTheme = resolveTheme(theme);

  useLayoutEffect(() => {
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  // theme === "system"일 때는 OS 설정이 바뀌면 즉시 반영한다
  useEffect(() => {
    if (theme !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyThemeClass(resolveTheme("system"));
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    if (next === "system") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    }
    // 같은 탭 구독자(useSyncExternalStore)에게 즉시 알려 리렌더를 트리거한다.
    notifyThemeChange();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme은 ThemeProvider 내부에서만 사용할 수 있다");
  }
  return context;
}
