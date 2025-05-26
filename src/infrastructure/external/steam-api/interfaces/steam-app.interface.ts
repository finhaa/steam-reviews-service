export interface SteamMetacriticInfo {
  score: number;
  url: string;
}

export interface SteamReleaseDate {
  coming_soon: boolean;
  date: string;
}

export interface SteamPlatforms {
  [key: string]: unknown;
  windows: boolean;
  mac: boolean;
  linux: boolean;
}

export interface SteamCategory {
  [key: string]: unknown;
  id: number;
  description: string;
}

export interface SteamGenre {
  [key: string]: unknown;
  id: number;
  description: string;
}

export interface SteamAppDetails {
  name: string;
  detailed_description: string;
  short_description: string;
  header_image: string;
  website?: string;
  developers: string[];
  publishers: string[];
  is_free: boolean;
  required_age: number;
  metacritic?: SteamMetacriticInfo;
  release_date: SteamReleaseDate;
  platforms: SteamPlatforms;
  categories?: SteamCategory[];
  genres?: SteamGenre[];
  type: string;
  steam_appid: number;
}

export interface SteamAppDetailsResponse {
  [appId: string]: {
    success: boolean;
    data: SteamAppDetails;
  };
}
