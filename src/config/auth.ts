// 認証モード: セッションベースに固定
export const AUTH = {
  mode: "session",
  isSession: true,
} as const;

export const SESSION_TIMEOUT_SECONDS = 60 * 60 * 3;
export const LOGIN_LOCKOUT_MAX_ATTEMPTS = 3;
export const LOGIN_LOCKOUT_DURATION_SECONDS = 60 * 60 * 3;
