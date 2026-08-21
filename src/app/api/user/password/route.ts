import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/libs/prisma";
import { verifySession } from "@/app/api/_helper/verifySession";
import { passwordChangeRequestSchema } from "@/app/_types/PasswordChangeRequest";
import type { ApiResponse } from "@/app/_types/ApiResponse";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const updatePassword = async (req: NextRequest) => {
  const userId = await verifySession();
  if (!userId) {
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "認証が必要です。",
    };
    return NextResponse.json(res, { status: 401 });
  }

  const parseResult = passwordChangeRequestSchema.safeParse(await req.json());
  if (!parseResult.success) {
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message:
        parseResult.error.issues[0]?.message ?? "入力内容に不備があります。",
    };
    return NextResponse.json(res, { status: 400 });
  }

  const { currentPassword, newPassword } = parseResult.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) {
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ユーザー情報が見つかりません。",
    };
    return NextResponse.json(res, { status: 404 });
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password,
  );
  if (!isCurrentPasswordValid) {
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "現在のパスワードが正しくありません。",
    };
    return NextResponse.json(res, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  const res: ApiResponse<null> = {
    success: true,
    payload: null,
    message: "パスワードを変更しました。",
  };
  return NextResponse.json(res);
};

export const PUT = updatePassword;
export const POST = updatePassword;
