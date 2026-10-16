import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  level?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  centered = false,
  level = "h2",
  id,
  className,
}: SectionHeadingProps) {
  const Heading = level;
  return (
    <div className={cn(centered && "text-center", className)}>
      <Heading
        id={id}
        className="text-balance text-3xl font-bold leading-tight text-brand-primary md:text-4xl"
      >
        {title}
      </Heading>
      {subtitle && (
        <p className={cn("mt-3 max-w-2xl text-base leading-7 text-brand-text/80 md:text-lg", centered && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
