import { getGalleryItems } from "./actions";
import { GalleryItemForm } from "./components/GalleryItemForm";
import { ToggleActiveButton } from "./components/ToggleActiveButton";
import { DeleteButton } from "./components/DeleteButton";

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h1 className="font-headline text-2xl lg:text-3xl font-bold text-brand-primary">Gallery</h1>
        <p className="mt-1 text-sm text-brand-muted">Manage gallery photos.</p>
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Add gallery item</h2>
          <GalleryItemForm />
        </section>

        <section className="rounded-lg border border-brand-border bg-brand-surface p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Gallery items</h2>
          {items.length === 0 ? (
            <p className="text-sm text-brand-muted">No gallery items yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-brand-border bg-brand-surface p-4 shadow-sm"
                >
                  {item.signedUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.signedUrl}
                      alt={item.title || "Gallery image"}
                      className="mb-4 h-48 w-full rounded-md object-cover"
                    />
                  ) : (
                    <div className="mb-4 flex h-48 items-center justify-center rounded-md bg-brand-background text-sm text-brand-muted">
                      No image
                    </div>
                  )}
                  <h3 className="font-semibold">{item.title || "Untitled"}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-brand-muted">{item.description}</p>
                  )}
                  <p className="mt-2 text-xs text-brand-muted">Sort order: {item.sortOrder}</p>
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
    </div>
  );
}
