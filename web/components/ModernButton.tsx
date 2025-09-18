"use client";

import { Button, cn } from "@consulting-platform/ui";
import { forwardRef } from "react";

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

const ModernButton = forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseClasses =
      "relative overflow-hidden font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantClasses = {
      primary:
        "bg-gradient-to-r from-tekhelet-500 via-tekhelet-600 to-tekhelet-700 text-white shadow-lg hover:shadow-xl hover:shadow-tekhelet-500/25 border border-tekhelet-400/20 backdrop-blur-sm",
      secondary:
        "bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 text-white shadow-lg hover:shadow-xl hover:shadow-teal-500/25 border border-teal-400/20 backdrop-blur-sm",
      outline:
        "bg-white/10 backdrop-blur-md border-2 border-tekhelet-500/30 text-tekhelet-700 hover:bg-tekhelet-500/10 hover:border-tekhelet-500/50 shadow-lg hover:shadow-xl",
      ghost:
        "bg-white/5 backdrop-blur-sm border border-white/20 text-gray-700 hover:bg-white/10 hover:border-white/30 shadow-md hover:shadow-lg",
    };

    const sizeClasses = {
      sm: "px-4 py-2 text-sm rounded-lg",
      md: "px-6 py-3 text-base rounded-xl",
      lg: "px-8 py-4 text-lg rounded-xl",
      xl: "px-12 py-5 text-xl rounded-2xl",
    };

    return (
      <Button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>

        {/* Shine effect */}
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </Button>
    );
  }
);

ModernButton.displayName = "ModernButton";

export { ModernButton };
