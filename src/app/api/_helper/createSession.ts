import { cookies } from "next/headers";
import { prisma } from "@/libs/prisma";
import { SESSION_TIMEOUT_SECONDS } from "@/config/auth";

/**
 * セッションを新規作成して Cookie に設定する。
 * @param userId - ユーザのID (UUID)
 * @param sessionMaxAgeSeconds - 有効期限（秒単位）
 * @returns - SessionID
 */
export const createSession = async (
  userId: string,
  sessionMaxAgeSeconds: number = SESSION_TIMEOUT_SECONDS,
): Promise<string> => {
  const session = await prisma.session.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      expiresAt: new Date(Date.now() + sessionMaxAgeSeconds * 1000),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("session_id", session.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: sessionMaxAgeSeconds,
    secure: false,
  });

  return session.id;
};
