import { z } from "zod";
import { passwordSchema } from "./CommonSchemas";

export const passwordChangeRequestSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema.min(8),
    confirmPassword: passwordSchema.min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "新しいパスワードと確認用パスワードが一致しません。",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "現在のパスワードと新しいパスワードは同じにできません。",
    path: ["newPassword"],
  });

export type PasswordChangeRequest = z.infer<typeof passwordChangeRequestSchema>;
