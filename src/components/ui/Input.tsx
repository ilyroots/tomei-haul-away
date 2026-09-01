import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border border-charcoal-200 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal-400 focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange disabled:cursor-not-allowed disabled:bg-cream-200",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
