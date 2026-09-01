import { getGalleryItems } from "./actions";
import { GalleryItemForm } from "./components/GalleryItemForm";
import { ToggleActiveButton } from "./components/ToggleActiveButton";
import { DeleteButton } from "./components/DeleteButton";

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cream">Gallery</h1>
        <p className="mt-1 text-cream-200">Manage gallery photos.</p>
      </div>

      <section className="rounded-lg bg-navy p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-cream">Add gallery item</h2>
        <GalleryItemForm />
      </section>

      <section className="rounded-lg bg-navy p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-cream">Gallery items</h2>
        {items.length === 0 ? (
          <p className="text-cream-200">No gallery items yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-charcoal-600 bg-charcoal-800 p-4"
              >
                {item.signedUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.signedUrl}
                    alt={item.title || "Gallery image"}
                    className="mb-4 h-48 w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-48 items-center justify-center rounded-md bg-charcoal-700 text-cream-200">
                    No image
                  </div>
                )}
                <h3 className="font-semibold text-cream">{item.title || "Untitled"}</h3>
                {item.description && (
                  <p className="mt-1 text-sm text-cream-200">{item.description}</p>
                )}
                <p className="mt-2 text-xs text-cream-200">Sort order: {item.sortOrder}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <GalleryItemForm item={item} />
                  <ToggleActiveButton id={item.id} isActive={item.isActive} />
                  <DeleteButton id={item.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
