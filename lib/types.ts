export interface Earthquake {
  date: string;
  magnitude: number;
  latitude: number;
  longitude: number;
  depth: string;
  location: string;
  detailsUrl: string | null;
}

export interface EarthquakeListResponse {
  count: number;
  data: Earthquake[];
}

export interface EarthquakeDetails {
  url: string;
  dateTime: string | null;
  latitude: string | null;
  longitude: string | null;
  epicenter: {
    distance: string;
    direction: string;
    place: string;
  } | null;
  depth: string | null;
  magnitude: string | null;
  expectingDamage: string | null;
  expectingAftershocks: string | null;
  issuedOn: string | null;
  preparedBy: string | null;
  mapImage: string | null;
}

