import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  isRequired?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className, isRequired, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("mb-1 block text-sm font-semibold text-charcoal", className)}
        {...props}
      >
        {children}
        {isRequired && (
          <span className="ml-1 text-orange" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";
