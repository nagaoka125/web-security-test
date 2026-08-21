"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import { useAuth } from "@/app/_hooks/useAuth";
import {
  passwordChangeRequestSchema,
  type PasswordChangeRequest,
} from "@/app/_types/PasswordChangeRequest";
import { twMerge } from "tailwind-merge";

const Page: React.FC = () => {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const formMethods = useForm<PasswordChangeRequest>({
    mode: "onChange",
    resolver: zodResolver(passwordChangeRequestSchema),
  });

  const fieldErrors = formMethods.formState.errors;

  useEffect(() => {
    if (!userProfile) {
      router.replace("/login");
    }
  }, [router, userProfile]);

  if (!userProfile) {
    return null;
  }

  const setRootError = (message: string) => {
    formMethods.setError("root", {
      type: "manual",
      message,
    });
  };

  const clearRootOnChange =
    (originalOnChange: React.ChangeEventHandler<HTMLInputElement>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      originalOnChange(e);
      formMethods.clearErrors("root");
    };

  const onSubmit = async (formValues: PasswordChangeRequest) => {
    try {
      setIsPending(true);
      setRootError("");

      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
        credentials: "same-origin",
        cache: "no-store",
      });

      const body = await res.json();
      if (!res.ok || !body.success) {
        setRootError(body.message ?? "パスワード変更に失敗しました。");
        return;
      }

      formMethods.reset();
      setRootError("パスワードを変更しました。");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "予期せぬエラーが発生しました。";
      setRootError(message);
    } finally {
      setIsPending(false);
    }
  };

  const c_CurrentPassword = "currentPassword";
  const c_NewPassword = "newPassword";
  const c_ConfirmPassword = "confirmPassword";

  const { onChange: onCurrentPasswordChange, ...currentPasswordRegister } =
    formMethods.register(c_CurrentPassword);
  const { onChange: onNewPasswordChange, ...newPasswordRegister } =
    formMethods.register(c_NewPassword);
  const { onChange: onConfirmPasswordChange, ...confirmPasswordRegister } =
    formMethods.register(c_ConfirmPassword);

  return (
    <main>
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faKey} className="mr-1.5" />
        パスワード変更
      </div>

      <div className="mt-4 text-sm text-slate-600">
        {userProfile.name} さんのアカウントのパスワードを変更します。
      </div>

      <form
        noValidate
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className={twMerge("mt-6 flex flex-col gap-y-4")}
      >
        <div>
          <label htmlFor={c_CurrentPassword} className="mb-2 block font-bold">
            現在のパスワード
          </label>
          <TextInputField
            {...currentPasswordRegister}
            onChange={clearRootOnChange(onCurrentPasswordChange)}
            id={c_CurrentPassword}
            type="password"
            showPasswordToggle
            placeholder="現在のパスワード"
            disabled={isPending}
            error={!!fieldErrors.currentPassword}
            autoComplete="current-password"
          />
          <ErrorMsgField msg={fieldErrors.currentPassword?.message} />
        </div>

        <div>
          <label htmlFor={c_NewPassword} className="mb-2 block font-bold">
            新しいパスワード
          </label>
          <TextInputField
            {...newPasswordRegister}
            onChange={clearRootOnChange(onNewPasswordChange)}
            id={c_NewPassword}
            type="password"
            showPasswordToggle
            placeholder="8文字以上"
            disabled={isPending}
            error={!!fieldErrors.newPassword}
            autoComplete="new-password"
          />
          <ErrorMsgField msg={fieldErrors.newPassword?.message} />
        </div>

        <div>
          <label htmlFor={c_ConfirmPassword} className="mb-2 block font-bold">
            新しいパスワード（確認）
          </label>
          <TextInputField
            {...confirmPasswordRegister}
            onChange={clearRootOnChange(onConfirmPasswordChange)}
            id={c_ConfirmPassword}
            type="password"
            showPasswordToggle
            placeholder="新しいパスワードを再入力"
            disabled={isPending}
            error={!!fieldErrors.confirmPassword}
            autoComplete="new-password"
          />
          <ErrorMsgField msg={fieldErrors.confirmPassword?.message} />
        </div>

        <ErrorMsgField msg={fieldErrors.root?.message} />

        <Button
          variant="indigo"
          width="stretch"
          isBusy={isPending}
          disabled={!formMethods.formState.isValid || isPending}
        >
          パスワードを変更
        </Button>
      </form>
    </main>
  );
};

export default Page;
