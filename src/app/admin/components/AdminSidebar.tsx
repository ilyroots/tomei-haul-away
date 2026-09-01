"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/service-areas", label: "Service Areas" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminSidebar({
  adminEmail,
  adminName,
}: {
  adminEmail?: string | null;
  adminName?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-md bg-orange px-3 py-2 text-white shadow-md lg:hidden"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        aria-controls="admin-sidebar"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-navy text-cream transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-navy-700 p-6">
            <Link href="/admin" className="font-headline text-2xl font-bold text-orange">
              Tomei Admin
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Admin navigation">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block rounded-md px-4 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-orange text-white"
                          : "text-cream-200 hover:bg-navy-800 hover:text-white"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-navy-700 p-4">
            <div className="mb-3 text-sm text-cream-200">
              <p className="font-medium text-white">{adminName || "Admin"}</p>
              <p className="truncate">{adminEmail}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="w-full rounded-md border border-cream-300 px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-navy"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
