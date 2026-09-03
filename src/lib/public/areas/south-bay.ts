/**
 * South Bay service-area photography.
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

export const southBay: ServiceAreaRegion = {
  region: "South Bay",
  slug: "south-bay",
  image: {
    src: "/images/areas/region-south-bay.webp",
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c9/Aerial_view_of_San_Diego%2C_CA_looking_southwest_toward_National_City_and_the_bay.jpg",
    filePageUrl:
      "https://commons.wikimedia.org/wiki/File:Aerial_view_of_San_Diego,_CA_looking_southwest_toward_National_City_and_the_bay.jpg",
    photographer: "Joe Mabel",
    license: "CC BY-SA 4.0",
    attribution: "Joe Mabel, CC BY-SA 4.0, via Wikimedia Commons",
    alt: "Aerial view over San Diego's South Bay toward National City and San Diego Bay",
  },
  cities: [
    {
      name: "Chula Vista",
      slug: "chula-vista",
      image: {
        src: "/images/areas/chula-vista.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/6/61/Downtown_Chula_Vista_2019a.jpg",
        filePageUrl: "https://commons.wikimedia.org/wiki/File:Downtown_Chula_Vista_2019a.jpg",
        photographer: "Antony-22",
        license: "CC BY-SA 4.0",
        attribution: "Antony-22, CC BY-SA 4.0, via Wikimedia Commons",
        alt: "Downtown Chula Vista at Third Avenue and F Street",
      },
    },
    {
      name: "National City",
      slug: "national-city",
      image: {
        src: "/images/areas/national-city.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/1/14/Paradise_marsh_surrounded_by_urban_development_%286590280539%29.jpg",
        filePageUrl:
          "https://commons.wikimedia.org/wiki/File:Paradise_marsh_surrounded_by_urban_development_(6590280539).jpg",
        photographer: "U.S. Fish and Wildlife Service (Pacific Southwest Region)",
        license: "Public domain",
        attribution: "U.S. Fish and Wildlife Service, public domain, via Wikimedia Commons",
        alt: "Sweetwater Marsh alongside the I-5 and SR-54 freeways in National City",
      },
    },
    {
      name: "Imperial Beach",
      slug: "imperial-beach",
      image: {
        src: "/images/areas/imperial-beach.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/6/6b/Imperial_Beach_Pier%2C_Imperial_Beach%2C_United_States_%28Unsplash%29.jpg",
        filePageUrl:
          "https://commons.wikimedia.org/wiki/File:Imperial_Beach_Pier,_Imperial_Beach,_United_States_(Unsplash).jpg",
        photographer: "Isai Ramos",
        license: "CC0 1.0",
        attribution: "Isai Ramos, CC0 1.0, via Unsplash and Wikimedia Commons",
        alt: "Imperial Beach shoreline with the pier in the distance",
      },
    },
    {
      name: "Bonita",
      slug: "bonita",
      image: {
        src: "/images/areas/bonita.webp",
        sourceUrl:
          "https://upload.wikimedia.org/wikipedia/commons/e/e6/Aerial_view_of_Sweetwater_Regional_Park%2C_Bonita%2C_CA%2C_looking_southwest.jpg",
        filePageUrl:
          "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Sweetwater_Regional_Park,_Bonita,_CA,_looking_southwest.jpg",
        photographer: "Joe Mabel",
        license: "CC BY-SA 4.0",
        attribution: "Joe Mabel, CC BY-SA 4.0, via Wikimedia Commons",
        alt: "Aerial view of Sweetwater Regional Park and the Bonita valley",
      },
    },
  ],
};
