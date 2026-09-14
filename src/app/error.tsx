"use client";

import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-brand-primary md:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-lg text-brand-text/80">
        An unexpected error occurred while loading this page. Please try again, and if
        the problem continues, give us a call or text.
      </p>
      <div className="mt-8">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
