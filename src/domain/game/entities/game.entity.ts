import { SteamAppDetails } from '@infrastructure/external/steam-api/interfaces/steam-app.interface';

export interface GamePlatforms {
  [key: string]: unknown;
  windows: boolean;
  mac: boolean;
  linux: boolean;
}

export interface GameCategory {
  [key: string]: unknown;
  id: number;
  description: string;
}

export interface GameGenre {
  [key: string]: unknown;
  id: number;
  description: string;
}

export class Game {
  constructor(
    public readonly id: number | null,
    public readonly appId: number,
    public readonly name: string,
    public readonly description: string,
    public readonly shortDescription: string,
    public readonly headerImage: string,
    public readonly website: string | null,
    public readonly developers: string[],
    public readonly publishers: string[],
    public readonly isFree: boolean,
    public readonly requiredAge: number,
    public readonly metacriticScore: number | null,
    public readonly metacriticUrl: string | null,
    public readonly releaseDate: Date | null,
    public readonly platforms: GamePlatforms,
    public readonly categories: GameCategory[],
    public readonly genres: GameGenre[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromSteamDetails(
    appId: number,
    details: SteamAppDetails,
    existingId: number | null = null,
  ): Game {
    const now = new Date();
    return new Game(
      existingId,
      appId,
      details.name,
      details.detailed_description,
      details.short_description,
      details.header_image,
      details.website || null,
      details.developers,
      details.publishers,
      details.is_free,
      details.required_age,
      details.metacritic?.score || null,
      details.metacritic?.url || null,
      details.release_date?.date ? new Date(details.release_date.date) : null,
      details.platforms,
      details.categories || [],
      details.genres || [],
      now,
      now,
    );
  }
}
