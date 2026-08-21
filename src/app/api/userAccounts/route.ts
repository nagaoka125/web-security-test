import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { requireRole } from "@/app/api/_helper/requireRole";

export const GET = async () => {
  const { user, error } = await requireRole("ADMIN");

  if (error || !user) {
    return NextResponse.json(
      { success: false, message: error ?? "管理者権限が必要です" },
      { status: 403 },
    );
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    success: true,
    payload: users,
    message: "",
  });
};
