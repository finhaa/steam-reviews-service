import { SteamPlatforms } from './steam-app.interface';

export interface SteamSearchItemPrice {
  currency: string;
  initial: number;
  final: number;
}

export interface SteamSearchItem {
  type: string;
  name: string;
  id: number;
  tiny_image: string;
  metascore: string;
  platforms: SteamPlatforms;
  streamingvideo: boolean;
  price?: SteamSearchItemPrice;
  controller_support?: string;
}

export interface SteamSearchResult {
  total: number;
  items: SteamSearchItem[];
}
