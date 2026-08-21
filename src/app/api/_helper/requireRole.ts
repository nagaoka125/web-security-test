import { prisma } from "@/libs/prisma";
import { verifySession } from "./verifySession";

export type UserRole = "ADMIN" | "USER";

export const requireRole = async (allowedRoles: UserRole | UserRole[]) => {
  const userId = await verifySession();
  if (!userId) {
    return { user: null, error: "認証されていません" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  if (!user) return { user: null, error: "ユーザーが見つかりません" };

  const normalizedRoles = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];

  if (!normalizedRoles.includes(user.role)) {
    return {
      user: null,
      error:
        normalizedRoles.includes("ADMIN") && !normalizedRoles.includes("USER")
          ? "管理者権限が必要です"
          : "この操作を行う権限がありません",
    };
  }

  return { user, error: null };
};
