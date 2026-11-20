import { Metadata } from "next";
import { COMPANY_NAME } from "@/lib/business/config";
import { getActiveGalleryItems } from "@/lib/public/data";
import { SectionHeading } from "@/components/public/SectionHeading";
import { GalleryImage } from "@/components/public/GalleryImage";

export const dynamic = "force-dynamic";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Gallery",
  description: `See before-and-after junk removal photos from ${COMPANY_NAME}.`,
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
  const galleryItems = (await getActiveGalleryItems()).filter((item) => item.assetKey);

  return (
    <div className="container mx-auto px-4 py-16">
      <SectionHeading title="Gallery" subtitle="Before and after a DreHauling cleanout." centered />

      <section aria-labelledby="front-yard-cleanout" className="mx-auto mt-10 max-w-5xl">
        <h2 id="front-yard-cleanout" className="mb-4 text-xl font-semibold text-brand-primary">
          Front yard cleanout
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <GalleryImage
            src="/images/gallery/front-yard-cleanout-before.jpg"
            alt="Cardboard and debris piled beside the front walkway"
            caption="Before"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          <GalleryImage
            src="/images/gallery/front-yard-cleanout-after.jpg"
            alt="The same front yard and walkway cleared of cardboard and debris"
            caption="After"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
      </section>

      {galleryItems.length > 0 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item, index) => (
            <GalleryImage
              key={item.id}
              src={`/api/gallery/${encodeURIComponent(item.id)}/image`}
              alt={item.description ?? item.title ?? "Gallery photo"}
              caption={item.title}
              priority={index < 3}
              unoptimized
            />
          ))}
        </div>
      )}
    </div>
  );
}
