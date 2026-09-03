/**
 * East County service-area photography.
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

export const eastCounty: ServiceAreaRegion = {
  region: "East County",
  slug: "east-county",
  image: {
    src: "/images/areas/region-east-county.webp",
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d2/El_Cajon_Mountain_from_Cowles_Mountain.jpg",
    filePageUrl:
      "https://commons.wikimedia.org/wiki/File:El_Cajon_Mountain_from_Cowles_Mountain.jpg",
    photographer: "Blervis",
    license: "CC0 1.0",
    attribution: "Blervis, CC0 1.0, via Wikimedia Commons",
    alt: "El Cajon Mountain rising over East County communities, seen from Cowles Mountain",
  },
  cities: [
    {
      name: "El Cajon",
      slug: "el-cajon",
      image: {
        src: "/images/areas/el-cajon.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/9/91/Aerial_-_San_Diego_County%2C_CA_-_Lake_Murray%2C_La_Mesa%2C_El_Cajon.jpg",
        filePageUrl:
          "https://commons.wikimedia.org/wiki/File:Aerial_-_San_Diego_County,_CA_-_Lake_Murray,_La_Mesa,_El_Cajon.jpg",
        photographer: "Joe Mabel",
        license: "CC BY 3.0",
        attribution: "Joe Mabel, CC BY 3.0, via Wikimedia Commons",
        alt: "Aerial view over El Cajon with La Mesa and Lake Murray visible to the west",
      },
    },
    {
      name: "La Mesa",
      slug: "la-mesa",
      image: {
        src: "/images/areas/la-mesa.webp",
        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/2/29/Amayatrolley.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Amayatrolley.jpg",
        photographer: "Stickpen",
        license: "Public domain",
        attribution: "Stickpen, public domain, via Wikimedia Commons",
        alt: "Amaya Drive Trolley Station in La Mesa",
      },
    },
    {
      name: "Santee",
      slug: "santee",
      image: {
        src: "/images/areas/santee.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/5/5a/Scenic_view_of_Santee_looking_east_over_Santee_Lakes.jpg",
        filePageUrl:
          "https://commons.wikimedia.org/wiki/File:Scenic_view_of_Santee_looking_east_over_Santee_Lakes.jpg",
        photographer: "Devindad",
        license: "CC BY-SA 4.0",
        attribution: "Devindad, CC BY-SA 4.0, via Wikimedia Commons",
        alt: "View looking east over Santee and Santee Lakes under breaking storm clouds",
      },
    },
    {
      name: "Spring Valley",
      slug: "spring-valley",
      image: {
        src: "/images/areas/spring-valley.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/0/08/Spring_Valley%2C_California_%2815470263878%29.jpg",
        filePageUrl:
          "https://commons.wikimedia.org/wiki/File:Spring_Valley,_California_(15470263878).jpg",
        photographer: "Ken Lund",
        license: "CC BY-SA 2.0",
        attribution: "Ken Lund, CC BY-SA 2.0, via Wikimedia Commons (originally on Flickr)",
        alt: "Aerial view of Spring Valley and the surrounding San Diego County hillsides",
      },
    },
    {
      name: "Lemon Grove",
      slug: "lemon-grove",
      image: {
        src: "/images/areas/lemon-grove.webp",
        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Lemon_Grove%2C_CA.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Lemon_Grove,_CA.jpg",
        photographer: "Allan Ferguson",
        license: "CC BY 2.0",
        attribution: "Allan Ferguson, CC BY 2.0, via Wikimedia Commons (originally on Flickr)",
        alt: "The Big Lemon monument beside the trolley tracks in Lemon Grove",
      },
    },
  ],
};
