import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "genuine" | "suspicious" | "fake" | "brand" | "info" | "neutral";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    genuine:
      "bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30",
    suspicious:
      "bg-[#ffb95f]/10 text-[#ffb95f] border border-[#ffb95f]/30",
    fake:
      "bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30",
    brand:
      "bg-[#2563eb]/15 text-[#b4c5ff] border border-[#b4c5ff]/30",
    info:
      "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30",
    neutral:
      "bg-[#102034] text-[#8d90a0] border border-[#1b2b3f]",
  };

  const dotColors = {
    genuine: "bg-[#4edea3] shadow-[#4edea3]/50",
    suspicious: "bg-[#ffb95f] shadow-[#ffb95f]/50",
    fake: "bg-[#ffb4ab] shadow-[#ffb4ab]/50",
    brand: "bg-[#b4c5ff] shadow-[#b4c5ff]/50",
    info: "bg-cyan-400 shadow-cyan-400/50",
    neutral: "bg-[#8d90a0] shadow-[#8d90a0]/50",
  };

  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5 rounded-[2px] gap-1 font-semibold",
    md: "text-[11px] px-2 py-0.5 rounded-[2px] gap-1.5 font-semibold",
    lg: "text-xs px-2.5 py-1 rounded-[2px] gap-2 font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center select-none font-mono tracking-wider uppercase leading-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shadow-sm animate-pulse shrink-0", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};
