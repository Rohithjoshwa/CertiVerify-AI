import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "glass";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      icon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-[4px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#000f21] disabled:opacity-50 disabled:pointer-events-none select-none";

    const variants = {
      primary:
        "bg-[#2563eb] hover:bg-blue-600 text-white shadow-sm shadow-blue-500/20 focus:ring-[#2563eb] active:scale-[0.99]",
      secondary:
        "bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#1b2b3f] hover:border-white/20 focus:ring-slate-500 active:scale-[0.99]",
      outline:
        "border border-[#1b2b3f] hover:border-[#2563eb] hover:bg-[#2563eb]/10 text-[#d3e4fe] focus:ring-[#2563eb] active:scale-[0.99]",
      ghost:
        "hover:bg-[#102034] text-[#c3c6d7] hover:text-[#d3e4fe] focus:ring-slate-500 active:scale-[0.99]",
      danger:
        "bg-[#93000a] hover:bg-red-900 text-[#ffb4ab] border border-[#ffb4ab]/30 focus:ring-red-500 active:scale-[0.99]",
      success:
        "bg-emerald-950/80 hover:bg-emerald-900 text-[#4edea3] border border-[#4edea3]/40 focus:ring-emerald-500 active:scale-[0.99]",
      glass:
        "bg-[#0b1c30]/90 hover:bg-[#102034] text-[#d3e4fe] border border-[#1b2b3f] shadow-sm active:scale-[0.99]",
    };

    const sizes = {
      sm: "text-xs px-2.5 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
      icon: "p-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
