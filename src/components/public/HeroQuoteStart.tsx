"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const OPTIONS = [
  ["", "Choose what needs to go"],
  ["furniture-removal", "Furniture"],
  ["appliance-removal", "Appliances"],
  ["garage-home-cleanouts", "Home or garage cleanout"],
  ["yard-debris", "Yard debris"],
  ["construction-renovation-debris", "Renovation debris"],
  ["estate-cleanouts", "Commercial or estate cleanout"],
] as const;

export function HeroQuoteStart() {
  const [service, setService] = useState("");
  const quoteHref = service ? `/quote?service=${service}` : "/quote";

  return (
    <div className="mt-8 max-w-xl border-l-2 border-brand-accent pl-4 sm:pl-5">
      <label htmlFor="hero-service" className="block text-sm font-semibold text-white">
        Start with what you need removed
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <select
          id="hero-service"
          value={service}
          onChange={(event) => setService(event.target.value)}
          className="min-h-12 min-w-0 flex-1 rounded-md border border-white/50 bg-white px-4 text-sm font-medium text-brand-primary focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent"
        >
          {OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button asChild size="md" className="min-h-12 shrink-0 px-5 text-sm sm:px-6">
          <Link href={quoteHref}>Start my quote</Link>
        </Button>
      </div>
    </div>
  );
}
