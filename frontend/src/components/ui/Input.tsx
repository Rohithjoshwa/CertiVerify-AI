import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 font-sans">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[#c3c6d7] select-none tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-[#8d90a0] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={cn(
              "w-full bg-[#000f21] border border-[#1b2b3f] text-[#d3e4fe] placeholder:text-[#8d90a0] text-sm rounded-[4px] px-3 py-2",
              "transition-colors duration-150",
              "focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-[#ffb4ab]/60 focus:border-[#ffb4ab] focus:ring-[#ffb4ab]/30",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[#8d90a0] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[#ffb4ab] mt-1 font-medium font-mono">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#8d90a0] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
