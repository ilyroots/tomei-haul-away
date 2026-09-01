import Image from "next/image";

interface GalleryImageProps {
  src: string;
  alt: string;
  caption?: string | null;
  priority?: boolean;
}

export function GalleryImage({ src, alt, caption, priority = false }: GalleryImageProps) {
  return (
    <figure className="group relative overflow-hidden rounded-xl bg-cream-100 shadow-sm">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          priority={priority}
        />
      </div>
      {caption && (
        <figcaption className="bg-white px-4 py-3 text-sm font-medium text-charcoal">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
