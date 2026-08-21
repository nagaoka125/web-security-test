import { prisma } from "@/libs/prisma";
import { loginRequestSchema } from "@/app/_types/LoginRequest";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import { createSession } from "@/app/api/_helper/createSession";
import bcrypt from "bcryptjs";
import {
  LOGIN_LOCKOUT_DURATION_SECONDS,
  LOGIN_LOCKOUT_MAX_ATTEMPTS,
  SESSION_TIMEOUT_SECONDS,
} from "@/config/auth";

// キャッシュを無効化して毎回最新情報を取得
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const formatLockoutRemaining = (lockedUntil: Date) => {
  const diffSeconds = Math.max(
    0,
    Math.ceil((lockedUntil.getTime() - Date.now()) / 1000),
  );

  if (diffSeconds <= 0) return "ロック解除の時間です";
  if (diffSeconds < 60) return `${diffSeconds}秒`;
  if (diffSeconds < 3600) return `${Math.ceil(diffSeconds / 60)}分`;
  return `${Math.ceil(diffSeconds / 3600)}時間`;
};

export const POST = async (req: NextRequest) => {
  try {
    const result = loginRequestSchema.safeParse(await req.json());
    if (!result.success) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "リクエストボディの形式が不正です。",
      };
      return NextResponse.json(res);
    }
    const loginRequest = result.data;

    const user = await prisma.user.findUnique({
      where: { email: loginRequest.email },
    });

    if (!user) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message:
          "メールアドレスまたはパスワードの組み合わせが正しくありません。",
      };
      return NextResponse.json(res);
    }

    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: `このアカウントは ${formatLockoutRemaining(user.lockedUntil)} の間ロックされています。`,
      };
      return NextResponse.json(res, { status: 423 });
    }

    if (user.lockedUntil && user.lockedUntil <= now) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lockedUntil: null,
          failedLoginAttempts: 0,
        },
      });
    }

    const isValidPassword = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!isValidPassword) {
      const nextFailedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = nextFailedAttempts >= LOGIN_LOCKOUT_MAX_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: shouldLock
            ? LOGIN_LOCKOUT_MAX_ATTEMPTS
            : nextFailedAttempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOGIN_LOCKOUT_DURATION_SECONDS * 1000)
            : null,
        },
      });

      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: shouldLock
          ? `パスワードを ${LOGIN_LOCKOUT_MAX_ATTEMPTS} 回連続で間違えたため、3時間ログインできません。`
          : `メールアドレスまたはパスワードの組み合わせが正しくありません。残り ${LOGIN_LOCKOUT_MAX_ATTEMPTS - nextFailedAttempts} 回でロックされます。`,
      };
      return NextResponse.json(res, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    await createSession(user.id, SESSION_TIMEOUT_SECONDS);
    const res: ApiResponse<UserProfile> = {
      success: true,
      payload: userProfileSchema.parse({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
      message: "",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ログインのサーバサイドの処理に失敗しました。",
    };
    return NextResponse.json(res);
  }
};
