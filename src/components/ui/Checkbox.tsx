import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <label className={cn("flex cursor-pointer items-start gap-3", className)}>
        <input
          ref={ref}
          type="checkbox"
          className="mt-1 h-5 w-5 cursor-pointer rounded border-brand-border text-brand-accent focus:ring-brand-accent"
          {...props}
        />
        <span className="text-sm text-brand-text/90">{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
