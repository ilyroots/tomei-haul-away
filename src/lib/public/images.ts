/**
 * Centralized public image content for the Tomei Haul Away site.
 *
 * NOTE: All placeholder images below are generated brand-colored illustrations.
 * Replace them with real Tomei photography as it becomes available.
 */

export type ImageCategory =
  "logo" | "hero" | "service" | "gallery" | "team" | "process" | "service-area" | "page";

export interface SiteImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  category: ImageCategory;
  caption?: string;
  isPlaceholder: boolean;
  replacementNotes?: string;
}

// ---------------------------------------------------------------------------
// Logos
// ---------------------------------------------------------------------------

export const logoHorizontal: SiteImage = {
  src: "/images/logos/tomei-logo-horizontal.png",
  alt: "Tomei Haul Away logo",
  width: 2089,
  height: 753,
  category: "logo",
  isPlaceholder: false,
  replacementNotes: "Master horizontal logo. Use for desktop header, emails, and social sharing.",
};

export const logoIcon: SiteImage = {
  src: "/images/logos/tomei-logo-icon.png",
  alt: "Tomei Haul Away icon mark",
  width: 512,
  height: 512,
  category: "logo",
  isPlaceholder: false,
  replacementNotes: "Square icon mark for mobile header and favicon base.",
};

export const logoStacked: SiteImage = {
  src: "/images/logos/tomei-logo-stacked.png",
  alt: "Tomei Haul Away stacked logo",
  width: 1268,
  height: 1444,
  category: "logo",
  isPlaceholder: false,
  replacementNotes: "Stacked/wordmark logo for footer and narrow spaces.",
};

export const logoSocial: SiteImage = {
  src: "/images/logos/tomei-logo-social.webp",
  alt: "Tomei Haul Away",
  width: 1200,
  height: 630,
  category: "logo",
  isPlaceholder: false,
  replacementNotes: "Open Graph / social sharing image on navy background.",
};

// ---------------------------------------------------------------------------
// Page images
// ---------------------------------------------------------------------------

export const heroImage: SiteImage = {
  src: "/images/placeholders/hero/tomei-hero-crew-placeholder.webp",
  alt: "Tomei Haul Away truck and crew serving a residential neighborhood",
  width: 1200,
  height: 800,
  category: "hero",
  caption: "Serving homes, businesses, and estates across the Haverhill area.",
  isPlaceholder: true,
  replacementNotes:
    "Replace with a real photo of the Tomei crew and truck on a residential street.",
};

export const quickQuoteImage: SiteImage = {
  src: "/images/placeholders/pages/tomei-quick-quote-placeholder.webp",
  alt: "Quick quote illustration with clipboard and item box",
  width: 1200,
  height: 800,
  category: "page",
  caption: "Get a fast, upfront estimate.",
  isPlaceholder: true,
  replacementNotes:
    "Replace with a real photo of a crew member reviewing an estimate with a customer.",
};

export const pricingImage: SiteImage = {
  src: "/images/placeholders/pages/tomei-pricing-placeholder.webp",
  alt: "Pricing estimate illustration",
  width: 1200,
  height: 800,
  category: "page",
  caption: "Honest, personalized pricing.",
  isPlaceholder: true,
  replacementNotes:
    "Replace with a real photo showing a written estimate or crew discussing a job.",
};

export const quoteImage: SiteImage = {
  src: "/images/placeholders/pages/tomei-quote-placeholder.webp",
  alt: "Request a free quote illustration",
  width: 1200,
  height: 800,
  category: "page",
  caption: "Request your free quote.",
  isPlaceholder: true,
  replacementNotes:
    "Replace with a real photo of the crew preparing for a pickup or customer interaction.",
};

export const scheduleImage: SiteImage = {
  src: "/images/placeholders/pages/tomei-schedule-placeholder.webp",
  alt: "Schedule an appointment illustration with calendar and truck",
  width: 1200,
  height: 800,
  category: "page",
  caption: "Pick a time that works for you.",
  isPlaceholder: true,
  replacementNotes: "Replace with a real photo of the crew arriving at a scheduled appointment.",
};

export const finalCtaImage: SiteImage = {
  src: "/images/placeholders/pages/tomei-final-cta-placeholder.webp",
  alt: "Clean home after junk removal",
  width: 1200,
  height: 800,
  category: "page",
  caption: "Ready to reclaim your space?",
  isPlaceholder: true,
  replacementNotes: "Replace with a real before/after or clean-space photo from a completed job.",
};

// ---------------------------------------------------------------------------
// About page images
// ---------------------------------------------------------------------------

export const aboutOwnerImage: SiteImage = {
  src: "/images/placeholders/pages/tomei-about-owner-placeholder.webp",
  alt: "Tomei Haul Away owner",
  width: 1200,
  height: 800,
  category: "page",
  caption: "Owner-operated and local.",
  isPlaceholder: true,
  replacementNotes: "Replace with a real headshot or photo of the owner.",
};

export const aboutCrewImage: SiteImage = {
  src: "/images/placeholders/pages/tomei-about-crew-placeholder.webp",
  alt: "Tomei Haul Away crew",
  width: 1200,
  height: 800,
  category: "page",
  caption: "Experienced, respectful crew.",
  isPlaceholder: true,
  replacementNotes: "Replace with a real crew photo.",
};

export const aboutTruckImage: SiteImage = {
  src: "/images/placeholders/pages/tomei-about-truck-placeholder.webp",
  alt: "Tomei Haul Away truck and equipment",
  width: 1200,
  height: 800,
  category: "page",
  caption: "Equipped for jobs of all sizes.",
  isPlaceholder: true,
  replacementNotes: "Replace with a real photo of the Tomei truck and equipment.",
};

export const aboutCommunityImage: SiteImage = {
  src: "/images/placeholders/pages/tomei-about-community-placeholder.webp",
  alt: "Communities served by Tomei Haul Away",
  width: 1200,
  height: 800,
  category: "page",
  caption: "Proudly serving local communities.",
  isPlaceholder: true,
  replacementNotes:
    "Replace with a real local neighborhood or community photo from the service area.",
};

// ---------------------------------------------------------------------------
// Contact page images
// ---------------------------------------------------------------------------

export const contactImage: SiteImage = {
  src: "/images/placeholders/pages/tomei-contact-placeholder.webp",
  alt: "Friendly Tomei Haul Away crew member",
  width: 1200,
  height: 800,
  category: "page",
  caption: "We are here to help.",
  isPlaceholder: true,
  replacementNotes:
    "Replace with a real photo of the owner or crew member answering a call or greeting a customer.",
};

// ---------------------------------------------------------------------------
// Service images
// ---------------------------------------------------------------------------

export const serviceImages: Record<string, SiteImage> = {
  "furniture-removal": {
    src: "/images/placeholders/services/tomei-service-furniture-removal-placeholder.webp",
    alt: "Furniture removal service",
    width: 1200,
    height: 800,
    category: "service",
    caption: "Furniture removal",
    isPlaceholder: true,
    replacementNotes: "Replace with a real photo of removed furniture.",
  },
  "appliance-removal": {
    src: "/images/placeholders/services/tomei-service-appliance-removal-placeholder.webp",
    alt: "Appliance removal service",
    width: 1200,
    height: 800,
    category: "service",
    caption: "Appliance removal",
    isPlaceholder: true,
    replacementNotes: "Replace with a real photo of removed appliances.",
  },
  "garage-home-cleanouts": {
    src: "/images/placeholders/services/tomei-service-garage-home-cleanouts-placeholder.webp",
    alt: "Garage and home cleanout service",
    width: 1200,
    height: 800,
    category: "service",
    caption: "Garage & home cleanouts",
    isPlaceholder: true,
    replacementNotes: "Replace with a real garage or home cleanout photo.",
  },
  "estate-cleanouts": {
    src: "/images/placeholders/services/tomei-service-estate-cleanouts-placeholder.webp",
    alt: "Estate cleanout service",
    width: 1200,
    height: 800,
    category: "service",
    caption: "Estate cleanouts",
    isPlaceholder: true,
    replacementNotes: "Replace with a real estate cleanout photo.",
  },
  "yard-debris": {
    src: "/images/placeholders/services/tomei-service-yard-debris-placeholder.webp",
    alt: "Yard debris removal service",
    width: 1200,
    height: 800,
    category: "service",
    caption: "Yard debris",
    isPlaceholder: true,
    replacementNotes: "Replace with a real yard debris removal photo.",
  },
  "construction-renovation-debris": {
    src: "/images/placeholders/services/tomei-service-construction-renovation-debris-placeholder.webp",
    alt: "Construction and renovation debris removal service",
    width: 1200,
    height: 800,
    category: "service",
    caption: "Construction & renovation debris",
    isPlaceholder: true,
    replacementNotes: "Replace with a real construction debris removal photo.",
  },
  "storage-unit-cleanouts": {
    src: "/images/placeholders/services/tomei-service-storage-unit-cleanouts-placeholder.webp",
    alt: "Storage unit cleanout service",
    width: 1200,
    height: 800,
    category: "service",
    caption: "Storage-unit cleanouts",
    isPlaceholder: true,
    replacementNotes: "Replace with a real storage unit cleanout photo.",
  },
  "commercial-junk-removal": {
    src: "/images/placeholders/services/tomei-service-commercial-junk-removal-placeholder.webp",
    alt: "Commercial junk removal service",
    width: 1200,
    height: 800,
    category: "service",
    caption: "Commercial junk removal",
    isPlaceholder: true,
    replacementNotes: "Replace with a real commercial junk removal photo.",
  },
  "single-item-pickup": {
    src: "/images/placeholders/services/tomei-service-single-item-pickup-placeholder.webp",
    alt: "Single-item pickup service",
    width: 1200,
    height: 800,
    category: "service",
    caption: "Single-item pickup",
    isPlaceholder: true,
    replacementNotes: "Replace with a real single-item pickup photo.",
  },
  "specialty-item-removal": {
    src: "/images/placeholders/services/tomei-service-specialty-item-removal-placeholder.webp",
    alt: "Specialty item removal service",
    width: 1200,
    height: 800,
    category: "service",
    caption: "Specialty-item removal",
    isPlaceholder: true,
    replacementNotes: "Replace with a real specialty item removal photo.",
  },
};

export function getServiceImage(slug: string): SiteImage {
  return (
    serviceImages[slug] ?? {
      src: "/images/placeholders/services/tomei-service-furniture-removal-placeholder.webp",
      alt: "Junk removal service",
      width: 1200,
      height: 800,
      category: "service",
      isPlaceholder: true,
    }
  );
}

// ---------------------------------------------------------------------------
// Gallery before/after pairs
// ---------------------------------------------------------------------------

export const galleryPairs: Array<{ before: SiteImage; after: SiteImage }> = Array.from(
  { length: 6 },
  (_, i) => {
    const num = String(i + 1).padStart(2, "0");
    return {
      before: {
        src: `/images/placeholders/gallery/tomei-gallery-before-${num}-placeholder.webp`,
        alt: `Before junk removal job ${i + 1}`,
        width: 1200,
        height: 800,
        category: "gallery",
        caption: `Before — Job ${i + 1}`,
        isPlaceholder: true,
        replacementNotes: `Replace before photo ${i + 1} with a real before shot from a completed job.`,
      },
      after: {
        src: `/images/placeholders/gallery/tomei-gallery-after-${num}-placeholder.webp`,
        alt: `After junk removal job ${i + 1}`,
        width: 1200,
        height: 800,
        category: "gallery",
        caption: `After — Job ${i + 1}`,
        isPlaceholder: true,
        replacementNotes: `Replace after photo ${i + 1} with the matching real after shot.`,
      },
    };
  }
);

// ---------------------------------------------------------------------------
// Team image
// ---------------------------------------------------------------------------

export const teamImage: SiteImage = {
  src: "/images/placeholders/team/tomei-team-placeholder.webp",
  alt: "Tomei Haul Away team members",
  width: 1200,
  height: 800,
  category: "team",
  caption: "Meet the crew.",
  isPlaceholder: true,
  replacementNotes: "Replace with a real team or crew photo.",
};

// ---------------------------------------------------------------------------
// Process images
// ---------------------------------------------------------------------------

export const processImages = {
  quote: {
    src: "/images/placeholders/process/tomei-process-quote-placeholder.webp",
    alt: "Step 1: Request a quote",
    width: 1200,
    height: 800,
    category: "process" as ImageCategory,
    caption: "Request a quote",
    isPlaceholder: true,
    replacementNotes:
      "Replace with a real photo of a customer submitting a quote request or crew reviewing details.",
  },
  estimate: {
    src: "/images/placeholders/process/tomei-process-estimate-placeholder.webp",
    alt: "Step 2: Review your estimate",
    width: 1200,
    height: 800,
    category: "process" as ImageCategory,
    caption: "Review your estimate",
    isPlaceholder: true,
    replacementNotes:
      "Replace with a real photo of an estimate being reviewed or calendar scheduling.",
  },
  haul: {
    src: "/images/placeholders/process/tomei-process-haul-placeholder.webp",
    alt: "Step 3: We haul it away",
    width: 1200,
    height: 800,
    category: "process" as ImageCategory,
    caption: "We haul it away",
    isPlaceholder: true,
    replacementNotes: "Replace with a real photo of the crew loading items into the truck.",
  },
};

// ---------------------------------------------------------------------------
// Service area images
// ---------------------------------------------------------------------------

export const serviceAreaImages: SiteImage[] = Array.from({ length: 5 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  return {
    src: `/images/placeholders/service-areas/tomei-service-area-${num}-placeholder.webp`,
    alt: `Residential neighborhood in the Tomei Haul Away service area`,
    width: 1200,
    height: 800,
    category: "service-area",
    caption: `Local service area`,
    isPlaceholder: true,
    replacementNotes: `Replace service area illustration ${i + 1} with a real neighborhood or landmark photo from the service area.`,
  };
});

export function getServiceAreaImage(index: number): SiteImage {
  return serviceAreaImages[index % serviceAreaImages.length];
}
