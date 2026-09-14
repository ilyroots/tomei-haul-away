import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const SIZES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
} as const;

const STAR_INSET = {
  sm: "h-2.5 w-2.5",
  md: "h-3.5 w-3.5",
  lg: "h-5 w-5",
} as const;

export function StarRating({ rating, size = "md", showLabel = false, className }: StarRatingProps) {
  const clamped = Math.min(5, Math.max(1, Math.round(rating)));

  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      role="img"
      aria-label={`Rated ${clamped} out of 5 stars`}
    >
      <span className="inline-flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "flex items-center justify-center",
              SIZES[size],
              index < clamped ? "bg-[#00b67a]" : "bg-[#dcdce6]"
            )}
          >
            <svg
              className={STAR_INSET[size]}
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2l2.9 6.26 6.86.83-5.07 4.7 1.35 6.77L12 17.27 5.96 20.56l1.35-6.77-5.07-4.7 6.86-.83L12 2z" />
            </svg>
          </span>
        ))}
      </span>
      {showLabel && <span className="text-sm font-semibold text-brand-muted">{clamped} / 5</span>}
    </span>
  );
}
