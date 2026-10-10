import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  max?: number;
  indeterminate?: boolean;
  variant?: "brand" | "emerald" | "amber" | "rose" | "gradient";
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  className,
  value = 0,
  max = 100,
  indeterminate = false,
  variant = "brand",
  size = "sm",
  showLabel = false,
  label,
  ...props
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const sizeStyles = {
    xs: "h-1",
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const variantStyles = {
    brand: "bg-[#2563eb] shadow-sm shadow-[#2563eb]/50",
    emerald: "bg-[#4edea3] shadow-sm shadow-[#4edea3]/50",
    amber: "bg-[#ffb95f] shadow-sm shadow-[#ffb95f]/50",
    rose: "bg-[#ffb4ab] shadow-sm shadow-[#ffb4ab]/50",
    gradient: "bg-gradient-to-r from-[#2563eb] via-[#38bdf8] to-[#4edea3]",
  };

  return (
    <div className="w-full space-y-1.5" {...props}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#c3c6d7] font-medium">{label}</span>
          {showLabel && (
            <span className="font-mono text-[#d3e4fe] font-semibold">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-[#000f21] rounded-[2px] overflow-hidden border border-[#1b2b3f]",
          sizeStyles[size],
          className
        )}
      >
        {indeterminate ? (
          <div
            className={cn(
              "h-full w-2/5 rounded-[2px]",
              variantStyles[variant]
            )}
            style={{
              animation: "indeterminate 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          />
        ) : (
          <div
            className={cn("h-full rounded-[2px] transition-all duration-300 ease-out", variantStyles[variant])}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};
