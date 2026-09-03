import { getGalleryItems } from "./actions";
import { GalleryItemForm } from "./components/GalleryItemForm";
import { ToggleActiveButton } from "./components/ToggleActiveButton";
import { DeleteButton } from "./components/DeleteButton";

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-brand-background">Gallery</h1>
        <p className="mt-1 text-brand-background/80">Manage gallery photos.</p>
      </div>

      <section className="rounded-lg bg-brand-primary p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-brand-background">Add gallery item</h2>
        <GalleryItemForm />
      </section>

      <section className="rounded-lg bg-brand-primary p-6 shadow">
        <h2 className="mb-4 text-xl font-bold text-brand-background">Gallery items</h2>
        {items.length === 0 ? (
          <p className="text-brand-background/80">No gallery items yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-brand-text/30 bg-brand-text/70 p-4"
              >
                {item.signedUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.signedUrl}
                    alt={item.title || "Gallery image"}
                    className="mb-4 h-48 w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-48 items-center justify-center rounded-md bg-brand-text/90 text-brand-background/80">
                    No image
                  </div>
                )}
                <h3 className="font-semibold text-brand-background">{item.title || "Untitled"}</h3>
                {item.description && (
                  <p className="mt-1 text-sm text-brand-background/80">{item.description}</p>
                )}
                <p className="mt-2 text-xs text-brand-background/80">
                  Sort order: {item.sortOrder}
                </p>
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
