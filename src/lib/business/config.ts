export const COMPANY_NAME = "Tomei Haul Away" as const;
export const OWNER_NAME = "Tomei" as const;
export const HOME_CITY = "Haverhill, MA" as const;

export const PHONE = "+19785550100" as const;
export const TEXT_NUMBER = "+19785550100" as const;
export const EMAIL = "info@tomeihaulaway.com" as const;

export const BUSINESS_HOURS = [
  { day: "Monday", hours: "7:00 AM – 7:00 PM" },
  { day: "Tuesday", hours: "7:00 AM – 7:00 PM" },
  { day: "Wednesday", hours: "7:00 AM – 7:00 PM" },
  { day: "Thursday", hours: "7:00 AM – 7:00 PM" },
  { day: "Friday", hours: "7:00 AM – 7:00 PM" },
  { day: "Saturday", hours: "8:00 AM – 5:00 PM" },
  { day: "Sunday", hours: "Closed" },
] as const;

export type Service = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
};

export const SERVICES: Service[] = [
  {
    slug: "furniture-removal",
    title: "Furniture Removal",
    shortDescription: "Couches, mattresses, dressers, tables, and more.",
    description:
      "We pick up unwanted furniture from homes, apartments, offices, and storage spaces. Items are handled responsibly and routed toward donation or disposal based on condition.",
  },
  {
    slug: "appliance-removal",
    title: "Appliance Removal",
    shortDescription: "Refrigerators, washers, dryers, ovens, and small appliances.",
    description:
      "Safe removal of large and small appliances. We take care to avoid damage to floors and doorways and can coordinate recycling or proper disposal.",
  },
  {
    slug: "garage-home-cleanouts",
    title: "Garage & Home Cleanouts",
    shortDescription: "Clear out cluttered garages, basements, attics, and rooms.",
    description:
      "Full or partial cleanouts for residential spaces. We remove accumulated junk, old tools, boxes, and leftover materials so you can reclaim your space.",
  },
  {
    slug: "estate-cleanouts",
    title: "Estate Cleanouts",
    shortDescription: "Respectful cleanouts during life transitions.",
    description:
      "Compassionate, efficient estate cleanout services for families and property managers. We sort items for donation, recycling, or disposal as requested.",
  },
  {
    slug: "yard-debris",
    title: "Yard Debris",
    shortDescription: "Branches, leaves, brush, and outdoor waste.",
    description:
      "Seasonal or storm-related yard debris removal. We haul away branches, leaves, grass clippings, and other outdoor waste to keep your property tidy.",
  },
  {
    slug: "construction-renovation-debris",
    title: "Construction & Renovation Debris",
    shortDescription: "Drywall, lumber, tile, roofing, and remodeling leftovers.",
    description:
      "Debris removal for homeowners, contractors, and DIY renovators. We handle the heavy lifting so your job site stays clean and safe.",
  },
  {
    slug: "storage-unit-cleanouts",
    title: "Storage-Unit Cleanouts",
    shortDescription: "Empty out storage units quickly and completely.",
    description:
      "Whether you're downsizing, moving, or closing a unit, we remove everything and help sort items for donation, recycling, or disposal.",
  },
  {
    slug: "commercial-junk-removal",
    title: "Commercial Junk Removal",
    shortDescription: "Office furniture, equipment, and business cleanouts.",
    description:
      "Junk removal services for offices, retail spaces, warehouses, and property managers. Flexible scheduling minimizes disruption to your business.",
  },
  {
    slug: "single-item-pickup",
    title: "Single-Item Pickup",
    shortDescription: "Fast pickup for one large or bulky item.",
    description:
      "Need just one thing gone? We offer quick, straightforward pickup for single items like couches, appliances, mattresses, and exercise equipment.",
  },
  {
    slug: "specialty-item-removal",
    title: "Specialty-Item Removal",
    shortDescription: "Pianos, safes, hot tubs, and other oversized items.",
    description:
      "Heavy, awkward, or delicate item removal. Let us know what you need moved and we'll plan the safest approach.",
  },
];

export type ServiceArea = {
  radiusMiles: number;
  cities: string[];
  zips: string[];
};

export const SERVICE_AREA: ServiceArea = {
  radiusMiles: 30,
  cities: [
    "Haverhill",
    "Methuen",
    "Lawrence",
    "Andover",
    "North Andover",
    "Lowell",
    "Dracut",
    "Tewksbury",
    "Billerica",
    "Wilmington",
    "Burlington",
    "Woburn",
    "Reading",
    "Wakefield",
    "Lynnfield",
    "Peabody",
    "Salem",
    "Beverly",
    "Danvers",
    "Georgetown",
    "Groveland",
    "West Newbury",
    "Newburyport",
    "Amesbury",
    "Salisbury",
  ],
  zips: [
    "01830",
    "01832",
    "01833",
    "01834",
    "01835",
    "01840",
    "01841",
    "01842",
    "01843",
    "01844",
    "01845",
    "01850",
    "01851",
    "01852",
    "01853",
    "01854",
    "01855",
    "01860",
    "01862",
    "01863",
    "01864",
    "01865",
    "01867",
    "01876",
    "01879",
    "01880",
    "01887",
    "01890",
    "01901",
    "01902",
    "01904",
    "01905",
    "01906",
    "01907",
    "01908",
    "01913",
    "01915",
    "01921",
    "01923",
    "01929",
    "01930",
    "01938",
    "01940",
    "01944",
    "01945",
    "01949",
    "01950",
    "01952",
    "01960",
    "01969",
    "01970",
    "01982",
    "01983",
  ],
};

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function isInServiceArea(zip: string): boolean {
  const normalized = zip.replace(/\D/g, "").slice(0, 5);
  return SERVICE_AREA.zips.includes(normalized);
}

export function getCities(): string[] {
  return [...SERVICE_AREA.cities];
}

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((service) => service.slug === slug);
}

export function slugifyCity(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-");
}

export function getCityBySlug(slug: string): string | undefined {
  return SERVICE_AREA.cities.find((city) => slugifyCity(city) === slug);
}

export function getZipsForCity(_city: string): string[] {
  // Config does not map each ZIP to a city, so return all configured ZIPs for the area.
  return [...SERVICE_AREA.zips];
}

export function getNeighboringCities(city: string): string[] {
  return SERVICE_AREA.cities.filter((c) => c !== city).slice(0, 8);
}
