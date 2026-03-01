import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const variantStyles = {
  primary:
    "border-2 border-charcoal bg-oxblood text-white shadow-[4px_4px_0_0_theme(colors.charcoal)] hover:bg-oxblood-deep hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_theme(colors.charcoal)]",
  secondary:
    "border-2 border-charcoal bg-snow text-charcoal shadow-[4px_4px_0_0_theme(colors.charcoal)] hover:bg-mist hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_theme(colors.charcoal)]",
  outline:
    "border-2 border-charcoal bg-transparent text-charcoal hover:bg-charcoal/5",
  ghost: "border-2 border-transparent bg-transparent text-charcoal hover:bg-charcoal/5",
};

const sizeStyles = {
  sm: "h-9 px-3 text-sm",
  md: "h-12 px-5 text-base",
  lg: "h-14 px-8 text-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-semibold uppercase tracking-wider transition-[box-shadow,transform,background-color] disabled:pointer-events-none disabled:opacity-50 rounded-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
