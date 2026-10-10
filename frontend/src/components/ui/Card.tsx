import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: "brand" | "emerald" | "amber" | "rose" | "none";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, glow = "none", children, ...props }, ref) => {
    const glowStyles = {
      none: "",
      brand: "border-[#2563eb]/40 shadow-glow-brand",
      emerald: "border-[#4edea3]/40 shadow-glow-success",
      amber: "border-[#ffb95f]/40 shadow-glow-warning",
      rose: "border-[#ffb4ab]/40 shadow-glow-danger",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-[#0b1c30] border border-[#1b2b3f] rounded-[8px] p-5 transition-all duration-150",
          hover && "hover:border-[#d3e4fe]/25 hover:bg-[#0e223a]",
          glowStyles[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1 pb-3 border-b border-[#1b2b3f]", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-sm font-semibold text-[#d3e4fe] tracking-normal leading-tight font-sans", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-[#8d90a0] font-normal leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-3 mt-3 border-t border-[#1b2b3f]", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
