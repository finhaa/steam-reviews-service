export class Review {
  constructor(
    public readonly id: number,
    public readonly steamId: string,
    public readonly gameId: number,
    public readonly authorSteamId: string | null,
    public readonly recommended: boolean,
    public readonly content: string,
    public readonly timestampCreated: Date,
    public readonly timestampUpdated: Date | null,
    public readonly deleted: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
