"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SERVICES } from "@/lib/business/config";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { quickQuoteImage } from "@/lib/public/images";

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
    <section
      className="bg-brand-primary py-10 text-brand-background"
      aria-labelledby="quick-quote-heading"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-3">
            <h2
              id="quick-quote-heading"
              className="text-2xl font-bold text-brand-background md:text-3xl"
            >
              Get a fast estimate
            </h2>
            <p className="mt-2 text-brand-background/80">
              Tell us where you are and what you need removed. Continue to the full form to add
              details and schedule.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="quick-zip" className="text-brand-background/90">
                  ZIP code
                </Label>
                <Input
                  id="quick-zip"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="92101"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="bg-brand-surface text-brand-text"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="quick-service" className="text-brand-background/90">
                  Job type
                </Label>
                <Select
                  id="quick-service"
                  options={JOB_OPTIONS}
                  value={serviceSlug}
                  onChange={(e) => setServiceSlug(e.target.value)}
                  className="bg-brand-surface text-brand-text"
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
              <Label htmlFor="quick-photos" className="text-brand-background/90">
                Upload up to 3 photos (optional)
              </Label>
              <Input
                id="quick-photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                disabled={files.length >= 3}
                className="mt-1 bg-brand-surface text-brand-text"
              />
              {files.length > 0 && (
                <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="relative rounded-md bg-brand-surface p-2"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="aspect-square w-full rounded object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute right-1 top-1 rounded-full bg-brand-primary p-1 text-brand-background hover:bg-brand-accent"
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
              <p className="mt-2 text-xs text-brand-background/70">
                Photos selected here are for preview only. You will be able to upload them again on
                the full quote form.
              </p>
            </div>
          </div>

          <div className="relative hidden aspect-[4/3] w-full overflow-hidden rounded-xl lg:col-span-2 lg:block">
            <Image
              src={quickQuoteImage.src}
              alt={quickQuoteImage.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
