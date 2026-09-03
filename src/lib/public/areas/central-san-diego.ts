/**
 * Central San Diego service-area photography.
 *
 * All images are genuine photographs sourced from Wikimedia Commons
 * (real photos only; no AI-generated imagery). Each entry records the
 * original file page, direct source URL, photographer, and license so
 * attribution can be rendered on the site where required.
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

export const centralSanDiego: ServiceAreaRegion = {
  region: "Central San Diego",
  slug: "central-san-diego",
  image: {
    src: "/images/areas/region-central-san-diego.webp",
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/bb/San_Diego_skyline_at_dusk_from_Coronado_2015.jpg",
    filePageUrl:
      "https://commons.wikimedia.org/wiki/File:San_Diego_skyline_at_dusk_from_Coronado_2015.jpg",
    photographer: "russellstreet",
    license: "CC BY-SA 2.0",
    attribution: "russellstreet, CC BY-SA 2.0, via Wikimedia Commons",
    alt: "Downtown San Diego skyline at dusk reflected in San Diego Bay, seen from Coronado",
  },
  cities: [
    {
      name: "San Diego",
      slug: "san-diego",
      image: {
        src: "/images/areas/san-diego.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/f/f2/Downtown_San_Diego_Skyline_bay.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Downtown_San_Diego_Skyline_bay.jpg",
        photographer: "Mds08011",
        license: "CC BY 4.0",
        attribution: "Mds08011, CC BY 4.0, via Wikimedia Commons",
        alt: "Downtown San Diego skyline and waterfront seen from San Diego Bay",
      },
    },
    {
      name: "Coronado",
      slug: "coronado",
      image: {
        src: "/images/areas/coronado.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/b/b7/Coronado_bridge_from_San_Diego_bay.jpg",
        filePageUrl:
          "https://commons.wikimedia.org/wiki/File:Coronado_bridge_from_San_Diego_bay.jpg",
        photographer: "Mds08011",
        license: "CC BY 4.0",
        attribution: "Mds08011, CC BY 4.0, via Wikimedia Commons",
        alt: "The San Diego-Coronado Bridge spanning San Diego Bay",
      },
    },
    {
      name: "Mira Mesa",
      slug: "mira-mesa",
      image: {
        src: "/images/areas/mira-mesa.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/e/e0/East_Mira_Mesa_Canyon_1.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:East_Mira_Mesa_Canyon_1.jpg",
        photographer: "RightCowLeftCoast",
        license: "CC BY-SA 4.0",
        attribution: "RightCowLeftCoast, CC BY-SA 4.0, via Wikimedia Commons",
        alt: "Eucalyptus trees in the canyon between Revelstoke Way and Elbert Way in Mira Mesa",
      },
    },
    {
      name: "Clairemont",
      slug: "clairemont",
      image: {
        src: "/images/areas/clairemont.webp",
        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Clairemont_Drive.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Clairemont_Drive.jpg",
        photographer: "SDarchitect",
        license: "CC BY-SA 4.0",
        attribution: "SDarchitect, CC BY-SA 4.0, via Wikimedia Commons",
        alt: "View down Clairemont Drive toward Mission Bay and the Pacific Ocean",
      },
    },
    {
      name: "Scripps Ranch",
      slug: "scripps-ranch",
      image: {
        src: "/images/areas/scripps-ranch.webp",
        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Scripps_Ranch_sign.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Scripps_Ranch_sign.jpg",
        photographer: "Ryan Casey Aguinaldo",
        license: "CC BY-SA 4.0",
        attribution: "Ryan Casey Aguinaldo (False casey), CC BY-SA 4.0, via Wikimedia Commons",
        alt: "Scripps Ranch neighborhood entrance sign along Scripps Ranch Parkway",
      },
    },
    {
      name: "Tierrasanta",
      slug: "tierrasanta",
      image: {
        src: "/images/areas/tierrasanta.webp",
        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cf/Shephard_Canyon.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Shephard_Canyon.jpg",
        photographer: "RightCowLeftCoast",
        license: "CC BY-SA 4.0",
        attribution: "RightCowLeftCoast, CC BY-SA 4.0, via Wikimedia Commons",
        alt: "Shepard Canyon in Tierrasanta seen from Melojo Lane, with native chaparral and eucalyptus slopes",
      },
    },
  ],
};
