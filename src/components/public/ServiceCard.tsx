import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { getServiceImage } from "@/lib/public/images";

interface ServiceCardProps {
  slug: string;
  title: string;
  shortDescription: string;
}

export function ServiceCard({ slug, title, shortDescription }: ServiceCardProps) {
  const image = getServiceImage(slug);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-brand-surface shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[3/2] w-full bg-brand-background">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-brand-primary">{title}</h3>
        <p className="mt-2 flex-1 text-brand-text/80">{shortDescription}</p>
        <div className="mt-4 flex items-center gap-3">
          <Link
            href={`/services/${slug}`}
            className="text-sm font-semibold text-brand-primary hover:text-brand-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          >
            Learn more
          </Link>
          <Button asChild variant="primary" size="sm">
            <Link href={`/quote?service=${slug}`}>Get a quote</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
