import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { COMPANY_NAME } from "@/lib/business/config";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-headline text-7xl font-bold text-brand-accent md:text-8xl">404</p>
      <h1 className="mt-4 text-3xl font-bold text-brand-primary md:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-lg text-brand-text/80">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been
        moved or no longer exists.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/quote">Get a free quote</Link>
        </Button>
      </div>
      <p className="mt-6 text-sm text-brand-muted">
        {COMPANY_NAME} &mdash; junk removal and cleanouts
      </p>
    </div>
  );
}
