import { Metadata } from "next";
import { COMPANY_NAME } from "@/lib/business/config";
import { getActiveGalleryItems } from "@/lib/public/data";
import { SectionHeading } from "@/components/public/SectionHeading";
import { GalleryImage } from "@/components/public/GalleryImage";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Gallery",
  description: `See before-and-after photos of junk removal jobs by ${COMPANY_NAME}.`,
  alternates: {
    canonical: `${appUrl}/gallery`,
  },
  openGraph: {
    title: `Gallery | ${COMPANY_NAME}`,
    description: "Before-and-after junk removal photos.",
    url: `${appUrl}/gallery`,
    type: "website",
  },
};

export default async function GalleryPage() {
  const galleryItems = await getActiveGalleryItems();
  const hasItems = galleryItems.length > 0;

  return (
    <div className="container mx-auto px-4 py-16">
      <SectionHeading
        title="Gallery"
        subtitle="Before-and-after photos from real jobs. Replace placeholders with your own project photos."
        centered
      />

      {hasItems ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item, index) => (
            <GalleryImage
              key={item.id}
              src={item.assetKey ? `/api/assets/${item.assetKey}` : "/placeholders/gallery.svg"}
              alt={item.description ?? item.title ?? "Gallery photo"}
              caption={item.title}
              priority={index < 3}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <GalleryImage
              key={i}
              src="/placeholders/gallery.svg"
              alt="Photo placeholder — replace with real job photo"
              caption={`Job photo ${i + 1} — replace with real photo`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
