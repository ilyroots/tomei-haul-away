"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SERVICES } from "@/lib/business/config";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const JOB_OPTIONS = [
  { value: "", label: "Select a service" },
  ...SERVICES.map((service) => ({
    value: service.slug,
    label: service.title,
  })),
];

const QUICK_QUOTE_DRAFT_KEY = "quick-quote-draft";

export function QuickQuoteStrip() {
  const router = useRouter();
  const [zip, setZip] = useState("");
  const [serviceSlug, setServiceSlug] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = event.target.files;
      if (!selected) return;
      const remaining = 3 - files.length;
      if (remaining <= 0) return;
      const toAdd = Array.from(selected).slice(0, remaining);
      setFiles((prev) => [...prev, ...toAdd]);
    },
    [files.length]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleContinue = useCallback(() => {
    const draft = {
      zip: zip.replace(/\D/g, "").slice(0, 5),
      serviceSlug,
    };
    localStorage.setItem(QUICK_QUOTE_DRAFT_KEY, JSON.stringify(draft));
    const params = new URLSearchParams();
    if (draft.serviceSlug) params.set("service", draft.serviceSlug);
    if (draft.zip) params.set("zip", draft.zip);
    router.push(`/quote?${params.toString()}`);
  }, [zip, serviceSlug, router]);

  return (
    <section className="bg-navy py-10 text-cream" aria-labelledby="quick-quote-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <h2 id="quick-quote-heading" className="text-2xl font-bold text-cream md:text-3xl">
            Get a fast estimate
          </h2>
          <p className="mt-2 text-cream/80">
            Tell us where you are and what you need removed. Continue to the full form to add
            details and schedule.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="quick-zip" className="text-cream/90">
                ZIP code
              </Label>
              <Input
                id="quick-zip"
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="01830"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="bg-white text-charcoal"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="quick-service" className="text-cream/90">
                Job type
              </Label>
              <Select
                id="quick-service"
                options={JOB_OPTIONS}
                value={serviceSlug}
                onChange={(e) => setServiceSlug(e.target.value)}
                className="bg-white text-charcoal"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleContinue}
                disabled={!zip.replace(/\D/g, "").slice(0, 5)}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          </div>

          <div className="mt-5">
            <Label htmlFor="quick-photos" className="text-cream/90">
              Upload up to 3 photos (optional)
            </Label>
            <Input
              id="quick-photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              disabled={files.length >= 3}
              className="mt-1 bg-white text-charcoal"
            />
            {files.length > 0 && (
              <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="relative rounded-md bg-white p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="aspect-square w-full rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute right-1 top-1 rounded-full bg-navy p-1 text-cream hover:bg-orange"
                      aria-label={`Remove ${file.name}`}
                    >
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-cream/70">
              Photos selected here are for preview only. You will be able to upload them again on
              the full quote form.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
