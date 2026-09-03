import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { logoSocial } from "@/lib/public/images";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tomei Haul Away | Junk Removal",
    template: "%s | Tomei Haul Away",
  },
  description:
    "Reliable junk removal and cleanout services for homes, businesses, and estates in the San Diego area. Request a free quote today.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  openGraph: {
    images: [
      {
        url: logoSocial.src,
        width: logoSocial.width,
        height: logoSocial.height,
        alt: logoSocial.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [logoSocial.src],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col bg-brand-background text-brand-text">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
