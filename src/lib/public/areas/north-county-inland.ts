/**
 * Region imagery for North County Inland, sourced from Wikimedia Commons.
 * All images are real photographs (no AI-generated content) and are used
 * under their stated Creative Commons / public domain licenses.
 */

export interface AreaImage {
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
  image: AreaImage;
}

export interface AreaRegion {
  region: string;
  slug: string;
  image: AreaImage;
  cities: AreaCity[];
}

export const northCountyInland: AreaRegion = {
  region: "North County Inland",
  slug: "north-county-inland",
  image: {
    src: "/images/areas/region-north-county-inland.webp",
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/87/Downtown_Escondido_Grand_%26_Broadway_Intersection.jpg",
    filePageUrl:
      "https://commons.wikimedia.org/wiki/File:Downtown_Escondido_Grand_%26_Broadway_Intersection.jpg",
    photographer: "CaliforniaUrbanist",
    license: "CC BY-SA 4.0",
    attribution: "Photo by CaliforniaUrbanist, CC BY-SA 4.0, via Wikimedia Commons",
    alt: "Aerial view over downtown Escondido at the Grand Avenue and Broadway intersection",
  },
  cities: [
    {
      name: "Escondido",
      slug: "escondido",
      image: {
        src: "/images/areas/escondido.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/1/14/Historic_Downtown_Escondido_Grand_Avenue_July_2025%2C_Facing_Northeast.jpg",
        filePageUrl:
          "https://commons.wikimedia.org/wiki/File:Historic_Downtown_Escondido_Grand_Avenue_July_2025,_Facing_Northeast.jpg",
        photographer: "CaliforniaUrbanist",
        license: "CC BY-SA 4.0",
        attribution: "Photo by CaliforniaUrbanist, CC BY-SA 4.0, via Wikimedia Commons",
        alt: "Aerial view of historic downtown Escondido along Grand Avenue, with Maple Street Plaza in the foreground",
      },
    },
    {
      name: "San Marcos",
      slug: "san-marcos",
      image: {
        src: "/images/areas/san-marcos.webp",
        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/7/72/SanMarcos.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:SanMarcos.jpg",
        photographer: "Taylorj661",
        license: "Public domain",
        attribution: "Photo by Taylorj661, public domain, via Wikimedia Commons",
        alt: "View over Lake San Marcos and the surrounding hillside neighborhoods of San Marcos, California",
      },
    },
    {
      name: "Poway",
      slug: "poway",
      image: {
        src: "/images/areas/poway.webp",
        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Poway_Depot.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Poway_Depot.jpg",
        photographer: "Visitor7",
        license: "CC BY-SA 3.0",
        attribution: "Photo by Visitor7, CC BY-SA 3.0, via Wikimedia Commons",
        alt: "The historic Midland Railroad Depot at Old Poway Park in Poway, California",
      },
    },
    {
      name: "Rancho Bernardo",
      slug: "rancho-bernardo",
      image: {
        src: "/images/areas/rancho-bernardo.webp",
        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Rancho_Bernardo_view.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Rancho_Bernardo_view.jpg",
        photographer: "RightCowLeftCoast",
        license: "CC BY-SA 4.0",
        attribution: "Photo by RightCowLeftCoast, CC BY-SA 4.0, via Wikimedia Commons",
        alt: "View across the Rancho Bernardo neighborhood toward the hills west of Pomerado Road",
      },
    },
  ],
};

export default northCountyInland;
