import Image from "next/image";

const cleanoutPhotos = [
  { phase: "Before", file: "before", alt: "Cardboard and debris piled beside the front walkway" },
  { phase: "After", file: "after", alt: "The same front yard and walkway cleared of cardboard and debris" },
];

export function CleanoutPhotos() {
  return (
    <section aria-label="Front yard cleanout">
      <h2 className="mb-4 text-xl font-semibold text-brand-primary">Front yard cleanout</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {cleanoutPhotos.map(({ phase, file, alt }) => (
          <figure key={file} className="overflow-hidden rounded-xl bg-brand-surface shadow-sm">
            <Image
              src={`/images/job-photos/front-yard-cleanout-${file}.jpg`}
              alt={alt}
              width={512}
              height={384}
              sizes="(max-width: 640px) 50vw, 480px"
              className="h-auto w-full"
            />
            <figcaption className="px-3 py-2 text-sm font-medium text-brand-text">{phase}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
