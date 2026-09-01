import Link from "next/link";
import { PHONE, TEXT_NUMBER } from "@/lib/business/config";

export function MobileBottomBar() {
  return (
    <div
      role="toolbar"
      aria-label="Quick contact"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-border bg-brand-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden"
    >
      <div className="grid grid-cols-3 divide-x divide-brand-border">
        <a
          href={`tel:${PHONE}`}
          className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-brand-primary active:bg-brand-background focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span className="text-xs font-semibold">Call</span>
        </a>
        <a
          href={`sms:${TEXT_NUMBER}`}
          className="flex flex-col items-center justify-center gap-1 px-2 py-3 text-brand-primary active:bg-brand-background focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-xs font-semibold">Text</span>
        </a>
        <Link
          href="/quote"
          className="flex flex-col items-center justify-center gap-1 bg-brand-accent px-2 py-3 text-brand-primary active:bg-brand-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className="text-xs font-semibold">Free Quote</span>
        </Link>
      </div>
    </div>
  );
}
