/**
 * Aggregates the five service-area regions and provides lookup helpers
 * used by the service-areas pages.
 */

import { northCountyCoastal } from "./north-county-coastal";
import { northCountyInland } from "./north-county-inland";
import { centralSanDiego } from "./central-san-diego";
import { eastCounty } from "./east-county";
import { southBay } from "./south-bay";

export interface AreaPhoto {
  src: string;
  sourceUrl: string;
  filePageUrl: string;
  photographer: string;
  license: string;
  attribution: string;
  alt: string;
}

export interface AreaCity {
  name: string;
  slug: string;
  image: AreaPhoto;
}

export interface ServiceAreaRegion {
  region: string;
  slug: string;
  image: AreaPhoto;
  cities: AreaCity[];
}

/** Regions in display order: North County Coastal through South Bay. */
export const SERVICE_REGIONS: ServiceAreaRegion[] = [
  northCountyCoastal,
  northCountyInland,
  centralSanDiego,
  eastCounty,
  southBay,
];

export function regionForCitySlug(citySlug: string): ServiceAreaRegion | undefined {
  return SERVICE_REGIONS.find((region) => region.cities.some((city) => city.slug === citySlug));
}
