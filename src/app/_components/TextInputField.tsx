"use client";

import React, { useState } from "react";
import { ReactNode, ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const input = tv({
  base: "w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-700",
  variants: {
    border: {
      normal: "border-gray-300 ",
      hoverOnly:
        "border-transparent bg-transparent hover:border-gray-300 focus:ring-inset",
    },
    disabled: {
      true: "cursor-not-allowed opacity-50",
    },
    readOnly: {
      true: "cursor-default bg-gray-100 text-gray-500 focus:border-gray-300 focus:ring-0",
    },
    error: {
      true: "border-red-500 focus:border-red-500 focus:ring-red-500",
    },
  },
  defaultVariants: {
    border: "normal",
    disabled: false,
    isBusy: false,
    readOnly: false,
    error: false,
  },
});

interface Props
  extends
    Omit<ComponentPropsWithRef<"input">, "className">,
    VariantProps<typeof input> {
  children?: ReactNode;
  className?: string;
  isBusy?: boolean;
  readOnly?: boolean;
  error?: boolean;
  border?: "normal" | "hoverOnly";
  showPasswordToggle?: boolean;
}

export const TextInputField = React.forwardRef<HTMLInputElement, Props>(
  (props, ref) => {
    const {
      disabled,
      className,
      readOnly,
      error,
      isBusy,
      border,
      type,
      showPasswordToggle,
      ...rest
    } = props;

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputType = showPasswordToggle
      ? isPasswordVisible
        ? "text"
        : "password"
      : (type ?? "text");

    if (showPasswordToggle && type === "password") {
      return (
        <div className="relative">
          <input
            ref={ref}
            className={input({
              border,
              disabled,
              readOnly,
              error,
              class: className,
            })}
            disabled={disabled || isBusy}
            readOnly={readOnly}
            type={inputType}
            {...rest}
          />
          <button
            type="button"
            aria-label={
              isPasswordVisible ? "パスワードを非表示" : "パスワードを表示"
            }
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            tabIndex={-1}
            disabled={disabled || isBusy || readOnly}
          >
            <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
          </button>
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={input({
          border,
          disabled,
          readOnly,
          error,
          class: className,
        })}
        disabled={disabled || isBusy}
        readOnly={readOnly}
        type={type ?? "text"}
        {...rest}
      />
    );
  },
);

TextInputField.displayName = "TextInputField";
