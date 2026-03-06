import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const variantStyles = {
  primary:
    "border-[4px] border-black bg-yellow text-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-[#e6c757] active:bg-[#d9b94e]",
  secondary:
    "border-[4px] border-black bg-cyan text-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-[#43b9e0] active:bg-[#39add1]",
  outline:
    "border-[4px] border-black bg-white text-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-gray active:bg-[#d0d0d0]",
  ghost: "border-4 border-transparent bg-transparent text-black hover:bg-gray/50",
};

const sizeStyles = {
  sm: "h-10 px-4 text-sm",
  md: "h-14 px-6 text-base",
  lg: "h-16 px-10 text-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-black uppercase tracking-widest transition-all disabled:pointer-events-none disabled:opacity-50 rounded-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
