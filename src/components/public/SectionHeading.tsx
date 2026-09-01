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
      <Heading id={id} className="text-3xl font-bold text-navy md:text-4xl">
        {title}
      </Heading>
      {subtitle && <p className="mt-3 max-w-2xl text-lg text-charcoal-600">{subtitle}</p>}
    </div>
  );
}
