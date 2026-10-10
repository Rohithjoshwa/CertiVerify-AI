"use client";

import React from "react";
import Link from "next/link";

export interface LogoProps {
  /** Size of the logo icon in pixels or predefined size string */
  size?: "sm" | "md" | "lg" | "xl" | number;
  /** Whether to show the "certiverify" wordmark next to the icon */
  showWordmark?: boolean;
  /** If true or variant="dark", wordmark's 'certi' text is white for dark backgrounds */
  isDark?: boolean;
  /** Explicit theme variant ("light" | "dark") */
  theme?: "light" | "dark";
  /** Optional link destination (e.g. "/" or "/dashboard") */
  href?: string;
  /** Additional CSS class names */
  className?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Click event handler */
  onClick?: () => void;
}

export const LogoIcon: React.FC<{ sizePx: number; className?: string }> = ({ sizePx, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={sizePx}
    height={sizePx}
    viewBox="0 0 96 96"
    role="img"
    aria-label="CertiVerify Icon"
    className={`shrink-0 ${className}`}
  >
    <rect width="96" height="96" rx="22" fill="#4F46E5" />
    <path
      d="M69 33 A26 26 0 1 0 69 63"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="9"
      strokeLinecap="round"
    />
    <path
      d="M41 50 L50 59 L72 35"
      fill="none"
      stroke="#10213A"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showWordmark = true,
  isDark = false,
  theme,
  href,
  className = "",
  ariaLabel = "CertiVerify Home",
  onClick,
}) => {
  // Determine pixel size & font size classes
  let iconSizePx = 36;
  let fontClasses = "text-xl";

  if (typeof size === "number") {
    iconSizePx = size;
    fontClasses = size >= 56 ? "text-3xl" : size >= 44 ? "text-2xl" : size >= 32 ? "text-xl" : "text-base";
  } else {
    switch (size) {
      case "sm":
        iconSizePx = 28;
        fontClasses = "text-lg";
        break;
      case "md":
        iconSizePx = 36;
        fontClasses = "text-xl";
        break;
      case "lg":
        iconSizePx = 48;
        fontClasses = "text-2xl";
        break;
      case "xl":
        iconSizePx = 64;
        fontClasses = "text-4xl";
        break;
    }
  }

  const useDarkText = theme === "dark" || isDark;
  const certiColorClass = useDarkText ? "text-white" : "text-[#10213A]";

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`} onClick={onClick}>
      <LogoIcon sizePx={iconSizePx} />

      {showWordmark && (
        <span
          className={`font-sora font-semibold tracking-[-0.03em] leading-none ${fontClasses}`}
          style={{ fontFamily: "var(--font-sora), Sora, sans-serif" }}
        >
          <span className={certiColorClass}>certi</span>
          <span className="text-[#4F46E5]">verify</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
