"use client";

import { Button, cn } from "@consulting-platform/ui";
import { forwardRef } from "react";

interface GlobalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

const GlobalButton = forwardRef<HTMLButtonElement, GlobalButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseClasses =
      "relative overflow-hidden font-normal transition-all duration-300 ease-in-out transform hover:scale-102 focus:outline-none focus:ring-1 focus:ring-offset-1 rounded-lg";

    const variantClasses = {
      primary:
        "bg-gradient-to-r from-tekhelet-200/80 via-tekhelet-300/90 to-tekhelet-400/80 text-white shadow-sm hover:shadow-md hover:shadow-tekhelet-200/30 border border-tekhelet-200/40 backdrop-blur-md hover:from-tekhelet-300/90 hover:via-tekhelet-400/90 hover:to-tekhelet-500/90",
      secondary:
        "bg-gradient-to-r from-teal-200/80 via-teal-300/90 to-teal-400/80 text-white shadow-sm hover:shadow-md hover:shadow-teal-200/30 border border-teal-200/40 backdrop-blur-md hover:from-teal-300/90 hover:via-teal-400/90 hover:to-teal-500/90",
    };

    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
      xl: "px-12 py-5 text-xl",
    };

    return (
      <Button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out" />

        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>

        {/* Shine effect */}
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-white/8 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      </Button>
    );
  }
);

GlobalButton.displayName = "GlobalButton";

export { GlobalButton };
