"use client";

import React, { useEffect } from "react";
import useSWR from "swr";
import { useAuth } from "@/app/_hooks/useAuth";
import { useRouter } from "next/navigation";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "same-origin" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message ?? "失敗");
  return data.payload;
};

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
};

const Page = () => {
  const { userProfile } = useAuth();
  const router = useRouter();
  const { data: users, error } = useSWR(
    userProfile?.role === "ADMIN" ? "/api/userAccounts" : null,
    fetcher,
  );

  useEffect(() => {
    if (!userProfile) {
      router.replace("/login");
    }
  }, [router, userProfile]);

  if (!userProfile) {
    return null;
  }

  if (userProfile.role !== "ADMIN") {
    return (
      <main>
        <div className="text-xl font-bold text-red-600">
          管理者権限が必要です
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div className="text-xl font-bold text-red-600">
          ユーザー情報の取得に失敗しました
        </div>
      </main>
    );
  }

  if (!users) {
    return (
      <main>
        <div className="text-xl font-bold">ユーザー情報を取得中...</div>
      </main>
    );
  }

  return (
    <main>
      <div className="text-2xl font-bold">ユーザーアカウント一覧</div>
      <div className="mt-4　space-y-2">
        {users.map((user: User) => (
          <div key={user.id} className="rounded border p-3">
            <div className="font-bold">{user.name}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
            <div className="text-sm text-gray-600">Role: {user.role}</div>
            <div className="text-sm text-gray-600">
              Created At: {new Date(user.createdAt).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Last Login At:{" "}
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString()
                : "未ログイン"}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Page;
