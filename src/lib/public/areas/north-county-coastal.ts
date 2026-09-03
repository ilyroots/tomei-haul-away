/**
 * Region imagery for North County Coastal, sourced from Wikimedia Commons.
 * All images are real photographs (no AI-generated content) and are used
 * under their stated Creative Commons / public domain licenses.
 */

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

export const northCountyCoastal: ServiceAreaRegion = {
  region: "North County Coastal",
  slug: "north-county-coastal",
  image: {
    src: "/images/areas/region-north-county-coastal.webp",
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2d/North_Solana_Beach%2C_Looking_South.jpg",
    filePageUrl: "https://commons.wikimedia.org/wiki/File:North_Solana_Beach,_Looking_South.jpg",
    photographer: "Z3lvs",
    license: "CC0 1.0",
    attribution: "Photo by Z3lvs, CC0, via Wikimedia Commons",
    alt: "View south along the North County coastline from north Solana Beach, with La Jolla visible in the distance",
  },
  cities: [
    {
      name: "Carlsbad",
      slug: "carlsbad",
      image: {
        src: "/images/areas/carlsbad.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/3/33/Carlsbad_center_street_view_2013.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Carlsbad_center_street_view_2013.jpg",
        photographer: "Tuxyso",
        license: "CC BY-SA 3.0",
        attribution: "Photo by Tuxyso, CC BY-SA 3.0, via Wikimedia Commons",
        alt: "Street view through the center of downtown Carlsbad, California",
      },
    },
    {
      name: "Oceanside",
      slug: "oceanside",
      image: {
        src: "/images/areas/oceanside.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/3/36/Oceanside%2C_California_Beach.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Oceanside,_California_Beach.jpg",
        photographer: "Roc1233",
        license: "CC BY-SA 4.0",
        attribution: "Photo by Roc1233, CC BY-SA 4.0, via Wikimedia Commons",
        alt: "The sandy beach and Pacific shoreline in Oceanside, California",
      },
    },
    {
      name: "Encinitas",
      slug: "encinitas",
      image: {
        src: "/images/areas/encinitas.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/7/79/Downtown_Encinitas%2C_California.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Downtown_Encinitas,_California.jpg",
        photographer: "Mikefairbanks",
        license: "CC BY-SA 3.0",
        attribution: "Photo by Mikefairbanks, CC BY-SA 3.0, via Wikimedia Commons",
        alt: "Downtown Encinitas, California, showing the historic Welcome Arch and La Paloma Theater",
      },
    },
    {
      name: "Vista",
      slug: "vista",
      image: {
        src: "/images/areas/vista.webp",
        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/7/79/Downtown_Vista.JPG",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Downtown_Vista.JPG",
        photographer: "Paulvta",
        license: "CC BY-SA 3.0",
        attribution: "Photo by Paulvta, CC BY-SA 3.0, via Wikimedia Commons",
        alt: "View east down Main Street in downtown Vista, California",
      },
    },
    {
      name: "Solana Beach",
      slug: "solana-beach",
      image: {
        src: "/images/areas/solana-beach.webp",
        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/4/43/Solana_Beach_bluffs.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Solana_Beach_bluffs.jpg",
        photographer: "Timeforkindergarten",
        license: "CC BY-SA 4.0",
        attribution: "Photo by Timeforkindergarten, CC BY-SA 4.0, via Wikimedia Commons",
        alt: "The coastal bluffs above the beach in Solana Beach, California",
      },
    },
    {
      name: "Del Mar",
      slug: "del-mar",
      image: {
        src: "/images/areas/del-mar.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/1/13/Del_Mar_California_photo_Don_Ramey_Logan.jpg",
        filePageUrl:
          "https://commons.wikimedia.org/wiki/File:Del_Mar_California_photo_Don_Ramey_Logan.jpg",
        photographer: "Don Ramey Logan",
        license: "CC BY-SA 3.0",
        attribution: "Photo by Don Ramey Logan, CC BY-SA 3.0, via Wikimedia Commons",
        alt: "Aerial view of Del Mar, California, and the Pacific coastline",
      },
    },
  ],
};

export default northCountyCoastal;
